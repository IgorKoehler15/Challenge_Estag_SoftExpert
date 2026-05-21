import { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../templates/SidebarLayout';
import ProductForm from '../organisms/ProductForm';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import ErrorMessage from '../atoms/ErrorMessage';
import * as api from '../../services/api';
import { validateName, validateAmount, validatePrice, parsePrice } from '../../utils/validation';
import logger from '../../utils/logger';

// Página de gerenciamento de produtos (listagem, criação e exclusão)
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addDisabled, setAddDisabled] = useState(false);
  const [error, setError] = useState(null);

  // Carrega produtos e categorias da API
  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        api.fetchProducts(),
        api.fetchCategories(),
      ]);
      setProducts(prods);
      setCategoriesList(cats);
    } catch (err) {
      logger.error('Error loading data:', err);
      setError('Failed to load products. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Monta as opções do select de categorias para o formulário
  const categoryOptions = categoriesList.map((c) => ({
    value: String(c.code),
    label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
  }));

  // Valida os campos e envia o novo produto para a API
  const handleAdd = async () => {
    const name = productName.replace(/\s+/g, ' ').trim();
    const amountRaw = amount.trim();
    const priceRaw = unitPrice.trim();
    const categoryCode = parseInt(selectedCategory, 10);

    // Validação do nome: tamanho e formato
    const nameError = validateName(name, 'Product name');
    if (nameError) return alert(nameError);

    // Verifica duplicidade local (apenas produtos com estoque visível)
    if (products.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return alert('Product already exists!');

    // Validação da quantidade
    const amountError = validateAmount(amountRaw);
    if (amountError) return alert(amountError);
    const qty = parseInt(amountRaw, 10);

    // Validação do preço
    const priceError = validatePrice(priceRaw);
    if (priceError) return alert(priceError);
    const priceVal = parsePrice(priceRaw);

    if (isNaN(categoryCode)) return alert('Please select a category.');

    // Desabilita o botão para evitar duplo clique
    setAddDisabled(true);

    const newProduct = {
      name,
      amount: qty,
      price: priceVal,
      category_code: categoryCode,
    };

    try {
      await api.createProduct(newProduct);
      setProductName('');
      setAmount('');
      setUnitPrice('');
      setSelectedCategory('');
      await loadData(); 
    } catch (error) {
      alert(error.message || 'Error saving product to server.');
    } finally {
      setAddDisabled(false); 
    }
  };

  // Verifica se o produto está no carrinho e executa a exclusão
  const handleDelete = async (code) => {
    const productToDelete = products.find((p) => parseInt(p.code) === parseInt(code));
    if (!productToDelete) return;

    // Impede exclusão se o produto está no carrinho da HomePage
    const cartData = localStorage.getItem('suite_cart');
    if (cartData) {
      const cart = JSON.parse(cartData);
      const isInCart = cart.some(
        (item) => parseInt(item.product.code) === parseInt(code)
      );
      if (isInCart) {
        return alert(
          `It cannot be deleted: The "${productToDelete.name}" product is currently in the shopping cart on the Home page!`
        );
      }
    }

    if (window.confirm(`Delete the product "${productToDelete.name}"?`)) {
      try {
        const data = await api.deleteProduct(code);
        alert(data.message || 'Product successfully deleted!');
        await loadData(); 
      } catch (error) {
        alert(error.message || 'Error connecting to the server while trying to delete.');
      }
    }
  };

  // Monta as linhas da tabela com dados dos produtos e nome da categoria
  const rows = products.map((p, index) => {
    const catObj = categoriesList.find(
      (c) => parseInt(c.code) === parseInt(p.category_code)
    );
    const catName = catObj ? catObj.name : 'Unknown';
    const catFormat = catName.charAt(0).toUpperCase() + catName.slice(1);
    const displayCode = String(p.display_code).padStart(3, '0');

    return {
      key: p.code,
      cells: [
        <strong>{displayCode}</strong>,
        p.name,
        catFormat,
        Number(p.price).toFixed(2),
        p.amount,
        <Button variant="btn-cancel" onClick={() => handleDelete(p.code)}>
          Delete
        </Button>,
      ],
    };
  });

  // Sidebar: formulário de cadastro de produto
  const sidebar = (
    <ProductForm
      productName={productName}
      amount={amount}
      unitPrice={unitPrice}
      categoryOptions={categoryOptions}
      selectedCategory={selectedCategory}
      onNameChange={(e) => setProductName(e.target.value)}
      onAmountChange={(e) => setAmount(e.target.value)}
      onPriceChange={(e) => setUnitPrice(e.target.value)}
      onCategoryChange={(e) => setSelectedCategory(e.target.value)}
      onAdd={handleAdd}
      disabled={addDisabled}
    />
  );

  // Conteúdo principal: tabela de produtos
  const content = error ? (
    <ErrorMessage message={error} onRetry={loadData} />
  ) : (
    <DataTable
      className="table-products"
      columns={['Code', 'Product', 'Category', 'Price', 'Amount', 'Actions']}
      rows={rows}
      fillerCols={6}
    />
  );

  return <SidebarLayout sidebar={sidebar} content={content} />;
}
