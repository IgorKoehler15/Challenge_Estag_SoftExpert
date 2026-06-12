<?php
// Configurações de conexão com o banco de dados PostgreSQL
$host = 'db'; 
$port = '5432';
$dbname = 'applicationphp';
$user = 'root';
$password = 'root';

try {
    // Cria a conexão PDO com PostgreSQL usando as credenciais acima
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,           // Lança exceções em caso de erro SQL
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC       // Retorna resultados como array associativo
    ]);

} catch (PDOException $e) {
    // Retorna erro JSON padronizado e encerra com status 500
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Database connection failed."]);
    exit();
}

