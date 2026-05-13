<?php
/**
 * ============================================================
 * ARQUIVO: back/src/checkout.php
 * API REST — FINALIZAÇÃO DE COMPRA (Checkout)
 * ============================================================
 *
 * Este endpoint processa a FINALIZAÇÃO de uma compra. Recebe
 * os itens do carrinho e cria um pedido completo no banco.
 *
 * OPERAÇÃO DISPONÍVEL:
 * - POST → Processar compra (criar pedido + itens + atualizar estoque)
 *
 * É o endpoint mais CRÍTICO da aplicação porque:
 * 1. Envolve MÚLTIPLAS operações no banco (inserções + updates)
 * 2. Precisa ser ATÔMICO (tudo funciona ou nada funciona)
 * 3. Modifica dados financeiros (pedidos e estoque)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: TRANSAÇÕES (Transactions)
 * ═══════════════════════════════════════════════════════════════
 *
 * Uma TRANSAÇÃO agrupa múltiplas operações SQL em uma unidade
 * ATÔMICA — ou TODAS são executadas com sucesso, ou NENHUMA é.
 *
 * SEM transação (PERIGOSO):
 *   INSERT pedido ✅ (criou o pedido)
 *   INSERT item 1 ✅ (adicionou item)
 *   INSERT item 2 ❌ (ERRO! banco caiu)
 *   UPDATE estoque ??? (nunca executou)
 *   → Resultado: pedido incompleto no banco! Dados inconsistentes.
 *
 * COM transação (SEGURO):
 *   BEGIN TRANSACTION
 *   INSERT pedido ✅
 *   INSERT item 1 ✅
 *   INSERT item 2 ❌ (ERRO!)
 *   ROLLBACK → desfaz TUDO (pedido e item 1 também são removidos)
 *   → Resultado: banco fica como estava antes. Dados consistentes.
 *
 * MÉTODOS:
 * - $pdo->beginTransaction() → inicia a transação
 * - $pdo->commit() → confirma todas as operações (salva de verdade)
 * - $pdo->rollBack() → desfaz todas as operações (volta ao estado anterior)
 *
 * ANALOGIA: É como um "Ctrl+Z" para o banco de dados.
 * Enquanto não fizer commit, nada é permanente.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: PROPRIEDADES ACID
 * ═══════════════════════════════════════════════════════════════
 *
 * Transações seguem as propriedades ACID:
 * - Atomicidade: tudo ou nada (não existe "meio pedido")
 * - Consistência: banco vai de um estado válido para outro válido
 * - Isolamento: transações simultâneas não interferem entre si
 * - Durabilidade: após commit, dados sobrevivem a falhas
 *
 * ═══════════════════════════════════════════════════════════════
 * FLUXO DO CHECKOUT:
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. Recebe os itens do carrinho (array de produtos + quantidades)
 * 2. Inicia uma transação
 * 3. Gera o código do novo pedido
 * 4. Calcula totais (taxa total + valor total)
 * 5. Insere o pedido na tabela "orders"
 * 6. Para cada item do carrinho:
 *    a. Insere na tabela "order_item"
 *    b. Atualiza o estoque do produto (diminui a quantidade)
 * 7. Commit (confirma tudo)
 * 8. Se qualquer passo falhar → Rollback (desfaz tudo)
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Frontend: api.js → checkout(items)
 * - Frontend: HomePage.js → handleFinish() envia o carrinho
 * - Banco: connection.php → conexão PDO
 * - Tabelas: orders (pedidos), order_item (itens), products (estoque)
 */

// ═══════════════════════════════════════════════════════════════
// HEADERS HTTP — CORS
// ═══════════════════════════════════════════════════════════════

/**
 * Este endpoint só aceita POST (e OPTIONS para preflight).
 * Não tem GET nem DELETE — checkout é uma operação de CRIAÇÃO.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

/** Preflight: responde OK para o navegador prosseguir com o POST */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

// ═══════════════════════════════════════════════════════════════
// POST — PROCESSAR COMPRA
// ═══════════════════════════════════════════════════════════════

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    /**
     * Lê o corpo da requisição e extrai o array de itens.
     *
     * O frontend envia:
     * {
     *   "items": [
     *     {
     *       "product": { "code": 1, "name": "Arroz", "price": "5.99" },
     *       "category": { "code": 2, "tax": "10.00" },
     *       "amount": 3
     *     },
     *     ...
     *   ]
     * }
     *
     * ?? []: se 'items' não existir, usa array vazio (evita erro).
     */
    $data = json_decode(file_get_contents("php://input"), true);
    $items = $data['items'] ?? [];

    /** Validação: carrinho não pode estar vazio */
    if (empty($items)) {
        http_response_code(400);
        echo json_encode(["error" => "The cart is empty."]);
        exit();
    }

    try {
        // ─── INÍCIO DA TRANSAÇÃO ─────────────────────────────────
        /**
         * A partir daqui, NADA é salvo permanentemente no banco
         * até chamarmos $pdo->commit(). Se algo der errado,
         * $pdo->rollBack() desfaz TUDO.
         */
        $pdo->beginTransaction();

        // ─── GERAR CÓDIGO DO PEDIDO ──────────────────────────────
        /**
         * Busca o próximo código disponível para o pedido.
         * MAX(code) + 1 garante sequência sem repetição.
         * COALESCE trata o caso de ser o primeiro pedido (MAX = NULL → 0).
         */
        $stmtMaxOrder = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_code FROM orders");
        $nextOrderCode = $stmtMaxOrder->fetch(PDO::FETCH_ASSOC)['next_code'];

        // ─── CÁLCULO DOS TOTAIS ──────────────────────────────────
        /**
         * Percorre todos os itens para calcular:
         * - totalTax: soma de todas as taxas
         * - grandTotal: soma de todos os totais (preço + taxa)
         *
         * CONCEITO: foreach — Loop para arrays
         * foreach ($array as $item) { ... }
         * Executa o bloco UMA vez para cada elemento do array.
         * $item recebe o valor do elemento atual a cada iteração.
         *
         * É o equivalente PHP do .forEach() ou for...of do JavaScript.
         *
         * CÁLCULO POR ITEM:
         * 1. productTotal = preço × quantidade
         * 2. taxValue = productTotal × (taxa / 100)
         * 3. Acumula nos totais gerais
         *
         * (float) e (int): type casting para garantir tipos numéricos.
         * Dados vindos do JSON podem ser strings ("5.99"), então
         * convertemos explicitamente para evitar erros de cálculo.
         */
        $totalTax = 0;
        $grandTotal = 0;

        foreach ($items as $item) {
            $price = (float)$item['product']['price'];
            $tax = (float)$item['category']['tax'];
            $amount = (int)$item['amount'];

            $productTotal = $price * $amount;
            $taxValue = ($productTotal * $tax) / 100;
            
            $totalTax += $taxValue;
            $grandTotal += ($productTotal + $taxValue);
        }

        // ─── INSERIR O PEDIDO (tabela orders) ────────────────────
        /**
         * Cria o registro principal do pedido com:
         * - code: identificador único do pedido
         * - total: valor total da compra (com taxas)
         * - tax: valor total das taxas
         *
         * A tabela "orders" é o "cabeçalho" do pedido.
         * Os itens individuais ficam em "order_item" (detalhe).
         *
         * PADRÃO: Cabeçalho + Detalhe (Header + Detail)
         * É um padrão clássico de banco de dados para pedidos:
         * - orders: 1 registro por pedido (totais, data, status)
         * - order_item: N registros por pedido (um por produto)
         *
         * Relação: 1 order → N order_items (um para muitos)
         */
        $stmtOrder = $pdo->prepare("INSERT INTO orders (code, total, tax) VALUES (:code, :total, :tax)");
        $stmtOrder->execute([
            ':code'  => $nextOrderCode,
            ':total' => $grandTotal,
            ':tax'   => $totalTax
        ]);

        // ─── INSERIR ITENS + ATUALIZAR ESTOQUE ───────────────────
        /**
         * Para CADA item do carrinho, fazemos DUAS operações:
         *
         * 1. INSERT em order_item: registra o item no pedido
         *    (qual produto, quantidade, preço e taxa no momento da compra)
         *
         * 2. UPDATE em products: diminui o estoque do produto
         *    (amount = amount - quantidade comprada)
         *
         * POR QUE SALVAR PREÇO E TAXA NO order_item?
         * Porque preços e taxas podem MUDAR no futuro!
         * Se apenas salvássemos o código do produto, ao consultar
         * o histórico veríamos o preço ATUAL, não o preço da época.
         * Salvando no order_item, preservamos o valor EXATO da compra.
         *
         * CONCEITO: "Snapshot" de dados
         * order_item é um "snapshot" (foto) dos dados no momento
         * da compra. Mesmo que o produto mude de preço depois,
         * o histórico mostra o valor correto.
         */
        foreach ($items as $item) {
            // Gera código único para o item do pedido
            $stmtMaxItem = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_item_code FROM order_item");
            $nextItemCode = $stmtMaxItem->fetch(PDO::FETCH_ASSOC)['next_item_code'];

            /**
             * INSERT order_item: registra o item comprado.
             *
             * Colunas:
             * - code: identificador único do item
             * - order_code: referência ao pedido (FK → orders)
             * - product_code: referência ao produto (FK → products)
             * - amount: quantidade comprada
             * - price: preço unitário NO MOMENTO DA COMPRA
             * - tax: taxa da categoria NO MOMENTO DA COMPRA
             */
            $stmtItem = $pdo->prepare("INSERT INTO order_item (code, order_code, product_code, amount, price, tax) 
                                       VALUES (:code, :order_code, :product_code, :amount, :price, :tax)");
            
            $stmtItem->execute([
                ':code'         => $nextItemCode,
                ':order_code'   => $nextOrderCode,
                ':product_code' => $item['product']['code'],
                ':amount'       => (int)$item['amount'],
                ':price'        => $item['product']['price'],
                ':tax'          => $item['category']['tax']
            ]);

            /**
             * UPDATE estoque: diminui a quantidade disponível.
             *
             * amount = amount - :qty
             * Usa a quantidade ATUAL do banco (não um valor fixo).
             * Isso é seguro mesmo com acessos simultâneos porque
             * a transação garante isolamento.
             *
             * Exemplo: estoque = 50, comprou 3 → estoque = 47
             */
            $stmtStock = $pdo->prepare("UPDATE products SET amount = amount - :qty WHERE code = :p_code");
            $stmtStock->execute([
                ':qty'    => (int)$item['amount'],
                ':p_code' => $item['product']['code']
            ]);
        }

        // ─── COMMIT: CONFIRMAR TODAS AS OPERAÇÕES ────────────────
        /**
         * Se chegou até aqui sem erros, CONFIRMA todas as operações.
         * A partir do commit, os dados são permanentes no banco.
         *
         * Sem o commit, mesmo que tudo tenha executado com sucesso,
         * os dados seriam descartados ao final da conexão.
         */
        $pdo->commit();
        echo json_encode(["message" => "Purchase complete!", "order_code" => $nextOrderCode]);

    } catch (Exception $e) {
        // ─── ROLLBACK: DESFAZER EM CASO DE ERRO ──────────────────
        /**
         * Se QUALQUER operação falhar (insert, update, etc.):
         *
         * 1. Verifica se há uma transação ativa (inTransaction())
         * 2. Se sim, faz rollBack() — desfaz TUDO desde o beginTransaction()
         * 3. Retorna erro 500 com a mensagem do problema
         *
         * RESULTADO: o banco fica EXATAMENTE como estava antes.
         * Nenhum pedido parcial, nenhum estoque incorreto.
         *
         * $pdo->inTransaction(): verifica se há transação ativa.
         * É uma verificação de segurança — se o rollBack for chamado
         * sem transação ativa, geraria outro erro.
         */
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Error processing checkou: " . $e->getMessage()]);
    }
}
?>
