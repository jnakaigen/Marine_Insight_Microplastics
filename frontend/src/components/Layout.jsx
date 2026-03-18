import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header type="main" />
      <main className="container" style={{ padding: '40px 0', flexGrow: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;