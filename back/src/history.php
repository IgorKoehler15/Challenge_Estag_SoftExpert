<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $code = $_GET['code'] ?? null;

    try {
        if ($code) {
            $stmtOrder = $pdo->prepare("SELECT * FROM orders WHERE code = :code");
            $stmtOrder->execute([':code' => $code]);
            $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(["error" => "Order not found."]);
                exit();
            }

            $stmtItems = $pdo->prepare("
                SELECT oi.amount, oi.price, oi.tax, p.name as product_name 
                FROM order_item oi 
                JOIN products p ON oi.product_code = p.code 
                WHERE oi.order_code = :code
            ");
            $stmtItems->execute([':code' => $code]);
            $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($order);
        } else {
            $stmt = $pdo->query("SELECT code, tax, total FROM orders ORDER BY code DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
}
?>