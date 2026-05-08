import React, { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../templates/SidebarLayout';
import CategoryForm from '../organisms/CategoryForm';
import DataTable from '../organisms/DataTable';
import Button from '../atoms/Button';
import * as api from '../../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [tax, setTax] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error searching for categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAdd = async () => {
    const nameRaw = categoryName.replace(/\s+/g, ' ').trim();
    const taxRaw = tax.trim();

    if (nameRaw.length === 0 || nameRaw.length > 30)
      return alert('Category name must be between 1 and 30 characters.');

    const nameRegex = /^(?=.*[a-zA-ZÀ-ÿ])[a-zA-ZÀ-ÿ0-9 ]+$/;
    if (!nameRegex.test(nameRaw))
      return alert('Invalid Category Name! It cannot contain only numbers or special characters!');

    if (categories.some((c) => c.name.replace(/\s+/g, ' ').toLowerCase() === nameRaw.toLowerCase()))
      return alert('This category already exists!');

    if (taxRaw.length === 0 || taxRaw.length > 5)
      return alert('Tax must have between 1 and 5 characters (e.g., 10 or 25.50).');

    const taxRegex = /^\d+(\.\d{1,2})?$/;
    if (!taxRegex.test(taxRaw))
      return alert('Invalid Tax format! Use numbers separated by a dot (e.g., 10 or 25.50).');

    const taxValue = parseFloat(taxRaw);
    if (isNaN(taxValue) || taxValue < 0 || taxValue > 100)
      return alert('Tax must be a valid number between 0 and 100.');

    try {
      await api.createCategory({ name: nameRaw, tax: taxValue });
      setCategoryName('');
      setTax('');
      await loadCategories();
    } catch (error) {
      alert(error.message || 'Error connecting to the server while trying to save.');
    }
  };

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

  return <SidebarLayout sidebar={sidebar} content={content} />;
}
