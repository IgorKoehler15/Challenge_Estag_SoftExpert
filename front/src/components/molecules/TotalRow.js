import Label from '../atoms/Label';

// Componente molecular que exibe uma linha de total (label + valor formatado)
// Usado nas seções de resumo/totais da compra
export default function TotalRow({ label, value }) {
  return (
    <div className="total-row">
      <Label>{label}</Label>
      <span>{value}</span>
    </div>
  );
}
