<?php
/**
 * ============================================================
 * ARQUIVO: back/src/index.php
 * ARQUIVO DE TESTES — Sandbox para experimentar PHP + PostgreSQL
 * ============================================================
 *
 * Este arquivo é um SANDBOX (área de testes) usado durante o
 * desenvolvimento para experimentar funcionalidades do PHP e
 * testar a conexão com o banco de dados.
 *
 * NÃO FAZ PARTE DA APLICAÇÃO FINAL — é apenas para aprendizado
 * e debugging. O frontend nunca chama este arquivo.
 *
 * ⚠️ ATENÇÃO: Em produção, este arquivo deveria ser REMOVIDO
 * ou protegido, pois executa operações no banco sem validação.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: error_log() — Logs do servidor
 * ═══════════════════════════════════════════════════════════════
 *
 * error_log('mensagem') escreve uma mensagem no LOG do servidor
 * (geralmente em /var/log/apache2/error.log ou similar).
 *
 * DIFERENÇA DE echo:
 * - echo → envia texto para o NAVEGADOR (resposta HTTP)
 * - error_log → escreve no ARQUIVO DE LOG do servidor
 *
 * Logs são úteis para:
 * - Debugar problemas em produção (sem mostrar ao usuário)
 * - Registrar eventos importantes (logins, erros, etc.)
 * - Monitorar a saúde da aplicação
 *
 * Em Docker, logs aparecem com: docker logs nome_do_container
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: echo vs print_r — Exibindo dados
 * ═══════════════════════════════════════════════════════════════
 *
 * - echo "texto": exibe uma string simples
 *   echo "Olá"; → Olá
 *
 * - print_r($var): exibe a ESTRUTURA de arrays/objetos
 *   print_r(["a" => 1, "b" => 2]);
 *   → Array ( [a] => 1 [b] => 2 )
 *
 * - var_dump($var): como print_r, mas mostra TIPOS e tamanhos
 *   var_dump("hello");
 *   → string(5) "hello"
 *
 * Para debugging:
 * - Dados simples → echo
 * - Arrays/objetos → print_r ou var_dump
 * - Em produção → error_log (nunca exiba dados internos ao usuário!)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: fetch() vs fetchAll() — Buscando resultados
 * ═══════════════════════════════════════════════════════════════
 *
 * Após executar uma query SELECT, temos duas formas de ler:
 *
 * fetch(): busca UMA linha por vez.
 *   $row = $stmt->fetch();
 *   → Retorna a PRIMEIRA linha como array
 *   → Chamar novamente retorna a SEGUNDA linha, e assim por diante
 *   → Retorna false quando não há mais linhas
 *   → Útil para: buscar UM registro, ou processar linha a linha
 *
 * fetchAll(): busca TODAS as linhas de uma vez.
 *   $rows = $stmt->fetchAll();
 *   → Retorna um array de arrays (todas as linhas)
 *   → Útil para: retornar listas completas (como fazemos na API)
 *   → Cuidado: se a tabela tiver milhões de linhas, pode estourar memória!
 *
 * QUANDO USAR CADA UM:
 * - fetch(): quando espera 1 resultado, ou quer processar um por um
 * - fetchAll(): quando quer todos os resultados de uma vez
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: prepare() vs query() — Executando SQL
 * ═══════════════════════════════════════════════════════════════
 *
 * query($sql): executa SQL diretamente (sem parâmetros).
 *   → Usar APENAS para queries sem dados do usuário
 *   → Ex: "SELECT * FROM mytable" (sem WHERE com variáveis)
 *
 * prepare($sql) + execute($params): executa com parâmetros seguros.
 *   → Usar SEMPRE que houver dados externos (do usuário, URL, etc.)
 *   → Protege contra SQL Injection
 *   → Ex: "SELECT * FROM users WHERE id = :id"
 *
 * NESTE ARQUIVO: o prepare é usado para INSERT com valor fixo ('TEST PHP').
 * Como o valor é hardcoded (não vem do usuário), query() também seria seguro.
 * Mas usar prepare é uma BOA PRÁTICA mesmo com valores fixos — cria o hábito.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Nenhuma conexão com a aplicação principal
 * - É um arquivo independente de testes/aprendizado
 * - Usa conexão direta (não usa connection.php) como exemplo alternativo
 */

/**
 * error_log: escreve no log do servidor.
 * Útil para confirmar que o arquivo foi executado
 * sem precisar ver a resposta no navegador.
 */
error_log('Sou um log');

/** echo: envia texto como resposta HTTP (aparece no navegador) */
echo "Olá mundo";

// ─── CONEXÃO DIRETA (sem usar connection.php) ─────────────────
/**
 * Este é um exemplo ALTERNATIVO de conexão, diferente do
 * connection.php que é usado pela aplicação real.
 *
 * NOTA: o host aqui é "pgsql_desafio" (pode ser um nome antigo
 * do container Docker). Na aplicação real, usamos "db".
 *
 * Em projetos reais, CENTRALIZE a conexão em um arquivo
 * (como connection.php) e use require_once. Nunca repita
 * credenciais em múltiplos arquivos.
 */
$host = "pgsql_desafio";
$db = "applicationphp";
$user = "root";
$pw = "root";

$myPDO = new PDO("pgsql:host=$host;dbname=$db", $user, $pw);

// ─── EXEMPLO DE INSERT ────────────────────────────────────────
/**
 * Insere um registro fixo na tabela "mytable".
 *
 * prepare() + execute(): mesmo para valores fixos, é boa prática
 * usar prepared statements. Cria o hábito de NUNCA concatenar
 * strings diretamente no SQL.
 *
 * NOTA: Este INSERT executa TODA VEZ que a página é acessada!
 * Em um arquivo de teste, isso pode encher a tabela rapidamente.
 * Em produção, inserts são feitos apenas quando o usuário solicita.
 */
$statement = $myPDO->prepare("INSERT INTO mytable (DESCRIPTION) VALUES ('TEST PHP')");
$statement->execute();

// ─── EXEMPLO DE FETCH (uma linha) ────────────────────────────
/**
 * query(): executa o SELECT e retorna um PDOStatement.
 * fetch(): busca a PRIMEIRA linha do resultado.
 *
 * Resultado: array associativo com os dados da primeira linha.
 * Ex: ["id" => 1, "DESCRIPTION" => "TEST PHP"]
 *
 * "<br>": tag HTML para quebra de linha no navegador.
 * print_r(): exibe a estrutura do array de forma legível.
 */
$statement1 = $myPDO->query("SELECT * FROM mytable");
$data = $statement1->fetch();

echo "<br>";
print_r($data);

// ─── EXEMPLO DE FETCHALL (todas as linhas) ───────────────────
/**
 * fetchAll(): busca TODAS as linhas do resultado de uma vez.
 *
 * Resultado: array de arrays (cada sub-array é uma linha).
 * Ex: [
 *   ["id" => 1, "DESCRIPTION" => "TEST PHP"],
 *   ["id" => 2, "DESCRIPTION" => "TEST PHP"],
 * ]
 *
 * DIFERENÇA VISUAL:
 * - fetch() → Array ( [id] => 1 [DESCRIPTION] => TEST PHP )
 * - fetchAll() → Array ( [0] => Array(...) [1] => Array(...) )
 */
$statement2 = $myPDO->query("SELECT * FROM mytable");
$data2 = $statement2->fetchALL();

echo "<br>";
print_r($data2);
