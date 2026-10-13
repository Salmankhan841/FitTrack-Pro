/**
 * LandingLayout.jsx
 * 
 * Public Pages Wrapper & Navigation.
 * 
 * Provides floating frosted-glass navigation bar, mobile drawer menu, and branded footer.
 */

import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import ftLogo from '../../assets/images/ft_logo.jpg';
import { Menu, X, ArrowRight } from 'lucide-react';
import '../../pages/landing/LandingPage.css';

const LandingLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="landing-layout">
      {/* Mobile Drawer Backdrop */}
      {isMenuOpen && (
        <div 
          className="mobile-landing-backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Glass Navigation Bar */}
      <nav className={`landing-nav-container ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="landing-nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <img src={ftLogo} alt="FitTrack Pro" className="custom-ft-logo-small" />
            </div>
            FitTrack <span>Pro</span>
          </Link>
          
          {/* Desktop & Mobile Navigation Links */}
          <div className={`nav-links-wrapper ${isMenuOpen ? 'open' : ''}`}>
            <button onClick={() => handleScroll('home')} className="nav-link-btn">Home</button>
            <button onClick={() => handleScroll('about')} className="nav-link-btn">About</button>
            <button onClick={() => handleScroll('motivation')} className="nav-link-btn">Inspiration</button>
            <button onClick={() => handleScroll('services')} className="nav-link-btn">Features</button>
            <button onClick={() => handleScroll('contact')} className="nav-cta-btn">
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          {/* Right Controls: Mobile Menu Hamburger */}
          <div className="landing-nav-actions">
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="landing-main">
        <Outlet />
      </main>
    </div>
  );
};

export default LandingLayout;
