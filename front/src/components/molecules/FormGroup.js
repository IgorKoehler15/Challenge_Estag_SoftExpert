import PropTypes from 'prop-types';
import styles from './FormGroup.module.css';

// Componente molecular que agrupa campos de formulário dentro de uma div com classe "form-group"
// Aceita estilos inline opcionais via prop style
export default function FormGroup({ children, style }) {
  return (
    <div className={styles.formGroup} style={style}>
      {children}
    </div>
  );
}

FormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
