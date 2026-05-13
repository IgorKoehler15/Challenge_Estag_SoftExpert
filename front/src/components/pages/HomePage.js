import { useState, useEffect, useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../templates/SidebarLayout';
import HomeForm from '../organisms/HomeForm';
import DataTable from '../organisms/DataTable';
import TotalsSection from '../organisms/TotalsSection';
import Button from '../atoms/Button';
import * as api from '../../services/api';

// Chave usada para persistir o carrinho no localStorage
const CART_KEY = 'suite_cart';

// Recupera o carrinho salvo no localStorage (ou retorna array vazio)
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// Salva o carrinho no localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Página principal — gerencia o carrinho de compras e finalização do pedido
export default function HomePage() {
  const navigate = useNavigate();
  const [productsDb, setProductsDb] = useState([]);
  const [categoriesDb, setCategoriesDb] = useState([]);
  const [cart, setCart] = useState(getCart);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [price, setPrice] = useState('');
  const [cartLoaded, setCartLoaded] = useState(false);

  // Carrega produtos e categorias da API, e valida itens do carrinho salvo
  const loadData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.fetchProducts(),
        api.fetchCategories(),
      ]);
      setProductsDb(prods);
      setCategoriesDb(cats);

      // Remove do carrinho itens cujos produtos não existem mais no banco
      const stored = getCart();
      const valid = stored.filter((item) =>
        prods.some((p) => parseInt(p.code) === parseInt(item.product.code))
      );
      if (valid.length !== stored.length) {
        saveCart(valid); 
      }
      setCart(valid);
      setCartLoaded(true);
    } catch (error) {
      console.error('Erro ao buscar dados do banco:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persiste o carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    if (cartLoaded) {
      saveCart(cart);
    }
  }, [cart, cartLoaded]);

  // Filtra produtos disponíveis (exclui os que já atingiram o limite no carrinho)
  const buildProductOptions = () => {
    return productsDb
      .filter((p) => {
        const inCart = cart.find(
          (item) => parseInt(item.product.code) === parseInt(p.code)
        );
        const amountInCart = inCart ? inCart.amount : 0;
        return parseInt(p.amount) - amountInCart > 0;
      })
      .map((p) => ({
        value: String(p.code),
        label: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      }));
  };

  // Ao selecionar um produto, preenche automaticamente imposto e preço
  const handleProductChange = (e) => {
    const code = parseInt(e.target.value);
    setSelectedProduct(e.target.value);
    const product = productsDb.find((p) => parseInt(p.code) === code);
    if (product) {
      const category = categoriesDb.find(
        (c) => parseInt(c.code) === parseInt(product.category_code)
      );
      setTax(category ? parseFloat(category.tax).toFixed(2) : '0');
      setPrice(parseFloat(product.price).toFixed(2));
    } else {
      setTax('');
      setPrice('');
    }
  };

  // Valida e adiciona o produto selecionado ao carrinho
  const handleAdd = () => {
    const selectedCode = parseInt(selectedProduct);
    const rawAmount = amount.trim();

    if (isNaN(selectedCode)) return alert('Please select a valid product.');

    const product = productsDb.find((p) => parseInt(p.code) === selectedCode);
    if (!product) return alert('Product not found in database.');

    if (!/^\d+$/.test(rawAmount) || parseInt(rawAmount) <= 0)
      return alert('Invalid amount.');

    const qty = parseInt(rawAmount);
    const existing = cart.find(
      (item) => parseInt(item.product.code) === parseInt(product.code)
    );
    const totalDesired = existing ? existing.amount + qty : qty;

    // Verifica se a quantidade desejada não excede o estoque disponível
    if (totalDesired > parseInt(product.amount)) {
      return alert(
        `Stock limit reached! Available: ${
          product.amount - (existing ? existing.amount : 0)
        } more.`
      );
    }

    const category = categoriesDb.find(
      (c) => parseInt(c.code) === parseInt(product.category_code)
    );

    // Se o produto já está no carrinho, atualiza a quantidade; senão, adiciona novo item
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        parseInt(item.product.code) === parseInt(product.code)
          ? { ...item, amount: totalDesired }
          : item
      );
    } else {
      newCart = [...cart, { product, category, amount: qty }];
    }

    setCart(newCart);
    setSelectedProduct('');
    setAmount('');
    setTax('');
    setPrice('');
  };

  // Cancela a compra e limpa o carrinho
  const handleCancel = () => {
    if (cart.length > 0 && window.confirm('Cancel this purchase?')) {
      setCart([]);
    }
  };

  // Finaliza a compra enviando o carrinho para a API de checkout
  const handleFinish = async () => {
    if (cart.length === 0) return alert('Your cart is empty.');

    if (window.confirm('Finalize this purchase?')) {
      try {
        await api.checkout(cart);
        localStorage.removeItem(CART_KEY); 
        navigate('/history');
      } catch (error) {
        alert(error.message || 'Connection error while trying to complete the purchase.');
      }
    }
  };

  // Remove um produto do carrinho
  const handleDelete = (productCode) => {
    if (window.confirm('Do you really want to remove this product from the cart?')) {
      setCart(cart.filter((item) => parseInt(item.product.code) !== parseInt(productCode)));
    }
  };

  // Calcula totais de imposto e valor geral para exibição
  let totalTax = 0;
  let grandTotal = 0;

  // Monta as linhas da tabela do carrinho com cálculos de imposto por item
  const rows = cart.map((item) => {
    const itemPrice = parseFloat(item.product.price) || 0;

    const categoryObj =
      categoriesDb.find(
        (c) => parseInt(c.code) === parseInt(item.product.category_code)
      ) || item.category; 

    const taxRate =
      categoryObj && !isNaN(parseFloat(categoryObj.tax))
        ? parseFloat(categoryObj.tax)
        : 0;

    const productTotal = itemPrice * item.amount;
    const taxValue = (productTotal * taxRate) / 100;
    const finalRowTotal = productTotal + taxValue;

    totalTax += taxValue;
    grandTotal += finalRowTotal;

    return {
      key: item.product.code,
      cells: [
        item.product.name,
        itemPrice.toFixed(2),
        item.amount,
        taxValue.toFixed(2),
        finalRowTotal.toFixed(2),
        <Button
          variant="btn-cancel"
          style={{ padding: '5px 10px', fontSize: '12px' }}
          onClick={() => handleDelete(item.product.code)}
        >
          Delete
        </Button>,
      ],
    };
  });

  // Sidebar: formulário para adicionar produtos ao carrinho
  const sidebar = (
    <HomeForm
      productOptions={buildProductOptions()}
      selectedProduct={selectedProduct}
      amount={amount}
      tax={tax}
      price={price}
      onProductChange={handleProductChange}
      onAmountChange={(e) => setAmount(e.target.value)}
      onAdd={handleAdd}
    />
  );

  // Conteúdo principal: tabela do carrinho + totais + botões de ação
  const content = (
    <>
      <DataTable
        className="tabelaProdutos"
        columns={['Product', 'Price', 'Amount', 'Tax', 'Total', 'Actions']}
        rows={rows}
        fillerCols={6}
      />
      <div style={{ marginTop: 'auto' }}>
        <TotalsSection
          rows={[
            { label: 'Tax:', value: cart.length === 0 ? '$0.00' : totalTax.toFixed(2) },
            { label: 'Total:', value: cart.length === 0 ? '$0.00' : grandTotal.toFixed(2) },
          ]}
        />
        <div className="action-buttons">
          <Button variant="btn-cancel" onClick={handleCancel}>Cancel</Button>
          <Button variant="btn-finish" onClick={handleFinish}>Finish</Button>
        </div>
      </div>
    </>
  );

  return <SidebarLayout sidebar={sidebar} content={content} />;
}
