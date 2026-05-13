/**
 * ============================================================
 * ARQUIVO: components/organisms/HomeForm.js
 * FORMULÁRIO DE SELEÇÃO DE PRODUTO (Página Inicial / Carrinho)
 * ============================================================
 *
 * Este organismo renderiza o formulário da página inicial onde
 * o usuário SELECIONA um produto e define a QUANTIDADE para
 * adicionar ao carrinho de compras.
 *
 * DIFERENÇA DOS OUTROS FORMULÁRIOS:
 * - CategoryForm: cadastra categorias (nome + taxa)
 * - ProductForm: cadastra produtos (nome + qtd + preço + categoria)
 * - HomeForm: SELECIONA produto existente + quantidade para compra
 *
 * CAMPOS:
 * - Select de produto (dropdown com produtos disponíveis)
 * - Input de quantidade (editável pelo usuário)
 * - Input de taxa (somente leitura — preenchido automaticamente)
 * - Input de preço (somente leitura — preenchido automaticamente)
 * - Botão "Add Product" (adiciona ao carrinho)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: CAMPOS SOMENTE LEITURA (readOnly)
 * ═══════════════════════════════════════════════════════════════
 *
 * Os campos "Tax" e "Price" são readOnly — o usuário NÃO pode
 * editá-los. Eles são preenchidos AUTOMATICAMENTE quando o
 * usuário seleciona um produto no dropdown.
 *
 * POR QUE EXIBIR SE NÃO PODE EDITAR?
 * - Feedback visual: o usuário vê o preço e taxa antes de adicionar
 * - Transparência: mostra como o total será calculado
 * - UX: evita surpresas no momento da finalização
 *
 * readOnly vs disabled:
 * - readOnly: campo visível, texto selecionável, NÃO enviado em forms nativos
 * - disabled: campo "acinzentado", texto NÃO selecionável, NÃO enviado
 *
 * Aqui usamos readOnly + backgroundColor cinza para indicar visualmente
 * que o campo é informativo (não editável).
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: HomePage.js (como prop "sidebar" do SidebarLayout)
 * - Usa: FormGroup (molecule), InputRow (molecule), Select (atom),
 *         Input (atom), Button (atom)
 * - Estilos: components.css (.aside-1, .form-group, .input-row)
 */

import React from 'react';
import FormGroup from '../molecules/FormGroup';
import InputRow from '../molecules/InputRow';
import Select from '../atoms/Select';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

/**
 * HomeForm — Formulário de seleção de produto para o carrinho.
 *
 * PROPS (todas vêm da HomePage):
 *
 * @param {Array} productOptions — Opções para o dropdown de produtos
 *   Formato: [{ value: "1", label: "Arroz" }, ...]
 *   Já filtrado: só mostra produtos com estoque disponível
 *
 * @param {string} selectedProduct — Código do produto selecionado
 * @param {string} amount — Quantidade digitada pelo usuário
 * @param {string} tax — Taxa da categoria (preenchido automaticamente)
 * @param {string} price — Preço do produto (preenchido automaticamente)
 *
 * @param {function} onProductChange — Handler quando seleciona um produto
 *   (a HomePage preenche taxa e preço automaticamente)
 * @param {function} onAmountChange — Handler quando digita quantidade
 * @param {function} onAdd — Handler do botão "Add Product"
 *   (a HomePage valida e adiciona ao carrinho)
 */
export default function HomeForm({
  productOptions,
  selectedProduct,
  amount,
  tax,
  price,
  onProductChange,
  onAmountChange,
  onAdd,
}) {
  return (
    <aside className="aside-1">
      {/* ─── SELECT DE PRODUTO ─────────────────────────────────── */}
      {/*
        FormGroup sem InputRow = campo ocupa toda a largura.
        O Select mostra apenas produtos com estoque disponível
        (a filtragem é feita na HomePage, buildProductOptions).
      */}
      <FormGroup>
        <Select
          id="prod"
          name="prod"
          value={selectedProduct}
          onChange={onProductChange}
          placeholder="Select a Product"
          options={productOptions}
        />
      </FormGroup>

      {/* ─── LINHA COM 3 CAMPOS LADO A LADO ────────────────────── */}
      {/*
        InputRow coloca os 3 campos na mesma linha (flex horizontal).
        Cada FormGroup tem flex: 1 = todos ocupam espaço igual (1/3).
      */}
      <InputRow>
        {/* Quantidade: editável pelo usuário */}
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="amount"
            name="amount"
            placeholder="Amount"
            value={amount}
            onChange={onAmountChange}
          />
        </FormGroup>

        {/* Taxa: somente leitura (preenchido ao selecionar produto) */}
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="tax"
            name="tax"
            placeholder="Tax"
            value={tax}
            readOnly
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </FormGroup>

        {/* Preço: somente leitura (preenchido ao selecionar produto) */}
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="price"
            name="price"
            placeholder="Price"
            value={price}
            readOnly
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </FormGroup>
      </InputRow>

      {/* Botão para adicionar o produto ao carrinho */}
      <Button variant="addProduct" onClick={onAdd}>
        Add Product
      </Button>
    </aside>
  );
}
