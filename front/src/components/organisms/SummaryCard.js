import React from 'react';
import SummaryItem from '../molecules/SummaryItem';

export default function SummaryCard({ items }) {
  return (
    <div className="summary-card">
      {items.map((item, i) => (
        <SummaryItem
          key={i}
          label={item.label}
          value={item.value}
          valueClassName={item.valueClassName}
          hidden={item.hidden}
        />
      ))}
    </div>
  );
}
