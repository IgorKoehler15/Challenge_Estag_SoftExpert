<?php
// Cabeçalhos CORS — permite requisições de qualquer origem
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Responde requisições preflight (OPTIONS) do navegador
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'connection.php';

$method = $_SERVER['REQUEST_METHOD'];

// ==================== LISTAR CATEGORIAS ====================
if ($method === 'GET') {
    try {
        // Busca todas as categorias ativas ordenadas pelo código de exibição
        $stmt = $pdo->query("SELECT code, display_code, name, tax FROM categories WHERE is_active = true ORDER BY display_code ASC");

        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($categories);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error searching for categories: " . $e->getMessage()]);
    }
}

// ==================== CRIAR CATEGORIA ====================
elseif ($method === 'POST') {
    try {
        // Lê os dados enviados no corpo da requisição (JSON)
        $input = json_decode(file_get_contents("php://input"), true);

        $name = trim($input['name']);
        $tax = $input['tax'];

        // Verifica se já existe uma categoria ativa com o mesmo nome
        $stmtCheck = $pdo->prepare("SELECT code FROM categories WHERE LOWER(name) = LOWER(:name) AND is_active = true LIMIT 1");
        $stmtCheck->execute([':name' => $name]);

        if ($stmtCheck->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "A category with this name already exists and is active!"]);
            exit();
        }

        // Calcula o próximo display_code (sequencial entre categorias ativas)
        $stmt_display = $pdo->query("SELECT COALESCE(MAX(display_code), 0) + 1 AS next_display FROM categories WHERE is_active = true");
        $next_display = $stmt_display->fetch()['next_display'];

        // Calcula o próximo code (ID real, sequencial geral)
        $stmt_id = $pdo->query("SELECT COALESCE(MAX(code), 0) + 1 AS next_code FROM categories");
        $next_code = $stmt_id->fetch()['next_code'];

        // Insere a nova categoria no banco
        $sql = "INSERT INTO categories (code, display_code, name, tax) VALUES (:code, :display_code, :name, :tax)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':code' => $next_code,
            ':display_code' => $next_display,
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

// ==================== DELETAR CATEGORIA ====================
elseif ($method === 'DELETE') {
    try {
        // Obtém o código da categoria pela query string
        $code = $_GET['code'] ?? null;

        if (!$code) {
            http_response_code(400);
            echo json_encode(["error" => "The category code was not provided."]);
            exit();
        }

        // Verifica se existem produtos ativos com estoque vinculados a esta categoria
        $stmtCheckActive = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_code = :code AND is_active = true AND amount > 0");
        $stmtCheckActive->execute([':code' => $code]);

        if ($stmtCheckActive->fetchColumn() > 0) {
            http_response_code(400);
            echo json_encode(["error" => "Action denied: There are active products linked to this category! Please delete the products first."]);
            exit();
        }

        // Verifica se há pedidos vinculados a produtos desta categoria
        $stmtCheckOrders = $pdo->prepare("
            SELECT COUNT(*) FROM order_item oi
            INNER JOIN products p ON p.code = oi.product_code
            WHERE p.category_code = :code
        ");
        $stmtCheckOrders->execute([':code' => $code]);
        $hasOrderLinks = $stmtCheckOrders->fetchColumn() > 0;

        // Verifica se há produtos inativos vinculados
        $stmtCheckInactive = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_code = :code AND is_active = false");
        $stmtCheckInactive->execute([':code' => $code]);
        $hasInactiveProducts = $stmtCheckInactive->fetchColumn() > 0;

        if ($hasOrderLinks || $hasInactiveProducts) {
            // Soft delete — desativa a categoria para preservar integridade do histórico
            $sql = "UPDATE categories SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        } else {
            // Hard delete — remove definitivamente pois não há dependências
            $sql = "DELETE FROM categories WHERE code = :code AND is_active = true";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':code' => $code]);
        }

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
