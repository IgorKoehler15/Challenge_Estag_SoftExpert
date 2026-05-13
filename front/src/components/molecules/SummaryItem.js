/**
 * ============================================================
 * ARQUIVO: components/molecules/SummaryItem.js
 * MOLÉCULA — ITEM DE RESUMO (label + valor)
 * ============================================================
 *
 * Este componente renderiza UM item dentro do card de resumo
 * (SummaryCard). Cada item tem um rótulo (label) em cima e
 * um valor embaixo.
 *
 * VISUAL:
 * ┌─────────────┐
 * │  CÓDIGO     │  ← Label (atom) — rótulo em maiúsculas
 * │  005        │  ← span — valor
 * └─────────────┘
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: RENDERIZAÇÃO CONDICIONAL COM OPERADOR TERNÁRIO
 * ═══════════════════════════════════════════════════════════════
 *
 * Este componente usa renderização condicional para:
 *
 * 1. ESCONDER o item (prop hidden):
 *    style={hidden ? { display: 'none' } : undefined}
 *    - Se hidden=true → aplica display:none (invisível)
 *    - Se hidden=false → style=undefined (sem estilo inline)
 *
 * 2. CLASSE CONDICIONAL no valor (prop valueClassName):
 *    className={valueClassName || undefined}
 *    - Se valueClassName existe → aplica a classe (ex: "status-finished")
 *    - Se não existe → className=undefined (sem classe)
 *
 * POR QUE undefined E NÃO "" (string vazia)?
 * Quando passamos undefined para um atributo, o React NÃO
 * renderiza esse atributo no HTML final. Com "", ele renderiza
 * class="" que é válido mas desnecessário e "sujo".
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPOSIÇÃO ATOM + MOLECULE
 * ═══════════════════════════════════════════════════════════════
 *
 * Hierarquia:
 *   SummaryCard (organism)
 *     └── SummaryItem (molecule) ← ESTE ARQUIVO
 *           ├── Label (atom) — rótulo estilizado
 *           └── <span> — valor com classe opcional
 *
 * O SummaryItem COMBINA um átomo (Label) com um elemento HTML
 * nativo (<span>) para criar uma unidade visual coesa.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: SummaryCard.js (organism)
 * - Usa: Label.js (atom)
 * - Estilos: components.css (.summary-item, .summary-item label)
 * - Classe opcional: .status-finished (texto verde para "Finalizado")
 */

import React from 'react';
import Label from '../atoms/Label';

/**
 * SummaryItem — Um item individual do card de resumo.
 *
 * PROPS:
 * @param {string} label — Texto do rótulo (ex: "Code:", "Status:")
 * @param {string} value — Valor a exibir (ex: "005", "Finished")
 * @param {string} valueClassName — Classe CSS opcional para o valor
 *   Exemplo: "status-finished" → aplica cor verde
 * @param {boolean} hidden — Se true, esconde o item completamente
 *   Usado quando um dado não está disponível (ex: data não informada)
 */
export default function SummaryItem({ label, value, valueClassName, hidden }) {
  return (
    /**
     * style={hidden ? { display: 'none' } : undefined}
     *
     * OPERADOR TERNÁRIO: condição ? valorSeTrue : valorSeFalse
     *
     * Se hidden=true:
     *   → style={{ display: 'none' }} → elemento invisível
     *   (ainda existe no DOM, mas não é exibido)
     *
     * Se hidden=false/undefined:
     *   → style={undefined} → nenhum estilo inline aplicado
     *
     * ALTERNATIVA: poderia usar "if (!hidden) return null" no início,
     * mas display:none mantém o elemento no DOM (útil para animações
     * ou se quiser mostrar/esconder dinamicamente depois).
     */
    <div className="summary-item" style={hidden ? { display: 'none' } : undefined}>
      {/* Label: átomo que renderiza o rótulo em maiúsculas e negrito */}
      <Label>{label}</Label>

      {/*
        Span com classe condicional para estilização do valor.
        Exemplo: valueClassName="status-finished" → texto verde
      */}
      <span className={valueClassName || undefined}>{value}</span>
    </div>
  );
}
