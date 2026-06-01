import PropTypes from 'prop-types';
import Header from '../organisms/Header';
import styles from './Layout.module.css';

// Template de layout com sidebar (formulário à esquerda, conteúdo à direita)
// Usado nas páginas de categorias, produtos e home (carrinho)
export default function SidebarLayout({ sidebar, content }) {
  return (
    <>
      <Header />

      <div className={styles.container}>
        {/* Sidebar: formulário de entrada de dados */}
        <div className={styles.sidebar}>{sidebar}</div>
        {/* Conteúdo principal: tabela de dados */}
        <div className={styles.content}>{content}</div>
      </div>
    </>
  );
}

SidebarLayout.propTypes = {
  sidebar: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};
