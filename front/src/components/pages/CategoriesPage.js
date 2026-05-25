import { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../templates/SidebarLayout';
import CategoryForm from '../organisms/CategoryForm';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import ErrorMessage from '../atoms/ErrorMessage';
import * as api from '../../services/api';
import { validateName, validateTax } from '../../utils/validation';
import logger from '../../utils/logger';

// Página de gerenciamento de categorias (listagem, criação e exclusão)
export default function CategoriesPage() {

  // Estados: lista de categorias, nome e taxa do formulário
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [tax, setTax] = useState('');
  const [error, setError] = useState(null);

  // Callbacks estáveis para os handlers de onChange do formulário
  const handleNameChange = useCallback((e) => setCategoryName(e.target.value), []);
  const handleTaxChange = useCallback((e) => setTax(e.target.value), []);

  // Busca as categorias da API e atualiza o estado
  const loadCategories = useCallback(async () => {
    setError(null);
    try {
      const data = await api.fetchCategories();
      setCategories(data);
    } catch (err) {
      logger.error('Error searching for categories:', err);
      setError('Failed to load categories. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Valida os campos do formulário e envia a nova categoria para a API
  const handleAdd = async () => {
    
    const nameRaw = categoryName.replace(/\s+/g, ' ').trim();
    const taxRaw = tax.trim();

    // Validação do nome
    const nameError = validateName(nameRaw, 'Category name');
    if (nameError) return alert(nameError);

    // Verifica duplicidade local (case insensitive)
    if (categories.some((c) => c.name.replace(/\s+/g, ' ').toLowerCase() === nameRaw.toLowerCase()))
      return alert('This category already exists!');

    // Validação da taxa
    const taxError = validateTax(taxRaw);
    if (taxError) return alert(taxError);

    const taxValue = parseFloat(taxRaw);

    try {
      await api.createCategory({ name: nameRaw, tax: taxValue });
      setCategoryName('');
      setTax('');
      await loadCategories();
    } catch (error) {
      alert(error.message || 'Error connecting to the server while trying to save.');
    }
  };

  // Confirma e executa a exclusão de uma categoria
  const handleDelete = async (code, name) => {
    if (window.confirm(`Delete the category "${name}"?`)) {
      try {
        const data = await api.deleteCategory(code);
        alert(data.message || 'Category successfully deleted!');
        await loadCategories();
      } catch (error) {
        alert(error.message || 'Error connecting to the server while trying to delete.');
      }
    }
  };

  // Monta as linhas da tabela a partir dos dados das categorias
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

  // Sidebar: formulário de cadastro de categoria
  const sidebar = (
    <CategoryForm
      categoryName={categoryName}
      tax={tax}
      onNameChange={handleNameChange}
      onTaxChange={handleTaxChange}
      onAdd={handleAdd}
    />
  );

  // Conteúdo principal: tabela de categorias
  const content = error ? (
    <ErrorMessage message={error} onRetry={loadCategories} />
  ) : (
    <DataTable
      className="table-categories"
      columns={['Code', 'Category', 'Tax', 'Actions']}
      rows={rows}
      fillerCols={4}
    />
  );

  return <SidebarLayout sidebar={sidebar} content={content} />;
}
