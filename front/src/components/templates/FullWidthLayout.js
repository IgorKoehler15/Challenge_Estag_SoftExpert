import PropTypes from 'prop-types';
import Header from '../organisms/Header';

// Template de layout em largura total (sem sidebar)
// Usado nas páginas de histórico e detalhes de compra
export default function FullWidthLayout({ children }) {
  return (
    <>
      <Header />
      <div className="container">
        <div className="content-full">{children}</div>
      </div>
    </>
  );
}

FullWidthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
