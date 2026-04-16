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
        $stmt = $pdo->query("SELECT * FROM categories WHERE is_active = true ORDER BY code ASC");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($categories);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error searching for categories: " . $e->getMessage()]);
    }
}

elseif ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents("php://input"), true);

        $name = trim($input['name']);
        $tax = $input['tax'];

        $stmtCheck = $pdo->prepare("SELECT code FROM categories WHERE LOWER(name) = LOWER(:name) AND is_active = true LIMIT 1");
        $stmtCheck->execute([':name' => $name]);
        
        if ($stmtCheck->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "A category with this name already exists and is active!"]);
            exit();
        }

        $stmtInactive = $pdo->prepare("SELECT code, name FROM categories WHERE LOWER(name) = LOWER(:name) AND is_active = false");
        $stmtInactive->execute([':name' => $name]);
        $inactives = $stmtInactive->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($inactives as $inactive) {
            $newName = $inactive['name'];
            $pdo->prepare("UPDATE categories SET name = :new_name WHERE code = :code")
                ->execute([':new_name' => $newName, ':code' => $inactive['code']]);
        }

        $stmt_id = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM categories");
        $next_code = $stmt_id->fetch()['next_code'];

        $sql = "INSERT INTO categories (code, name, tax) VALUES (:code, :name, :tax)";
        $stmt = $pdo->prepare($sql);
        
        $stmt->execute([
            ':code' => $next_code,
            ':name' => $name,
            ':tax'  => $tax
        ]);

        http_response_code(201); 
        echo json_encode(["message" => "Category created successfully!", "code" => $next_code]);

    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["error" => "Error creating category: " . $e->getMessage()]);
    }
}

elseif ($method === 'DELETE') {
    try {
        $code = $_GET['code'] ?? null;

        if (!$code) {
            http_response_code(400);
            echo json_encode(["error" => "The category code was not provided."]);
            exit();
        }

        $stmtCheckActive = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_code = :code AND is_active = true");
        $stmtCheckActive->execute([':code' => $code]);
        
        if ($stmtCheckActive->fetchColumn() > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Action denied: There are active products linked to this category! Please delete the products first."]);
            exit();
        }

        $stmtCheckHistory = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_code = :code");
        $stmtCheckHistory->execute([':code' => $code]);
        
        if ($stmtCheckHistory->fetchColumn() > 0) {
            $sql = "UPDATE categories SET is_active = false WHERE code = :code";
        } else {
            $sql = "DELETE FROM categories WHERE code = :code";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':code' => $code]);

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