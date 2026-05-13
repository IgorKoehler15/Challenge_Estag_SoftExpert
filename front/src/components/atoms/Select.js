// Componente atômico de select (dropdown)
// Recebe uma lista de opções (options) e um placeholder opcional
export default function Select({ options, placeholder, ...props }) {
  return (
    <select {...props}>
      {/* Exibe o placeholder como primeira opção desabilitada, se fornecido */}
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {/* Renderiza cada opção do array com value e label */}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
