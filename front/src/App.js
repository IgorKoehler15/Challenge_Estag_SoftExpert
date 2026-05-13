import { useEffect, useLayoutEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/pages/HomePage';           
import ProductsPage from './components/pages/ProductsPage';   
import CategoriesPage from './components/pages/CategoriesPage'; 
import HistoryPage from './components/pages/HistoryPage';     
import PurchasePage from './components/pages/PurchasePage';   
import useDomProtection from './hooks/useDomProtection';

// Componente que envolve as rotas com a proteção contra manipulação do DOM
function ProtectedRoutes() {
  const { pauseProtection, resumeProtection } = useDomProtection();
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Pausa a proteção antes de cada re-render do React (evita falsos positivos)
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; 
    }
    pauseProtection(); 
  });

  // Retoma a proteção após cada render finalizado
  useEffect(() => {
    resumeProtection(300); 
  });

  // Pausa e retoma a proteção ao navegar entre páginas (mudança de rota)
  useEffect(() => {
    pauseProtection();
    resumeProtection(500); 
  }, [location, pauseProtection, resumeProtection]);

  // Definição das rotas da aplicação
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

// Componente raiz da aplicação — configura o roteador e renderiza as rotas protegidas
export default function App() {
  return (
    <BrowserRouter>
      <ProtectedRoutes />
    </BrowserRouter>
  );
}
