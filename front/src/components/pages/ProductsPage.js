/**
 * ============================================================
 * ARQUIVO: components/pages/ProductsPage.js
 * PÁGINA DE CADASTRO E LISTAGEM DE PRODUTOS
 * ============================================================
 *
 * Esta página permite ao usuário:
 * 1. Cadastrar novos produtos (nome, quantidade, preço, categoria)
 * 2. Visualizar todos os produtos em uma tabela
 * 3. Excluir produtos (com verificação de carrinho)
 *
 * LAYOUT: SidebarLayout (duas colunas)
 * - Esquerda: formulário de cadastro (ProductForm)
 * - Direita: tabela com produtos cadastrados (DataTable)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: RELAÇÃO ENTRE ENTIDADES (Produto ↔ Categoria)
 * ═══════════════════════════════════════════════════════════════
 *
 * No banco de dados, cada produto PERTENCE a uma categoria.
 * Essa relação é feita pelo campo "category_code" no produto,
 * que referencia o "code" da categoria (chave estrangeira).
 *
 * Por isso esta página precisa carregar TANTO produtos QUANTO
 * categorias — para exibir o NOME da categoria na tabela e
 * para popular o dropdown de seleção no formulário.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: DESABILITAR BOTÃO DURANTE REQUISIÇÃO
 * ═══════════════════════════════════════════════════════════════
 *
 * O estado "addDisabled" impede que o usuário clique no botão
 * "Adicionar" múltiplas vezes enquanto a requisição está em
 * andamento. Sem isso, cliques rápidos poderiam criar duplicatas.
 *
 * Padrão: desabilita ANTES de enviar, reabilita no "finally"
 * (que executa tanto em sucesso quanto em erro).
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: VERIFICAÇÃO CROSS-PAGE (entre páginas)
 * ═══════════════════════════════════════════════════════════════
 *
 * Antes de deletar um produto, verificamos se ele está no
 * carrinho de compras (HomePage). Isso é feito lendo o
 * localStorage diretamente, pois o carrinho é gerenciado
 * por outra página.
 *
 * Isso demonstra como diferentes partes da aplicação podem
 * se comunicar indiretamente via localStorage.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - SidebarLayout.js → template de duas colunas
 * - ProductForm.js → formulário de cadastro (organism)
 * - DataTable.js → tabela de dados (organism)
 * - Button.js → botão de excluir (atom)
 * - api.js → fetchProducts, fetchCategories, createProduct, deleteProduct
 * - HomePage.js → compartilha dados via localStorage (carrinho)
 */

import React, { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../templates/SidebarLayout';
import ProductForm from '../organisms/ProductForm';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import * as api from '../../services/api';

export default function ProductsPage() {

  // ─── ESTADOS DO COMPONENTE ──────────────────────────────────

  /** Lista de produtos vindos do banco de dados */
  const [products, setProducts] = useState([]);

  /** Lista de categorias (para o dropdown e para exibir na tabela) */
  const [categoriesList, setCategoriesList] = useState([]);

  /** Valores dos campos do formulário (controlled inputs) */
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  /**
   * addDisabled: controla se o botão "Adicionar" está desabilitado.
   * true = botão desabilitado (requisição em andamento)
   * false = botão habilitado (pode clicar)
   *
   * Isso previne "double submit" (enviar o formulário duas vezes
   * por cliques rápidos ou duplo-clique acidental).
   */
  const [addDisabled, setAddDisabled] = useState(false);

  // ─── CARREGAMENTO DE DADOS ──────────────────────────────────
  /**
   * loadData: busca produtos E categorias em PARALELO.
   *
   * Promise.all([...]) executa ambas as requisições ao mesmo tempo.
   * O resultado é um array na mesma ordem: [produtos, categorias].
   *
   * Desestruturação do array:
   *   const [prods, cats] = await Promise.all([...])
   * É o mesmo que:
   *   const resultado = await Promise.all([...])
   *   const prods = resultado[0]
   *   const cats = resultado[1]
   */
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

  /** Executa loadData ao montar o componente */
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── OPÇÕES DO DROPDOWN DE CATEGORIAS ──────────────────────
  /**
   * Transforma a lista de categorias em formato para o Select:
   * [{ value: "1", label: "Bebidas" }, { value: "2", label: "Alimentos" }]
   *
   * O componente Select espera objetos com "value" (valor enviado)
   * e "label" (texto exibido ao usuário).
   *
   * charAt(0).toUpperCase() + slice(1): capitaliza primeira letra.
   */
  const categoryOptions = categoriesList.map((c) => ({
    value: String(c.code),
    label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
  }));

  // ─── HANDLER: ADICIONAR PRODUTO ────────────────────────────
  /**
   * handleAdd: valida os campos e envia o novo produto ao servidor.
   *
   * VALIDAÇÕES (padrão early return):
   * 1. Nome: 1-30 caracteres, pelo menos uma letra, sem duplicatas
   * 2. Quantidade: número inteiro entre 1 e 9999
   * 3. Preço: número decimal entre 0.01 e 99999.99
   * 4. Categoria: deve estar selecionada
   *
   * NORMALIZAÇÃO DO PREÇO:
   * .replace(',', '.') → aceita tanto vírgula quanto ponto como
   * separador decimal (comum no Brasil usar vírgula: "25,50").
   * O backend espera ponto, então convertemos antes de enviar.
   */
  const handleAdd = async () => {
    // Limpeza dos inputs
    const name = productName.replace(/\s+/g, ' ').trim();
    const amountRaw = amount.trim();
    const priceRaw = unitPrice.trim();
    const categoryCode = parseInt(selectedCategory, 10);

    // ─── Validação do NOME ────────────────────────────────────
    if (name.length === 0 || name.length > 30)
      return alert('Product name must be between 1 and 30 characters.');

    /**
     * Regex: deve conter pelo menos uma letra (incluindo acentuadas).
     * Permite letras, números e espaços. Rejeita apenas números
     * ou caracteres especiais.
     */
    const nameRegex = /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/;
    if (!nameRegex.test(name))
      return alert('Invalid Product Name! It must contain at least one letter.');

    // Verifica duplicata (case-insensitive)
    if (products.some((p) => p.name.toLowerCase() === name.toLowerCase()))
      return alert('Product already exists!');

    // ─── Validação da QUANTIDADE ──────────────────────────────
    if (amountRaw.length === 0 || amountRaw.length > 5)
      return alert('Amount is invalid or too large.');

    const amountRegex = /^\d+$/; // Apenas dígitos (inteiro positivo)
    if (!amountRegex.test(amountRaw)) return alert('Invalid Amount! Use only integers.');
    const qty = parseInt(amountRaw, 10);
    if (isNaN(qty) || qty <= 0 || qty > 9999)
      return alert('Amount must be between 1 and 9999.');

    // ─── Validação do PREÇO ───────────────────────────────────
    if (priceRaw.length === 0 || priceRaw.length > 10)
      return alert('Price is invalid or too large.');

    // Normaliza: aceita vírgula como separador decimal
    const normalizedPrice = priceRaw.replace(',', '.');

    /**
     * Regex do preço: /^\d+(\.\d{1,2})?$/
     * - \d+ → parte inteira (obrigatória)
     * - (\.\d{1,2})? → parte decimal opcional (1 ou 2 casas)
     * Aceita: "10", "25.5", "99.99" | Rejeita: ".5", "10.", "10.123"
     */
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!priceRegex.test(normalizedPrice))
      return alert('Invalid Price format! Use e.g., 10 or 25.50');
    const priceVal = parseFloat(normalizedPrice);
    if (isNaN(priceVal) || priceVal <= 0 || priceVal > 99999.99)
      return alert('Price must be between 0.01 and 99999.99.');

    // ─── Validação da CATEGORIA ───────────────────────────────
    if (isNaN(categoryCode)) return alert('Please select a category.');

    // ─── ENVIO AO SERVIDOR ────────────────────────────────────
    /**
     * PADRÃO: disable → request → enable
     * 1. Desabilita o botão (setAddDisabled(true))
     * 2. Envia a requisição
     * 3. Reabilita o botão no "finally" (sempre executa)
     *
     * "finally" é executado INDEPENDENTE de sucesso ou erro.
     * Garante que o botão sempre volta ao estado normal.
     */
    setAddDisabled(true);

    const newProduct = {
      name,
      amount: qty,
      price: priceVal,
      category_code: categoryCode,
    };

    try {
      await api.createProduct(newProduct);
      // Limpa todos os campos após sucesso
      setProductName('');
      setAmount('');
      setUnitPrice('');
      setSelectedCategory('');
      await loadData(); // Recarrega a tabela
    } catch (error) {
      alert(error.message || 'Error saving product to server.');
    } finally {
      setAddDisabled(false); // SEMPRE reabilita o botão
    }
  };

  // ─── HANDLER: EXCLUIR PRODUTO ──────────────────────────────
  /**
   * handleDelete: exclui um produto com verificações de segurança.
   *
   * VERIFICAÇÃO CROSS-PAGE:
   * Antes de deletar, verifica se o produto está no carrinho
   * de compras (gerenciado pela HomePage via localStorage).
   * Se estiver, impede a exclusão para não quebrar o carrinho.
   *
   * FLUXO:
   * 1. Encontra o produto pelo código
   * 2. Lê o carrinho do localStorage
   * 3. Verifica se o produto está no carrinho
   * 4. Se estiver → bloqueia com mensagem explicativa
   * 5. Se não estiver → pede confirmação e deleta
   */
  const handleDelete = async (code) => {
    const productToDelete = products.find((p) => parseInt(p.code) === parseInt(code));
    if (!productToDelete) return;

    // Verifica se o produto está no carrinho (outra página)
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

    // Confirmação e exclusão
    if (window.confirm(`Delete the product "${productToDelete.name}"?`)) {
      try {
        const data = await api.deleteProduct(code);
        alert(data.message || 'Product successfully deleted!');
        await loadData(); // Atualiza a tabela
      } catch (error) {
        alert(error.message || 'Error connecting to the server while trying to delete.');
      }
    }
  };

  // ─── PREPARAÇÃO DOS DADOS PARA A TABELA ────────────────────
  /**
   * Para cada produto, precisamos:
   * 1. Encontrar o NOME da categoria (o produto só tem o código)
   * 2. Formatar o código com zeros à esquerda (padStart)
   * 3. Formatar o preço com 2 casas decimais (toFixed)
   * 4. Criar o botão de excluir com o handler correto
   *
   * .find() retorna o PRIMEIRO elemento que satisfaz a condição,
   * ou undefined se nenhum satisfizer. Por isso o fallback 'Unknown'.
   */
  const rows = products.map((p, index) => {
    // Busca a categoria pelo código de referência do produto
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
        /**
         * () => handleDelete(p.code)
         *
         * POR QUE UMA ARROW FUNCTION AQUI?
         * Se escrevêssemos onClick={handleDelete(p.code)}, a função
         * seria EXECUTADA imediatamente durante a renderização!
         * A arrow function cria uma "função que chama handleDelete"
         * que só executa quando o usuário CLICAR.
         *
         * É um dos erros mais comuns de iniciantes em React.
         * ❌ onClick={handleDelete(p.code)} → executa na renderização
         * ✅ onClick={() => handleDelete(p.code)} → executa no clique
         */
        <Button variant="btn-cancel" onClick={() => handleDelete(p.code)}>
          Delete
        </Button>,
      ],
    };
  });

  // ─── MONTAGEM DO LAYOUT ─────────────────────────────────────
  /**
   * Sidebar: formulário com todos os campos e handlers.
   *
   * Cada prop "on___Change" recebe uma arrow function que:
   * 1. Recebe o evento (e) do input
   * 2. Extrai o valor digitado (e.target.value)
   * 3. Atualiza o estado correspondente
   *
   * "disabled={addDisabled}" desabilita o botão durante o envio.
   */
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
