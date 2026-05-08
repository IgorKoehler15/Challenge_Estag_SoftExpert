import React from 'react';
import Label from '../atoms/Label';

export default function TotalRow({ label, value }) {
  return (
    <div className="total-row">
      <Label>{label}</Label>
      <span>{value}</span>
    </div>
  );
}
