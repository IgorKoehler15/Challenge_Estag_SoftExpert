import FormGroup from '../molecules/FormGroup';
import InputRow from '../molecules/InputRow';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

// Formulário de cadastro de categorias
// Recebe os valores dos campos e callbacks para atualizar estado e submeter
export default function CategoryForm({
  categoryName,
  tax,
  onNameChange,
  onTaxChange,
  onAdd,
}) {
  return (
    <aside className="aside-1">
      {/* Linha com campo de nome da categoria e campo de imposto */}
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

      {/* Botão que dispara a criação da categoria */}
      <Button variant="addCategory" onClick={onAdd}>
        Add Category
      </Button>
    </aside>
  );
}
