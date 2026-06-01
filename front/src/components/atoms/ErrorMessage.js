import PropTypes from 'prop-types';
import Button from './Button';
import styles from './ErrorMessage.module.css';

// Componente de mensagem de erro exibida ao usuário quando um fetch falha
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className={styles.errorMessage}>
      <p>{message}</p>
      {onRetry && (
        <Button variant="btn-view" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};
