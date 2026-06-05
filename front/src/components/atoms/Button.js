import PropTypes from 'prop-types';
import styles from './Button.module.css';

// Mapeamento de variantes para classes do CSS Module
const variantMap = {
  addProduct: styles.btnPrimary,
  addCategory: styles.btnPrimary,
  'btn-cancel': styles.btnCancel,
  'btn-view': styles.btnPrimary,
  'btn-finish': styles.btnPrimary,
};

// Componente atômico de botão reutilizável
// Aceita uma variante de estilo (variant), classes extras (className) e qualquer prop nativa de <button>
export default function Button({ children, variant, className, ...props }) {

  // Monta a string de classes CSS combinando base + variante + classes adicionais
  const classes = [styles.btn, variantMap[variant], className].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  className: PropTypes.string,
};
