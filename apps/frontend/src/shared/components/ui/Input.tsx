import React, { type CSSProperties } from 'react';
import { colors, borderRadius } from '../../styles/theme';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  darkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: CSSProperties;
  className?: string;
  min?: number;
  max?: number;
  step?: number | string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
  darkMode = false,
  size = 'md',
  icon,
  iconPosition = 'left',
  style = {},
  className = '',
  min,
  max,
  step
}) => {
  const sizeStyles = {
    sm: { padding: '8px 12px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '10px 14px', fontSize: '14px', minHeight: '40px' },
    lg: { padding: '12px 16px', fontSize: '16px', minHeight: '48px' }
  };

  const inputStyle: CSSProperties = {
    ...sizeStyles[size],
    backgroundColor: darkMode ? colors.dark[800] : '#ffffff',
    border: `1px solid ${error 
      ? colors.error[500] 
      : darkMode ? colors.dark[600] : colors.gray[300]}`,
    borderRadius: borderRadius.md,
    color: darkMode ? colors.dark[100] : colors.gray[900],
    fontFamily: "'Noto Sans KR', sans-serif",
    width: '100%',
    outline: 'none',
    paddingLeft: icon && iconPosition === 'left' ? '40px' : sizeStyles[size].padding.split(' ')[1],
    paddingRight: icon && iconPosition === 'right' ? '40px' : sizeStyles[size].padding.split(' ')[1],
    ...style
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error 
      ? colors.error[500] 
      : colors.primary[500];
    e.currentTarget.style.boxShadow = `0 0 0 3px ${error 
      ? colors.error[100] 
      : colors.primary[100]}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error 
      ? colors.error[500] 
      : darkMode ? colors.dark[600] : colors.gray[300];
    e.currentTarget.style.boxShadow = 'none';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '14px',
          fontWeight: '500',
          color: darkMode ? colors.dark[200] : colors.gray[700],
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {label}
          {required && <span style={{ color: colors.error[500], marginLeft: '2px' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={className}
          style={inputStyle}
          min={min}
          max={max}
          step={step}
        />
        
        {icon && (
          <div style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            [iconPosition]: '12px',
            color: darkMode ? colors.dark[400] : colors.gray[500],
            fontSize: '16px',
            pointerEvents: 'none'
          }}>
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p style={{
          marginTop: '4px',
          fontSize: '12px',
          color: colors.error[500],
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {error}
        </p>
      )}
    </div>
  );
};
