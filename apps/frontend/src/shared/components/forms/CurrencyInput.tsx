/**
 * 금액 입력 폼 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { Input, Select, FormField, Button } from '../../../index';
import { useApp } from '../../../app/hooks/useApp';

// 지원되는 통화 타입 정의
export type CurrencyType = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'GBP' | 'CNY';

// CurrencyInput 컴포넌트 Props 타입 정의
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

/**
 * CurrencyInput 컴포넌트
 * @param param0 - CurrencyInput 컴포넌트 Props
 * @returns CurrencyInput 컴포넌트
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value = 0,
  onChange,
  onValueChange,
  onCurrencyChange,
  placeholder = '금액을 입력하세요',
  required = false,
  error,
  darkMode: propDarkMode,
  currency = 'KRW',
  showCurrencySelector = true,
  disabled = false
}) => {
  // ==================================================
  // 상태 변수 및 전역 설정
  // ==================================================
  
  // 앱 전역 상태에서 다크모드 설정 가져오기
  const { darkMode } = useApp();
  
  // 입력 필드 값 (문자열, 천 단위 콤마 포함)
  const [inputValue, setInputValue] = useState<string>('');
  
  // 선택된 통화 타입
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(currency);

  // 다크모드 설정 (prop이 우선)
  const isDark = propDarkMode ?? darkMode;

  // 지원되는 통화 옵션들
  const CURRENCIES = [
    { value: 'KRW', label: 'KRW', symbol: '₩' },     // 한국 원
    { value: 'USD', label: 'USD', symbol: '$' },     // 미국 달러
    { value: 'EUR', label: 'EUR', symbol: '€' },     // 유로
    { value: 'JPY', label: 'JPY', symbol: '¥' },     // 일본 엔
    { value: 'GBP', label: 'GBP', symbol: '£' },     // 영국 파운드
    { value: 'CNY', label: 'CNY', symbol: '¥' }      // 중국 위안
  ];

  // ==================================================
  // 유틸리티 함수들
  // ==================================================
  
  /**
   * 통화별 유효성 검사 최소/최대값 반환
   * @param currency - 통화 타입
   * @returns 최소값과 최대값 객체
   */
  const getValidationLimits = (currency: CurrencyType) => {
    switch (currency) {
      case 'KRW':
        return { min: 0, max: 10000000000 }; // 100억원
      case 'USD':
      case 'EUR':
        return { min: 0, max: 100000000 }; // 1억 달러/유로
      case 'JPY':
        return { min: 0, max: 1000000000 }; // 10억 엔
      case 'GBP':
        return { min: 0, max: 80000000 }; // 8천만 파운드
      case 'CNY':
        return { min: 0, max: 700000000 }; // 7억 위안
      default:
        return { min: 0, max: 10000000000 };
    }
  };

  /**
   * 숫자에 천 단위 콤마 추가
   * @param num - 포맷팅할 숫자
   * @returns 콤마가 추가된 문자열 (e.g., 1000 -> "1,000")
   */
  const formatNumberWithCommas = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * 문자열에서 숫자 파싱
   * @param str - 파싱할 문자열
   * @returns 숫자 값 (e.g., "1,000" -> 1000)
   */
  const parseNumberFromString = (str: string): number => {
    return parseInt(str.replace(/,/g, ''), 10) || 0;
  };

  // ==================================================
  // 사이드 이팩트
  // ==================================================
  
  // 외부에서 전달된 value prop이 변경될 때 입력 필드 값 업데이트
  useEffect(() => {
    if (value && value > 0) {
      setInputValue(formatNumberWithCommas(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  // 외부에서 전달된 currency prop이 변경될 때 선택된 통화 업데이트
  useEffect(() => {
    setSelectedCurrency(currency);
  }, [currency]);

  // ==================================================
  // 이벤트 핸들러 함수들
  // ==================================================
  
  /**
   * 금액 값 업데이트 및 유효성 검사
   * @param newValue - 새로운 금액 값
   */
  const updateValue = (newValue: number) => {
    const limits = getValidationLimits(selectedCurrency);
    const clampedValue = Math.max(limits.min, Math.min(limits.max, newValue));
    
    setInputValue(clampedValue > 0 ? formatNumberWithCommas(clampedValue) : '');
    onValueChange?.(clampedValue);
    onChange?.(clampedValue, selectedCurrency);
  };

  const handleInputChange = (newValue: string) => {
    // 숫자와 쉼표만 허용
    const cleanValue = newValue.replace(/[^\d,]/g, '');
    const numberValue = parseNumberFromString(cleanValue);
    
    const limits = getValidationLimits(selectedCurrency);
    if (numberValue > limits.max) return;
    
    setInputValue(numberValue > 0 ? formatNumberWithCommas(numberValue) : '');
    onValueChange?.(numberValue);
    onChange?.(numberValue, selectedCurrency);
  };

  // 키보드 이벤트 처리 (상하 방향키)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    const currentValue = parseNumberFromString(inputValue) || 0;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateValue(currentValue + 1000); // 천원 단위 증가
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateValue(Math.max(0, currentValue - 1000)); // 천원 단위 감소
    }
  };

  // +/- 버튼 처리
  const handleIncrement = () => {
    const currentValue = parseNumberFromString(inputValue) || 0;
    updateValue(currentValue + 1000);
  };

  const handleDecrement = () => {
    const currentValue = parseNumberFromString(inputValue) || 0;
    updateValue(Math.max(0, currentValue - 1000));
  };

  // 빠른 금액 추가 버튼
  const handleQuickAmount = (amount: number) => {
    const currentValue = parseNumberFromString(inputValue) || 0;
    updateValue(currentValue + amount);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const currencyType = newCurrency as CurrencyType;
    setSelectedCurrency(currencyType);
    onCurrencyChange?.(currencyType);
    
    const currentValue = parseNumberFromString(inputValue) || 0;
    onChange?.(currentValue, currencyType);
  };

  const getCurrentSymbol = () => {
    return CURRENCIES.find(c => c.value === selectedCurrency)?.symbol || '₩';
  };

  // 빠른 금액 버튼 데이터
  const quickAmounts = [
    { label: '+1만', amount: 10000 },
    { label: '+5만', amount: 50000 },
    { label: '+10만', amount: 100000 },
    { label: '+100만', amount: 1000000 }
  ];

  return (
    <FormField label={label} required={required} error={error}>
      <div className="space-y-3">
        {/* 빠른 금액 추가 버튼들 - 수평 배치 */}
        <div className="flex flex-row w-full gap-2 p-2 bg-red-100 rounded">
          {quickAmounts.map((item) => (
            <Button
              key={item.amount}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickAmount(item.amount)}
              disabled={disabled}
              className={`text-xs px-2 sm:px-3 py-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-md rounded-lg flex-1 whitespace-nowrap bg-red-500 text-white ${
                isDark 
                  ? 'bg-gradient-to-r from-red-800 to-red-700 border border-red-600 text-white hover:from-red-700 hover:to-red-600 hover:border-red-500 shadow-sm' 
                  : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 hover:from-red-100 hover:to-red-200 hover:border-red-300 shadow-sm'
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* 금액 입력 영역 - 입력창 + +/- 버튼 수평 배치 */}
        <div className="w-full">
          <div className="flex items-stretch gap-2 sm:gap-3">
            {/* 메인 입력 필드 */}
            <div className="relative flex-1">
              <div 
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className="relative focus:outline-none"
              >
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={`w-full pl-4 pr-20 text-center font-mono text-lg sm:text-xl font-semibold h-12 sm:h-14 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-offset-2 shadow-inner ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-750 border-2 border-gray-600 text-gray-100 focus:ring-blue-400/60 focus:border-blue-500 placeholder-gray-500' 
                      : 'bg-gradient-to-r from-white to-gray-50 border-2 border-gray-300 text-gray-900 focus:ring-blue-400/60 focus:border-blue-400 placeholder-gray-400'
                  }`}
                />
                
                {/* 통화 심볼 */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none sm:pr-4">
                  <div className={`px-1.5 sm:px-2 py-1 rounded-md text-xs sm:text-sm font-bold ${
                    isDark 
                      ? 'bg-gray-700/80 text-gray-200 border border-gray-600' 
                      : 'bg-blue-100/80 text-blue-700 border border-blue-200'
                  }`}>
                    {getCurrentSymbol()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* +/- 버튼들 - 입력창 오른편에 배치 */}
            <div className="flex gap-1 sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDecrement}
                disabled={disabled || parseNumberFromString(inputValue) <= 0}
                className={`w-10 h-12 sm:w-12 sm:h-14 p-0 rounded-lg text-sm sm:text-base font-bold transition-all duration-300 hover:scale-110 shadow-sm ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-red-600/20 border border-gray-600 hover:border-red-500/50' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-300'
                }`}
              >
                −
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleIncrement}
                disabled={disabled}
                className={`w-10 h-12 sm:w-12 sm:h-14 p-0 rounded-lg text-sm sm:text-base font-bold transition-all duration-300 hover:scale-110 shadow-sm ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-green-600/20 border border-gray-600 hover:border-green-500/50' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50 border border-gray-300 hover:border-green-300'
                }`}
              >
                +
              </Button>
            </div>
            
            {/* 통화 선택기 */}
            {showCurrencySelector && (
              <div className="flex-shrink-0">
                <div className={`w-20 sm:w-24 h-12 sm:h-14 rounded-xl border-2 transition-all duration-300 font-medium ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-800 to-gray-750 border-gray-600 text-gray-100 hover:border-gray-500 focus:ring-2 focus:ring-blue-400/60' 
                      : 'bg-gradient-to-r from-white to-gray-50 border-gray-300 text-gray-900 hover:border-gray-400 focus:ring-2 focus:ring-blue-400/60'
                  } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Select
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    options={CURRENCIES}
                    darkMode={isDark}
                  />
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
    </FormField>
  );
};