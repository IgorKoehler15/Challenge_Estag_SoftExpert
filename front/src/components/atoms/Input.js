// Componente atômico de input — encapsula o <input> nativo repassando todas as props
export default function Input({ ...props }) {
  return <input {...props} />;
}
