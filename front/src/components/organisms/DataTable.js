/**
 * ============================================================
 * ARQUIVO: components/organisms/DataTable.js
 * TABELA DE DADOS GENÉRICA E REUTILIZÁVEL
 * ============================================================
 *
 * Este é o organismo MAIS REUTILIZADO da aplicação. Ele renderiza
 * uma tabela HTML completa a partir de dados recebidos via props.
 *
 * É usado em TODAS as páginas que exibem dados tabulares:
 * - HomePage (carrinho de compras)
 * - ProductsPage (lista de produtos)
 * - CategoriesPage (lista de categorias)
 * - HistoryPage (histórico de compras)
 * - PurchasePage (itens de uma compra)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPONENTE GENÉRICO (Reusable Component)
 * ═══════════════════════════════════════════════════════════════
 *
 * Este componente NÃO sabe o que vai exibir. Ele recebe:
 * - columns: nomes das colunas (cabeçalho)
 * - rows: dados das linhas (corpo)
 *
 * Cada página decide O QUE passar. O DataTable apenas RENDERIZA.
 * Isso é o princípio de "Inversão de Controle" — quem CHAMA
 * o componente controla o que ele exibe.
 *
 * VANTAGENS:
 * - UM componente serve para 5+ tabelas diferentes
 * - Mudanças no estilo/comportamento da tabela afetam TODAS
 * - Menos código duplicado (DRY)
 * - Mais fácil de manter e testar
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: RENDERIZAÇÃO DE LISTAS COM .map()
 * ═══════════════════════════════════════════════════════════════
 *
 * Em React, para renderizar uma lista de elementos, usamos .map()
 * que transforma cada item de dados em um elemento JSX.
 *
 * REGRA DA KEY:
 * Todo elemento em uma lista DEVE ter uma prop "key" única.
 * O React usa a key para identificar qual item mudou, foi
 * adicionado ou removido — otimizando a re-renderização.
 *
 * Boas keys: IDs do banco, códigos únicos
 * Keys aceitáveis: índice do array (quando a lista não reordena)
 * Más keys: valores aleatórios (Math.random())
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: TODAS as páginas (HomePage, ProductsPage, etc.)
 * - Estilos: tables.css (table, th, td, .filler-row, .table-*)
 */

import React from 'react';

/**
 * DataTable — Tabela genérica que renderiza qualquer dado tabular.
 *
 * PROPS:
 * @param {string} className — Classe CSS para estilização específica
 *   (ex: "table-products", "table-categories", "tabelaProdutos")
 *   Cada classe define larguras de colunas diferentes em tables.css
 *
 * @param {Array<string>} columns — Títulos das colunas do cabeçalho
 *   Exemplo: ['Code', 'Product', 'Price', 'Actions']
 *
 * @param {Array<Object>} rows — Dados das linhas. Cada objeto tem:
 *   - key: identificador único da linha (para otimização do React)
 *   - cells: array com o conteúdo de cada célula (pode ser texto ou JSX)
 *
 * @param {number} fillerCols — Número de colunas para a "filler row"
 *   (linha vazia que preenche espaço quando não há dados)
 */
export default function DataTable({ className, columns, rows, fillerCols }) {
  /**
   * colCount: número de colunas para a filler row.
   * Usa fillerCols se fornecido, senão usa o número de colunas do cabeçalho.
   */
  const colCount = fillerCols || columns.length;

  /**
   * isEmpty: verifica se não há dados para exibir.
   * !rows → rows é null/undefined
   * rows.length === 0 → rows é um array vazio
   */
  const isEmpty = !rows || rows.length === 0;

  return (
    /**
     * className={className || undefined}
     *
     * Se className for uma string vazia ou null, passamos undefined
     * para que o React NÃO renderize o atributo class no HTML.
     * (class="" no HTML é válido mas desnecessário)
     */
    <table className={className || undefined}>
      {/* ─── CABEÇALHO (thead) ─────────────────────────────────── */}
      <thead>
        <tr>
          {/*
            .map() transforma cada título em um <th>.
            key={i} usa índice (colunas são estáticas, não mudam).

            Exemplo: columns=['Code', 'Name', 'Price']
            Resultado: <th>Code</th><th>Name</th><th>Price</th>
          */}
          {columns.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
        </tr>
      </thead>

      {/* ─── CORPO (tbody) ─────────────────────────────────────── */}
      <tbody>
        {/*
          RENDERIZAÇÃO CONDICIONAL com operador ternário:
          condição ? (se verdadeiro) : (se falso)

          Se a tabela está vazia → mostra a "filler row"
          Se tem dados → mostra as linhas de dados
        */}
        {isEmpty ? (
          /**
           * FILLER ROW: linha vazia que mantém a estrutura visual
           * da tabela mesmo quando não há dados.
           *
           * Array.from({ length: colCount }):
           * Cria um array com N posições (uma para cada coluna).
           * Exemplo: Array.from({ length: 4 }) → [undefined, undefined, undefined, undefined]
           *
           * .map((_, i) => ...):
           * O "_" é uma convenção para parâmetros que não usamos.
           * Aqui não precisamos do valor (undefined), só do índice.
           */
          <tr className="filler-row">
            {Array.from({ length: colCount }).map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
        ) : (
          /**
           * LINHAS DE DADOS: renderiza cada row como um <tr>.
           *
           * row.key ?? i:
           * O operador ?? (nullish coalescing) retorna o lado direito
           * APENAS se o lado esquerdo for null ou undefined.
           * Se row.key existir, usa ele. Senão, usa o índice i.
           *
           * Diferença de ||:
           * - ?? → só para null/undefined
           * - || → para qualquer valor "falsy" (0, "", false, null, undefined)
           *
           * row.cells.map() renderiza cada célula como um <td>.
           * O conteúdo pode ser texto simples OU JSX complexo
           * (ex: um <Button> ou um <Link>).
           */
          rows.map((row, i) => (
            <tr key={row.key ?? i}>
              {row.cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
