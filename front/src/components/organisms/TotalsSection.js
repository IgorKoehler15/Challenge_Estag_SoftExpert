/**
 * ============================================================
 * ARQUIVO: components/organisms/TotalsSection.js
 * SEÇÃO DE TOTAIS (taxa e valor total)
 * ============================================================
 *
 * Este organismo renderiza a seção de totais que aparece no
 * rodapé das páginas de compra (HomePage e PurchasePage).
 *
 * Exibe linhas como:
 *   Tax:    12.50
 *   Total:  125.00
 *
 * É um componente GENÉRICO — recebe um array de linhas e
 * renderiza cada uma usando TotalRow (molecule).
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPOSIÇÃO DE COMPONENTES
 * ═══════════════════════════════════════════════════════════════
 *
 * Observe a hierarquia:
 *   TotalsSection (organism)
 *     └── TotalRow (molecule) × N
 *           ├── Label (atom) — rótulo
 *           └── Span — valor
 *
 * Cada nível adiciona uma camada de organização:
 * - TotalsSection: agrupa TODAS as linhas de total
 * - TotalRow: renderiza UMA linha (label + valor)
 *
 * Isso é composição: componentes maiores são feitos de menores.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: HomePage.js (totais do carrinho), PurchasePage.js (totais da compra)
 * - Usa: TotalRow.js (molecule)
 * - Estilos: components.css (.totals-section)
 */

import React from 'react';
import TotalRow from '../molecules/TotalRow';

/**
 * TotalsSection — Seção que agrupa linhas de totais.
 *
 * @param {Array} rows — Array de objetos, cada um com:
 *   - label: texto do rótulo (ex: "Total:")
 *   - value: valor numérico formatado (ex: "125.00")
 *
 * .map() cria um TotalRow para cada item do array.
 * key={i} usa índice (lista estática, não reordena).
 */
export default function TotalsSection({ rows }) {
  return (
    <div className="totals-section">
      {rows.map((r, i) => (
        <TotalRow key={i} label={r.label} value={r.value} />
      ))}
    </div>
  );
}
