import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';
import waterVideo from '../assets/water-video.mp4';

const Layout = ({ children }) => {
  return (
    <div className="ocean-theme-wrapper">
      <div className="ocean-video-wrapper">
        <video autoPlay loop muted playsInline className="ocean-video">
          <source src={waterVideo} type="video/mp4" />
        </video>
        <div className="ocean-video-overlay" />
      </div>

      <div className="ocean-content-shell">
        <Header type="main" />
        <main className="container" style={{ padding: '40px 0', flexGrow: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;