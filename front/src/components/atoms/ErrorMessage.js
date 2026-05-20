import PropTypes from 'prop-types';

// Componente de mensagem de erro exibida ao usuário quando um fetch falha
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-view" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};
