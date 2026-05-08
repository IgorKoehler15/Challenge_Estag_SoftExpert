import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <nav>
        <div className="nav-group">
          <div className="logo">
            <Link to="/">Suite Store</Link>
          </div>
          <ul className="nav-links" id="nav-links">
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/history">History</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
