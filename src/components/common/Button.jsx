import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  isLoading = false,
  disabled,
  ...props 
}) => {
  const classes = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${isLoading ? 'btn-loading' : ''}`;
  
  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className="spinner"></span> : children}
    </button>
  );
};

export default Button;
