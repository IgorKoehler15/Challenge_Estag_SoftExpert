// Tabela de dados genérica e reutilizável
// Recebe colunas (columns), linhas (rows) e exibe uma linha vazia se não houver dados
export default function DataTable({ className, columns, rows, fillerCols }) {
  
  // Define quantas colunas a linha de preenchimento deve ter
  const colCount = fillerCols || columns.length;
  const isEmpty = !rows || rows.length === 0;

  return (
    <table className={className || undefined}>
      {/* Cabeçalho da tabela com os nomes das colunas */}
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {isEmpty ? (
          // Linha de preenchimento quando não há dados para exibir
          <tr className="filler-row">
            {Array.from({ length: colCount }).map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
        ) : (
          // Renderiza cada linha com suas células de dados
          rows.map((row, i) => (
            <tr key={row.key ?? i}>
              {row.cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
