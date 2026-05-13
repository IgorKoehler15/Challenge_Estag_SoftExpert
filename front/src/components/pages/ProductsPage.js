import { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../templates/SidebarLayout';
import ProductForm from '../organisms/ProductForm';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import * as api from '../../services/api';

// Página de gerenciamento de produtos (listagem, criação e exclusão)
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addDisabled, setAddDisabled] = useState(false);

  // Carrega produtos e categorias da API
  const loadData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.fetchProducts(),
        api.fetchCategories(),
      ]);
      setProducts(prods);
      setCategoriesList(cats);
    } catch (error) {
      console.error('Error loading data:', error);
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
    if (name.length === 0 || name.length > 30)
      return alert('Product name must be between 1 and 30 characters.');

    const nameRegex = /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/;
    if (!nameRegex.test(name))
      return alert('Invalid Product Name! It must contain at least one letter.');

    // Verifica duplicidade local
    if (products.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return alert('Product already exists!');

    // Validação da quantidade: inteiro positivo até 9999
    if (amountRaw.length === 0 || amountRaw.length > 5)
      return alert('Amount is invalid or too large.');

    const amountRegex = /^\d+$/;
    if (!amountRegex.test(amountRaw)) return alert('Invalid Amount! Use only integers.');
    const qty = parseInt(amountRaw, 10);
    if (isNaN(qty) || qty <= 0 || qty > 9999)
      return alert('Amount must be between 1 and 9999.');

    // Validação do preço: formato numérico com até 2 casas decimais
    if (priceRaw.length === 0 || priceRaw.length > 10)
      return alert('Price is invalid or too large.');

    const normalizedPrice = priceRaw.replace(',', '.');

    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!priceRegex.test(normalizedPrice))
      return alert('Invalid Price format! Use e.g., 10 or 25.50');
    const priceVal = parseFloat(normalizedPrice);
    if (isNaN(priceVal) || priceVal <= 0 || priceVal > 99999.99)
      return alert('Price must be between 0.01 and 99999.99.');

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
  const content = (
    <DataTable
      className="table-products"
      columns={['Code', 'Product', 'Category', 'Price', 'Amount', 'Actions']}
      rows={rows}
      fillerCols={6}
    />
  );

  return <SidebarLayout sidebar={sidebar} content={content} />;
}
