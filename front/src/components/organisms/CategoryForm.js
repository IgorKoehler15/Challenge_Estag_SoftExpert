/**
 * ============================================================
 * ARQUIVO: components/organisms/CategoryForm.js
 * FORMULÁRIO DE CADASTRO DE CATEGORIAS
 * ============================================================
 *
 * Este é um ORGANISMO (organism) no padrão Atomic Design.
 * Organismos são seções completas da interface compostas por
 * moléculas e átomos trabalhando juntos.
 *
 * O QUE FAZ:
 * Renderiza o formulário para cadastrar novas categorias,
 * com campos para nome e taxa, e um botão de adicionar.
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: COMPONENTE "BURRO" (Presentational Component)
 * ═══════════════════════════════════════════════════════════════
 *
 * Este componente NÃO tem lógica própria. Ele apenas:
 * - Recebe dados via props (valores dos campos)
 * - Recebe funções via props (handlers de eventos)
 * - Renderiza a interface visual
 *
 * Toda a LÓGICA (validação, envio, etc.) fica na PÁGINA
 * (CategoriesPage.js) que usa este componente.
 *
 * VANTAGENS deste padrão:
 * - Fácil de testar (só precisa verificar se renderiza corretamente)
 * - Reutilizável (poderia ser usado em outro contexto)
 * - Separação clara: visual aqui, lógica na página
 *
 * Este padrão é chamado de "Presentational vs Container":
 * - Presentational (este): cuida da APARÊNCIA
 * - Container (CategoriesPage): cuida da LÓGICA e DADOS
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado por: CategoriesPage.js (como prop "sidebar" do SidebarLayout)
 * - Usa: FormGroup (molecule), InputRow (molecule), Input (atom), Button (atom)
 * - Estilos: components.css (.aside-1, .form-group, .input-row, button.addCategory)
 */

import React from 'react';
import FormGroup from '../molecules/FormGroup';
import InputRow from '../molecules/InputRow';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

/**
 * CategoryForm — Formulário de cadastro de categorias.
 *
 * PROPS RECEBIDAS (todas vêm da CategoriesPage):
 *
 * @param {string} categoryName — Valor atual do campo "nome da categoria"
 * @param {string} tax — Valor atual do campo "taxa"
 * @param {function} onNameChange — Função chamada quando o nome muda
 *   (recebe o evento "e", a página extrai e.target.value)
 * @param {function} onTaxChange — Função chamada quando a taxa muda
 * @param {function} onAdd — Função chamada ao clicar "Add Category"
 *   (a página executa a validação e envio ao servidor)
 *
 * DESESTRUTURAÇÃO DE PROPS:
 * Ao invés de receber "props" e acessar "props.categoryName",
 * desestruturamos diretamente no parâmetro: { categoryName, tax, ... }
 * Isso torna o código mais limpo e deixa claro quais props são usadas.
 */
export default function CategoryForm({
  categoryName,
  tax,
  onNameChange,
  onTaxChange,
  onAdd,
}) {
  return (
    /**
     * <aside className="aside-1">
     * Define a coluna esquerda do SidebarLayout.
     * A classe "aside-1" aplica os estilos de global.css:
     * - flex: 1 1 300px (cresce, encolhe, mínimo 300px)
     * - display: flex, flex-direction: column
     */
    <aside className="aside-1">
      {/*
        InputRow: coloca os campos LADO A LADO (flex horizontal).
        Aqui temos nome (flex: 2 = ocupa 2/3) e taxa (flex: 1 = ocupa 1/3).

        O atributo "style" com {{ }} é um INLINE STYLE em React.
        O primeiro { } é a sintaxe JSX para expressões JavaScript.
        O segundo { } é o objeto CSS em JavaScript.
        Propriedades CSS em React usam camelCase: flex-direction → flexDirection
      */}
      <InputRow>
        <FormGroup style={{ flex: 2 }}>
          <Input
            type="text"
            id="category"
            name="category"
            placeholder="Category Name"
            value={categoryName}
            onChange={onNameChange}
          />
        </FormGroup>
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="taxCategory"
            name="taxCategory"
            placeholder="Tax"
            value={tax}
            onChange={onTaxChange}
          />
        </FormGroup>
      </InputRow>

      {/*
        Botão de adicionar. variant="addCategory" aplica a classe
        CSS "addCategory" (definida em components.css — cor roxa).
        onClick={onAdd} chama a função handleAdd da CategoriesPage.
      */}
      <Button variant="addCategory" onClick={onAdd}>
        Add Category
      </Button>
    </aside>
  );
}
