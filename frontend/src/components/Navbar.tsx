import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { GlobeAltIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <GlobeAltIcon className="logo-icon" />
          <span className="logo-text">Web Crawler</span>
        </Link>

        <div className="navbar-links">
          <NavLink 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/history" 
            className={`navbar-link ${isActive('/history') ? 'active' : ''}`}
          >
            History
          </NavLink>
        </div>

        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <Bars3Icon className="mobile-menu-icon" />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="logo-text">Menu</span>
          <button className="close-button" onClick={closeMobileMenu}>
            <XMarkIcon className="mobile-menu-icon" />
          </button>
        </div>
        <div className="mobile-menu-links">
          <NavLink 
            to="/" 
            className={`mobile-menu-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={`mobile-menu-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/history" 
            className={`mobile-menu-link ${isActive('/history') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            History
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 