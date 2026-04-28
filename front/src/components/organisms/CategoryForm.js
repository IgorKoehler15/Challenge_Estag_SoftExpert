import React from 'react';
import FormGroup from '../molecules/FormGroup';
import InputRow from '../molecules/InputRow';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

export default function CategoryForm({
  categoryName,
  tax,
  onNameChange,
  onTaxChange,
  onAdd,
}) {
  return (
    <aside className="aside-1">
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
      <Button variant="addCategory" onClick={onAdd}>
        Add Category
      </Button>
    </aside>
  );
}
