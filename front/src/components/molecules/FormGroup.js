// Componente molecular que agrupa campos de formulário dentro de uma div com classe "form-group"
// Aceita estilos inline opcionais via prop style
export default function FormGroup({ children, style }) {
  return (
    <div className="form-group" style={style}>
      {children}
    </div>
  );
}
