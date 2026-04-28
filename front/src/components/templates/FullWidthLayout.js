import React from 'react';
import Header from '../organisms/Header';

export default function FullWidthLayout({ children }) {
  return (
    <>
      <Header />
      <div className="container">
        <div className="content-full">{children}</div>
      </div>
    </>
  );
}
