import { useState, useCallback, useMemo } from 'react';
import { 
  Currency, 
  formatCurrency, 
  parseCurrency, 
  getCurrencyMetadata,
  convertCurrency,
  DEFAULT_CURRENCY 
} from '../constants';

/**
 * 통화 관련 유틸리티를 제공하는 hook
 * 금액 포맷팅, 파싱, 변환 등의 기능
 */
export function useCurrency(defaultCurrency: Currency = DEFAULT_CURRENCY) {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultCurrency);

  // 통화 메타데이터 가져오기
  const currencyMetadata = useMemo(() => {
    return getCurrencyMetadata(currentCurrency);
  }, [currentCurrency]);

  // 금액 포맷팅
  const format = useCallback((
    amount: number, 
    options?: {
      currency?: Currency;
      showSymbol?: boolean;
      showCode?: boolean;
      compact?: boolean;
    }
  ) => {
    const currency = options?.currency || currentCurrency;
    return formatCurrency(amount, currency, options);
  }, [currentCurrency]);

  // 금액 파싱
  const parse = useCallback((
    value: string,
    currency?: Currency
  ) => {
    return parseCurrency(value, currency || currentCurrency);
  }, [currentCurrency]);

  // 통화 변환
  const convert = useCallback((
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    exchangeRate: number
  ) => {
    return convertCurrency(amount, fromCurrency, toCurrency, exchangeRate);
  }, []);

  // 현재 통화 변경
  const changeCurrency = useCallback((newCurrency: Currency) => {
    setCurrentCurrency(newCurrency);
  }, []);

  return {
    currentCurrency,
    currencyMetadata,
    format,
    parse,
    convert,
    changeCurrency,
  };
}

/**
 * 다중 통화 관리 hook
 * 여러 통화를 동시에 관리하고 변환할 때 사용
 */
export function useMultiCurrency(baseCurrency: Currency = DEFAULT_CURRENCY) {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 환율 업데이트
  const updateExchangeRates = useCallback((rates: Record<string, number>) => {
    setExchangeRates(rates);
    setLastUpdated(new Date());
  }, []);

  // 다중 통화로 금액 변환
  const convertToMultipleCurrencies = useCallback((
    amount: number,
    fromCurrency: Currency,
    targetCurrencies: Currency[]
  ) => {
    return targetCurrencies.reduce((acc, currency) => {
      const rate = exchangeRates[`${fromCurrency}_${currency}`] || 1;
      acc[currency] = convertCurrency(amount, fromCurrency, currency, rate);
      return acc;
    }, {} as Record<Currency, number>);
  }, [exchangeRates]);

  // 포트폴리오 총액 계산 (다중 통화)
  const calculatePortfolioValue = useCallback((
    holdings: Array<{ amount: number; currency: Currency }>
  ) => {
    return holdings.reduce((total, holding) => {
      const rate = exchangeRates[`${holding.currency}_${baseCurrency}`] || 1;
      return total + convertCurrency(holding.amount, holding.currency, baseCurrency, rate);
    }, 0);
  }, [exchangeRates, baseCurrency]);

  return {
    baseCurrency,
    exchangeRates,
    lastUpdated,
    updateExchangeRates,
    convertToMultipleCurrencies,
    calculatePortfolioValue,
  };
}