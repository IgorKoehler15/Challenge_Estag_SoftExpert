/**
 * ============================================================
 * ARQUIVO: components/atoms/Select.js
 * ÁTOMO — DROPDOWN DE SELEÇÃO
 * ============================================================
 *
 * Este átomo renderiza um <select> HTML (dropdown/combobox) com
 * opções geradas dinamicamente a partir de um array.
 *
 * É o átomo mais COMPLEXO do projeto porque, diferente de Input
 * e Label, ele tem LÓGICA interna: gera as <option> a partir
 * de dados recebidos via props.
 *
 * VISUAL:
 * ┌──────────────────────────┐
 * │ Selecione um Produto   ▼ │  ← placeholder (disabled)
 * ├──────────────────────────┤
 * │ Arroz                    │  ← option gerada do array
 * │ Feijão                   │
 * │ Macarrão                 │
 * └──────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: LISTAS DINÂMICAS COM .map()
 * ═══════════════════════════════════════════════════════════════
 *
 * As opções do select são geradas DINAMICAMENTE a partir de um
 * array de dados. Isso significa que:
 * - Se o array tiver 3 itens → 3 options
 * - Se tiver 100 itens → 100 options
 * - Se estiver vazio → nenhuma option (só o placeholder)
 *
 * O .map() transforma cada objeto do array em um elemento <option>:
 *   [{ value: "1", label: "Arroz" }]
 *   → <option value="1">Arroz</option>
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: PLACEHOLDER EM SELECT (opção desabilitada)
 * ═══════════════════════════════════════════════════════════════
 *
 * Diferente de <input> que tem atributo "placeholder" nativo,
 * <select> não tem. A solução é criar uma <option> com:
 * - value="" → valor vazio (não é uma seleção válida)
 * - disabled → não pode ser selecionada depois de escolher outra
 *
 * Isso cria o efeito de "texto de dica" no dropdown:
 * "Selecione um Produto" aparece inicialmente, mas não pode
 * ser re-selecionado após o usuário escolher uma opção real.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: RENDERIZAÇÃO CONDICIONAL COM && (short-circuit)
 * ═══════════════════════════════════════════════════════════════
 *
 * {placeholder && (<option>...</option>)}
 *
 * O operador && em JSX funciona assim:
 * - Se o lado esquerdo for "truthy" → renderiza o lado direito
 * - Se o lado esquerdo for "falsy" → não renderiza nada
 *
 * Então:
 * - placeholder="Selecione" → renderiza a option de placeholder
 * - placeholder={undefined} → não renderiza (sem placeholder)
 *
 * É uma alternativa mais curta ao ternário quando só há o caso "true":
 * - && → renderiza OU não renderiza
 * - ternário → renderiza A ou renderiza B
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: ProductForm (organism) → dropdown de categorias
 *              HomeForm (organism) → dropdown de produtos
 * - Estilos: components.css (.aside-1 select → padding, border, etc.)
 * - Dados: as "options" vêm das páginas que buscam da API
 *   (ProductsPage busca categorias, HomePage busca produtos)
 */

import React from 'react';

/**
 * Select — Componente de dropdown com opções dinâmicas.
 *
 * PROPS EXPLÍCITAS:
 * @param {Array} options — Array de opções para o dropdown.
 *   Cada opção é um objeto: { value: string, label: string }
 *   - value: valor enviado quando selecionado (geralmente um código/ID)
 *   - label: texto exibido ao usuário (nome legível)
 *
 * @param {string} placeholder — Texto da opção inicial desabilitada.
 *   Exemplo: "Select a Product", "Category"
 *   Se não fornecido, não renderiza a opção de placeholder.
 *
 * PROPS IMPLÍCITAS (via ...props):
 * - value: valor atualmente selecionado (controlled component)
 * - onChange: função chamada quando o usuário seleciona uma opção
 * - id: identificador único
 * - name: nome do campo
 * - disabled: desabilita o select inteiro
 *
 * CONTROLLED SELECT:
 * Assim como inputs, o select é "controlado" pelo React:
 * - value={selectedCategory} → React define qual opção está selecionada
 * - onChange={handler} → quando muda, React atualiza o estado
 * - O estado é a "fonte da verdade", não o DOM
 */
export default function Select({ options, placeholder, ...props }) {
  return (
    <select {...props}>
      {/*
        PLACEHOLDER: opção inicial que serve como "dica".
        - value="" → valor vazio (validação pode verificar se está vazio)
        - disabled → após selecionar outra opção, não pode voltar para esta

        {placeholder && (...)} → só renderiza se placeholder existir.
        Isso torna o placeholder OPCIONAL — se não passar a prop,
        o select começa direto nas opções reais.
      */}
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {/*
        OPÇÕES DINÂMICAS: geradas a partir do array "options".

        .map() transforma cada objeto em um elemento <option>.

        key={opt.value}: identificador único para o React.
        Usamos opt.value (código do banco) que é garantidamente único.
        Isso é MELHOR que usar índice (i) porque se a lista mudar
        de ordem, o React sabe exatamente qual option é qual.

        value={opt.value}: valor que será enviado ao selecionar.
        {opt.label}: texto visível para o usuário.

        Exemplo de transformação:
        options = [{ value: "1", label: "Bebidas" }, { value: "2", label: "Alimentos" }]
        →
        <option value="1">Bebidas</option>
        <option value="2">Alimentos</option>
      */}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
