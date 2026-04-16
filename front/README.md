# 📦 Sistema de Gestão de Produtos e Pedidos 

## 📖 Sobre o Projeto
Este projeto foi desenvolvido como parte do programa de estágio e estudos da **SoftExpert**. O objetivo principal é construir uma aplicação Full-Stack robusta para o gerenciamento de categorias, produtos e histórico de pedidos, com foco em integridade de dados e boas práticas de regras de negócio.

## ✨ Funcionalidades Principais
* **Gestão de Categorias:** Criação, listagem e exclusão (com validação de segurança caso existam produtos vinculados).
* **Gestão de Produtos:** Controle de catálogo com nome, preço, quantidade e vínculo de categorias.
* **Lógica Inteligente de Exclusão (Soft vs. Hard Delete):**
  * **Hard Delete:** Se um produto nunca foi vendido, ele é apagado permanentemente do banco, otimizando o uso de IDs e limpeza da tabela.
  * **Soft Delete:** Se um produto possui histórico em pedidos anteriores, ele é apenas inativado (`is_active = false`), protegendo a integridade financeira e o histórico das vendas.
* **Reativação de Itens:** Prevenção de duplicação de cadastros, reativando itens previamente excluídos e atualizando seus dados sem quebrar a sequência do banco de dados.

## 🛠️ Tecnologias Utilizadas

### Backend
* **PHP:** Construção da API REST.
* **PDO:** Comunicação segura com o banco de dados.
* **Banco de Dados:** PostgreSQL / MySQL (com chaves estrangeiras e relacionamentos).

### Frontend
* **React.js:** Construção da interface de usuário (SPA).
* **Integração:** Consumo da API via requisições HTTP (Fetch/Axios).

## 🚀 Como Executar o Projeto

### 1. Configuração do Banco de Dados
1. Execute o script SQL localizado na pasta `/database` para criar as tabelas (`categories`, `products`, `orders`, `order_item`).
2. Ajuste as credenciais de conexão no arquivo `connection.php`.

### 2. Backend (API PHP)
1. Coloque os arquivos PHP na pasta do seu servidor web (XAMPP, WAMP, etc.) ou inicie o servidor embutido do PHP na pasta do backend:

   ```bash
   php -S localhost:8000
### 3. Frontend (React)
1. Navegue até a pasta do projeto React:

    ```bash
    cd frontend
2. Caso ainda não tenha criado o projeto, você pode iniciá-lo com:

    ```bash
    npx create-react-app .
3. Instale as dependências (caso tenha apenas clonado o repositório):

    ```bash
    npm install
4. Inicie o servidor de desenvolvimento:

    ```bash
    npm start

## 👨‍💻Autor

Desenvolvido durante o programa de estágio da SoftExpert.
