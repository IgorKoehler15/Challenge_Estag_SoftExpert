/**
 * ============================================================
 * ARQUIVO: components/pages/HomePage.js
 * PÁGINA PRINCIPAL — CARRINHO DE COMPRAS
 * ============================================================
 *
 * Esta é a página MAIS COMPLEXA da aplicação. Ela implementa um
 * carrinho de compras completo com:
 *
 * 1. Seleção de produtos (com verificação de estoque)
 * 2. Adição de itens ao carrinho
 * 3. Cálculo automático de taxas e totais
 * 4. Persistência no localStorage (carrinho sobrevive ao refresh)
 * 5. Finalização da compra (checkout)
 * 6. Remoção de itens individuais
 * 7. Cancelamento da compra
 *
 * LAYOUT: SidebarLayout (duas colunas)
 * - Esquerda: formulário para selecionar produto e quantidade
 * - Direita: tabela do carrinho + totais + botões de ação
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: localStorage — PERSISTÊNCIA NO NAVEGADOR
 * ═══════════════════════════════════════════════════════════════
 *
 * localStorage é uma API do navegador que permite salvar dados
 * que PERSISTEM mesmo após fechar o navegador ou recarregar a página.
 *
 * - localStorage.setItem('chave', 'valor') → salva
 * - localStorage.getItem('chave') → lê
 * - localStorage.removeItem('chave') → remove
 *
 * LIMITAÇÕES:
 * - Só armazena STRINGS (por isso usamos JSON.stringify/parse)
 * - Limite de ~5MB por domínio
 * - Não é seguro para dados sensíveis (qualquer JS pode ler)
 * - Não sincroniza entre dispositivos
 *
 * AQUI USAMOS PARA: manter o carrinho de compras entre recarregamentos.
 * Se o usuário adicionar itens e fechar a aba, ao voltar os itens
 * ainda estarão lá.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: Promise.all — REQUISIÇÕES PARALELAS
 * ═══════════════════════════════════════════════════════════════
 *
 * Quando precisamos buscar dados de MÚLTIPLAS fontes, podemos:
 *
 * SEQUENCIAL (lento):
 *   const prods = await fetchProducts();   // espera 500ms
 *   const cats = await fetchCategories();  // espera mais 500ms
 *   // Total: 1000ms
 *
 * PARALELO (rápido):
 *   const [prods, cats] = await Promise.all([
 *     fetchProducts(),    // inicia imediatamente
 *     fetchCategories(),  // inicia imediatamente
 *   ]);
 *   // Total: 500ms (o tempo do mais lento)
 *
 * Promise.all executa todas as Promises ao mesmo tempo e espera
 * TODAS terminarem. Muito mais eficiente!
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - SidebarLayout.js → template de duas colunas
 * - HomeForm.js → formulário de seleção de produto (organism)
 * - DataTable.js → tabela do carrinho (organism)
 * - TotalsSection.js → seção de totais (organism)
 * - Button.js → botões de ação (atom)
 * - api.js → fetchProducts, fetchCategories, checkout
 * - HistoryPage.js → destino após finalizar compra (navigate)
 */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * useNavigate: hook do react-router-dom para navegação PROGRAMÁTICA.
 *
 * DIFERENÇA DE <Link>:
 * - <Link> → navegação por CLIQUE do usuário (declarativa)
 * - useNavigate → navegação por CÓDIGO (imperativa)
 *
 * Exemplo: após finalizar a compra, redirecionamos automaticamente
 * para /history sem o usuário precisar clicar em nada.
 */
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../templates/SidebarLayout';
import HomeForm from '../organisms/HomeForm';
import DataTable from '../organisms/DataTable';
import TotalsSection from '../organisms/TotalsSection';
import Button from '../atoms/Button';
import * as api from '../../services/api';

// ─── CONSTANTE E FUNÇÕES AUXILIARES DO CARRINHO ──────────────
/**
 * CART_KEY: chave usada no localStorage para salvar o carrinho.
 * Usar uma constante evita erros de digitação e facilita mudanças.
 */
const CART_KEY = 'suite_cart';

/**
 * getCart(): lê o carrinho do localStorage.
 *
 * JSON.parse() converte a string salva de volta para um array.
 * O try/catch protege contra dados corrompidos no localStorage
 * (ex: se alguém editou manualmente e quebrou o JSON).
 *
 * || [] → se não existir nada salvo (null), retorna array vazio.
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * saveCart(cart): salva o carrinho no localStorage.
 * JSON.stringify() converte o array para string (localStorage só aceita strings).
 */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export default function HomePage() {
  /**
   * useNavigate() retorna uma função que permite navegar programaticamente.
   * Usamos após finalizar a compra: navigate('/history')
   */
  const navigate = useNavigate();

  // ─── ESTADOS ────────────────────────────────────────────────

  /** Produtos cadastrados no banco (vindos da API) */
  const [productsDb, setProductsDb] = useState([]);

  /** Categorias cadastradas no banco (vindas da API) */
  const [categoriesDb, setCategoriesDb] = useState([]);

  /**
   * cart: itens no carrinho de compras.
   *
   * useState(getCart) → inicializa com o valor do localStorage!
   * Quando passamos uma FUNÇÃO para useState (sem parênteses),
   * ela é executada apenas na PRIMEIRA renderização (lazy initialization).
   * Isso evita ler o localStorage em toda re-renderização.
   *
   * Cada item do carrinho tem a estrutura:
   * { product: {...}, category: {...}, amount: 3 }
   */
  const [cart, setCart] = useState(getCart);

  /** Valor selecionado no dropdown de produtos */
  const [selectedProduct, setSelectedProduct] = useState('');

  /** Quantidade digitada pelo usuário */
  const [amount, setAmount] = useState('');

  /** Taxa da categoria do produto selecionado (exibição) */
  const [tax, setTax] = useState('');

  /** Preço do produto selecionado (exibição) */
  const [price, setPrice] = useState('');

  /**
   * cartLoaded: flag que indica se o carrinho já foi validado
   * contra os produtos do banco. Evita salvar um carrinho vazio
   * no localStorage antes de verificar se os itens ainda existem.
   */
  const [cartLoaded, setCartLoaded] = useState(false);

  // ─── CARREGAMENTO INICIAL DE DADOS ──────────────────────────
  /**
   * loadData: busca produtos E categorias do servidor em paralelo,
   * depois valida o carrinho salvo no localStorage.
   *
   * VALIDAÇÃO DO CARRINHO:
   * Produtos podem ter sido deletados desde a última visita.
   * Então filtramos o carrinho para manter apenas itens cujo
   * produto AINDA EXISTE no banco de dados.
   *
   * .filter() cria um novo array apenas com itens que passam no teste.
   * .some() verifica se existe pelo menos um produto com aquele código.
   */
  const loadData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.fetchProducts(),
        api.fetchCategories(),
      ]);
      setProductsDb(prods);
      setCategoriesDb(cats);

      // Valida carrinho: remove itens de produtos que não existem mais
      const stored = getCart();
      const valid = stored.filter((item) =>
        prods.some((p) => parseInt(p.code) === parseInt(item.product.code))
      );
      if (valid.length !== stored.length) {
        saveCart(valid); // Atualiza localStorage sem itens inválidos
      }
      setCart(valid);
      setCartLoaded(true);
    } catch (error) {
      console.error('Erro ao buscar dados do banco:', error);
    }
  }, []);

  /** Carrega dados ao montar o componente */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * SINCRONIZAÇÃO: Salva o carrinho no localStorage sempre que ele muda.
   *
   * DEPENDÊNCIAS: [cart, cartLoaded]
   * - cart: quando itens são adicionados/removidos
   * - cartLoaded: só salva APÓS a validação inicial (evita sobrescrever
   *   com array vazio antes de carregar)
   */
  useEffect(() => {
    if (cartLoaded) {
      saveCart(cart);
    }
  }, [cart, cartLoaded]);

  // ─── CONSTRUÇÃO DAS OPÇÕES DO SELECT ────────────────────────
  /**
   * buildProductOptions: gera a lista de produtos disponíveis para
   * o dropdown, EXCLUINDO produtos que já estão com estoque esgotado
   * no carrinho.
   *
   * LÓGICA:
   * 1. Para cada produto do banco, verifica quanto já está no carrinho
   * 2. Se (estoque - quantidade_no_carrinho) > 0, o produto aparece
   * 3. Formata como { value, label } para o componente Select
   *
   * Isso impede o usuário de adicionar mais do que o estoque permite.
   */
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

  // ─── HANDLER: SELEÇÃO DE PRODUTO ───────────────────────────
  /**
   * handleProductChange: executada quando o usuário seleciona um
   * produto no dropdown.
   *
   * Além de atualizar o estado do select, também preenche
   * automaticamente os campos de taxa e preço (apenas exibição).
   * Isso dá feedback visual imediato ao usuário.
   *
   * FLUXO:
   * 1. Pega o código do produto selecionado
   * 2. Busca o produto no array productsDb
   * 3. Busca a categoria do produto no array categoriesDb
   * 4. Preenche taxa (da categoria) e preço (do produto)
   */
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

  // ─── HANDLER: ADICIONAR AO CARRINHO ────────────────────────
  /**
   * handleAdd: adiciona o produto selecionado ao carrinho.
   *
   * LÓGICA COMPLEXA:
   * 1. Valida se um produto foi selecionado
   * 2. Valida se a quantidade é um número inteiro positivo
   * 3. Verifica se o produto já está no carrinho
   * 4. Calcula o total desejado (existente + novo)
   * 5. Verifica se não excede o estoque
   * 6. Se já existe no carrinho: ATUALIZA a quantidade
   *    Se não existe: ADICIONA novo item
   * 7. Limpa os campos do formulário
   *
   * CONCEITO: IMUTABILIDADE DO ESTADO
   * Nunca modificamos o array "cart" diretamente!
   * Sempre criamos um NOVO array (com map ou spread [...]).
   * Isso é necessário para o React detectar a mudança e re-renderizar.
   *
   * ❌ cart.push(novoItem)  → modifica o array original (React não detecta)
   * ✅ setCart([...cart, novoItem]) → cria novo array (React detecta)
   */
  const handleAdd = () => {
    const selectedCode = parseInt(selectedProduct);
    const rawAmount = amount.trim();

    if (isNaN(selectedCode)) return alert('Please select a valid product.');

    const product = productsDb.find((p) => parseInt(p.code) === selectedCode);
    if (!product) return alert('Product not found in database.');

    // Regex /^\d+$/ → apenas dígitos (número inteiro positivo)
    if (!/^\d+$/.test(rawAmount) || parseInt(rawAmount) <= 0)
      return alert('Invalid amount.');

    const qty = parseInt(rawAmount);
    const existing = cart.find(
      (item) => parseInt(item.product.code) === parseInt(product.code)
    );
    const totalDesired = existing ? existing.amount + qty : qty;

    // Verificação de estoque
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

    let newCart;
    if (existing) {
      /**
       * .map() para atualizar UM item sem modificar os outros.
       * Para cada item: se for o produto que queremos atualizar,
       * retorna uma CÓPIA com a nova quantidade. Senão, retorna igual.
       *
       * { ...item, amount: totalDesired } → spread operator
       * Cria um novo objeto com todas as propriedades de "item",
       * mas sobrescreve "amount" com o novo valor.
       */
      newCart = cart.map((item) =>
        parseInt(item.product.code) === parseInt(product.code)
          ? { ...item, amount: totalDesired }
          : item
      );
    } else {
      /**
       * [...cart, novoItem] → spread operator em array
       * Cria um novo array com todos os itens existentes + o novo.
       */
      newCart = [...cart, { product, category, amount: qty }];
    }

    setCart(newCart);
    // Limpa os campos do formulário
    setSelectedProduct('');
    setAmount('');
    setTax('');
    setPrice('');
  };

  // ─── HANDLER: CANCELAR COMPRA ──────────────────────────────
  /**
   * Limpa todo o carrinho após confirmação do usuário.
   * setCart([]) → define o carrinho como array vazio.
   */
  const handleCancel = () => {
    if (cart.length > 0 && window.confirm('Cancel this purchase?')) {
      setCart([]);
    }
  };

  // ─── HANDLER: FINALIZAR COMPRA ─────────────────────────────
  /**
   * handleFinish: envia o carrinho ao servidor para processar a compra.
   *
   * FLUXO:
   * 1. Verifica se o carrinho não está vazio
   * 2. Pede confirmação ao usuário
   * 3. Envia os dados via api.checkout()
   * 4. Se der certo: limpa localStorage e navega para /history
   * 5. Se der erro: mostra mensagem de erro
   *
   * navigate('/history'): navegação programática — redireciona o
   * usuário para a página de histórico automaticamente.
   */
  const handleFinish = async () => {
    if (cart.length === 0) return alert('Your cart is empty.');

    if (window.confirm('Finalize this purchase?')) {
      try {
        await api.checkout(cart);
        localStorage.removeItem(CART_KEY); // Limpa o carrinho salvo
        navigate('/history'); // Redireciona para histórico
      } catch (error) {
        alert(error.message || 'Connection error while trying to complete the purchase.');
      }
    }
  };

  // ─── HANDLER: REMOVER ITEM DO CARRINHO ─────────────────────
  /**
   * Remove um produto específico do carrinho.
   *
   * .filter() cria um novo array EXCLUINDO o item com o código informado.
   * filter retorna apenas os itens onde a condição é TRUE.
   * Então "mantém todos EXCETO o que tem o código igual".
   */
  const handleDelete = (productCode) => {
    if (window.confirm('Do you really want to remove this product from the cart?')) {
      setCart(cart.filter((item) => parseInt(item.product.code) !== parseInt(productCode)));
    }
  };

  // ─── CÁLCULO DE TOTAIS E PREPARAÇÃO DA TABELA ──────────────
  /**
   * Aqui calculamos os totais E preparamos as linhas da tabela
   * ao mesmo tempo (em um único .map()).
   *
   * LÓGICA DE CÁLCULO POR ITEM:
   * 1. preço unitário × quantidade = subtotal do produto
   * 2. subtotal × (taxa / 100) = valor da taxa
   * 3. subtotal + taxa = total final do item
   *
   * As variáveis totalTax e grandTotal ACUMULAM os valores de
   * todos os itens (somam a cada iteração do map).
   *
   * NOTA: Declaramos com "let" (não "const") porque seus valores
   * mudam dentro do loop. "const" não permite reatribuição.
   */
  let totalTax = 0;
  let grandTotal = 0;

  const rows = cart.map((item) => {
    const itemPrice = parseFloat(item.product.price) || 0;

    // Busca a categoria atualizada do banco (pode ter mudado a taxa)
    const categoryObj =
      categoriesDb.find(
        (c) => parseInt(c.code) === parseInt(item.product.category_code)
      ) || item.category; // Fallback: usa a categoria salva no carrinho

    const taxRate =
      categoryObj && !isNaN(parseFloat(categoryObj.tax))
        ? parseFloat(categoryObj.tax)
        : 0;

    const productTotal = itemPrice * item.amount;
    const taxValue = (productTotal * taxRate) / 100;
    const finalRowTotal = productTotal + taxValue;

    // Acumula nos totais gerais
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

  // ─── MONTAGEM DO LAYOUT ─────────────────────────────────────

  /** Sidebar: formulário de seleção de produto */
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

  /**
   * Content: tabela do carrinho + totais + botões.
   *
   * O Fragment (<>...</>) agrupa múltiplos elementos sem criar
   * uma div extra no DOM.
   *
   * style={{ marginTop: 'auto' }}: empurra totais e botões para
   * o final da coluna (mesmo truque do CSS margin-top: auto).
   */
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
