/**
 * ============================================================
 * ARQUIVO: components/templates/SidebarLayout.js
 * TEMPLATE DE LAYOUT COM BARRA LATERAL (duas colunas)
 * ============================================================
 *
 * Este é um componente de TEMPLATE que define a estrutura visual
 * para páginas com DUAS COLUNAS: uma barra lateral (sidebar) à
 * esquerda e o conteúdo principal à direita.
 *
 * LAYOUT VISUAL DESTE TEMPLATE:
 * ┌─────────────────────────────────────────┐
 * │            HEADER (navegação)            │
 * ├──────────────────┬──────────────────────┤
 * │                  │                      │
 * │    SIDEBAR       │      CONTENT         │
 * │  (formulário)    │  (tabela de dados)   │
 * │                  │                      │
 * │  [prop: sidebar] │  [prop: content]     │
 * │                  │                      │
 * └──────────────────┴──────────────────────┘
 *
 * DIFERENÇA DO FullWidthLayout:
 * - FullWidthLayout: UMA coluna, recebe "children" (conteúdo único)
 * - SidebarLayout: DUAS colunas, recebe "sidebar" + "content" (dois conteúdos)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPOSIÇÃO vs HERANÇA
 * ═══════════════════════════════════════════════════════════════
 *
 * Em React, preferimos COMPOSIÇÃO ao invés de herança.
 * Composição = passar componentes como props para outros componentes.
 *
 * Ao invés de criar um "SuperLayout" que herda de "Layout" (herança),
 * criamos templates que RECEBEM conteúdo via props (composição).
 * Isso é mais flexível e mais fácil de entender.
 *
 * Exemplo de como uma página USA este template:
 *
 *   <SidebarLayout
 *     sidebar={<ProductForm />}      ← formulário na esquerda
 *     content={<DataTable />}        ← tabela na direita
 *   />
 *
 * O template não sabe NEM SE IMPORTA com o que está dentro de
 * sidebar ou content. Ele só define ONDE cada coisa fica na tela.
 * Isso é o princípio de "Separação de Responsabilidades".
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: RENDER PROPS (Props de Renderização)
 * ═══════════════════════════════════════════════════════════════
 *
 * Quando passamos componentes JSX como props (sidebar={<Form />}),
 * estamos usando um padrão chamado "render props" ou "slots".
 * É similar ao conceito de "slots" em Vue.js ou Angular.
 *
 * Vantagens:
 * - O template é REUTILIZÁVEL (qualquer página pode usar)
 * - Cada página decide O QUE colocar em cada "slot"
 * - Fácil de testar (cada parte é independente)
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Importa Header.js (organism) → menu de navegação
 * - Usado por: HomePage.js, ProductsPage.js, CategoriesPage.js
 * - Classes CSS definidas em: styles/global.css (.container, .aside-2)
 * - A prop "sidebar" geralmente é um <aside className="aside-1">
 *   que já vem estilizado pela página que usa o template
 */

import React from 'react';
import Header from '../organisms/Header';

/**
 * SidebarLayout — Componente de template para páginas com duas colunas.
 *
 * PARÂMETROS (via desestruturação de props):
 * - sidebar: componente/JSX que será renderizado na coluna ESQUERDA
 *   (geralmente um formulário de cadastro dentro de <aside class="aside-1">)
 * - content: componente/JSX que será renderizado na coluna DIREITA
 *   (geralmente uma tabela de dados — DataTable)
 *
 * POR QUE "sidebar" E "content" AO INVÉS DE "children"?
 * Porque temos DOIS "buracos" para preencher, não um.
 * "children" é sempre UM só (tudo entre as tags do componente).
 * Com props nomeadas, podemos ter quantos "slots" quisermos e
 * cada um tem um nome descritivo que indica onde vai ficar.
 */
export default function SidebarLayout({ sidebar, content }) {
  return (
    <>
      {/* Header: menu de navegação (mesmo em todas as páginas) */}
      <Header />

      {/*
        Container principal com display: flex (definido em global.css).
        Os filhos (sidebar e aside-2) ficam lado a lado automaticamente
        graças ao flexbox. Em telas pequenas (<900px), empilham
        verticalmente graças à media query em global.css.
      */}
      <div className="container">
        {/*
          SIDEBAR (coluna esquerda):
          Renderiza o que foi passado na prop "sidebar".
          Geralmente é algo como:
            <aside className="aside-1">
              <ProductForm />
            </aside>

          Note que o elemento <aside> com classe "aside-1" é definido
          PELA PÁGINA que usa o template, não pelo template em si.
          Isso dá flexibilidade para cada página customizar sua sidebar.
        */}
        {sidebar}

        {/*
          CONTENT (coluna direita):
          Envolvido em <aside className="aside-2"> que aplica:
          - border-left: linha divisória visual
          - padding-left: espaço entre a linha e o conteúdo
          - overflow-x: auto (scroll horizontal se necessário)

          Aqui o template DEFINE o wrapper (aside-2), diferente da
          sidebar onde a página define. Isso garante que a coluna
          direita sempre tenha o estilo correto de separação visual.
        */}
        <aside className="aside-2">{content}</aside>
      </div>
    </>
  );
}
