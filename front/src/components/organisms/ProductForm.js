/**
 * ============================================================
 * ARQUIVO: components/organisms/ProductForm.js
 * FORMULÁRIO DE CADASTRO DE PRODUTOS
 * ============================================================
 *
 * Este organismo renderiza o formulário para cadastrar novos
 * produtos no sistema. É o formulário mais COMPLETO da aplicação,
 * com 4 campos: nome, quantidade, preço unitário e categoria.
 *
 * LAYOUT DOS CAMPOS:
 * ┌─────────────────────────────────────┐
 * │  [Nome do Produto                 ] │  ← linha inteira
 * ├───────────┬───────────┬─────────────┤
 * │ [Qtd    ] │ [Preço  ] │ [Categoria] │  ← 3 campos lado a lado
 * ├─────────────────────────────────────┤
 * │        [Adicionar Produto]          │  ← botão
 * └─────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: PROP "disabled" — DESABILITAR INTERAÇÃO
 * ═══════════════════════════════════════════════════════════════
 *
 * A prop "disabled" é passada ao botão para impedir cliques
 * enquanto uma requisição está em andamento (double submit).
 *
 * Quando disabled={true}:
 * - O botão fica visualmente "acinzentado"
 * - Cliques são ignorados (onClick não dispara)
 * - O cursor muda para "not-allowed"
 *
 * A ProductsPage controla esse estado:
 * 1. Usuário clica → setAddDisabled(true) → botão desabilita
 * 2. Requisição termina → setAddDisabled(false) → botão reabilita
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: FLUXO DE DADOS UNIDIRECIONAL (One-Way Data Flow)
 * ═══════════════════════════════════════════════════════════════
 *
 * Em React, dados fluem em UMA direção: de CIMA para BAIXO.
 *
 *   ProductsPage (estado + lógica)
 *       ↓ props (dados descem)
 *   ProductForm (visual)
 *       ↓ eventos (ações sobem via callbacks)
 *   ProductsPage (processa o evento)
 *
 * O formulário NÃO modifica dados diretamente. Ele apenas
 * AVISA a página (via callbacks como onNameChange) que algo
 * aconteceu, e a página decide o que fazer.
 *
 * Isso torna o fluxo PREVISÍVEL e fácil de debugar:
 * - Dados sempre vêm de um lugar (estado da página)
 * - Mudanças sempre passam por um caminho (setState)
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: ProductsPage.js (como prop "sidebar" do SidebarLayout)
 * - Usa: FormGroup (molecule), InputRow (molecule), Input (atom),
 *         Select (atom), Button (atom)
 * - Estilos: components.css (.aside-1, .form-group, .input-row)
 */

import React from 'react';
import FormGroup from '../molecules/FormGroup';
import InputRow from '../molecules/InputRow';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Button from '../atoms/Button';

/**
 * ProductForm — Formulário de cadastro de produtos.
 *
 * PROPS (todas vêm da ProductsPage):
 *
 * @param {string} productName — Valor do campo "nome do produto"
 * @param {string} amount — Valor do campo "quantidade"
 * @param {string} unitPrice — Valor do campo "preço unitário"
 * @param {Array} categoryOptions — Opções do dropdown de categorias
 *   Formato: [{ value: "1", label: "Bebidas" }, ...]
 * @param {string} selectedCategory — Código da categoria selecionada
 *
 * @param {function} onNameChange — Handler para mudança no nome
 * @param {function} onAmountChange — Handler para mudança na quantidade
 * @param {function} onPriceChange — Handler para mudança no preço
 * @param {function} onCategoryChange — Handler para mudança na categoria
 * @param {function} onAdd — Handler do botão "Add Product"
 *
 * @param {boolean} disabled — Se true, desabilita o botão de adicionar
 */
export default function ProductForm({
  productName,
  amount,
  unitPrice,
  categoryOptions,
  selectedCategory,
  onNameChange,
  onAmountChange,
  onPriceChange,
  onCategoryChange,
  onAdd,
  disabled,
}) {
  return (
    <aside className="aside-1">
      {/* ─── CAMPO DE NOME (linha inteira) ─────────────────────── */}
      {/*
        FormGroup sem InputRow = ocupa toda a largura disponível.
        O nome é o campo mais importante, por isso fica sozinho
        em uma linha — mais espaço para digitar nomes longos.
      */}
      <FormGroup>
        <Input
          type="text"
          id="productName"
          name="productName"
          placeholder="Product Name"
          value={productName}
          onChange={onNameChange}
        />
      </FormGroup>

      {/* ─── LINHA COM 3 CAMPOS LADO A LADO ────────────────────── */}
      {/*
        InputRow + FormGroup com flex: 1 = cada campo ocupa 1/3.
        Campos numéricos e select ficam na mesma linha para
        economizar espaço vertical.
      */}
      <InputRow>
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
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="unitPrice"
            name="unitPrice"
            placeholder="Unit Price"
            value={unitPrice}
            onChange={onPriceChange}
          />
        </FormGroup>
        <FormGroup style={{ flex: 1 }}>
          <Select
            name="category"
            id="category"
            value={selectedCategory}
            onChange={onCategoryChange}
            placeholder="Category"
            options={categoryOptions}
          />
        </FormGroup>
      </InputRow>

      {/* ─── BOTÃO DE ADICIONAR ────────────────────────────────── */}
      {/*
        disabled={disabled}: quando true, o botão fica inativo.
        Isso previne envios duplicados durante requisições.

        O componente Button internamente aplica o atributo HTML
        "disabled" que o navegador reconhece nativamente.
      */}
      <Button variant="addProduct" onClick={onAdd} disabled={disabled}>
        Add Product
      </Button>
    </aside>
  );
}
