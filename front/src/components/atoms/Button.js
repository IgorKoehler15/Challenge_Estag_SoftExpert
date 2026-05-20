import PropTypes from 'prop-types';

// Componente atômico de botão reutilizável
// Aceita uma variante de estilo (variant), classes extras (className) e qualquer prop nativa de <button>
export default function Button({ children, variant, className, ...props }) {

  // Monta a string de classes CSS combinando base + variante + classes adicionais
  const classes = ['btn', variant, className].filter(Boolean).join(' ');

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
