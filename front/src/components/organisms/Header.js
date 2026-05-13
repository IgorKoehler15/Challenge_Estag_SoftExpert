/**
 * ============================================================
 * ARQUIVO: components/organisms/Header.js
 * MENU DE NAVEGAÇÃO (CABEÇALHO)
 * ============================================================
 *
 * Este organismo renderiza o menu de navegação que aparece no
 * TOPO de TODAS as páginas da aplicação. Contém o logo e os
 * links para as diferentes seções.
 *
 * É importado pelos TEMPLATES (SidebarLayout e FullWidthLayout),
 * garantindo que toda página tenha o menu automaticamente.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: NAVEGAÇÃO SPA COM <Link>
 * ═══════════════════════════════════════════════════════════════
 *
 * Em uma SPA (Single Page Application), a navegação NÃO recarrega
 * a página. O React apenas troca o componente exibido.
 *
 * <Link to="/products"> do react-router-dom:
 * - Renderiza um <a> no HTML final (acessibilidade mantida)
 * - Intercepta o clique e previne o comportamento padrão
 * - Atualiza a URL do navegador sem recarregar
 * - O React Router detecta a mudança e renderiza a rota correta
 *
 * RESULTADO: navegação instantânea, sem "piscar" da tela.
 *
 * DIFERENÇA IMPORTANTE:
 * - <Link to="/products"> → navegação INTERNA (SPA, sem reload)
 * - <a href="/products"> → navegação EXTERNA (reload completo)
 * - <a href="https://google.com"> → link para outro site
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: SEMÂNTICA HTML
 * ═══════════════════════════════════════════════════════════════
 *
 * Usamos tags semânticas que descrevem o PROPÓSITO do conteúdo:
 * - <header> → cabeçalho da página
 * - <nav> → seção de navegação
 * - <ul>/<li> → lista de itens (links de navegação)
 *
 * POR QUE IMPORTA?
 * - Acessibilidade: leitores de tela entendem a estrutura
 * - SEO: mecanismos de busca entendem o conteúdo
 * - Manutenção: desenvolvedores entendem o propósito
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: SidebarLayout.js e FullWidthLayout.js (templates)
 * - Estilos: global.css (nav, .nav-group, .logo, .nav-links)
 * - Rotas definidas em: App.js (cada Link aponta para uma rota)
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Header — Componente de navegação principal.
 *
 * NÃO recebe props — é sempre igual em todas as páginas.
 * Componentes sem props são chamados de "estáticos" ou "puros".
 * Eles sempre renderizam a mesma coisa, independente do contexto.
 */
export default function Header() {
  return (
    <header>
      {/* <nav> com estilos de global.css: fundo roxo, padding, flex */}
      <nav>
        <div className="nav-group">
          {/* Logo: link para a página inicial (/) */}
          <div className="logo">
            <Link to="/">Suite Store</Link>
          </div>

          {/*
            Lista de links de navegação.
            <ul> = unordered list (lista não ordenada)
            <li> = list item (item da lista)

            Cada <Link> aponta para uma rota definida no App.js:
            - /products → ProductsPage
            - /categories → CategoriesPage
            - /history → HistoryPage
          */}
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
