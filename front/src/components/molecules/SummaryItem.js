import React from 'react';
import Label from '../atoms/Label';

export default function SummaryItem({ label, value, valueClassName, hidden }) {
  return (
    <div className="summary-item" style={hidden ? { display: 'none' } : undefined}>
      <Label>{label}</Label>
      <span className={valueClassName || undefined}>{value}</span>
    </div>
  );
}
