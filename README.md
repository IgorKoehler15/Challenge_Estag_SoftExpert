# 📦 Sistema de Gestão de Produtos e Pedidos

## 📖 Sobre o Projeto
Este projeto foi desenvolvido como parte do programa de estágio e estudos da **SoftExpert**. O objetivo principal é construir uma aplicação Full-Stack robusta para o gerenciamento de categorias, produtos e histórico de pedidos, com foco em integridade de dados e boas práticas de regras de negócio.

O frontend possui **duas versões**:
- **Versão Original (Vanilla JS):** HTML, CSS e JavaScript puro — os arquivos estão na raiz da pasta `front/` (`index.html`, `categories.html`, etc.) junto com as pastas `js/` e `css/`.
- **Versão React:** Refatoração completa para React 18 utilizando **Atomic Design**, localizada em `front/src/`. A aparência e o comportamento são idênticos à versão original.

## ✨ Funcionalidades Principais
* **Gestão de Categorias:** Criação, listagem e exclusão (com validação de segurança caso existam produtos vinculados).
* **Gestão de Produtos:** Controle de catálogo com nome, preço, quantidade e vínculo de categorias.
* **Carrinho de Compras:** Adição de produtos ao carrinho com controle de estoque, cálculo de impostos e finalização de pedido.
* **Histórico de Pedidos:** Listagem de pedidos finalizados com visualização detalhada de cada compra.
* **Lógica Inteligente de Exclusão (Soft vs. Hard Delete):**
  * **Hard Delete:** Se um produto nunca foi vendido, ele é apagado permanentemente do banco.
  * **Soft Delete:** Se um produto possui histórico em pedidos anteriores, ele é apenas inativado (`is_active = false`), protegendo a integridade financeira e o histórico das vendas.
* **Reativação de Itens:** Prevenção de duplicação de cadastros, reativando itens previamente excluídos e atualizando seus dados.

## 🛠️ Tecnologias Utilizadas

### Backend
* **PHP** — API REST
* **PDO** — Comunicação segura com o banco de dados
* **PostgreSQL / MySQL** — Banco de dados relacional

### Frontend (Vanilla JS)
* **HTML5, CSS3, JavaScript** — Páginas estáticas com manipulação direta do DOM

### Frontend (React)
* **React 18** — SPA com hooks (`useState`, `useEffect`, `useCallback`)
* **React Router DOM** — Navegação client-side
* **Atomic Design** — Arquitetura de componentes organizada em Atoms, Molecules, Organisms, Templates e Pages

## 🏗️ Estrutura do Frontend React (Atomic Design)

```
front/src/
├── components/
│   ├── atoms/          # Button, Input, Select, Label
│   ├── molecules/      # FormGroup, InputRow, TotalRow, SummaryItem
│   ├── organisms/      # Header, DataTable, TotalsSection, SummaryCard, HomeForm, CategoryForm, ProductForm
│   ├── templates/      # SidebarLayout, FullWidthLayout
│   └── pages/          # HomePage, ProductsPage, CategoriesPage, HistoryPage, PurchasePage
├── services/
│   └── api.js          # Funções centralizadas de comunicação com o backend
├── styles/             # CSS original (global, components, tables) sem alterações
├── App.js              # Rotas da aplicação
└── index.js            # Ponto de entrada
```

## 🚀 Como Executar o Projeto

### 1. Banco de Dados
1. Execute o script SQL em `/database/init.sql` para criar as tabelas.
2. Ajuste as credenciais de conexão em `back/src/connection.php`.

### 2. Com Docker (recomendado)
```bash
docker-compose up -d
```

### 3. Sem Docker

#### Backend (API PHP)
Coloque os arquivos de `back/src/` no seu servidor web (XAMPP, WAMP, etc.) apontando para `localhost` na porta 80.

#### Frontend — Versão Vanilla JS
Abra diretamente os arquivos HTML da pasta `front/` no navegador (ex: `front/index.html`).

#### Frontend — Versão React
```bash
cd front
npm install
npm start
```
O servidor de desenvolvimento roda na porta 3000 e utiliza o proxy configurado no `package.json` para encaminhar as requisições da API para `http://localhost` (porta 80), evitando problemas de CORS.

## 👨‍💻 Autor

Desenvolvido por Igor Henrique Koehler durante o programa de estágio da SoftExpert (2026).
