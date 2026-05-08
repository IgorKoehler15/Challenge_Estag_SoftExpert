import React from 'react';

export default function Button({ children, variant, className, ...props }) {
  const variantClass = variant || '';
  const classes = [variantClass, className].filter(Boolean).join(' ');
  return (
    <button className={classes || undefined} {...props}>
      {children}
    </button>
  );
}
