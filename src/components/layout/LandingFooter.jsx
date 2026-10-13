/**
 * LandingFooter.jsx
 * 
 * Professional, clean, and responsive footer for FitTrack Pro.
 * Provides platform links, quick navigation, brand statement,
 * newsletter subscription, social links, and smooth back-to-top control.
 */

import React, { useState } from 'react';
import ftLogo from '../../assets/images/ft_logo.jpg';
import { 
  ArrowRight, 
  ArrowUp, 
  Mail, 
  CheckCircle 
} from 'lucide-react';
import './LandingFooter.css';

const LandingFooter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="fittrack-footer">
      {/* Decorative top accent line */}
      <div className="footer-top-accent" />

      <div className="footer-inner-container">
        {/* Main 4-Column Grid */}
        <div className="footer-main-grid">
          
          {/* Column 1: Brand & Identity */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-header">
              <img src={ftLogo} alt="FitTrack Pro" className="footer-brand-logo" />
              <div className="footer-brand-text">
                <span className="brand-name">FitTrack <span>Pro</span></span>
                <span className="brand-tagline">Precision Training System</span>
              </div>
            </div>

            <p className="footer-description">
              Engineered for athletes, lifters, and everyday warriors. Track workouts, 
              calculate macros, analyze progressive overload, and reach peak physical conditioning.
            </p>

            <div className="footer-status-pill">
              <span className="status-dot-pulse" />
              <span className="status-text">Cloud Engine Online · v2.4</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" onClick={() => handleScrollTo('home')} className="footer-btn-link">
                  Home Overview
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollTo('about')} className="footer-btn-link">
                  About Platform
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollTo('motivation')} className="footer-btn-link">
                  Inspiration Orbit
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollTo('services')} className="footer-btn-link">
                  Core Features
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleScrollTo('contact')} className="footer-btn-link">
                  Get Started
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Community */}
          <div className="footer-col footer-col-newsletter">
            <h4 className="footer-heading">Stay Connected</h4>
            <p className="newsletter-info">
              Get notified about new feature updates, training protocols, and performance tips.
            </p>

            {subscribed ? (
              <div className="newsletter-success-box">
                <CheckCircle size={18} className="success-icon" />
                <span>Thank you! You are subscribed to updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <div className="newsletter-input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="newsletter-input"
                    aria-label="Email address for newsletter"
                  />
                  <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Social Links */}
            <div className="footer-social-row">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-btn"
                title="GitHub"
                aria-label="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>

              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-btn"
                title="X / Twitter"
                aria-label="X / Twitter"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>

              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-btn"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>

              <a 
                href="mailto:support@fittrackpro.com" 
                className="social-icon-btn"
                title="Contact Support"
                aria-label="Contact Support"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <span>&copy; {new Date().getFullYear()} FitTrack Pro. Built for champions. All rights reserved.</span>
          </div>

          <div className="footer-bottom-links">
            <span className="bottom-link">Privacy Policy</span>
            <span className="bottom-separator">&middot;</span>
            <span className="bottom-link">Terms of Service</span>
            <span className="bottom-separator">&middot;</span>
            <span className="bottom-link">Security</span>
          </div>

          <button 
            type="button"
            onClick={scrollToTop} 
            className="back-to-top-btn"
            title="Scroll to top of page"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
