import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      
      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            © {new Date().getFullYear()} Web Crawler. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 