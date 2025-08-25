import React from 'react';
import { Select } from './Select';
import { FormField } from './FormField';

interface PercentageInputProps {
  label?: string;
  value?: number;
  onChange?: (value: number) => void;
  required?: boolean;
  error?: string;
  darkMode?: boolean;
  min?: number;
  max?: number;
  customOptions?: number[];
}

export const PercentageInput: React.FC<PercentageInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  darkMode = false,
  min = 1,
  max = 100,
  customOptions
}) => {
  // 커스텀 옵션이 있으면 사용, 없으면 기본값 생성
  const percentageOptions = customOptions || [50, 60, 70, 80, 90, 95];
  
  const options = percentageOptions
    .filter(percent => percent >= min && percent <= max)
    .map(percent => ({
      value: percent.toString(),
      label: `${percent}%`
    }));

  const handleChange = (stringValue: string) => {
    const numericValue = parseInt(stringValue, 10);
    onChange?.(numericValue);
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      darkMode={darkMode}
    >
      <Select
        value={value?.toString() || ''}
        onChange={handleChange}
        options={options}
        darkMode={darkMode}
      />
    </FormField>
  );
};