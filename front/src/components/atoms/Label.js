// Componente atômico de label — encapsula o <label> nativo repassando todas as props
export default function Label({ children, ...props }) {
  return <label {...props}>{children}</label>;
}
