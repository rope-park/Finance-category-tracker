import React, { useState } from 'react';
import { colors } from '../../../styles/theme';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  darkMode?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder,
  required = false,
  darkMode = false,
  error,
  size = 'md'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const sizeStyles = {
    sm: { padding: '8px 12px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '10px 14px', fontSize: '14px', minHeight: '40px' },
    lg: { padding: '12px 16px', fontSize: '16px', minHeight: '48px' }
  };

  const selectId = label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? colors.dark[100] : colors.gray[900],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}
          id={selectId ? selectId + '-label' : undefined}
        >
          {label}
          {required && <span style={{ color: colors.error[500], marginLeft: '2px' }} aria-hidden="true">*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          style={{
            ...sizeStyles[size],
            backgroundColor: darkMode ? colors.dark[700] : '#ffffff',
            color: darkMode ? colors.dark[100] : colors.gray[900],
            border: `2px solid ${error 
              ? colors.error[500] 
              : isFocused 
                ? colors.primary[500] 
                : darkMode ? colors.dark[600] : colors.gray[200]}`,
            borderRadius: '12px',
            fontSize: sizeStyles[size].fontSize,
            fontFamily: "'Noto Sans KR', sans-serif",
            outline: 'none',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            width: '100%',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${darkMode ? '%23cbd5e1' : '%236b7280'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 12px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '16px',
            paddingRight: '40px',
            boxShadow: error 
              ? `0 0 0 0px ${colors.error[100]}` 
              : isFocused 
                ? `0 0 0 4px ${colors.primary[100]}` 
                : 'none',
            transform: isFocused ? 'translateY(-1px)' : 'translateY(0)'
          }}
          aria-labelledby={selectId ? selectId + '-label' : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          aria-required={required}
          role="combobox"
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p
          id={errorId}
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: colors.error[500],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};