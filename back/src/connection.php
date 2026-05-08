<?php
$host = 'db'; 
$port = '5432';
$dbname = 'applicationphp';
$user = 'root';
$password = 'root';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC 
    ]);

    //Testando conexão:
    //echo "Conexão com o banco de dados realizada com sucesso!";

} catch (PDOException $e) {
    die("(Erro de Conexão): " . $e->getMessage());
}
?>