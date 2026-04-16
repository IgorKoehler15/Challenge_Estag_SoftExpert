<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $items = $data['items'] ?? [];

    if (empty($items)) {
        http_response_code(400);
        echo json_encode(["error" => "The cart is empty."]);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $stmtMaxOrder = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_code FROM orders");
        $nextOrderCode = $stmtMaxOrder->fetch(PDO::FETCH_ASSOC)['next_code'];

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

        $stmtOrder = $pdo->prepare("INSERT INTO orders (code, total, tax) VALUES (:code, :total, :tax)");
        $stmtOrder->execute([
            ':code'  => $nextOrderCode,
            ':total' => $grandTotal,
            ':tax'   => $totalTax
        ]);

        foreach ($items as $item) {
            $stmtMaxItem = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 as next_item_code FROM order_item");
            $nextItemCode = $stmtMaxItem->fetch(PDO::FETCH_ASSOC)['next_item_code'];

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
            $stmtStock = $pdo->prepare("UPDATE products SET amount = amount - :qty WHERE code = :p_code");
            $stmtStock->execute([
                ':qty'    => (int)$item['amount'],
                ':p_code' => $item['product']['code']
            ]);
        }

        $pdo->commit();
        echo json_encode(["message" => "Purchase complete!", "order_code" => $nextOrderCode]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Error processing checkou: " . $e->getMessage()]);
    }
}
?>