# 📦 Suite Store — Sistema de Gestão de Produtos e Pedidos

## 📖 Sobre o Projeto

Aplicação Full-Stack desenvolvida durante o programa de estágio da **SoftExpert**, com o objetivo de gerenciar categorias, produtos e pedidos de compra. O sistema implementa regras de negócio para integridade de dados, controle de estoque e preservação de histórico financeiro.

O frontend possui **duas versões** com aparência e comportamento idênticos:
- **Vanilla JS** — HTML, CSS e JavaScript puro (pasta `front/`, arquivos `.html` + `js/` + `css/`)
- **React 18** — Refatoração com Atomic Design (pasta `front/src/`)

---

## 🛠️ Linguagens e Tecnologias

| Camada | Linguagem / Tecnologia | Uso |
|--------|----------------------|-----|
| **Backend** | PHP 8.1 | API REST |
| **Backend** | SQL (PostgreSQL 14) | Banco de dados relacional |
| **Frontend** | JavaScript (ES6+) | Lógica da aplicação |
| **Frontend** | HTML5 | Estrutura das páginas |
| **Frontend** | CSS3 | Estilização |
| **Frontend** | React 18 | SPA com componentes |

---

## ✨ Funcionalidades

### Gestão de Categorias
- Criação, listagem e exclusão de categorias
- Validação de segurança: impede exclusão se houver produtos ativos vinculados

### Gestão de Produtos
- Cadastro com nome, preço, quantidade e categoria
- Controle de estoque automático (decrementado a cada compra)
- Validação de nome duplicado entre produtos visíveis

### Carrinho de Compras
- Adição de produtos com controle de estoque disponível
- Cálculo automático de impostos por categoria
- Persistência no `localStorage` (sobrevive a refresh)
- Finalização de pedido com atualização de estoque

### Histórico de Pedidos
- Listagem de todos os pedidos finalizados
- Visualização detalhada de cada compra (produtos, quantidades, impostos)

### Regras de Negócio de Exclusão
| Situação | Comportamento |
|----------|--------------|
| Produto/categoria **nunca usado** em pedidos | **Hard Delete** — removido permanentemente do banco |
| Produto/categoria **com histórico** de pedidos | **Soft Delete** — inativado (`is_active = false`), preservando a integridade do histórico |

### Código de Exibição (`display_code`)
- Cada item possui um `code` interno (PK, nunca reutilizado) e um `display_code` (exibido na tela)
- O `display_code` é sequencial baseado nos itens ativos visíveis
- Ao excluir um item do meio, os demais mantêm seus códigos (sem reindexação)
- O próximo cadastrado recebe `MAX(display_code dos visíveis) + 1`

---

## 🏗️ Arquitetura do Frontend React (Atomic Design)

```
front/src/
├── components/
│   ├── atoms/          → Button, Input, Select, Label
│   ├── molecules/      → FormGroup, InputRow, TotalRow, SummaryItem
│   ├── organisms/      → Header, DataTable, TotalsSection, SummaryCard, HomeForm, CategoryForm, ProductForm
│   ├── templates/      → SidebarLayout, FullWidthLayout
│   └── pages/          → HomePage, ProductsPage, CategoriesPage, HistoryPage, PurchasePage
├── hooks/
│   └── useDomProtection.js
├── services/
│   └── api.js          → Comunicação centralizada com o backend
├── styles/             → CSS (global, components, tables)
├── App.js              → Rotas da aplicação
└── index.js            → Ponto de entrada
```

---

## 🛠️ Infraestrutura (Docker)

O projeto roda com 4 containers via Docker Compose:

| Serviço | Container | Porta | Descrição |
|---------|-----------|-------|-----------|
| **PostgreSQL 14** | `pgsql_desafio` | `5433` | Banco de dados |
| **PHP 8.1 + Apache** | `php_desafio` | `80` | API REST (backend) |
| **Node.js** | `node_desafio` | `3000` | Frontend React (dev server) |
| **pgAdmin 4** | `pgadmin_desafio` | `8080` | Interface de administração do banco |

### Credenciais padrão

| Serviço | Usuário | Senha |
|---------|---------|-------|
| PostgreSQL | `root` | `root` |
| pgAdmin | `root@root.com` | `root` |

---

## 🚀 Como Executar

### Com Docker (recomendado)

```bash
# Subir todos os containers
docker-compose up -d

# Ou usar o script auxiliar
./scripts/start.sh
```

Após subir, acesse:
- **Frontend React:** http://localhost:3000
- **API (Backend):** http://localhost
- **pgAdmin:** http://localhost:8080

### Scripts auxiliares

| Script | Descrição |
|--------|-----------|
| `scripts/start.sh` | Derruba e recria todos os containers |
| `scripts/stop.sh` | Para todos os containers |
| `scripts/install.sh` | Instala dependências npm dentro do container Node |

### Sem Docker

#### Backend
Coloque os arquivos de `back/src/` em um servidor Apache com PHP 8.1+ e a extensão `pdo_pgsql` habilitada. Ajuste as credenciais em `back/src/connection.php`.

#### Frontend React
```bash
cd front
npm install
npm start
```

#### Banco de Dados
Execute o script `database/init.sql` em uma instância PostgreSQL.

---

## 📁 Estrutura do Projeto

```
├── back/
│   ├── src/              → Arquivos PHP da API (categories, products, checkout, history)
│   ├── logs/             → Logs do Apache
│   ├── Dockerfile        → Imagem PHP 8.1 + Apache
│   └── virtualhost.conf  → Configuração do Apache
├── front/
│   ├── src/              → Código React (Atomic Design)
│   ├── js/               → Versão Vanilla JS
│   ├── css/              → Estilos da versão Vanilla
│   ├── *.html            → Páginas da versão Vanilla
│   ├── Dockerfile        → Imagem Node.js
│   └── package.json      → Dependências React
├── database/
│   ├── init.sql          → Script de criação das tabelas
│   └── server.json       → Configuração do pgAdmin
├── scripts/              → Scripts auxiliares (start, stop, install)
└── docker-compose.yml    → Orquestração dos containers
```

---

## 👨‍💻 Autor

Desenvolvido por **Igor Henrique Koehler** durante o programa de estágio da SoftExpert (2026).
