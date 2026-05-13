<?php
/**
 * ============================================================
 * ARQUIVO: back/src/categories.php
 * API REST — CRUD DE CATEGORIAS
 * ============================================================
 *
 * Este arquivo é um ENDPOINT da API backend. Ele recebe
 * requisições HTTP do frontend (React) e interage com o
 * banco de dados MySQL para gerenciar categorias.
 *
 * OPERAÇÕES DISPONÍVEIS:
 * - GET    → Listar todas as categorias ativas
 * - POST   → Criar uma nova categoria
 * - DELETE → Excluir (ou desativar) uma categoria
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: API REST (Representational State Transfer)
 * ═══════════════════════════════════════════════════════════════
 *
 * REST é um padrão de arquitetura para APIs web. A ideia central
 * é usar os MÉTODOS HTTP para indicar a AÇÃO desejada:
 *
 * - GET    → BUSCAR dados (não modifica nada)
 * - POST   → CRIAR um novo recurso
 * - PUT    → ATUALIZAR um recurso existente (completo)
 * - PATCH  → ATUALIZAR parcialmente um recurso
 * - DELETE → REMOVER um recurso
 *
 * Cada método tem uma semântica clara. O frontend usa fetch()
 * com o método apropriado, e o backend decide o que fazer
 * baseado no método recebido.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: HTTP STATUS CODES (Códigos de Resposta)
 * ═══════════════════════════════════════════════════════════════
 *
 * Cada resposta HTTP tem um código numérico que indica o resultado:
 *
 * 2xx — SUCESSO:
 *   200 OK → requisição bem-sucedida
 *   201 Created → recurso criado com sucesso
 *
 * 4xx — ERRO DO CLIENTE:
 *   400 Bad Request → dados inválidos ou incompletos
 *   404 Not Found → recurso não encontrado
 *
 * 5xx — ERRO DO SERVIDOR:
 *   500 Internal Server Error → algo deu errado no servidor
 *
 * O frontend (api.js) verifica response.ok que é true para 2xx.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: SOFT DELETE vs HARD DELETE
 * ═══════════════════════════════════════════════════════════════
 *
 * - HARD DELETE: remove o registro do banco permanentemente
 *   (DELETE FROM tabela WHERE ...)
 *
 * - SOFT DELETE: marca o registro como inativo sem removê-lo
 *   (UPDATE tabela SET is_active = false WHERE ...)
 *
 * POR QUE SOFT DELETE?
 * Se uma categoria tem produtos vinculados (mesmo inativos) ou
 * aparece em pedidos antigos, deletá-la quebraria a integridade
 * dos dados históricos. O soft delete preserva o histórico.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Frontend: api.js → fetchCategories(), createCategory(), deleteCategory()
 * - Banco: connection.php → conexão PDO com MySQL
 * - Relacionamento: products.php → produtos referenciam categorias
 */

// ═══════════════════════════════════════════════════════════════
// HEADERS HTTP — Configuração de CORS e tipo de resposta
// ═══════════════════════════════════════════════════════════════

/**
 * CONCEITO: CORS (Cross-Origin Resource Sharing)
 *
 * Por segurança, navegadores BLOQUEIAM requisições de um domínio
 * para outro (ex: localhost:3000 → localhost:80). Isso é a
 * "Same-Origin Policy" (Política de Mesma Origem).
 *
 * Os headers abaixo PERMITEM que o frontend (em outra porta/domínio)
 * acesse esta API:
 *
 * - Access-Control-Allow-Origin: * → permite QUALQUER origem
 *   (em produção, seria restrito ao domínio do frontend)
 *
 * - Access-Control-Allow-Methods → métodos HTTP permitidos
 *
 * - Access-Control-Allow-Headers → headers que o frontend pode enviar
 *   (Content-Type é necessário para enviar JSON)
 *
 * - Content-Type: application/json → informa que a resposta é JSON
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

/**
 * PREFLIGHT REQUEST (requisição de "pré-voo"):
 *
 * Antes de enviar POST ou DELETE, o navegador envia automaticamente
 * uma requisição OPTIONS para verificar se o servidor aceita.
 * É como perguntar "posso enviar um POST?" antes de enviar de fato.
 *
 * Se não respondermos com 200, o navegador BLOQUEIA a requisição real.
 * Por isso respondemos imediatamente com 200 e saímos (exit).
 *
 * $_SERVER['REQUEST_METHOD'] → método HTTP da requisição atual.
 * $_SERVER é um array superglobal do PHP com informações do servidor.
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * require_once: inclui o arquivo connection.php UMA vez.
 * Esse arquivo cria a variável $pdo (conexão com o banco de dados).
 *
 * Diferença de require vs include:
 * - require: se o arquivo não existir, PARA a execução (fatal error)
 * - include: se não existir, apenas mostra warning e continua
 * - _once: garante que o arquivo é incluído apenas 1 vez
 *   (evita redefinição de variáveis/funções se chamado múltiplas vezes)
 */
require_once 'connection.php';

/** Armazena o método HTTP para decidir qual operação executar */
$method = $_SERVER['REQUEST_METHOD'];

// ═══════════════════════════════════════════════════════════════
// GET — LISTAR TODAS AS CATEGORIAS ATIVAS
// ═══════════════════════════════════════════════════════════════

if ($method === 'GET') {
    try {
        /**
         * QUERY SQL: busca categorias ativas ordenadas pelo código de exibição.
         *
         * SELECT code, display_code, name, tax → colunas que queremos
         * FROM categories → tabela de categorias
         * WHERE is_active = true → apenas categorias não deletadas (soft delete)
         * ORDER BY display_code ASC → ordena pelo código de exibição (crescente)
         *
         * CONCEITO: display_code vs code
         * - code: identificador INTERNO (nunca reutilizado, mesmo após delete)
         * - display_code: código VISUAL para o usuário (pode ser reorganizado)
         *
         * $pdo->query(): executa uma consulta SQL simples (sem parâmetros).
         * Retorna um objeto PDOStatement com os resultados.
         */
        $stmt = $pdo->query("SELECT code, display_code, name, tax FROM categories WHERE is_active = true ORDER BY display_code ASC");

        /**
         * fetchAll(PDO::FETCH_ASSOC): busca TODOS os resultados como
         * array associativo (chave => valor).
         *
         * Resultado: [
         *   ["code" => 1, "display_code" => 1, "name" => "Bebidas", "tax" => 10.00],
         *   ["code" => 3, "display_code" => 2, "name" => "Alimentos", "tax" => 5.50],
         * ]
         *
         * PDO::FETCH_ASSOC → retorna apenas array associativo (sem índices numéricos)
         * Alternativas: FETCH_NUM (só números), FETCH_BOTH (ambos), FETCH_OBJ (objetos)
         */
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        /**
         * json_encode(): converte o array PHP para string JSON.
         * echo: envia a string como resposta HTTP para o frontend.
         *
         * O frontend (api.js) recebe isso e faz response.json()
         * para converter de volta em objeto JavaScript.
         *
         * PHP array → json_encode → JSON string → rede → response.json() → JS object
         */
        echo json_encode($categories);

    } catch (PDOException $e) {
        /**
         * PDOException: exceção lançada quando algo dá errado no banco.
         * Exemplos: tabela não existe, conexão caiu, SQL inválido.
         *
         * Retornamos status 500 (erro do servidor) + mensagem de erro.
         * $e->getMessage() retorna a descrição do erro.
         */
        http_response_code(500);
        echo json_encode(["error" => "Error searching for categories: " . $e->getMessage()]);
    }
}

// ═══════════════════════════════════════════════════════════════
// POST — CRIAR UMA NOVA CATEGORIA
// ═══════════════════════════════════════════════════════════════

elseif ($method === 'POST') {
    try {
        /**
         * LEITURA DO CORPO DA REQUISIÇÃO:
         *
         * file_get_contents("php://input"):
         * Lê o CORPO (body) da requisição HTTP como string.
         * "php://input" é um stream especial do PHP que dá acesso
         * ao body raw (cru) da requisição.
         *
         * json_decode(..., true):
         * Converte a string JSON para array associativo PHP.
         * O segundo parâmetro "true" faz retornar array ao invés de objeto.
         *
         * O frontend envia: JSON.stringify({ name: "Bebidas", tax: 10 })
         * Aqui recebemos: ["name" => "Bebidas", "tax" => 10]
         */
        $input = json_decode(file_get_contents("php://input"), true);

        /**
         * trim(): remove espaços em branco do início e fim da string.
         * Mesma limpeza que o frontend faz, mas REPETIDA no backend
         * por segurança (nunca confie apenas na validação do frontend!).
         */
        $name = trim($input['name']);
        $tax = $input['tax'];

        // ─── VALIDAÇÃO: Verificar duplicata ──────────────────────
        /**
         * CONCEITO: PREPARED STATEMENTS (Consultas Preparadas)
         *
         * NUNCA insira variáveis diretamente no SQL! Isso causa
         * SQL Injection (um dos ataques mais perigosos da web).
         *
         * ❌ PERIGOSO (SQL Injection):
         *   $pdo->query("SELECT * FROM categories WHERE name = '$name'")
         *   Se $name for: "'; DROP TABLE categories; --"
         *   → O banco DELETA a tabela inteira!
         *
         * ✅ SEGURO (Prepared Statement):
         *   $stmt = $pdo->prepare("SELECT * FROM categories WHERE name = :name")
         *   $stmt->execute([':name' => $name])
         *   → O banco trata $name como DADO, nunca como código SQL.
         *
         * O :name é um "placeholder" (marcador de posição).
         * O execute() substitui o placeholder pelo valor REAL de forma segura.
         *
         * LOWER() converte para minúsculas → comparação case-insensitive.
         * LIMIT 1 → para na primeira ocorrência (mais eficiente).
         */
        $stmtCheck = $pdo->prepare("SELECT code FROM categories WHERE LOWER(name) = LOWER(:name) AND is_active = true LIMIT 1");
        $stmtCheck->execute([':name' => $name]);

        /**
         * fetch(): busca UMA linha do resultado.
         * Se encontrou algo → categoria já existe → retorna erro 400.
         * exit(): encerra a execução do script imediatamente.
         */
        if ($stmtCheck->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "A category with this name already exists and is active!"]);
            exit();
        }

        // ─── GERAÇÃO DO DISPLAY_CODE ─────────────────────────────
        /**
         * COALESCE(MAX(display_code), 0) + 1:
         *
         * - MAX(display_code): pega o maior display_code existente
         * - COALESCE(..., 0): se não existir nenhum (tabela vazia),
         *   retorna 0 ao invés de NULL
         * - + 1: próximo número sequencial
         *
         * Exemplo: se o maior display_code ativo é 5, o próximo será 6.
         * Se não existir nenhuma categoria ativa, será 1.
         */
        $stmt_display = $pdo->query("SELECT COALESCE(MAX(display_code), 0) + 1 AS next_display FROM categories WHERE is_active = true");
        $next_display = $stmt_display->fetch()['next_display'];

        // ─── GERAÇÃO DO CODE (identificador interno) ─────────────
        /**
         * Diferente do display_code, o code NUNCA é reutilizado.
         * Mesmo após deletar categorias, o próximo code é sempre
         * MAX + 1 de TODOS os registros (ativos e inativos).
         *
         * Isso garante que referências antigas (em pedidos) continuem
         * apontando para o registro correto.
         */
        $stmt_id = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM categories");
        $next_code = $stmt_id->fetch()['next_code'];

        // ─── INSERÇÃO NO BANCO ───────────────────────────────────
        /**
         * INSERT INTO: comando SQL para criar um novo registro.
         *
         * Estrutura: INSERT INTO tabela (colunas) VALUES (valores)
         *
         * Usamos prepared statement com placeholders (:code, :name, etc.)
         * para segurança contra SQL Injection.
         *
         * execute() com array associativo: cada chave (:placeholder)
         * é substituída pelo valor correspondente.
         */
        $sql = "INSERT INTO categories (code, display_code, name, tax) VALUES (:code, :display_code, :name, :tax)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':code' => $next_code,
            ':display_code' => $next_display,
            ':name' => $name,
            ':tax'  => $tax
        ]);

        /**
         * Resposta de sucesso:
         * - Status 201 (Created) → indica que um recurso foi criado
         * - Retorna mensagem + código da nova categoria
         *
         * O frontend pode usar o código retornado se precisar
         * referenciar a categoria recém-criada.
         */
        http_response_code(201);
        echo json_encode(["message" => "Category created successfully!", "code" => $next_code]);

    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["error" => "Error creating category: " . $e->getMessage()]);
    }
}

// ═══════════════════════════════════════════════════════════════
// DELETE — EXCLUIR (OU DESATIVAR) UMA CATEGORIA
// ═══════════════════════════════════════════════════════════════

elseif ($method === 'DELETE') {
    try {
        /**
         * $_GET['code']: lê o parâmetro "code" da URL.
         * Exemplo: DELETE /categories.php?code=5 → $_GET['code'] = "5"
         *
         * ?? null: operador "null coalescing" do PHP.
         * Se $_GET['code'] não existir, retorna null ao invés de erro.
         * É o equivalente PHP do ?? do JavaScript.
         */
        $code = $_GET['code'] ?? null;

        if (!$code) {
            http_response_code(400);
            echo json_encode(["error" => "The category code was not provided."]);
            exit();
        }

        // ─── VERIFICAÇÃO 1: Produtos ativos vinculados ───────────
        /**
         * Antes de deletar, verifica se existem produtos ATIVOS
         * com estoque que pertencem a esta categoria.
         *
         * Se existirem → BLOQUEIA a exclusão.
         * O usuário deve deletar os produtos primeiro.
         *
         * Isso protege a integridade dos dados: não faz sentido
         * ter produtos "órfãos" (sem categoria).
         *
         * COUNT(*): conta quantos registros satisfazem a condição.
         * fetchColumn(): retorna o valor da primeira coluna (o count).
         */
        $stmtCheckActive = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_code = :code AND is_active = true AND amount > 0");
        $stmtCheckActive->execute([':code' => $code]);

        if ($stmtCheckActive->fetchColumn() > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Action denied: There are active products linked to this category! Please delete the products first."]);
            exit();
        }

        // ─── VERIFICAÇÃO 2: Histórico de pedidos ─────────────────
        /**
         * Verifica se algum produto desta categoria já apareceu em
         * algum pedido (order_item).
         *
         * INNER JOIN: combina duas tabelas onde há correspondência.
         * Aqui junta order_item com products para encontrar produtos
         * desta categoria que estão em pedidos.
         *
         * Se existir histórico → usa SOFT DELETE (preserva dados).
         */
        $stmtCheckOrders = $pdo->prepare("
            SELECT COUNT(*) FROM order_item oi
            INNER JOIN products p ON p.code = oi.product_code
            WHERE p.category_code = :code
        ");
        $stmtCheckOrders->execute([':code' => $code]);
        $hasOrderLinks = $stmtCheckOrders->fetchColumn() > 0;

        // ─── VERIFICAÇÃO 3: Produtos inativos vinculados ─────────
        /**
         * Verifica se existem produtos INATIVOS (soft-deleted)
         * vinculados a esta categoria.
         *
         * Se existirem → soft delete (a categoria precisa existir
         * como referência para esses produtos inativos).
         */
        $stmtCheckInactive = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_code = :code AND is_active = false");
        $stmtCheckInactive->execute([':code' => $code]);
        $hasInactiveProducts = $stmtCheckInactive->fetchColumn() > 0;

        // ─── DECISÃO: SOFT DELETE ou HARD DELETE ──────────────────
        /**
         * REGRA DE NEGÓCIO:
         *
         * Se tem histórico de pedidos OU produtos inativos:
         *   → SOFT DELETE (UPDATE is_active = false)
         *   → Preserva o registro para integridade referencial
         *   → updated_at registra quando foi "deletado"
         *
         * Se NÃO tem nenhuma referência:
         *   → HARD DELETE (DELETE FROM)
         *   → Remove permanentemente (não há risco de quebrar dados)
         *
         * CURRENT_TIMESTAMP: função SQL que retorna a data/hora atual.
         */
        if ($hasOrderLinks || $hasInactiveProducts) {
            $sql = "UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        } else {
            $sql = "DELETE FROM categories WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        }

        /**
         * rowCount(): retorna quantas linhas foram afetadas pelo
         * último UPDATE ou DELETE.
         *
         * Se > 0 → a operação encontrou e modificou/deletou o registro.
         * Se = 0 → nenhum registro foi encontrado (código inválido ou já deletado).
         */
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["message" => "Category successfully deleted!"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Category not found in the database."]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error deleting category: " . $e->getMessage()]);
    }
}
?>
