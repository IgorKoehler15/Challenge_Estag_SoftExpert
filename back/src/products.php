<?php
/**
 * ============================================================
 * ARQUIVO: back/src/products.php
 * API REST — CRUD DE PRODUTOS
 * ============================================================
 *
 * Este endpoint gerencia o CRUD (Create, Read, Update, Delete)
 * de produtos. Produtos são o recurso CENTRAL da aplicação —
 * eles pertencem a categorias e são comprados pelos usuários.
 *
 * OPERAÇÕES DISPONÍVEIS:
 * - GET    → Listar todos os produtos ativos com estoque
 * - POST   → Criar um novo produto
 * - DELETE → Excluir (ou desativar) um produto
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: RELACIONAMENTO ENTRE TABELAS (Foreign Key)
 * ═══════════════════════════════════════════════════════════════
 *
 * No banco de dados, a tabela "products" tem uma coluna
 * "category_code" que REFERENCIA a tabela "categories".
 * Isso é uma CHAVE ESTRANGEIRA (Foreign Key).
 *
 * ESTRUTURA:
 *   categories: [code, display_code, name, tax, is_active]
 *        ↑
 *        │ category_code (FK)
 *        │
 *   products: [code, display_code, name, amount, price, category_code, is_active]
 *        ↑
 *        │ product_code (FK)
 *        │
 *   order_item: [order_code, product_code, amount, price, tax]
 *
 * Isso garante INTEGRIDADE REFERENCIAL: todo produto DEVE
 * pertencer a uma categoria que existe no banco.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: PDO (PHP Data Objects)
 * ═══════════════════════════════════════════════════════════════
 *
 * PDO é a interface do PHP para acessar bancos de dados.
 * Vantagens sobre as funções antigas (mysql_*):
 *
 * - Suporta múltiplos bancos (MySQL, PostgreSQL, SQLite, etc.)
 * - Prepared statements nativos (proteção contra SQL Injection)
 * - Orientado a objetos (mais organizado)
 * - Tratamento de erros com exceções (try/catch)
 *
 * Métodos principais usados aqui:
 * - $pdo->query($sql) → executa SQL simples (sem parâmetros)
 * - $pdo->prepare($sql) → prepara SQL com placeholders
 * - $stmt->execute($params) → executa com parâmetros seguros
 * - $stmt->fetchAll() → busca todos os resultados
 * - $stmt->fetch() → busca uma linha
 * - $stmt->fetchColumn() → busca valor de uma coluna
 * - $stmt->rowCount() → conta linhas afetadas
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Frontend: api.js → fetchProducts(), createProduct(), deleteProduct()
 * - Banco: connection.php → cria a variável $pdo
 * - Relacionamento: categories.php → produtos referenciam categorias
 * - Relacionamento: checkout.php → pedidos referenciam produtos
 */

// ═══════════════════════════════════════════════════════════════
// HEADERS HTTP — CORS e tipo de resposta
// ═══════════════════════════════════════════════════════════════

/**
 * Headers CORS: permitem que o frontend (em outro domínio/porta)
 * acesse esta API. Sem eles, o navegador bloqueia a requisição.
 *
 * Content-Type: application/json → todas as respostas são JSON.
 * O frontend sabe que pode fazer response.json() com segurança.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

/**
 * Preflight (OPTIONS): resposta automática para o navegador
 * que pergunta "posso enviar POST/DELETE para cá?"
 * Respondemos 200 (sim) e encerramos.
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/** Inclui a conexão com o banco de dados (variável $pdo) */
require_once 'connection.php';

/** Identifica qual operação o frontend está solicitando */
$method = $_SERVER['REQUEST_METHOD'];

// ═══════════════════════════════════════════════════════════════
// GET — LISTAR TODOS OS PRODUTOS ATIVOS COM ESTOQUE
// ═══════════════════════════════════════════════════════════════

if ($method === 'GET') {
    try {
        /**
         * QUERY SQL: busca produtos ativos que têm estoque.
         *
         * WHERE is_active = true → exclui produtos soft-deleted
         * AND amount > 0 → exclui produtos sem estoque
         *   (produtos com estoque zerado após compras não aparecem)
         * ORDER BY display_code ASC → ordenação visual para o usuário
         *
         * COLUNAS RETORNADAS:
         * - code: identificador interno (para operações de delete)
         * - display_code: código visual para o usuário (001, 002...)
         * - name: nome do produto
         * - amount: quantidade em estoque
         * - price: preço unitário
         * - category_code: referência à categoria (FK)
         *
         * O frontend usa category_code para buscar o NOME da categoria
         * na lista de categorias (que é carregada separadamente).
         */
        $stmt = $pdo->query("SELECT code, display_code, name, amount, price, category_code FROM products WHERE is_active = true AND amount > 0 ORDER BY display_code ASC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        /** Retorna o array de produtos como JSON */
        echo json_encode($products);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error searching for products: " . $e->getMessage()]);
    }
}

// ═══════════════════════════════════════════════════════════════
// POST — CRIAR UM NOVO PRODUTO
// ═══════════════════════════════════════════════════════════════

elseif ($method === 'POST') {
    try {
        /**
         * Lê e decodifica o corpo JSON da requisição.
         *
         * O frontend envia:
         *   JSON.stringify({ name: "Arroz", amount: 50, price: 5.99, category_code: 1 })
         *
         * Aqui recebemos:
         *   ["name" => "Arroz", "amount" => 50, "price" => 5.99, "category_code" => 1]
         */
        $data = json_decode(file_get_contents("php://input"), true);

        /**
         * !empty($data['name']): verifica se o nome foi fornecido.
         *
         * empty() retorna true para: "", null, 0, "0", false, [], undefined
         * !empty() = "não está vazio" = tem um valor válido
         *
         * Esta é a validação MÍNIMA no backend. O frontend já valida
         * em detalhes, mas o backend SEMPRE deve validar também
         * (nunca confie no frontend — ele pode ser burlado).
         */
        if (!empty($data['name'])) {
            $name = trim($data['name']);

            // ─── VALIDAÇÃO: Verificar duplicata ──────────────────
            /**
             * Verifica se já existe um produto ATIVO com estoque
             * com o mesmo nome (case-insensitive).
             *
             * LOWER() no SQL = toLowerCase() no JavaScript.
             * Garante que "Arroz" e "arroz" sejam considerados iguais.
             */
            $stmtCheck = $pdo->prepare("SELECT code FROM products WHERE LOWER(name) = LOWER(:name) AND is_active = true AND amount > 0 LIMIT 1");
            $stmtCheck->execute([':name' => $name]);

            if ($stmtCheck->fetch()) {
                http_response_code(400);
                echo json_encode(["error" => "An active product with this name already exists!"]);
                exit();
            }

            // ─── GERAÇÃO DO DISPLAY_CODE ─────────────────────────
            /**
             * display_code: código sequencial VISUAL (para o usuário).
             * Calculado como MAX dos ativos com estoque + 1.
             *
             * Se produtos forem deletados, os display_codes podem ter
             * "buracos" (1, 2, 4 — sem o 3). Isso é intencional:
             * o próximo sempre será MAX + 1 dos existentes.
             *
             * COALESCE: função SQL que retorna o primeiro valor não-NULL.
             * Se não existir nenhum produto, MAX retorna NULL,
             * e COALESCE substitui por 0. Então 0 + 1 = 1.
             */
            $stmt_display = $pdo->query("SELECT COALESCE(MAX(display_code), 0) + 1 AS next_display FROM products WHERE is_active = true AND amount > 0");
            $next_display = $stmt_display->fetch()['next_display'];

            // ─── GERAÇÃO DO CODE (identificador interno) ─────────
            /**
             * code: identificador INTERNO que NUNCA é reutilizado.
             * Calculado como MAX de TODOS os registros + 1
             * (incluindo inativos/deletados).
             *
             * POR QUE NUNCA REUTILIZAR?
             * Se o code 5 foi usado em um pedido antigo e depois
             * deletado, reutilizar o 5 para outro produto faria
             * o pedido antigo apontar para o produto ERRADO.
             * Códigos internos são como CPFs — únicos para sempre.
             */
            $stmt_id = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM products");
            $next_code = $stmt_id->fetch()['next_code'];

            // ─── INSERÇÃO NO BANCO ───────────────────────────────
            /**
             * INSERT INTO com prepared statement (seguro contra SQL Injection).
             *
             * (int)$data['amount']: cast para inteiro.
             * Garante que o valor é numérico mesmo se o frontend
             * enviar como string. É uma camada extra de segurança.
             *
             * CONCEITO: TYPE CASTING (conversão de tipo)
             * (int)"50" → 50 (inteiro)
             * (float)"5.99" → 5.99 (decimal)
             * (string)123 → "123" (texto)
             */
            $sql = "INSERT INTO products (code, display_code, name, amount, price, category_code) 
                    VALUES (:code, :display_code, :name, :amount, :price, :category_code)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':code'          => $next_code,
                ':display_code'  => $next_display,
                ':name'          => $name,
                ':amount'        => (int)$data['amount'],
                ':price'         => $data['price'],
                ':category_code' => $data['category_code']
            ]);

            /** Status 201 = recurso criado com sucesso */
            http_response_code(201);
            echo json_encode(["message" => "Product successfully created!"]);

        } else {
            /** Se o nome não foi fornecido, retorna erro 400 */
            http_response_code(400);
            echo json_encode(["error" => "Incomplete data."]);
        }

    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["error" => "Error creating product: " . $e->getMessage()]);
    }
}

// ═══════════════════════════════════════════════════════════════
// DELETE — EXCLUIR (OU DESATIVAR) UM PRODUTO
// ═══════════════════════════════════════════════════════════════

elseif ($method === 'DELETE') {
    try {
        /**
         * Lê o código do produto da URL: /products.php?code=5
         * ?? null → se não existir, retorna null (evita erro).
         */
        $code = $_GET['code'] ?? null;

        if (!$code) {
            http_response_code(400);
            echo json_encode(["error" => "The product code was not provided."]);
            exit();
        }

        // ─── VERIFICAÇÃO: Produto em pedidos ─────────────────────
        /**
         * Verifica se o produto já foi comprado (aparece em order_item).
         *
         * order_item é a tabela que registra os itens de cada pedido.
         * Se o produto está lá, ele faz parte do HISTÓRICO de compras.
         *
         * COUNT(*) conta quantas vezes o produto aparece em pedidos.
         * fetchColumn() retorna diretamente o número (sem precisar
         * acessar uma chave do array).
         */
        $stmtCheckOrders = $pdo->prepare("SELECT COUNT(*) FROM order_item WHERE product_code = :code");
        $stmtCheckOrders->execute([':code' => $code]);
        $hasOrderLinks = $stmtCheckOrders->fetchColumn() > 0;

        // ─── DECISÃO: SOFT DELETE ou HARD DELETE ──────────────────
        /**
         * REGRA DE NEGÓCIO:
         *
         * Se o produto JÁ FOI COMPRADO (tem histórico):
         *   → SOFT DELETE (is_active = false)
         *   → O produto "desaparece" da listagem mas continua no banco
         *   → O histórico de compras mantém a referência correta
         *   → updated_at registra quando foi desativado
         *
         * Se o produto NUNCA FOI COMPRADO:
         *   → HARD DELETE (remove permanentemente)
         *   → Não há risco de quebrar referências
         *   → Libera espaço no banco (embora mínimo)
         *
         * ANALOGIA: É como um funcionário que sai da empresa.
         * Se ele participou de projetos (histórico), seu registro
         * é arquivado (soft delete). Se nunca fez nada, é removido
         * completamente (hard delete).
         *
         * NOTA: O frontend (ProductsPage) também verifica se o produto
         * está no CARRINHO antes de permitir a exclusão. Mas essa
         * verificação é feita no frontend via localStorage, não aqui.
         */
        if ($hasOrderLinks) {
            // Soft delete — preserva para integridade do histórico
            $sql = "UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        } else {
            // Hard delete — produto nunca foi usado em pedidos
            $sql = "DELETE FROM products WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        }

        /**
         * rowCount(): verifica se alguma linha foi afetada.
         *
         * > 0 → encontrou e deletou/desativou o produto
         * = 0 → produto não encontrado (código inválido ou já deletado)
         *
         * Isso cobre o caso de alguém tentar deletar um produto
         * que já foi deletado (idempotência parcial).
         */
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Product successfully deleted!"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Product not found in the database."]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error deleting product: " . $e->getMessage()]);
    }
}
?>
