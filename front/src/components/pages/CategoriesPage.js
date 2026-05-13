/**
 * ============================================================
 * ARQUIVO: components/pages/CategoriesPage.js
 * PÁGINA DE CADASTRO E LISTAGEM DE CATEGORIAS
 * ============================================================
 *
 * Esta página permite ao usuário:
 * 1. Cadastrar novas categorias (nome + taxa/imposto)
 * 2. Visualizar todas as categorias cadastradas em uma tabela
 * 3. Excluir categorias existentes
 *
 * LAYOUT: Usa SidebarLayout (duas colunas)
 * - Esquerda: formulário de cadastro (CategoryForm)
 * - Direita: tabela com categorias cadastradas (DataTable)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: ESTADO (State) EM REACT
 * ═══════════════════════════════════════════════════════════════
 *
 * "Estado" é qualquer dado que pode MUDAR ao longo do tempo e que,
 * quando muda, deve atualizar a interface (re-renderizar).
 *
 * useState retorna um par [valor, função_para_mudar]:
 *   const [nome, setNome] = useState('');
 *   - nome: valor atual do estado
 *   - setNome: função para atualizar o valor
 *   - '': valor inicial
 *
 * REGRA DE OURO: NUNCA modifique o estado diretamente!
 *   ❌ nome = "novo valor"  (não funciona, React não detecta)
 *   ✅ setNome("novo valor") (React detecta e re-renderiza)
 *
 * ═══════════════════════════════════════════════════════════════
 * CONCEITO: VALIDAÇÃO DE FORMULÁRIOS
 * ═══════════════════════════════════════════════════════════════
 *
 * Antes de enviar dados ao servidor, SEMPRE validamos no frontend:
 * - Campos obrigatórios preenchidos?
 * - Formato correto? (regex)
 * - Limites respeitados? (tamanho, valor mínimo/máximo)
 * - Duplicatas? (já existe no banco?)
 *
 * POR QUE VALIDAR NO FRONTEND?
 * - Feedback instantâneo ao usuário (sem esperar resposta do servidor)
 * - Reduz requisições desnecessárias ao backend
 * - Melhora a experiência do usuário (UX)
 *
 * MAS ATENÇÃO: validação no frontend NÃO substitui validação no
 * backend! O backend TAMBÉM valida, pois alguém pode burlar o
 * frontend (ex: usando Postman ou DevTools).
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - SidebarLayout.js → define a estrutura de duas colunas
 * - CategoryForm.js → formulário de cadastro (organism)
 * - DataTable.js → tabela de dados (organism)
 * - Button.js → botão de excluir (atom)
 * - api.js → funções fetchCategories, createCategory, deleteCategory
 */

import React, { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../templates/SidebarLayout';
import CategoryForm from '../organisms/CategoryForm';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import * as api from '../../services/api';

/**
 * ─── IMPORTAÇÃO COM * (asterisco) ───────────────────────────
 *
 * "import * as api" importa TODAS as exportações do arquivo api.js
 * como um objeto chamado "api". Assim podemos usar:
 *   api.fetchCategories()
 *   api.createCategory(...)
 *   api.deleteCategory(...)
 *
 * Alternativa seria importar cada função individualmente:
 *   import { fetchCategories, createCategory, deleteCategory } from '...'
 *
 * Usar "* as api" é mais prático quando usamos muitas funções
 * do mesmo arquivo, e deixa claro de onde cada função vem.
 */

export default function CategoriesPage() {

  // ─── ESTADOS DO COMPONENTE ──────────────────────────────────
  /**
   * categories: array com todas as categorias vindas do banco de dados.
   * Começa vazio [] e é preenchido quando a página carrega.
   */
  const [categories, setCategories] = useState([]);

  /**
   * categoryName e tax: valores dos campos do formulário.
   * São "controlled inputs" — o React controla o valor do input.
   *
   * CONCEITO: CONTROLLED vs UNCONTROLLED INPUTS
   * - Controlled: valor vem do estado React (value={categoryName})
   *   → React é a "fonte da verdade"
   * - Uncontrolled: valor fica no DOM (acessado via ref)
   *   → DOM é a "fonte da verdade"
   *
   * Controlled é o padrão recomendado porque facilita validação,
   * formatação e sincronização com outros componentes.
   */
  const [categoryName, setCategoryName] = useState('');
  const [tax, setTax] = useState('');

  // ─── FUNÇÃO DE CARREGAMENTO ─────────────────────────────────
  /**
   * loadCategories: busca todas as categorias do servidor.
   *
   * useCallback memoriza a função para que ela não seja recriada
   * a cada renderização. Isso é necessário porque ela é usada
   * como dependência do useEffect abaixo.
   *
   * FLUXO:
   * 1. Chama api.fetchCategories() (requisição GET ao backend)
   * 2. Se der certo, atualiza o estado "categories" com os dados
   * 3. Se der erro, loga no console (não trava a aplicação)
   *
   * try/catch: estrutura para capturar erros em código assíncrono.
   * Se algo dentro do "try" falhar, o "catch" é executado.
   */
  const loadCategories = useCallback(async () => {
    try {
      const data = await api.fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error searching for categories:', error);
    }
  }, []);

  /**
   * useEffect com [loadCategories]: executa loadCategories quando
   * o componente é montado (primeira renderização).
   *
   * Como loadCategories é memorizado com useCallback([]),
   * ele nunca muda, então este efeito executa apenas UMA vez.
   */
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ─── HANDLER: ADICIONAR CATEGORIA ──────────────────────────
  /**
   * handleAdd: função executada quando o usuário clica em "Adicionar".
   *
   * CONCEITO: HANDLER (manipulador de evento)
   * Funções que respondem a ações do usuário (clique, digitação,
   * submit, etc.) são chamadas de "handlers" ou "event handlers".
   * Convenção: começam com "handle" (handleAdd, handleDelete, etc.)
   *
   * FLUXO DE VALIDAÇÃO (padrão "early return"):
   * Cada validação verifica uma condição e, se falhar, mostra
   * um alert e RETORNA (sai da função). Isso evita if/else aninhados
   * e torna o código mais legível.
   *
   * Padrão "early return":
   *   if (inválido) return alert('erro');  ← sai se inválido
   *   if (inválido) return alert('erro');  ← sai se inválido
   *   // Se chegou aqui, tudo é válido!
   *   // ... código de sucesso ...
   */
  const handleAdd = async () => {
    /**
     * LIMPEZA DO INPUT:
     * .replace(/\s+/g, ' ') → substitui múltiplos espaços por um só
     *   Regex: \s+ = um ou mais espaços, g = global (todos)
     * .trim() → remove espaços no início e fim
     *
     * Exemplo: "  Bebidas   Alcoólicas  " → "Bebidas Alcoólicas"
     */
    const nameRaw = categoryName.replace(/\s+/g, ' ').trim();
    const taxRaw = tax.trim();

    // Validação 1: nome deve ter entre 1 e 30 caracteres
    if (nameRaw.length === 0 || nameRaw.length > 30)
      return alert('Category name must be between 1 and 30 characters.');

    /**
     * Validação 2: nome deve conter pelo menos uma LETRA.
     *
     * REGEX EXPLICADA: /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/
     * - ^ e $ → início e fim da string (deve casar com TUDO)
     * - (?=.*[a-zA-ZÀ-ÿ]) → "lookahead" — exige pelo menos uma letra
     *   (incluindo acentuadas: À-ÿ)
     * - [a-zA-ZÀ-ÿ0-9 ]+ → permite letras, números e espaços
     *
     * Isso impede nomes como "123" ou "!!!" mas permite "Categoria 1"
     */
    const nameRegex = /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/;
    if (!nameRegex.test(nameRaw))
      return alert('Invalid Category Name! It cannot contain only numbers or special characters!');

    /**
     * Validação 3: verificar duplicatas (case-insensitive).
     *
     * .some() retorna true se ALGUM elemento do array satisfaz a condição.
     * Comparamos em lowercase para "Bebidas" == "bebidas" == "BEBIDAS".
     */
    if (categories.some((c) => c.name.replace(/\s+/g, ' ').toLowerCase() === nameRaw.toLowerCase()))
      return alert('This category already exists!');

    // Validação 4: taxa deve ter entre 1 e 5 caracteres
    if (taxRaw.length === 0 || taxRaw.length > 5)
      return alert('Tax must have between 1 and 5 characters (e.g., 10 or 25.50).');

    /**
     * Validação 5: formato da taxa (número com até 2 casas decimais).
     *
     * REGEX: /^\d+(\.\d{1,2})?$/
     * - \d+ → um ou mais dígitos (parte inteira)
     * - (\.\d{1,2})? → opcionalmente, ponto + 1 ou 2 dígitos (decimais)
     *
     * Aceita: "10", "25.5", "99.99"
     * Rejeita: "abc", "10.123", ".5", "10."
     */
    const taxRegex = /^\d+(\.\d{1,2})?$/;
    if (!taxRegex.test(taxRaw))
      return alert('Invalid Tax format! Use numbers separated by a dot (e.g., 10 or 25.50).');

    // Validação 6: valor numérico entre 0 e 100
    const taxValue = parseFloat(taxRaw);
    if (isNaN(taxValue) || taxValue < 0 || taxValue > 100)
      return alert('Tax must be a valid number between 0 and 100.');

    // ─── ENVIO AO SERVIDOR ────────────────────────────────────
    /**
     * Se todas as validações passaram, enviamos os dados ao backend.
     *
     * FLUXO:
     * 1. api.createCategory() → POST para /categories.php
     * 2. Se der certo: limpa os campos e recarrega a lista
     * 3. Se der erro: mostra a mensagem de erro ao usuário
     */
    try {
      await api.createCategory({ name: nameRaw, tax: taxValue });
      setCategoryName('');  // Limpa o campo nome
      setTax('');           // Limpa o campo taxa
      await loadCategories(); // Recarrega a tabela com dados atualizados
    } catch (error) {
      alert(error.message || 'Error connecting to the server while trying to save.');
    }
  };

  // ─── HANDLER: EXCLUIR CATEGORIA ────────────────────────────
  /**
   * handleDelete: executada quando o usuário clica em "Delete" na tabela.
   *
   * PARÂMETROS:
   * - code: código da categoria no banco de dados
   * - name: nome da categoria (para exibir na confirmação)
   *
   * window.confirm(): abre um diálogo nativo do navegador com
   * "OK" e "Cancelar". Retorna true se o usuário clicar OK.
   * Sempre peça confirmação antes de deletar! (boa prática de UX)
   */
  const handleDelete = async (code, name) => {
    if (window.confirm(`Delete the category "${name}"?`)) {
      try {
        const data = await api.deleteCategory(code);
        alert(data.message || 'Category successfully deleted!');
        await loadCategories(); // Atualiza a tabela
      } catch (error) {
        alert(error.message || 'Error connecting to the server while trying to delete.');
      }
    }
  };

  // ─── PREPARAÇÃO DOS DADOS PARA A TABELA ────────────────────
  /**
   * Transforma o array de categorias em um formato que o DataTable
   * entende. Cada item do array "rows" tem:
   * - key: identificador único (para o React otimizar renderização)
   * - cells: array com o conteúdo de cada célula da linha
   *
   * .map(): cria um NOVO array transformando cada elemento.
   * É o método mais usado em React para renderizar listas.
   *
   * padStart(3, '0'): preenche com zeros à esquerda até ter 3 dígitos.
   * Exemplo: "5" → "005", "12" → "012", "100" → "100"
   *
   * charAt(0).toUpperCase() + slice(1): capitaliza a primeira letra.
   * Exemplo: "bebidas" → "Bebidas"
   */
  const rows = categories.map((c, index) => {
    const displayCode = String(c.display_code).padStart(3, '0');
    return {
      key: c.code,
      cells: [
        <strong>{displayCode}</strong>,
        c.name.charAt(0).toUpperCase() + c.name.slice(1),
        `${parseFloat(c.tax).toFixed(2)}%`,
        <Button variant="btn-cancel" onClick={() => handleDelete(c.code, c.name)}>
          Delete
        </Button>,
      ],
    };
  });

  // ─── MONTAGEM DO LAYOUT ─────────────────────────────────────
  /**
   * Preparamos os dois "slots" do SidebarLayout:
   *
   * sidebar: o formulário de cadastro (CategoryForm)
   * - Recebe os valores dos estados e as funções de onChange
   * - onChange={(e) => setCategoryName(e.target.value)}
   *   → quando o usuário digita, atualiza o estado com o novo valor
   *   → e.target.value = valor atual do input que disparou o evento
   *
   * content: a tabela de dados (DataTable)
   * - columns: títulos das colunas
   * - rows: dados formatados (preparados acima)
   * - fillerCols: quantas colunas a "filler row" deve ter
   */
  const sidebar = (
    <CategoryForm
      categoryName={categoryName}
      tax={tax}
      onNameChange={(e) => setCategoryName(e.target.value)}
      onTaxChange={(e) => setTax(e.target.value)}
      onAdd={handleAdd}
    />
  );

  const content = (
    <DataTable
      className="table-categories"
      columns={['Code', 'Category', 'Tax', 'Actions']}
      rows={rows}
      fillerCols={4}
    />
  );

  /**
   * Retorna o SidebarLayout passando sidebar e content como props.
   * O template cuida de posicionar cada um no lugar certo.
   */
  return <SidebarLayout sidebar={sidebar} content={content} />;
}
