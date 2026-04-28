import React from 'react';
import FormGroup from '../molecules/FormGroup';
import InputRow from '../molecules/InputRow';
import Select from '../atoms/Select';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

export default function HomeForm({
  productOptions,
  selectedProduct,
  amount,
  tax,
  price,
  onProductChange,
  onAmountChange,
  onAdd,
}) {
  return (
    <aside className="aside-1">
      <FormGroup>
        <Select
          id="prod"
          name="prod"
          value={selectedProduct}
          onChange={onProductChange}
          placeholder="Select a Product"
          options={productOptions}
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
            id="tax"
            name="tax"
            placeholder="Tax"
            value={tax}
            readOnly
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </FormGroup>
        <FormGroup style={{ flex: 1 }}>
          <Input
            type="number"
            id="price"
            name="price"
            placeholder="Price"
            value={price}
            readOnly
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </FormGroup>
      </InputRow>

      <Button variant="addProduct" onClick={onAdd}>
        Add Product
      </Button>
    </aside>
  );
}
