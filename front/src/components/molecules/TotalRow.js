/**
 * ============================================================
 * ARQUIVO: components/molecules/TotalRow.js
 * MOLÉCULA — LINHA DE TOTAL (label + valor numérico)
 * ============================================================
 *
 * Este componente renderiza UMA linha na seção de totais.
 * Exibe um rótulo à esquerda e um valor à direita.
 *
 * VISUAL:
 * ┌──────────────────┐
 * │  Tax:      12.50 │  ← Label + span, justify-content: space-between
 * └──────────────────┘
 * ┌──────────────────┐
 * │  Total:   125.00 │
 * └──────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPONENTES PEQUENOS E FOCADOS
 * ═══════════════════════════════════════════════════════════════
 *
 * TotalRow faz UMA coisa: exibe um par label/valor alinhado.
 * Isso segue o princípio de "Responsabilidade Única" (SRP):
 * cada componente deve ter apenas UM motivo para mudar.
 *
 * Se no futuro quisermos:
 * - Mudar a formatação do valor → alteramos TotalRow
 * - Mudar o layout da seção inteira → alteramos TotalsSection
 * - Mudar quais totais exibir → alteramos a página
 *
 * Cada mudança afeta apenas UM componente. Isso é manutenibilidade.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: DIFERENÇA ENTRE MOLECULE E ATOM
 * ═══════════════════════════════════════════════════════════════
 *
 * ATOM (Label): elemento indivisível, sem contexto próprio.
 *   Um Label sozinho não significa nada — precisa de contexto.
 *
 * MOLECULE (TotalRow): combinação de átomos com SIGNIFICADO.
 *   Um TotalRow = Label + valor = "informação de total"
 *   A combinação cria algo com propósito claro.
 *
 * É como química:
 * - Átomo de Hidrogênio (H) → sozinho, não faz muita coisa
 * - Molécula de Água (H₂O) → combinação com utilidade real
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: TotalsSection.js (organism)
 * - Usa: Label.js (atom)
 * - Estilos: components.css (.total-row, .total-row label)
 *   → display: flex, width: 150px, justify-content: space-between
 */

import React from 'react';
import Label from '../atoms/Label';

/**
 * TotalRow — Uma linha de total com rótulo e valor.
 *
 * PROPS:
 * @param {string} label — Texto do rótulo (ex: "Tax:", "Total:")
 * @param {string|number} value — Valor numérico formatado (ex: "125.00")
 *
 * ESTRUTURA HTML GERADA:
 * <div class="total-row">
 *   <label>Tax:</label>
 *   <span>12.50</span>
 * </div>
 *
 * O CSS .total-row usa justify-content: space-between para
 * empurrar o label para a esquerda e o span para a direita,
 * criando o alinhamento visual de "rótulo ... valor".
 */
export default function TotalRow({ label, value }) {
  return (
    <div className="total-row">
      {/* Label: átomo que renderiza o rótulo em negrito */}
      <Label>{label}</Label>
      {/* Span: exibe o valor numérico */}
      <span>{value}</span>
    </div>
  );
}
