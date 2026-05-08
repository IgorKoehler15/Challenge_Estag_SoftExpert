<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT code, display_code, name, amount, price, category_code FROM products WHERE is_active = true AND amount > 0 ORDER BY display_code ASC");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($products);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error searching for products: " . $e->getMessage()]);
    }
}

elseif ($method === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data['name'])) {
            $name = trim($data['name']);
            
            $stmtCheck = $pdo->prepare("SELECT code FROM products WHERE LOWER(name) = LOWER(:name) AND is_active = true AND amount > 0 LIMIT 1");
            $stmtCheck->execute([':name' => $name]);
            
            if ($stmtCheck->fetch()) {
                http_response_code(400);
                echo json_encode(["error" => "An active product with this name already exists!"]);
                exit();
            }

            // Generate display_code: MAX of active (with stock) display_codes + 1
            $stmt_display = $pdo->query("SELECT COALESCE(MAX(display_code), 0) + 1 AS next_display FROM products WHERE is_active = true AND amount > 0");
            $next_display = $stmt_display->fetch()['next_display'];

            // Generate internal code: MAX of ALL codes + 1 (never reused)
            $stmt_id = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM products");
            $next_code = $stmt_id->fetch()['next_code'];

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

            http_response_code(201);
            echo json_encode(["message" => "Product successfully created!"]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Incomplete data."]);
        }
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["error" => "Error creating product: " . $e->getMessage()]);
    }
}

elseif ($method === 'DELETE') {
    try {
        $code = $_GET['code'] ?? null;

        if (!$code) {
            http_response_code(400);
            echo json_encode(["error" => "The product code was not provided."]);
            exit();
        }

        // Check if the product appears in any order
        $stmtCheckOrders = $pdo->prepare("SELECT COUNT(*) FROM order_item WHERE product_code = :code");
        $stmtCheckOrders->execute([':code' => $code]);
        $hasOrderLinks = $stmtCheckOrders->fetchColumn() > 0;

        if ($hasOrderLinks) {
            // Soft delete — product has order history
            $sql = "UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        } else {
            // Hard delete — product was never used in an order
            $sql = "DELETE FROM products WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        }

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