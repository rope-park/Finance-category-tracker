/**
 * 입력 폼 컴포넌트
 */
import React, { type CSSProperties } from 'react';
import { colors  } from '../../../styles/theme';

// Input 컴포넌트의 Props 타입 정의
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

/**
 * 입력 폼 컴포넌트
 * @param param0 - Input 컴포넌트 props
 * @returns Input 컴포넌트
 */
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

  // 기본 스타일 설정
  const inputStyle: CSSProperties = {
    ...sizeStyles[size],
    backgroundColor: darkMode ? colors.dark[700] : '#ffffff',
    border: `2px solid ${error 
      ? colors.error[500] 
      : darkMode ? colors.dark[600] : colors.gray[200]}`,
    borderRadius: '12px',
    color: darkMode ? colors.dark[100] : colors.gray[900],
    fontFamily: "'Noto Sans KR', sans-serif",
    width: '100%',
    outline: 'none',
    paddingLeft: icon && iconPosition === 'left' ? '40px' : sizeStyles[size].padding.split(' ')[1],
    paddingRight: icon && iconPosition === 'right' ? '40px' : sizeStyles[size].padding.split(' ')[1],
    transition: 'all 0.2s ease-in-out',
    boxShadow: error 
      ? `0 0 0 0px ${colors.error[100]}` 
      : 'none',
    ...style
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error 
      ? colors.error[500] 
      : colors.primary[500];
    e.currentTarget.style.boxShadow = `0 0 0 4px ${error 
      ? colors.error[100] 
      : colors.primary[100]}`;
    e.currentTarget.style.transform = 'translateY(-1px)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error 
      ? colors.error[500] 
      : darkMode ? colors.dark[600] : colors.gray[200];
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  // 접근성: id, aria-describedby, aria-invalid, aria-required, role 등 적용
  const inputId = label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div style={{ position: 'relative', width: '100%' }}>
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
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
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
          aria-labelledby={inputId ? inputId + '-label' : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          aria-required={required}
          role="textbox"
        />
        {icon && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              [iconPosition]: '12px',
              color: darkMode ? colors.dark[400] : colors.gray[500],
              fontSize: '16px',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
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