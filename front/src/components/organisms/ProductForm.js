import React from 'react';
import FormGroup from '../molecules/FormGroup';
import InputRow from '../molecules/InputRow';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Button from '../atoms/Button';

export default function ProductForm({
  productName,
  amount,
  unitPrice,
  categoryOptions,
  selectedCategory,
  onNameChange,
  onAmountChange,
  onPriceChange,
  onCategoryChange,
  onAdd,
  disabled,
}) {
  return (
    <aside className="aside-1">
      <FormGroup>
        <Input
          type="text"
          id="productName"
          name="productName"
          placeholder="Product Name"
          value={productName}
          onChange={onNameChange}
        />
      </FormGroup>

      <InputRow>
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="amount"
            name="amount"
            placeholder="Amount"
            value={amount}
            onChange={onAmountChange}
          />
        </FormGroup>
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="unitPrice"
            name="unitPrice"
            placeholder="Unit Price"
            value={unitPrice}
            onChange={onPriceChange}
          />
        </FormGroup>
        <FormGroup style={{ flex: 1 }}>
          <Select
            name="category"
            id="category"
            value={selectedCategory}
            onChange={onCategoryChange}
            placeholder="Category"
            options={categoryOptions}
          />
        </FormGroup>
      </InputRow>

      <Button variant="addProduct" onClick={onAdd} disabled={disabled}>
        Add Product
      </Button>
    </aside>
  );
}
