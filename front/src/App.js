/**
 * ============================================================
 * ARQUIVO: App.js — O COMPONENTE RAIZ DA APLICAÇÃO
 * ============================================================
 *
 * Este é o componente principal que organiza TODA a estrutura
 * da aplicação. Ele é responsável por:
 *
 * 1. Configurar o ROTEAMENTO (navegação entre páginas)
 * 2. Definir qual componente/página aparece em cada URL
 * 3. Gerenciar a proteção do DOM durante mudanças de rota
 *
 * CONCEITO IMPORTANTE — ROTEAMENTO (Routing):
 * Em uma aplicação React, não temos múltiplos arquivos HTML.
 * Temos apenas UM arquivo HTML (public/index.html) e o React
 * "troca" o conteúdo da tela conforme a URL muda. Isso é
 * chamado de SPA (Single Page Application).
 *
 * Exemplo: quando o usuário clica em "Produtos", a URL muda
 * para /products, mas a página NÃO recarrega — o React apenas
 * substitui o componente exibido.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - index.js importa este arquivo e o renderiza na tela
 * - Este arquivo importa todas as PÁGINAS (HomePage, ProductsPage, etc.)
 * - Usa o hook useDomProtection para segurança do DOM
 * - Usa react-router-dom para gerenciar a navegação
 */

// ─── IMPORTAÇÕES ────────────────────────────────────────────

/**
 * React: biblioteca principal para criar componentes.
 *
 * Hooks importados (funções especiais que começam com "use"):
 *
 * - useEffect: executa código APÓS o componente renderizar na tela.
 *   Útil para efeitos colaterais (chamadas à API, timers, etc.)
 *
 * - useLayoutEffect: similar ao useEffect, mas executa ANTES do
 *   navegador pintar a tela. Usado quando precisamos fazer algo
 *   que afeta o layout visual antes do usuário ver.
 *
 * - useRef: cria uma "referência" que persiste entre renderizações
 *   sem causar re-renderização quando muda. Aqui usamos para
 *   saber se é a primeira vez que o componente renderiza.
 */
import React, { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * react-router-dom: biblioteca para navegação em SPAs.
 *
 * - BrowserRouter: componente que "envolve" toda a aplicação e
 *   habilita o sistema de rotas. Ele escuta mudanças na URL do
 *   navegador e avisa os componentes filhos.
 *
 * - Routes: container que agrupa todas as rotas possíveis.
 *   Funciona como um "switch" — mostra apenas a rota que
 *   corresponde à URL atual.
 *
 * - Route: define UMA rota específica. Associa um caminho (path)
 *   a um componente (element) que deve ser exibido.
 *
 * - useLocation: hook que retorna a localização atual (URL).
 *   Usamos para detectar quando o usuário navega para outra página.
 */
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// ─── IMPORTAÇÃO DAS PÁGINAS ─────────────────────────────────
/**
 * Cada página é um componente React que representa uma tela
 * completa da aplicação. Elas ficam na pasta components/pages/
 * seguindo o padrão de organização Atomic Design.
 *
 * CONEXÃO: Cada página usa componentes menores (organisms,
 * molecules, atoms) para construir sua interface.
 */
import HomePage from './components/pages/HomePage';           // Página inicial (compras)
import ProductsPage from './components/pages/ProductsPage';   // Cadastro de produtos
import CategoriesPage from './components/pages/CategoriesPage'; // Cadastro de categorias
import HistoryPage from './components/pages/HistoryPage';     // Histórico de compras
import PurchasePage from './components/pages/PurchasePage';   // Realizar compra

/**
 * Hook customizado de proteção do DOM.
 * Impede que scripts externos ou extensões do navegador
 * modifiquem o HTML da aplicação de forma indevida.
 *
 * CONEXÃO: definido em src/hooks/useDomProtection.js
 */
import useDomProtection from './hooks/useDomProtection';

// ─── COMPONENTE: ProtectedRoutes ────────────────────────────
/**
 * Este componente interno gerencia as rotas E a proteção do DOM.
 *
 * POR QUE EXISTE UM COMPONENTE SEPARADO?
 * O hook useLocation() só funciona DENTRO de um BrowserRouter.
 * Como o App() é quem cria o BrowserRouter, precisamos de um
 * componente filho para usar useLocation(). Por isso criamos
 * ProtectedRoutes como componente separado.
 *
 * É um padrão comum em React: quando um hook precisa de um
 * "contexto" (Provider) acima dele na árvore de componentes,
 * criamos um componente intermediário.
 */
function ProtectedRoutes() {
  /**
   * Desestruturação do hook useDomProtection:
   * - pauseProtection: pausa a vigilância do DOM temporariamente
   * - resumeProtection: reativa a vigilância após um delay (ms)
   *
   * POR QUE PAUSAR? Quando o React atualiza a tela (muda de rota),
   * ele modifica o DOM. Se a proteção estiver ativa, ela pode
   * interpretar essas mudanças legítimas como "ataques" e revertê-las.
   * Então pausamos antes da mudança e reativamos depois.
   */
  const { pauseProtection, resumeProtection } = useDomProtection();

  /**
   * useLocation() retorna um objeto com informações da URL atual.
   * Exemplo: { pathname: "/products", search: "", hash: "" }
   *
   * Usamos isso para detectar quando o usuário navega entre páginas.
   */
  const location = useLocation();

  /**
   * useRef(true) cria uma referência com valor inicial "true".
   * Usamos para saber se é a PRIMEIRA renderização do componente.
   *
   * POR QUE? Na primeira renderização, não precisamos pausar a
   * proteção porque ela ainda não foi ativada. Só precisamos
   * pausar nas renderizações SEGUINTES (quando há mudança de rota).
   *
   * Diferente de useState, mudar um ref NÃO causa re-renderização.
   */
  const isFirstRender = useRef(true);

  // ─── EFEITO 1: Pausar proteção antes de atualizar a tela ───
  /**
   * useLayoutEffect executa ANTES do navegador pintar a tela.
   *
   * Sem array de dependências (sem []), ele executa em TODA
   * renderização. Isso garante que sempre que o React for
   * atualizar o DOM, a proteção será pausada primeiro.
   *
   * Na primeira renderização, apenas marcamos isFirstRender como
   * false e saímos (return), pois não há nada para pausar ainda.
   */
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Sai sem fazer nada na primeira renderização
    }
    pauseProtection(); // Pausa a proteção para o React poder atualizar o DOM
  });

  // ─── EFEITO 2: Reativar proteção após renderização ─────────
  /**
   * useEffect executa APÓS o componente renderizar na tela.
   *
   * Aqui reativamos a proteção com um delay de 300ms, dando
   * tempo para o React terminar todas as atualizações visuais
   * antes de "trancar" o DOM novamente.
   *
   * Sem array de dependências → executa após TODA renderização.
   */
  useEffect(() => {
    resumeProtection(300); // Reativa após 300ms
  });

  // ─── EFEITO 3: Proteção específica para navegação ──────────
  /**
   * Este useEffect executa APENAS quando a localização (URL) muda.
   * O array [location, ...] é o "array de dependências" — o efeito
   * só re-executa quando um dos valores nesse array mudar.
   *
   * Usamos um delay maior (500ms) aqui porque mudanças de rota
   * podem envolver animações ou carregamento de dados assíncronos,
   * então damos mais tempo antes de reativar a proteção.
   */
  useEffect(() => {
    pauseProtection();
    resumeProtection(500); // Delay maior para navegação completa
  }, [location, pauseProtection, resumeProtection]);

  // ─── RENDERIZAÇÃO DAS ROTAS ────────────────────────────────
  /**
   * <Routes> funciona como um "switch/case" para URLs:
   *
   * - Se a URL for "/"          → mostra HomePage
   * - Se a URL for "/products"  → mostra ProductsPage
   * - Se a URL for "/categories"→ mostra CategoriesPage
   * - Se a URL for "/history"   → mostra HistoryPage
   * - Se a URL for "/purchase"  → mostra PurchasePage
   *
   * Apenas UMA rota é renderizada por vez (a que corresponde à URL).
   *
   * O atributo "path" define a URL e "element" define o componente
   * que será exibido quando aquela URL estiver ativa.
   */
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

// ─── COMPONENTE PRINCIPAL: App ──────────────────────────────
/**
 * Este é o componente exportado e usado pelo index.js.
 *
 * Sua única responsabilidade é envolver tudo com o BrowserRouter,
 * que é o "provedor de contexto" de roteamento. Sem ele, nenhum
 * componente filho consegue usar useLocation, useNavigate, Link, etc.
 *
 * PADRÃO: Componentes "Provider" (como BrowserRouter) ficam no
 * nível mais alto possível da árvore de componentes, para que
 * todos os filhos tenham acesso ao contexto que eles fornecem.
 *
 * ESTRUTURA DA ÁRVORE:
 * index.js
 *   └── App (este arquivo)
 *         └── BrowserRouter (provê contexto de rotas)
 *               └── ProtectedRoutes (define as rotas + proteção)
 *                     └── [Página atual baseada na URL]
 */
export default function App() {
  return (
    <BrowserRouter>
      <ProtectedRoutes />
    </BrowserRouter>
  );
}
