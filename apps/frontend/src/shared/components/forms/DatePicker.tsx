import React, { useState } from 'react';
import { colors } from '../../../styles/theme';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  darkMode?: boolean;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
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

  const inputId = label ? `datepicker-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? colors.dark[100] : colors.gray[900],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}
          id={inputId ? inputId + '-label' : undefined}
        >
          {label}
          {required && <span style={{ color: colors.error[500], marginLeft: '2px' }} aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
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
          boxShadow: error 
            ? `0 0 0 0px ${colors.error[100]}` 
            : isFocused 
              ? `0 0 0 4px ${colors.primary[100]}` 
              : 'none',
          transform: isFocused ? 'translateY(-1px)' : 'translateY(0)'
        }}
        aria-labelledby={inputId ? inputId + '-label' : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        aria-required={required}
      />
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