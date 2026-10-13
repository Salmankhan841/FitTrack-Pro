import React, { forwardRef } from 'react';
import './Input.css';

const Input = forwardRef(({ label, error, type = 'text', options = [], id, ...props }, ref) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      {type === 'select' ? (
        <select
          id={id}
          ref={ref}
          className={`input-field ${error ? 'input-error' : ''}`}
          {...props}
        >
          {options.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          ref={ref}
          type={type}
          className={`input-field ${error ? 'input-error' : ''}`}
          {...props}
        />
      )}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
