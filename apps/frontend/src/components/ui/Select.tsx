import React from 'react';
import { colors } from '../../styles/theme';

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
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder,
  required = false,
  darkMode = false
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? colors.dark[200] : colors.gray[700],
            fontFamily: "'Noto Sans KR', sans-serif"
          }}
        >
          {label}
          {required && <span style={{ color: colors.error[600] }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          padding: '10px 12px',
          backgroundColor: darkMode ? colors.dark[700] : 'white',
          color: darkMode ? colors.dark[100] : colors.gray[900],
          border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[300]}`,
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: "'Noto Sans KR', sans-serif",
          outline: 'none',
          transition: 'border-color 0.2s ease',
          cursor: 'pointer'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colors.primary[500];
        }}
        onBlur={(e) => {
          e.target.style.borderColor = darkMode ? colors.dark[600] : colors.gray[300];
        }}
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
  );
};