import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const inputClasses = `
    block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    ${error 
      ? 'border-danger-300 focus:ring-danger-500' 
      : 'border-gray-300'
    }
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
    ${className}
  `;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
