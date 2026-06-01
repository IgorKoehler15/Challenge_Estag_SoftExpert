import { Link } from 'react-router-dom';
import styles from './Header.module.css';

// Cabeçalho da aplicação com navegação principal
// Contém o logo e os links para as páginas: Products, Categories e History
export default function Header() {
  return (
    <header>
      <nav className={styles.mainNav}>
        <div className={styles.navGroup}>
          {/* Logo que redireciona para a página inicial */}
          <div className={styles.logo}>
            <Link to="/">Suite Store</Link>
          </div>

          {/* Links de navegação entre as páginas */}
          <ul className={styles.navLinks} id="nav-links">
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/history">History</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
