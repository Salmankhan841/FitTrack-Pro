import React from 'react';
import './Loader.css';

const Loader = ({ fullPage = false, size = 'md' }) => {
  const loaderElement = (
    <div className={`loader-spinner loader-${size}`}>
      <svg viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
      </svg>
    </div>
  );

  if (fullPage) {
    return (
      <div className="loader-overlay">
        {loaderElement}
      </div>
    );
  }

  return (
    <div className="loader-container">
      {loaderElement}
    </div>
  );
};

export default Loader;
