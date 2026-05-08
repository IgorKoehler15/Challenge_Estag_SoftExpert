import React from 'react';

export default function DataTable({ className, columns, rows, fillerCols }) {
  const colCount = fillerCols || columns.length;
  const isEmpty = !rows || rows.length === 0;

  return (
    <table className={className || undefined}>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <tr className="filler-row">
            {Array.from({ length: colCount }).map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
        ) : (
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
