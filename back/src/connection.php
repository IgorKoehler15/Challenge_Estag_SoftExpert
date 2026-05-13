<?php
/**
 * ============================================================
 * ARQUIVO: back/src/connection.php
 * CONEXÃO COM O BANCO DE DADOS (PostgreSQL via PDO)
 * ============================================================
 *
 * Este arquivo é responsável por ESTABELECER A CONEXÃO com o
 * banco de dados. Ele é incluído (require_once) por TODOS os
 * outros arquivos PHP que precisam acessar o banco.
 *
 * Após executar, disponibiliza a variável $pdo que é usada
 * em categories.php, products.php, checkout.php e history.php.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: PDO (PHP Data Objects)
 * ═══════════════════════════════════════════════════════════════
 *
 * PDO é a interface PADRÃO do PHP para acessar bancos de dados.
 * É uma camada de ABSTRAÇÃO — o mesmo código funciona com
 * diferentes bancos (PostgreSQL, MySQL, SQLite, etc.) apenas
 * mudando o DSN (string de conexão).
 *
 * VANTAGENS DO PDO:
 * - Suporte a múltiplos bancos de dados
 * - Prepared statements nativos (segurança contra SQL Injection)
 * - Orientado a objetos
 * - Tratamento de erros com exceções (try/catch)
 * - Transações (commit/rollback)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: DSN (Data Source Name)
 * ═══════════════════════════════════════════════════════════════
 *
 * O DSN é uma STRING que contém todas as informações necessárias
 * para conectar ao banco de dados:
 *
 *   "pgsql:host=db;port=5432;dbname=applicationphp"
 *    ↑      ↑       ↑          ↑
 *    │      │       │          └── nome do banco
 *    │      │       └── porta (5432 = padrão PostgreSQL)
 *    │      └── endereço do servidor
 *    └── driver (tipo do banco: pgsql, mysql, sqlite)
 *
 * Para MySQL seria: "mysql:host=db;port=3306;dbname=applicationphp"
 * Para SQLite seria: "sqlite:/caminho/banco.db"
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: DOCKER E NOMES DE HOST
 * ═══════════════════════════════════════════════════════════════
 *
 * O host é 'db' (não 'localhost') porque a aplicação roda em
 * CONTAINERS DOCKER. No Docker, cada serviço tem um nome que
 * funciona como hostname na rede interna.
 *
 * No docker-compose.yml, o serviço do banco se chama "db",
 * então o PHP se conecta usando esse nome. O Docker resolve
 * internamente para o IP correto do container do banco.
 *
 * Se estivesse rodando SEM Docker, seria 'localhost' ou '127.0.0.1'.
 *
 * ═══════════════════════════════════════════════════════════════
 * SEGURANÇA: CREDENCIAIS EM CÓDIGO
 * ═══════════════════════════════════════════════════════════════
 *
 * ⚠️ ATENÇÃO: Em um projeto REAL (produção), NUNCA coloque
 * credenciais diretamente no código! Use:
 * - Variáveis de ambiente (getenv('DB_PASSWORD'))
 * - Arquivos .env (com dotenv)
 * - Secrets managers (AWS Secrets Manager, Vault, etc.)
 *
 * Aqui está hardcoded porque é um projeto de ESTUDO/DESENVOLVIMENTO
 * rodando localmente em Docker. Em produção, isso seria uma
 * vulnerabilidade grave.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Incluído por: categories.php, products.php, checkout.php, history.php
 * - Todos usam a variável $pdo criada aqui
 * - Docker: o host 'db' é definido no docker-compose.yml
 */

// ─── CONFIGURAÇÕES DE CONEXÃO ─────────────────────────────────
/**
 * Variáveis com os dados de acesso ao banco.
 *
 * $host: endereço do servidor de banco de dados
 *   'db' = nome do serviço Docker (resolve via DNS interno do Docker)
 *
 * $port: porta do PostgreSQL (padrão: 5432)
 *   MySQL usa 3306, MongoDB usa 27017, Redis usa 6379
 *
 * $dbname: nome do banco de dados criado para esta aplicação
 *
 * $user e $password: credenciais de acesso
 *   (em produção, viriam de variáveis de ambiente!)
 */
$host = 'db'; 
$port = '5432';
$dbname = 'applicationphp';
$user = 'root';
$password = 'root';

try {
    /**
     * Monta o DSN (string de conexão) para PostgreSQL.
     *
     * Usa interpolação de variáveis do PHP:
     * "texto $variavel texto" → PHP substitui $variavel pelo valor.
     * Isso só funciona com ASPAS DUPLAS ("), não com aspas simples (').
     *
     * Aspas simples: 'texto $variavel' → literal (não substitui)
     * Aspas duplas: "texto $variavel" → interpola (substitui)
     */
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

    /**
     * CRIAÇÃO DA CONEXÃO PDO:
     *
     * new PDO($dsn, $user, $password, $options):
     * - $dsn: string de conexão (driver + host + porta + banco)
     * - $user: usuário do banco
     * - $password: senha do banco
     * - $options: array de configurações adicionais
     *
     * OPÇÕES CONFIGURADAS:
     *
     * PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION:
     *   Define como o PDO reporta erros.
     *   - ERRMODE_SILENT (padrão): ignora erros silenciosamente (PERIGOSO!)
     *   - ERRMODE_WARNING: emite um warning PHP
     *   - ERRMODE_EXCEPTION: lança exceção (RECOMENDADO!)
     *
     *   Com EXCEPTION, qualquer erro SQL é capturado pelo try/catch.
     *   Sem isso, erros passariam despercebidos e causariam bugs difíceis.
     *
     * PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC:
     *   Define o formato padrão dos resultados.
     *   - FETCH_ASSOC: retorna array associativo ["coluna" => "valor"]
     *   - FETCH_NUM: retorna array numérico [0 => "valor"]
     *   - FETCH_BOTH: retorna ambos (padrão, mas desperdiça memória)
     *   - FETCH_OBJ: retorna objeto stdClass
     *
     *   FETCH_ASSOC é o mais prático: $row['name'] é mais legível
     *   que $row[1] e usa menos memória que FETCH_BOTH.
     */
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC 
    ]);

    //Testando conexão:
    //echo "Conexão com o banco de dados realizada com sucesso!";

} catch (PDOException $e) {
    /**
     * Se a conexão FALHAR (banco offline, credenciais erradas, etc.):
     *
     * die(): encerra a execução do script E exibe uma mensagem.
     * É equivalente a: echo "mensagem"; exit();
     *
     * $e->getMessage(): retorna a descrição do erro.
     * Exemplos:
     * - "could not find driver" → extensão pgsql não instalada
     * - "Connection refused" → banco não está rodando
     * - "password authentication failed" → credenciais erradas
     * - "database does not exist" → banco não foi criado
     *
     * Em produção, NÃO exibiríamos $e->getMessage() ao usuário
     * (pode revelar informações sensíveis). Apenas logaríamos
     * internamente e mostraríamos uma mensagem genérica.
     */
    die("(Erro de Conexão): " . $e->getMessage());
}
?>
