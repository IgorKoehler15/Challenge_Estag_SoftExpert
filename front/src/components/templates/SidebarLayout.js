import Header from '../organisms/Header';

// Template de layout com sidebar (formulário à esquerda, conteúdo à direita)
// Usado nas páginas de categorias, produtos e home (carrinho)
export default function SidebarLayout({ sidebar, content }) {
  return (
    <>
      <Header />

      <div className="container">
        {/* Sidebar: formulário de entrada de dados */}
        {sidebar}
        {/* Conteúdo principal: tabela de dados */}
        <aside className="aside-2">{content}</aside>
      </div>
    </>
  );
}
