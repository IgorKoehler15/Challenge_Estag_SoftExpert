import PropTypes from 'prop-types';
import Label from '../atoms/Label';
import styles from './SummaryItem.module.css';

// Componente molecular que exibe um item de resumo (label + valor)
// Pode ser ocultado via prop hidden e aceita classe CSS customizada no valor
export default function SummaryItem({ label, value, valueClassName, hidden }) {
  return (
    <div className={styles.summaryItem} style={hidden ? { display: 'none' } : undefined}>
      <Label>{label}</Label>
      <span className={valueClassName || undefined}>{value}</span>
    </div>
  );
}

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueClassName: PropTypes.string,
  hidden: PropTypes.bool,
};
