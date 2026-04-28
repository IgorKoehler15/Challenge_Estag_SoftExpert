import React from 'react';
import Header from '../organisms/Header';

export default function SidebarLayout({ sidebar, content }) {
  return (
    <>
      <Header />
      <div className="container">
        {sidebar}
        <aside className="aside-2">{content}</aside>
      </div>
    </>
  );
}
