// Mapeamento dos endpoints da API PHP no back-end
const ENDPOINTS = {
  products: '/products.php',
  categories: '/categories.php',
  checkout: '/checkout.php',
  history: '/history.php',
};

// Tenta parsear a resposta como JSON
// Se falhar (ex: proxy retorna texto puro), lança um erro amigável
async function parseJSON(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Server unavailable. Please try again later.');
  }
}

// ==================== PRODUTOS ====================

// Busca todos os produtos ativos com estoque
export async function fetchProducts() {
  const response = await fetch(ENDPOINTS.products);
  const data = await parseJSON(response);
  return Array.isArray(data) ? data : [];
}

// Cria um novo produto enviando os dados via POST
export async function createProduct(product) {
  const response = await fetch(ENDPOINTS.products, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const data = await parseJSON(response);
  if (!response.ok) {
    throw new Error(data.error || 'Error saving product to server.');
  }
  return data;
}

// Exclui um produto pelo código (soft ou hard delete no back-end)
export async function deleteProduct(code) {
  const response = await fetch(`${ENDPOINTS.products}?code=${code}`, {
    method: 'DELETE',
  });
  const data = await parseJSON(response);
  if (!response.ok) {
    throw new Error(data.error || 'Error deleting product on the server.');
  }
  return data;
}

// ==================== CATEGORIAS ====================

// Busca todas as categorias ativas
export async function fetchCategories() {
  const response = await fetch(ENDPOINTS.categories);
  const data = await parseJSON(response);
  return Array.isArray(data) ? data : [];
}

// Cria uma nova categoria enviando nome e taxa via POST
export async function createCategory(category) {
  const response = await fetch(ENDPOINTS.categories, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  const data = await parseJSON(response);
  if (!response.ok) {
    throw new Error(data.error || 'Error saving category to database.');
  }
  return data;
}

// Exclui uma categoria pelo código
export async function deleteCategory(code) {
  const response = await fetch(`${ENDPOINTS.categories}?code=${code}`, {
    method: 'DELETE',
  });
  const data = await parseJSON(response);
  if (!response.ok) {
    throw new Error(data.error || 'The category could not be deleted.');
  }
  return data;
}

// ==================== CHECKOUT ====================

// Envia os itens do carrinho para finalizar a compra
export async function checkout(items) {
  const response = await fetch(ENDPOINTS.checkout, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const data = await parseJSON(response);
    throw new Error(data.error || 'Error processing purchase on the server.');
  }
  return response;
}

// ==================== HISTÓRICO ====================

// Busca a lista de todos os pedidos finalizados
export async function fetchHistory() {
  const response = await fetch(ENDPOINTS.history);
  const data = await parseJSON(response);
  return Array.isArray(data) ? data : [];
}

// Busca os detalhes de um pedido específico pelo código
export async function fetchPurchase(code) {
  const response = await fetch(`${ENDPOINTS.history}?code=${code}`);
  if (!response.ok) throw new Error('Order not found');
  return parseJSON(response);
}
