/**
 * ============================================================
 * ARQUIVO: components/atoms/Button.js
 * ÁTOMO — BOTÃO REUTILIZÁVEL
 * ============================================================
 *
 * Este é um ÁTOMO (atom) no Atomic Design — o nível mais básico
 * e indivisível de componente. Átomos são elementos HTML nativos
 * encapsulados em componentes React para adicionar consistência
 * e flexibilidade.
 *
 * O QUE FAZ:
 * Renderiza um <button> HTML com suporte a variantes visuais
 * (cores/estilos diferentes) e qualquer prop adicional.
 *
 * VARIANTES DISPONÍVEIS (definidas em components.css):
 * - "addProduct" → botão roxo para adicionar produto
 * - "addCategory" → botão roxo para adicionar categoria
 * - "btn-cancel" → botão cinza para cancelar/excluir
 * - "btn-view" → botão roxo para visualizar
 * - "btn-finish" → botão roxo para finalizar
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: SPREAD OPERATOR (...props) — "REPASSAR" PROPS
 * ═══════════════════════════════════════════════════════════════
 *
 * O padrão {...props} é FUNDAMENTAL em componentes de baixo nível.
 * Ele permite que o componente aceite QUALQUER prop HTML válida
 * sem precisar declarar cada uma explicitamente.
 *
 * Exemplo: quando alguém usa <Button onClick={fn} disabled={true}>
 * - onClick e disabled NÃO estão declarados nas props do componente
 * - Eles caem no "...props" (rest operator na desestruturação)
 * - {...props} no JSX os "espalha" no <button> nativo
 * - Resultado: <button onClick={fn} disabled={true}>
 *
 * ISSO SIGNIFICA QUE:
 * Qualquer atributo HTML válido para <button> funciona automaticamente:
 * onClick, disabled, type, title, aria-label, style, etc.
 *
 * SEM spread, teríamos que declarar CADA prop manualmente:
 *   function Button({ onClick, disabled, type, title, ... }) ← tedioso!
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: REST vs SPREAD OPERATOR (mesmo símbolo, usos diferentes)
 * ═══════════════════════════════════════════════════════════════
 *
 * Os três pontos (...) têm dois usos:
 *
 * 1. REST (na desestruturação) — "pegue o RESTO":
 *    function Button({ children, variant, className, ...props })
 *    → "props" recebe TUDO que não é children, variant ou className
 *
 * 2. SPREAD (no JSX/objeto) — "espalhe tudo":
 *    <button {...props}>
 *    → "espalha" cada propriedade de props como atributo do button
 *
 * É o mesmo símbolo (...) mas com significados opostos:
 * - REST: junta vários valores em UM objeto
 * - SPREAD: espalha UM objeto em vários valores
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: TODOS os organismos e páginas
 * - Estilos: components.css (button, button.addProduct, .btn-cancel, etc.)
 */

import React from 'react';

/**
 * Button — Componente de botão com suporte a variantes.
 *
 * PROPS EXPLÍCITAS:
 * @param {ReactNode} children — Texto/conteúdo do botão (ex: "Add Product")
 * @param {string} variant — Nome da variante visual (vira classe CSS)
 * @param {string} className — Classes CSS adicionais (opcional)
 *
 * PROPS IMPLÍCITAS (via ...props):
 * - onClick: função executada ao clicar
 * - disabled: desabilita o botão
 * - style: estilos inline
 * - type: tipo do botão ("button", "submit", "reset")
 * - Qualquer outro atributo HTML válido para <button>
 */
export default function Button({ children, variant, className, ...props }) {
  /**
   * CONSTRUÇÃO DINÂMICA DE CLASSES CSS:
   *
   * 1. variantClass: a variante (ex: "btn-cancel") ou string vazia
   *
   * 2. [variantClass, className]: array com as possíveis classes
   *    Pode ser: ["btn-cancel", "minha-classe"]
   *    Ou: ["btn-cancel", undefined]
   *    Ou: ["", undefined]
   *
   * 3. .filter(Boolean): remove valores "falsy" do array
   *    Boolean é uma função que retorna true/false.
   *    Valores falsy: "", 0, null, undefined, false, NaN
   *    Então ["btn-cancel", undefined, ""] → ["btn-cancel"]
   *
   * 4. .join(' '): junta com espaço → "btn-cancel minha-classe"
   *
   * RESULTADO FINAL:
   * - Se variant="btn-cancel" e className=undefined → "btn-cancel"
   * - Se variant="btn-view" e className="extra" → "btn-view extra"
   * - Se nenhum → "" (string vazia)
   *
   * classes || undefined: se for string vazia, passa undefined
   * para que o React não renderize class="" no HTML.
   */
  const variantClass = variant || '';
  const classes = [variantClass, className].filter(Boolean).join(' ');

  return (
    <button className={classes || undefined} {...props}>
      {children}
    </button>
  );
}
