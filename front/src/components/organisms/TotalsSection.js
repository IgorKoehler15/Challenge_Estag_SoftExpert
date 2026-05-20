import PropTypes from 'prop-types';
import TotalRow from '../molecules/TotalRow';

// Seção de totais — exibe as linhas de subtotal, imposto e total geral
// Recebe um array de objetos { label, value } e renderiza cada um como TotalRow
export default function TotalsSection({ rows }) {
  return (
    <div className="totals-section">
      {rows.map((r, i) => (
        <TotalRow key={i} label={r.label} value={r.value} />
      ))}
    </div>
  );
}

TotalsSection.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ).isRequired,
};
