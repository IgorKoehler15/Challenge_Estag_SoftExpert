<?php
/**
 * ============================================================
 * ARQUIVO: back/src/phpinfo.php
 * PÁGINA DE INFORMAÇÕES DO PHP (Diagnóstico)
 * ============================================================
 *
 * Este arquivo é uma FERRAMENTA DE DIAGNÓSTICO que exibe todas
 * as informações sobre a instalação do PHP no servidor.
 *
 * O QUE EXIBE:
 * - Versão do PHP instalada
 * - Extensões habilitadas (pgsql, pdo, json, etc.)
 * - Configurações do php.ini (limites de memória, upload, etc.)
 * - Variáveis de ambiente do servidor
 * - Informações do sistema operacional
 *
 * QUANDO USAR:
 * - Para verificar se uma extensão está instalada (ex: pdo_pgsql)
 * - Para debugar problemas de configuração
 * - Para verificar limites (upload_max_filesize, memory_limit)
 * - Para confirmar a versão do PHP
 *
 * COMO ACESSAR:
 * No navegador: http://localhost/phpinfo.php
 * (ou a porta configurada no Docker para o serviço PHP)
 *
 * ⚠️ SEGURANÇA:
 * Este arquivo NUNCA deve existir em produção! Ele expõe
 * informações sensíveis sobre o servidor (versões, caminhos,
 * configurações) que um atacante poderia usar para explorar
 * vulnerabilidades.
 *
 * Em produção:
 * - Delete este arquivo
 * - Ou proteja com autenticação
 * - Ou restrinja por IP
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Nenhuma — é um arquivo independente de diagnóstico
 * - Útil para verificar se a extensão pdo_pgsql está habilitada
 *   (necessária para connection.php funcionar)
 */

/**
 * phpinfo(): função nativa do PHP que gera uma página HTML
 * completa com TODAS as informações da instalação.
 *
 * Não precisa de echo — ela mesma gera e envia o HTML.
 * É uma das funções mais simples do PHP: sem parâmetros,
 * sem retorno, apenas efeito colateral (output HTML).
 *
 * Parâmetros opcionais (para limitar o que exibe):
 * - phpinfo(INFO_GENERAL) → apenas informações gerais
 * - phpinfo(INFO_MODULES) → apenas módulos/extensões
 * - phpinfo(INFO_ENVIRONMENT) → apenas variáveis de ambiente
 * - phpinfo() → TUDO (padrão)
 */
phpinfo();
