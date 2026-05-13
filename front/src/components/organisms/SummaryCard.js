/**
 * ============================================================
 * ARQUIVO: components/organisms/SummaryCard.js
 * CARD DE RESUMO (informações gerais de uma compra)
 * ============================================================
 *
 * Este organismo renderiza um "card" (cartão) com informações
 * resumidas de uma compra: código, data, status.
 *
 * É um componente GENÉRICO — recebe um array de itens e renderiza
 * cada um usando o componente SummaryItem (molecule).
 *
 * VISUAL:
 * ┌─────────────────────────────────────────────┐
 * │  CÓDIGO     DATA        STATUS              │
 * │  005        12/01/25    Finalizado           │
 * └─────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPONENTE GENÉRICO (Data-Driven)
 * ═══════════════════════════════════════════════════════════════
 *
 * Este componente não sabe QUAIS informações vai exibir.
 * Ele recebe um array "items" e renderiza cada um.
 * A página que usa decide O QUE passar.
 *
 * Isso torna o componente REUTILIZÁVEL para qualquer tipo de
 * resumo, não apenas compras. Poderia exibir dados de um
 * usuário, um pedido, um relatório, etc.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: PurchasePage.js
 * - Usa: SummaryItem.js (molecule)
 * - Estilos: components.css (.summary-card)
 */

import React from 'react';
import SummaryItem from '../molecules/SummaryItem';

/**
 * SummaryCard — Card de resumo com informações em linha.
 *
 * @param {Array} items — Array de objetos, cada um com:
 *   - label: rótulo (ex: "Code:")
 *   - value: valor a exibir (ex: "005")
 *   - valueClassName: classe CSS opcional para o valor
 *   - hidden: se true, o item não é exibido
 *
 * .map() renderiza um SummaryItem para cada objeto do array.
 * key={i} usa o índice como chave (aceitável aqui porque a
 * lista é estática — não muda de ordem nem é filtrada).
 */
export default function SummaryCard({ items }) {
  return (
    <div className="summary-card">
      {items.map((item, i) => (
        <SummaryItem
          key={i}
          label={item.label}
          value={item.value}
          valueClassName={item.valueClassName}
          hidden={item.hidden}
        />
      ))}
    </div>
  );
}
