import Label from '../atoms/Label';

// Componente molecular que exibe um item de resumo (label + valor)
// Pode ser ocultado via prop hidden e aceita classe CSS customizada no valor
export default function SummaryItem({ label, value, valueClassName, hidden }) {
  return (
    <div className="summary-item" style={hidden ? { display: 'none' } : undefined}>
      <Label>{label}</Label>
      <span className={valueClassName || undefined}>{value}</span>
    </div>
  );
}
