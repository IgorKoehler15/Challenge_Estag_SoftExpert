import PropTypes from 'prop-types';
import SummaryItem from '../molecules/SummaryItem';
import styles from './SummaryCard.module.css';

// Card de resumo que renderiza uma lista de itens informativos (label + valor)
// Usado para exibir detalhes do produto selecionado ou resumo do pedido
export default function SummaryCard({ items }) {
  return (
    <div className={styles.summaryCard}>
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

SummaryCard.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      valueClassName: PropTypes.string,
      hidden: PropTypes.bool,
    })
  ).isRequired,
};
