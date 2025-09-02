import React from 'react';
import { colors } from '../../styles/theme';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  darkMode?: boolean;
  children: React.ReactNode;
  className?: string;
}

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
            color: darkMode ? colors.dark[200] : colors.gray[700],
            marginBottom: '6px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}
        >
          {label}
          {required && (
            <span style={{ color: colors.error[500], marginLeft: '4px' }} aria-hidden="true">*</span>
          )}
        </label>
      )}
      {/* children에 id, aria-describedby, aria-invalid 자동 주입 (cloneElement) */}
      {React.isValidElement(children) && typeof children.type !== 'string'
        ? React.cloneElement(children as React.ReactElement<any>, {
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
            color: colors.error[600],
            marginTop: '4px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};