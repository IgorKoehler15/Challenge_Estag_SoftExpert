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

require_once __DIR__ . '/connection.php';
require_once __DIR__ . '/Controllers/ProductController.php';

$controller = new ProductController($pdo);
$controller->handle($_SERVER['REQUEST_METHOD']);
