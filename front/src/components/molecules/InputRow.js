/**
 * ============================================================
 * ARQUIVO: components/molecules/InputRow.js
 * MOLÉCULA — LINHA DE INPUTS (campos lado a lado)
 * ============================================================
 *
 * Este componente cria uma LINHA HORIZONTAL que coloca múltiplos
 * campos de formulário LADO A LADO.
 *
 * VISUAL:
 * ┌───────────┬───────────┬───────────┐
 * │ [Campo 1] │ [Campo 2] │ [Campo 3] │  ← children (FormGroups)
 * └───────────┴───────────┴───────────┘
 *    ↑ .input-row (flex row, gap: 10px, nowrap)
 *
 * SEM InputRow (padrão — empilhado):
 * ┌─────────────────┐
 * │    [Campo 1]    │
 * ├─────────────────┤
 * │    [Campo 2]    │
 * ├─────────────────┤
 * │    [Campo 3]    │
 * └─────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPONENTES DE LAYOUT
 * ═══════════════════════════════════════════════════════════════
 *
 * InputRow é um "componente de layout" — sua única função é
 * POSICIONAR outros componentes na tela. Não tem lógica,
 * não tem estado, não faz chamadas à API.
 *
 * Componentes de layout são extremamente comuns em React:
 * - Grid, Row, Column (em bibliotecas como Bootstrap/MUI)
 * - Stack, Flex, Box (em Chakra UI)
 * - InputRow, FormGroup (neste projeto)
 *
 * POR QUE CRIAR UM COMPONENTE PARA ISSO?
 * Poderia ser apenas <div className="input-row">, mas:
 * 1. É mais SEMÂNTICO: <InputRow> diz O QUE é, não COMO é
 * 2. Se o layout mudar (ex: de flex para grid), muda em UM lugar
 * 3. Pode adicionar lógica futura (ex: responsividade condicional)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPONENTE MÍNIMO
 * ═══════════════════════════════════════════════════════════════
 *
 * Este é provavelmente o componente MAIS SIMPLES do projeto.
 * Apenas 1 linha de JSX! E está tudo bem.
 *
 * Não existe "componente pequeno demais". Se ele tem um propósito
 * claro e é usado em múltiplos lugares, vale a pena existir.
 * A simplicidade é uma QUALIDADE, não um defeito.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: CategoryForm, ProductForm, HomeForm (organisms)
 * - Estilos: components.css (.input-row)
 *   → display: flex, gap: 10px, flex-wrap: nowrap
 * - Recebe como children: FormGroup (molecule) × N
 */

import React from 'react';

/**
 * InputRow — Container horizontal para campos de formulário.
 *
 * @param {ReactNode} children — FormGroups que serão posicionados lado a lado.
 *
 * A classe "input-row" (de components.css) aplica:
 * - display: flex → layout horizontal
 * - gap: 10px → espaçamento entre os campos
 * - flex-wrap: nowrap → NÃO quebra linha (campos sempre lado a lado)
 *
 * Os FormGroups dentro herdam a regra:
 *   .input-row .form-group { flex: 1 1 150px }
 * Que faz cada campo crescer igualmente com mínimo de 150px.
 */
export default function InputRow({ children }) {
  return <div className="input-row">{children}</div>;
}
