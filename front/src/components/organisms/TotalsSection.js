import React from 'react';
import TotalRow from '../molecules/TotalRow';

export default function TotalsSection({ rows }) {
  return (
    <div className="totals-section">
      {rows.map((r, i) => (
        <TotalRow key={i} label={r.label} value={r.value} />
      ))}
    </div>
  );
}
