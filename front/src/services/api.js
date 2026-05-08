const ENDPOINTS = {
  products: '/products.php',
  categories: '/categories.php',
  checkout: '/checkout.php',
  history: '/history.php',
};

export async function fetchProducts() {
  const response = await fetch(ENDPOINTS.products);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

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

export async function fetchCategories() {
  const response = await fetch(ENDPOINTS.categories);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

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

export async function fetchHistory() {
  const response = await fetch(ENDPOINTS.history);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchPurchase(code) {
  const response = await fetch(`${ENDPOINTS.history}?code=${code}`);
  if (!response.ok) throw new Error('Order not found');
  return response.json();
}
