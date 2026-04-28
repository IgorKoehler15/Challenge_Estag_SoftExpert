import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import CategoriesPage from './components/pages/CategoriesPage';
import HistoryPage from './components/pages/HistoryPage';
import PurchasePage from './components/pages/PurchasePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/purchase" element={<PurchasePage />} />
      </Routes>
    </BrowserRouter>
  );
}
