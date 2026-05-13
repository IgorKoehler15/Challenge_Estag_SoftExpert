/**
 * ============================================================
 * ARQUIVO: services/api.js — CAMADA DE COMUNICAÇÃO COM O BACKEND
 * ============================================================
 *
 * Este arquivo é responsável por TODA a comunicação entre o
 * frontend (React) e o backend (PHP). Ele centraliza as
 * chamadas HTTP (requisições à API) em um único lugar.
 *
 * POR QUE CENTRALIZAR?
 * Imagine que a URL do servidor mude. Se cada componente fizesse
 * suas próprias chamadas fetch(), você teria que alterar dezenas
 * de arquivos. Com tudo centralizado aqui, basta mudar em UM lugar.
 * Isso é o princípio DRY (Don't Repeat Yourself — Não Se Repita).
 *
 * CONCEITOS IMPORTANTES USADOS AQUI:
 *
 * 1. FETCH API: função nativa do navegador para fazer requisições HTTP
 *    (GET, POST, PUT, DELETE) para servidores.
 *
 * 2. ASYNC/AWAIT: sintaxe moderna para lidar com operações assíncronas.
 *    "async" marca a função como assíncrona.
 *    "await" pausa a execução até a Promise resolver.
 *    Isso evita o "callback hell" e torna o código mais legível.
 *
 * 3. PROMISES: representam um valor que pode estar disponível agora,
 *    no futuro, ou nunca. fetch() retorna uma Promise.
 *
 * 4. JSON: formato de dados usado para trocar informações entre
 *    frontend e backend. É basicamente um objeto JavaScript em
 *    formato de texto.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - As PÁGINAS (HomePage, ProductsPage, etc.) importam estas funções
 *   para buscar e enviar dados ao servidor
 * - O BACKEND (PHP) recebe essas requisições e responde com dados
 *   do banco de dados (MySQL)
 *
 * FLUXO DE DADOS:
 * Componente React → chama função deste arquivo → fetch() envia
 * requisição HTTP → Backend PHP processa → retorna JSON → função
 * deste arquivo retorna os dados → Componente atualiza a tela
 */

// ─── CONFIGURAÇÃO DOS ENDPOINTS ─────────────────────────────
/**
 * ENDPOINTS são as "URLs" (caminhos) do backend que o frontend
 * precisa acessar. Cada endpoint corresponde a um arquivo PHP
 * no servidor que processa um tipo específico de dado.
 *
 * Usamos um objeto constante para:
 * - Evitar erros de digitação (typos) nas URLs
 * - Facilitar mudanças futuras (ex: mudar de .php para /api/v2/)
 * - Ter um "mapa" claro de todas as rotas disponíveis
 *
 * NOTA: As URLs são relativas (sem http://...), o que significa
 * que o navegador vai usar o mesmo domínio/porta da aplicação.
 * Em desenvolvimento, um proxy redireciona para o servidor PHP.
 *
 * CONEXÃO COM O BACKEND:
 * - /products.php   → back/src/products.php (CRUD de produtos)
 * - /categories.php → back/src/categories.php (CRUD de categorias)
 * - /checkout.php   → back/src/checkout.php (finalizar compra)
 * - /history.php    → back/src/history.php (histórico de compras)
 */
const ENDPOINTS = {
  products: '/products.php',
  categories: '/categories.php',
  checkout: '/checkout.php',
  history: '/history.php',
};

// ═══════════════════════════════════════════════════════════════
// ─── FUNÇÕES DE PRODUTOS ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

/**
 * fetchProducts() — Busca TODOS os produtos cadastrados no banco.
 *
 * MÉTODO HTTP: GET (padrão do fetch — buscar dados sem modificar nada)
 *
 * FLUXO:
 * 1. Faz uma requisição GET para /products.php
 * 2. Converte a resposta de texto JSON para objeto JavaScript
 * 3. Verifica se o resultado é um array (lista de produtos)
 * 4. Se não for array (erro inesperado), retorna array vazio []
 *
 * POR QUE VERIFICAR Array.isArray(data)?
 * O servidor pode retornar um erro como { "error": "..." } ao invés
 * de uma lista. Sem essa verificação, o componente quebraria ao
 * tentar fazer .map() em algo que não é um array.
 *
 * USADO POR: ProductsPage, HomePage (para listar produtos no select)
 */
export async function fetchProducts() {
  const response = await fetch(ENDPOINTS.products);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * createProduct(product) — Cadastra um NOVO produto no banco.
 *
 * MÉTODO HTTP: POST (enviar dados para criar algo novo no servidor)
 *
 * PARÂMETRO:
 * - product: objeto com os dados do produto
 *   Exemplo: { name: "Arroz", price: 5.99, category_code: 1 }
 *
 * FLUXO:
 * 1. Faz uma requisição POST para /products.php
 * 2. Define o header Content-Type como JSON (avisa o servidor
 *    que estamos enviando dados em formato JSON)
 * 3. Converte o objeto product para texto JSON (JSON.stringify)
 * 4. Se o servidor responder com erro (status != 200), lança exceção
 * 5. Se deu certo, retorna os dados da resposta (produto criado)
 *
 * TRATAMENTO DE ERROS:
 * - response.ok é true quando o status HTTP é 200-299 (sucesso)
 * - Se não for ok, lemos a mensagem de erro do servidor e lançamos
 *   um Error, que será capturado pelo componente com try/catch
 *
 * USADO POR: ProductsPage (formulário de cadastro)
 */
export async function createProduct(product) {
  const response = await fetch(ENDPOINTS.products, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error saving product to server.');
  }
  return response.json();
}

/**
 * deleteProduct(code) — Remove um produto do banco pelo código.
 *
 * MÉTODO HTTP: DELETE (solicitar remoção de um recurso no servidor)
 *
 * PARÂMETRO:
 * - code: código único do produto a ser deletado (ex: 5)
 *
 * FLUXO:
 * 1. Monta a URL com query parameter: /products.php?code=5
 * 2. Faz requisição DELETE para essa URL
 * 3. Lê a resposta JSON (mesmo em caso de erro, para pegar a mensagem)
 * 4. Se não foi ok, lança erro com a mensagem do servidor
 * 5. Se deu certo, retorna os dados de confirmação
 *
 * TEMPLATE LITERALS (crase `...`):
 * A sintaxe ${variavel} dentro de crases permite inserir valores
 * de variáveis diretamente na string. É mais legível que concatenar
 * com +.
 *
 * USADO POR: ProductsPage (botão "Excluir" na tabela)
 */
export async function deleteProduct(code) {
  const response = await fetch(`${ENDPOINTS.products}?code=${code}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error deleting product on the server.');
  }
  return data;
}

// ═══════════════════════════════════════════════════════════════
// ─── FUNÇÕES DE CATEGORIAS ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════

/**
 * fetchCategories() — Busca TODAS as categorias cadastradas.
 *
 * Funciona exatamente como fetchProducts(), mas para categorias.
 * Categorias são usadas para classificar produtos (ex: "Alimentos",
 * "Bebidas", "Limpeza").
 *
 * USADO POR: CategoriesPage, ProductsPage (select de categoria),
 *            HomePage (select de categoria no formulário de compra)
 */
export async function fetchCategories() {
  const response = await fetch(ENDPOINTS.categories);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * createCategory(category) — Cadastra uma NOVA categoria.
 *
 * PARÂMETRO:
 * - category: objeto com dados da categoria
 *   Exemplo: { name: "Bebidas" }
 *
 * Segue o mesmo padrão de createProduct: POST + JSON + tratamento de erro.
 *
 * USADO POR: CategoriesPage (formulário de cadastro)
 */
export async function createCategory(category) {
  const response = await fetch(ENDPOINTS.categories, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error saving category to database.');
  }
  return response.json();
}

/**
 * deleteCategory(code) — Remove uma categoria pelo código.
 *
 * Segue o mesmo padrão de deleteProduct: DELETE + query parameter.
 *
 * ATENÇÃO: No backend, deletar uma categoria pode falhar se
 * existirem produtos vinculados a ela (integridade referencial
 * do banco de dados). O erro retornado pelo servidor informará isso.
 *
 * USADO POR: CategoriesPage (botão "Excluir" na tabela)
 */
export async function deleteCategory(code) {
  const response = await fetch(`${ENDPOINTS.categories}?code=${code}`, {
    method: 'DELETE',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'The category could not be deleted.');
  }
  return data;
}

// ═══════════════════════════════════════════════════════════════
// ─── FUNÇÕES DE COMPRA (CHECKOUT) ────────────────────────────
// ═══════════════════════════════════════════════════════════════

/**
 * checkout(items) — Finaliza uma compra enviando os itens ao servidor.
 *
 * PARÂMETRO:
 * - items: array de objetos representando os itens da compra
 *   Exemplo: [
 *     { product_code: 1, quantity: 3, unit_price: 5.99 },
 *     { product_code: 4, quantity: 1, unit_price: 12.50 }
 *   ]
 *
 * FLUXO:
 * 1. Envia POST com o array de itens dentro de um objeto { items: [...] }
 * 2. O backend cria um registro de compra no banco e associa os itens
 * 3. Se der erro, lança exceção com a mensagem do servidor
 * 4. Se der certo, retorna a resposta (confirmação da compra)
 *
 * NOTA: Aqui retornamos "response" ao invés de "response.json()"
 * porque o componente que chama pode querer verificar o status
 * antes de processar o corpo da resposta.
 *
 * USADO POR: HomePage (botão "Finalizar Compra")
 */
export async function checkout(items) {
  const response = await fetch(ENDPOINTS.checkout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Error processing purchase on the server.');
  }
  return response;
}

// ═══════════════════════════════════════════════════════════════
// ─── FUNÇÕES DE HISTÓRICO ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

/**
 * fetchHistory() — Busca o histórico de TODAS as compras realizadas.
 *
 * Retorna uma lista com informações resumidas de cada compra
 * (código, data, valor total, etc.)
 *
 * USADO POR: HistoryPage (tabela de histórico)
 */
export async function fetchHistory() {
  const response = await fetch(ENDPOINTS.history);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * fetchPurchase(code) — Busca os DETALHES de uma compra específica.
 *
 * PARÂMETRO:
 * - code: código da compra (ex: 12)
 *
 * DIFERENÇA DE fetchHistory():
 * - fetchHistory() retorna TODAS as compras (resumo)
 * - fetchPurchase() retorna UMA compra com todos os detalhes
 *   (itens comprados, quantidades, preços individuais, etc.)
 *
 * A URL usa query parameter: /history.php?code=12
 * O backend PHP verifica se existe o parâmetro "code" e retorna
 * os detalhes daquela compra específica.
 *
 * USADO POR: PurchasePage (página de detalhes de uma compra)
 */
export async function fetchPurchase(code) {
  const response = await fetch(`${ENDPOINTS.history}?code=${code}`);
  if (!response.ok) throw new Error('Order not found');
  return response.json();
}
