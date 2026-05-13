<?php
/**
 * ============================================================
 * ARQUIVO: back/src/history.php
 * API REST — HISTÓRICO DE COMPRAS (Pedidos)
 * ============================================================
 *
 * Este endpoint gerencia a CONSULTA de pedidos já finalizados.
 * É um endpoint SOMENTE LEITURA (apenas GET) — não cria nem
 * modifica dados.
 *
 * OPERAÇÕES DISPONÍVEIS:
 * - GET (sem parâmetro) → Listar TODOS os pedidos (resumo)
 * - GET ?code=5        → Buscar DETALHES de um pedido específico
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: UM ENDPOINT, DUAS RESPOSTAS
 * ═══════════════════════════════════════════════════════════════
 *
 * Este arquivo responde de forma DIFERENTE dependendo se o
 * parâmetro "code" está presente na URL ou não:
 *
 * 1. GET /history.php
 *    → Retorna LISTA de todos os pedidos (código, taxa, total)
 *    → Usado pela HistoryPage (tabela de histórico)
 *
 * 2. GET /history.php?code=5
 *    → Retorna DETALHES de um pedido específico (com itens)
 *    → Usado pela PurchasePage (página de detalhes)
 *
 * Isso é um padrão comum em APIs REST:
 * - GET /recurso → lista todos (collection)
 * - GET /recurso?id=X → detalhe de um (single resource)
 *
 * Alternativa mais "RESTful" seria:
 * - GET /orders → lista
 * - GET /orders/5 → detalhe
 * Mas com PHP simples (sem framework), usar query params é mais prático.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: JOIN — Combinando dados de múltiplas tabelas
 * ═══════════════════════════════════════════════════════════════
 *
 * Quando buscamos os detalhes de um pedido, precisamos do NOME
 * do produto. Mas a tabela order_item só tem o product_code.
 * O nome está na tabela products.
 *
 * JOIN combina linhas de duas tabelas onde há correspondência:
 *
 *   order_item:                    products:
 *   | product_code | amount |      | code | name    |
 *   | 1            | 3      |      | 1    | Arroz   |
 *   | 4            | 1      |      | 4    | Feijão  |
 *
 *   JOIN ON oi.product_code = p.code:
 *   | product_code | amount | name    |
 *   | 1            | 3      | Arroz   |
 *   | 4            | 1      | Feijão  |
 *
 * TIPOS DE JOIN:
 * - INNER JOIN (ou JOIN): retorna apenas onde há correspondência em AMBAS
 * - LEFT JOIN: retorna tudo da esquerda, mesmo sem correspondência
 * - RIGHT JOIN: retorna tudo da direita, mesmo sem correspondência
 *
 * Aqui usamos JOIN (INNER) porque todo order_item DEVE ter um produto.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: ALIAS (Apelidos) EM SQL
 * ═══════════════════════════════════════════════════════════════
 *
 * "oi" e "p" são ALIASES (apelidos) para as tabelas:
 *   FROM order_item oi → "oi" é apelido para "order_item"
 *   JOIN products p    → "p" é apelido para "products"
 *
 * Isso permite escrever "oi.amount" ao invés de "order_item.amount".
 * Mais curto e legível, especialmente com múltiplas tabelas.
 *
 * "p.name as product_name":
 * "as" cria um alias para a COLUNA no resultado.
 * Ao invés de retornar "name" (que poderia confundir com nome do pedido),
 * retorna "product_name" — mais descritivo.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Frontend: api.js → fetchHistory() e fetchPurchase(code)
 * - Frontend: HistoryPage.js → lista de pedidos
 * - Frontend: PurchasePage.js → detalhes de um pedido
 * - Banco: connection.php → conexão PDO
 * - Tabelas: orders (cabeçalho), order_item (itens), products (nomes)
 */

// ═══════════════════════════════════════════════════════════════
// HEADERS HTTP — CORS
// ═══════════════════════════════════════════════════════════════

/**
 * Este endpoint só aceita GET (leitura).
 * Não modifica dados, então não precisa de POST/DELETE.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

/** Preflight para CORS */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

// ═══════════════════════════════════════════════════════════════
// GET — LISTAR PEDIDOS OU BUSCAR DETALHES
// ═══════════════════════════════════════════════════════════════

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    /**
     * Verifica se o parâmetro "code" foi passado na URL.
     *
     * - /history.php → $code = null → lista todos
     * - /history.php?code=5 → $code = "5" → busca detalhes
     *
     * ?? null: se $_GET['code'] não existir, retorna null.
     */
    $code = $_GET['code'] ?? null;

    try {
        if ($code) {
            // ─── MODO DETALHES: Buscar UM pedido específico ──────

            /**
             * PASSO 1: Buscar o cabeçalho do pedido.
             *
             * SELECT * → todas as colunas da tabela orders
             * WHERE code = :code → filtra pelo código do pedido
             *
             * Usa prepared statement porque $code vem do usuário
             * (query parameter da URL) — NUNCA confie em dados externos!
             */
            $stmtOrder = $pdo->prepare("SELECT * FROM orders WHERE code = :code");
            $stmtOrder->execute([':code' => $code]);
            $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

            /**
             * Se o pedido não foi encontrado, retorna 404.
             * fetch() retorna false quando não há resultados.
             *
             * !$order → se $order é false/null → pedido não existe.
             */
            if (!$order) {
                http_response_code(404);
                echo json_encode(["error" => "Order not found."]);
                exit();
            }

            // ─── PASSO 2: Buscar os ITENS do pedido ──────────────
            /**
             * JOIN entre order_item e products para obter o nome
             * do produto junto com os dados do item.
             *
             * QUERY EXPLICADA:
             * SELECT oi.amount, oi.price, oi.tax, p.name as product_name
             *   → Seleciona quantidade, preço e taxa do item
             *   → Seleciona o nome do produto (da tabela products)
             *   → "as product_name" renomeia a coluna no resultado
             *
             * FROM order_item oi
             *   → Tabela principal: itens do pedido (apelido "oi")
             *
             * JOIN products p ON oi.product_code = p.code
             *   → Combina com products onde o código bate
             *   → Isso nos dá acesso ao p.name (nome do produto)
             *
             * WHERE oi.order_code = :code
             *   → Filtra apenas itens DESTE pedido específico
             *
             * RESULTADO: array de itens com nome do produto incluído.
             */
            $stmtItems = $pdo->prepare("
                SELECT oi.amount, oi.price, oi.tax, p.name as product_name 
                FROM order_item oi 
                JOIN products p ON oi.product_code = p.code 
                WHERE oi.order_code = :code
            ");
            $stmtItems->execute([':code' => $code]);

            /**
             * Adiciona os itens ao array do pedido.
             *
             * $order['items'] = ...:
             * Em PHP, podemos adicionar chaves a um array associativo
             * a qualquer momento. Aqui adicionamos a chave 'items'
             * com o array de itens do pedido.
             *
             * RESULTADO FINAL enviado ao frontend:
             * {
             *   "code": 5,
             *   "total": "125.00",
             *   "tax": "12.50",
             *   "items": [
             *     { "amount": "3", "price": "5.99", "tax": "10", "product_name": "Arroz" },
             *     { "amount": "1", "price": "12.50", "tax": "5", "product_name": "Feijão" }
             *   ]
             * }
             */
            $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($order);

        } else {
            // ─── MODO LISTA: Buscar TODOS os pedidos (resumo) ────

            /**
             * Retorna apenas código, taxa e total de cada pedido.
             * NÃO retorna os itens (seria muita informação desnecessária
             * para uma listagem — os itens são carregados sob demanda
             * quando o usuário clica em "View").
             *
             * ORDER BY code DESC → pedidos mais recentes primeiro.
             * DESC = descendente (do maior para o menor).
             * ASC = ascendente (do menor para o maior, padrão).
             *
             * Isso é um padrão de PERFORMANCE: na listagem, retorne
             * apenas o MÍNIMO necessário. Detalhes são carregados
             * sob demanda (lazy loading).
             */
            $stmt = $pdo->query("SELECT code, tax, total FROM orders ORDER BY code DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
}
?>
