import React from 'react';

export default function FormGroup({ children, style }) {
  return (
    <div className="form-group" style={style}>
      {children}
    </div>
  );
}
