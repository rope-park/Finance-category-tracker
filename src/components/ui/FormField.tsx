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
  return (
    <div className={`form-field ${className}`} style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: darkMode ? colors.dark[200] : colors.gray[700],
          marginBottom: '6px',
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {label}
          {required && (
            <span style={{ 
              color: colors.error[500],
              marginLeft: '4px'
            }}>
              *
            </span>
          )}
        </label>
      )}
      
      {children}
      
      {error && (
        <div style={{
          fontSize: '12px',
          color: colors.error[600],
          marginTop: '4px',
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
