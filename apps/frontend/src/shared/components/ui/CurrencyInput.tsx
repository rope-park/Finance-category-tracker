import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { FormField } from './FormField';

export type CurrencyType = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY';

interface CurrencyInputProps {
  label?: string;
  value?: number;
  onChange?: (value: number, currency: CurrencyType) => void;
  onValueChange?: (value: number) => void;
  onCurrencyChange?: (currency: CurrencyType) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  darkMode?: boolean;
  min?: number;
  max?: number;
  currency?: CurrencyType;
  showCurrencySelector?: boolean;
  disabled?: boolean;
}

const CURRENCIES = [
  { value: 'KRW' as CurrencyType, label: '₩ 원 (KRW)', symbol: '₩' },
  { value: 'USD' as CurrencyType, label: '$ 달러 (USD)', symbol: '$' },
  { value: 'EUR' as CurrencyType, label: '€ 유로 (EUR)', symbol: '€' },
  { value: 'JPY' as CurrencyType, label: '¥ 엔화 (JPY)', symbol: '¥' },
  { value: 'GBP' as CurrencyType, label: '£ 파운드 (GBP)', symbol: '£' },
  { value: 'CNY' as CurrencyType, label: '¥ 위안 (CNY)', symbol: '¥' }
];

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value = 0,
  onChange,
  onValueChange,
  onCurrencyChange,
  placeholder = '금액을 입력하세요',
  required = false,
  error,
  darkMode = false,
  min = 0,
  max,
  currency = 'KRW',
  showCurrencySelector = true,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(currency);

  // value가 변경될 때 inputValue 업데이트
  useEffect(() => {
    if (value && value > 0) {
      setInputValue(value.toString());
    } else {
      setInputValue('');
    }
  }, [value]);

  // currency가 변경될 때 selectedCurrency 업데이트
  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  const handleInputChange = (newValue: string) => {
    // 숫자만 허용 (소수점 포함)
    const numericValue = newValue.replace(/[^\d.]/g, '');
    
    // 소수점이 두 개 이상 있으면 첫 번째만 유지
    const parts = numericValue.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
    
    setInputValue(formatted);
    
    const numberValue = parseFloat(formatted) || 0;
    
    // 최소/최대값 검증
    if (min !== undefined && numberValue < min && numberValue !== 0) return;
    if (max !== undefined && numberValue > max) return;
    
    // 콜백 호출
    onValueChange?.(numberValue);
    onChange?.(numberValue, selectedCurrency);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const currencyType = newCurrency as CurrencyType;
    setSelectedCurrency(currencyType);
    onCurrencyChange?.(currencyType);
    
    const currentValue = parseFloat(inputValue) || 0;
    onChange?.(currentValue, currencyType);
  };

  const getCurrentSymbol = () => {
    return CURRENCIES.find(c => c.value === selectedCurrency)?.symbol || '₩';
  };

  if (!showCurrencySelector) {
    return (
      <Input
        type="number"
        label={label}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        error={error}
        darkMode={darkMode}
        disabled={disabled}
        min={min}
        max={max}
        icon={getCurrentSymbol()}
        iconPosition="left"
      />
    );
  }

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      darkMode={darkMode}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr auto', 
        gap: '8px',
        alignItems: 'end'
      }}>
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          darkMode={darkMode}
          disabled={disabled}
          min={min}
          max={max}
          icon={getCurrentSymbol()}
          iconPosition="left"
        />
        
        <div style={{ minWidth: '120px' }}>
          <Select
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            options={CURRENCIES}
            darkMode={darkMode}
          />
        </div>
      </div>
    </FormField>
  );
};
