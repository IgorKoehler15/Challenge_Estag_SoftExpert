/**
 * ============================================================
 * ARQUIVO: components/atoms/Label.js
 * ÁTOMO — RÓTULO DE TEXTO
 * ============================================================
 *
 * Este átomo encapsula o elemento HTML <label> em um componente
 * React. É usado para exibir rótulos/textos descritivos em
 * diversas partes da interface.
 *
 * O QUE FAZ:
 * Renderiza um <label> com conteúdo (children) e quaisquer
 * props adicionais repassadas via spread.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: O ELEMENTO <label> EM HTML
 * ═══════════════════════════════════════════════════════════════
 *
 * O <label> tem um propósito semântico importante em HTML:
 *
 * 1. ACESSIBILIDADE:
 *    Quando associado a um input (via atributo "for" ou "htmlFor"
 *    em React), leitores de tela anunciam o rótulo ao focar no campo.
 *    Isso ajuda pessoas com deficiência visual a entender o formulário.
 *
 * 2. USABILIDADE:
 *    Clicar no label foca/ativa o input associado.
 *    Isso aumenta a área clicável (especialmente útil em mobile).
 *
 * 3. SEMÂNTICA:
 *    Indica ao navegador e ferramentas que aquele texto DESCREVE
 *    um campo de formulário.
 *
 * NESTE PROJETO:
 * O Label é usado de forma mais genérica — como rótulo de texto
 * em TotalRow e SummaryItem, não necessariamente associado a inputs.
 * Isso é uma simplificação aceitável para manter consistência visual.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: children — A PROP MAIS ESPECIAL DO REACT
 * ═══════════════════════════════════════════════════════════════
 *
 * "children" é o conteúdo entre as tags de abertura e fechamento:
 *
 *   <Label>Tax:</Label>
 *          ↑↑↑↑
 *       isso é children
 *
 * children pode ser:
 * - Texto: <Label>Hello</Label> → children = "Hello"
 * - Elementos: <Label><strong>Bold</strong></Label> → children = JSX
 * - Múltiplos: <Label>A <em>B</em> C</Label> → children = array
 * - Nada: <Label></Label> → children = undefined
 *
 * É a forma mais natural de passar conteúdo para componentes,
 * similar a como HTML funciona: <p>texto</p>, <div>conteúdo</div>
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: TotalRow (molecule), SummaryItem (molecule)
 * - Estilos: herdados do contexto onde é usado
 *   → .total-row label { font-weight: bold }
 *   → .summary-item label { font-weight: bold, color: #666, uppercase }
 */

import React from 'react';

/**
 * Label — Componente de rótulo de texto.
 *
 * PROPS:
 * @param {ReactNode} children — Conteúdo do label (texto, JSX, etc.)
 * @param {...any} props — Quaisquer props adicionais (htmlFor, className, style, etc.)
 *
 * NOTA SOBRE "htmlFor":
 * Em HTML, usamos <label for="inputId">. Em React/JSX, "for" é
 * palavra reservada do JavaScript, então usamos "htmlFor" no lugar.
 * Exemplo: <Label htmlFor="email">Email:</Label>
 *
 * Neste projeto, o Label não usa htmlFor porque não está
 * diretamente associado a inputs (é usado em TotalRow e SummaryItem).
 */
export default function Label({ children, ...props }) {
  return <label {...props}>{children}</label>;
}
