<?php
// Cabeçalhos CORS — permite requisições de qualquer origem
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Responde requisições preflight (OPTIONS) do navegador
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Lê os itens do carrinho enviados no corpo da requisição
    $data = json_decode(file_get_contents("php://input"), true);
    $items = $data['items'] ?? [];

    if (empty($items)) {
        http_response_code(400);
        echo json_encode(["error" => "The cart is empty."]);
        exit();
    }

    try {
        // Inicia transação para garantir atomicidade (tudo ou nada)
        $pdo->beginTransaction();

        // Gera o próximo código de pedido
        $stmtMaxOrder = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_code FROM orders");
        $nextOrderCode = $stmtMaxOrder->fetch(PDO::FETCH_ASSOC)['next_code'];

        $totalTax = 0;
        $grandTotal = 0;

        // Calcula o total geral e o total de impostos do pedido
        foreach ($items as $item) {
            $price = (float)$item['product']['price'];
            $tax = (float)$item['category']['tax'];
            $amount = (int)$item['amount'];

            $productTotal = $price * $amount;
            $taxValue = ($productTotal * $tax) / 100;
            
            $totalTax += $taxValue;
            $grandTotal += ($productTotal + $taxValue);
        }

        // Insere o pedido na tabela orders com total e imposto
        $stmtOrder = $pdo->prepare("INSERT INTO orders (code, total, tax) VALUES (:code, :total, :tax)");
        $stmtOrder->execute([
            ':code'  => $nextOrderCode,
            ':total' => $grandTotal,
            ':tax'   => $totalTax
        ]);

        // Insere cada item do pedido e atualiza o estoque do produto
        foreach ($items as $item) {

            // Gera o próximo código de item de pedido
            $stmtMaxItem = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_item_code FROM order_item");
            $nextItemCode = $stmtMaxItem->fetch(PDO::FETCH_ASSOC)['next_item_code'];

            // Insere o item na tabela order_item
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

            // Desconta a quantidade comprada do estoque do produto
            $stmtStock = $pdo->prepare("UPDATE products SET amount = amount - :qty WHERE code = :p_code");
            $stmtStock->execute([
                ':qty'    => (int)$item['amount'],
                ':p_code' => $item['product']['code']
            ]);
        }

        // Confirma a transação — todas as operações foram bem-sucedidas
        $pdo->commit();
        echo json_encode(["message" => "Purchase complete!", "order_code" => $nextOrderCode]);

    } catch (Exception $e) {
        // Desfaz todas as operações em caso de erro
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Error processing checkou: " . $e->getMessage()]);
    }
}
?>
