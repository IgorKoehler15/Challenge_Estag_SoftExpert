/**
 * ============================================================
 * ARQUIVO: components/templates/FullWidthLayout.js
 * TEMPLATE DE LAYOUT DE LARGURA TOTAL (sem sidebar)
 * ============================================================
 *
 * Este é um componente de TEMPLATE (modelo de layout) que define
 * a estrutura visual para páginas que NÃO têm barra lateral.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: ATOMIC DESIGN — Nível "Templates"
 * ═══════════════════════════════════════════════════════════════
 *
 * O projeto segue o padrão ATOMIC DESIGN, que organiza componentes
 * em 5 níveis de complexidade (do menor ao maior):
 *
 * 1. ATOMS (átomos): elementos básicos indivisíveis
 *    → Input, Button, Label, Select
 *
 * 2. MOLECULES (moléculas): combinação de átomos
 *    → FormGroup (Label + Input), TotalRow (Label + valor)
 *
 * 3. ORGANISMS (organismos): seções completas da interface
 *    → Header, ProductForm, DataTable, SummaryCard
 *
 * 4. TEMPLATES (modelos): estrutura/layout da página ← ESTAMOS AQUI
 *    → SidebarLayout, FullWidthLayout
 *
 * 5. PAGES (páginas): templates preenchidos com dados reais
 *    → HomePage, ProductsPage, CategoriesPage, etc.
 *
 * Templates definem ONDE os conteúdos ficam na tela, mas NÃO
 * definem QUAIS conteúdos são. Eles recebem o conteúdo via props.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: CHILDREN (props.children)
 * ═══════════════════════════════════════════════════════════════
 *
 * "children" é uma prop especial do React que representa TUDO
 * que é colocado ENTRE as tags de abertura e fechamento de um
 * componente.
 *
 * Exemplo de uso:
 *   <FullWidthLayout>
 *     <h1>Histórico</h1>     ← isso tudo
 *     <table>...</table>      ← é o "children"
 *   </FullWidthLayout>
 *
 * É como um "buraco" no template que será preenchido pela página
 * que usar este layout. Cada página coloca conteúdo diferente.
 *
 * LAYOUT VISUAL DESTE TEMPLATE:
 * ┌─────────────────────────────────────────┐
 * │            HEADER (navegação)            │
 * ├─────────────────────────────────────────┤
 * │                                         │
 * │           CONTEÚDO (children)           │
 * │         (ocupa toda a largura)          │
 * │                                         │
 * └─────────────────────────────────────────┘
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Importa Header.js (organism) → menu de navegação
 * - Usado por: HistoryPage.js e PurchasePage.js
 * - Classes CSS definidas em: styles/global.css (.container, .content-full)
 */

import React from 'react';
import Header from '../organisms/Header';

/**
 * FullWidthLayout — Componente de template para páginas sem sidebar.
 *
 * PARÂMETRO (via desestruturação de props):
 * - children: conteúdo que será renderizado dentro do layout
 *
 * DESESTRUTURAÇÃO DE PROPS:
 * Ao invés de receber "props" e acessar "props.children", usamos
 * { children } diretamente no parâmetro. É a mesma coisa, mas
 * mais limpo e direto.
 *
 * Equivalente a:
 *   function FullWidthLayout(props) {
 *     const children = props.children;
 *     ...
 *   }
 *
 * FRAGMENT (<>...</>):
 * O React exige que todo componente retorne UM único elemento raiz.
 * O Fragment (<> </>) é um "container invisível" que agrupa elementos
 * sem adicionar uma <div> extra no HTML. Mantém o DOM mais limpo.
 *
 * Alternativa mais verbosa: <React.Fragment>...</React.Fragment>
 */
export default function FullWidthLayout({ children }) {
  return (
    <>
      {/* Header: menu de navegação que aparece em TODAS as páginas */}
      <Header />

      {/* Container principal: aplica padding e centraliza o conteúdo */}
      <div className="container">
        {/*
          content-full: classe CSS que faz o conteúdo ocupar 100%
          da largura disponível (definida em global.css)
        */}
        <div className="content-full">{children}</div>
      </div>
    </>
  );
}
