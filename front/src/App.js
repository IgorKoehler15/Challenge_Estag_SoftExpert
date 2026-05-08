import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import CategoriesPage from './components/pages/CategoriesPage';
import HistoryPage from './components/pages/HistoryPage';
import PurchasePage from './components/pages/PurchasePage';
import useDomProtection from './hooks/useDomProtection';

function ProtectedRoutes() {
  const { pauseProtection, resumeProtection } = useDomProtection();
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Pause protection on route changes so React can update the DOM
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    pauseProtection();
  });

  // Resume protection after React finishes rendering
  useEffect(() => {
    resumeProtection(300);
  });

  // Also pause/resume on navigation
  useEffect(() => {
    pauseProtection();
    resumeProtection(500);
  }, [location, pauseProtection, resumeProtection]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/purchase" element={<PurchasePage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProtectedRoutes />
    </BrowserRouter>
  );
}
