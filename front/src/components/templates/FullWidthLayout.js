import PropTypes from 'prop-types';
import Header from '../organisms/Header';
import styles from './Layout.module.css';

// Template de layout em largura total (sem sidebar)
// Usado nas páginas de histórico e detalhes de compra
export default function FullWidthLayout({ children }) {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.contentFull}>{children}</div>
      </div>
    </>
  );
}

FullWidthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
