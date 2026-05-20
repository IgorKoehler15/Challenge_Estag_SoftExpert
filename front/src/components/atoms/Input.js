import PropTypes from 'prop-types';

// Componente atômico de input — encapsula o <input> nativo repassando todas as props
export default function Input({ type, value, onChange, ...props }) {
  return <input type={type} value={value} onChange={onChange} {...props} />;
}

Input.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
};
