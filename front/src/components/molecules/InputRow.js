import PropTypes from 'prop-types';

// Componente molecular que organiza inputs lado a lado em uma linha (row)
export default function InputRow({ children }) {
  return <div className="input-row">{children}</div>;
}

InputRow.propTypes = {
  children: PropTypes.node.isRequired,
};
