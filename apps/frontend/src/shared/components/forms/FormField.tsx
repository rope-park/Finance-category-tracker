/**
 * 폼 필드 컴포넌트
 */
import React from 'react';
import { colors } from '../../../styles/theme';

// FormField 컴포넌트의 Props 타입 정의
interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  darkMode?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * 폼 필드 컴포넌트
 * @param param0 - FormField 컴포넌트 props
 * @returns FormField 컴포넌트
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  darkMode = false,
  children,
  className = ''
}) => {
  // 접근성: label과 children 연결, aria-invalid, aria-required, role, error id 등 적용
  const fieldId = label ? `formfield-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div
      className={`form-field ${className}`}
      style={{ marginBottom: '16px' }}
      role="group"
      aria-labelledby={fieldId}
      aria-invalid={!!error}
      aria-required={required}
    >
      {label && (
        <label
          id={fieldId}
          htmlFor={fieldId ? fieldId + '-input' : undefined}
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: darkMode ? colors.dark[100] : colors.gray[900],
            marginBottom: '8px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}
        >
          {label}
          {required && (
            <span style={{ color: colors.error[500], marginLeft: '2px' }} aria-hidden="true">*</span>
          )}
        </label>
      )}
      {/* children에 id, aria-describedby, aria-invalid 자동 주입 (cloneElement) */}
      {React.isValidElement(children) && typeof children.type !== 'string'
        ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            id: fieldId ? fieldId + '-input' : undefined,
            'aria-describedby': error ? errorId : undefined,
            'aria-invalid': !!error,
            'aria-required': required
          })
        : children}
      {error && (
        <div
          id={errorId}
          style={{
            fontSize: '12px',
            color: colors.error[500],
            marginTop: '4px',
            fontFamily: "'Noto Sans KR', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          role="alert"
        >
          <span style={{ fontSize: '12px' }}>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};