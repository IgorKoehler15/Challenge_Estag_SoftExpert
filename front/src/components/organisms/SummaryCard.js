import SummaryItem from '../molecules/SummaryItem';

// Card de resumo que renderiza uma lista de itens informativos (label + valor)
// Usado para exibir detalhes do produto selecionado ou resumo do pedido
export default function SummaryCard({ items }) {
  return (
    <div className="summary-card">
      {/* Itera sobre os itens e renderiza cada SummaryItem */}
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
