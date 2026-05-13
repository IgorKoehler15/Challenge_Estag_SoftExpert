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
    // Encerra a aplicação caso a conexão falhe
    die("(Erro de Conexão): " . $e->getMessage());
}
?>
