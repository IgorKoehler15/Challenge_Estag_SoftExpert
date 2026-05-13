/**
 * ============================================================
 * ARQUIVO: index.js — O PONTO DE ENTRADA DA APLICAÇÃO REACT
 * ============================================================
 *
 * Este é o PRIMEIRO arquivo JavaScript que o navegador executa
 * quando a aplicação React é carregada. Pense nele como a
 * "porta de entrada" do seu app.
 *
 * O que ele faz:
 * 1. Importa as dependências necessárias (React, ReactDOM)
 * 2. Importa os estilos CSS globais (aparência visual)
 * 3. Importa o componente principal (App)
 * 4. "Monta" o App dentro do HTML da página
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Este arquivo importa o App.js (componente raiz da aplicação)
 * - Importa os CSS que definem a aparência de toda a aplicação
 * - Se conecta ao arquivo public/index.html, onde existe uma
 *   <div id="root"> que serve como "container" para o React
 */

// ─── IMPORTAÇÕES ────────────────────────────────────────────

/**
 * 'React' é a biblioteca principal que permite criar interfaces
 * usando componentes. Mesmo que você não veja "React" sendo usado
 * diretamente aqui, ele é necessário para que o JSX funcione
 * (JSX é aquela sintaxe que parece HTML dentro do JavaScript).
 */
import React from 'react';

/**
 * 'ReactDOM' é a biblioteca que faz a "ponte" entre o React e o
 * navegador (o DOM real da página). Enquanto o React cria os
 * componentes em memória, o ReactDOM é quem de fato coloca eles
 * na tela.
 *
 * Usamos 'react-dom/client' porque a partir do React 18, a forma
 * de renderizar mudou para suportar funcionalidades mais modernas
 * (como renderização concorrente).
 */
import ReactDOM from 'react-dom/client';

/**
 * ─── IMPORTAÇÃO DE ESTILOS (CSS) ────────────────────────────
 *
 * Aqui importamos os arquivos CSS que definem a aparência visual
 * de toda a aplicação. A ordem importa! Estilos importados depois
 * podem sobrescrever os anteriores (cascata do CSS).
 *
 * - global.css: estilos base (fontes, cores, reset de margens)
 * - components.css: estilos de componentes reutilizáveis (botões, cards)
 * - tables.css: estilos específicos para tabelas de dados
 */
import './styles/global.css';
import './styles/components.css';
import './styles/tables.css';

/**
 * Importamos o componente App, que é o "componente raiz" da aplicação.
 * Ele contém toda a estrutura de rotas e páginas. Tudo que o usuário
 * vê na tela está dentro deste componente (direta ou indiretamente).
 *
 * CONEXÃO: App.js → define as rotas → cada rota carrega uma página
 */
import App from './App';

// ─── MONTAGEM DA APLICAÇÃO ──────────────────────────────────

/**
 * Aqui acontece a "mágica" de colocar o React na tela:
 *
 * 1. document.getElementById('root')
 *    → Busca no HTML (public/index.html) a <div id="root">
 *    → Essa div é o "container" onde TODA a aplicação React vai viver
 *
 * 2. ReactDOM.createRoot(...)
 *    → Cria uma "raiz" do React nesse elemento
 *    → A partir do React 18, usamos createRoot ao invés do antigo
 *      ReactDOM.render() — isso habilita melhorias de performance
 *
 * 3. root.render(...)
 *    → Renderiza (desenha na tela) o componente App dentro da raiz
 */
const root = ReactDOM.createRoot(document.getElementById('root'));

/**
 * React.StrictMode é um componente especial que NÃO aparece na tela.
 * Ele serve apenas durante o DESENVOLVIMENTO para:
 *
 * - Avisar sobre práticas ruins ou obsoletas no console
 * - Detectar efeitos colaterais inesperados (renderiza 2x de propósito)
 * - Ajudar você a encontrar bugs mais cedo
 *
 * Em produção (quando o app é publicado), o StrictMode não faz nada.
 * É como um "professor" que fica de olho no seu código durante o
 * desenvolvimento e te avisa quando algo pode dar problema.
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
