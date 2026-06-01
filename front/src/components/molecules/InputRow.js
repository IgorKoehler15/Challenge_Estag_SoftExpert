import PropTypes from 'prop-types';
import styles from './FormGroup.module.css';

// Componente molecular que organiza inputs lado a lado em uma linha (row)
export default function InputRow({ children }) {
  return <div className={styles.inputRow}>{children}</div>;
}

InputRow.propTypes = {
  children: PropTypes.node.isRequired,
};
