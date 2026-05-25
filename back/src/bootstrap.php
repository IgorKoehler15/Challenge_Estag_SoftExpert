<?php
function bootstrap(string $allowedMethods = "GET, POST, DELETE, OPTIONS"): void
{
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: {$allowedMethods}");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json");

    // Responde requisições preflight (OPTIONS) do navegador
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

bootstrap($allowedMethods ?? "GET, POST, DELETE, OPTIONS");

require_once __DIR__ . '/connection.php';
