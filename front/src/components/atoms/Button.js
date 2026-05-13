// Componente atômico de botão reutilizável
// Aceita uma variante de estilo (variant), classes extras (className) e qualquer prop nativa de <button>
export default function Button({ children, variant, className, ...props }) {

  // Monta a string de classes CSS combinando variante + classes adicionais
  const variantClass = variant || '';
  const classes = [variantClass, className].filter(Boolean).join(' ');

  return (
    <button className={classes || undefined} {...props}>
      {children}
    </button>
  );
}
