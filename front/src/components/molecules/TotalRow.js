import PropTypes from 'prop-types';
import Label from '../atoms/Label';
import styles from './TotalRow.module.css';

// Componente molecular que exibe uma linha de total (label + valor formatado)
// Usado nas seções de resumo/totais da compra
export default function TotalRow({ label, value }) {
  return (
    <div className={styles.totalRow}>
      <Label>{label}</Label>
      <span>{value}</span>
    </div>
  );
}

TotalRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
