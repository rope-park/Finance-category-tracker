import {
  Currency,
  CURRENCIES,
  CURRENCY_METADATA,
  CURRENCY_GROUPS,
  CurrencyMetadata,
} from '../constants/currencies';

/**
 * 통화 관련 유틸리티 함수들
 */

/**
 * 통화 포맷팅
 */
export const formatCurrency = (amount: number, currency: Currency = 'KRW'): string => {
  const metadata = getCurrencyMetadata(currency);
  
  if (!metadata) {
    return `${amount} ${currency}`;
  }

  try {
    const formatter = new Intl.NumberFormat(metadata.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: metadata.decimalPlaces,
      maximumFractionDigits: metadata.decimalPlaces,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting
    const rounded = Number(amount.toFixed(metadata.decimalPlaces));
    return `${metadata.symbol}${rounded.toLocaleString()}`;
  }
};

/**
 * 통화 메타데이터 가져오기
 */
export const getCurrencyMetadata = (currency: Currency): CurrencyMetadata | undefined => {
  return CURRENCY_METADATA[currency as keyof typeof CURRENCY_METADATA];
};

/**
 * 통화 심볼 가져오기
 */
export const getCurrencySymbol = (currency: Currency): string => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.symbol || currency;
};

/**
 * 통화 이름 가져오기
 */
export const getCurrencyName = (currency: Currency): string => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.name || currency;
};

/**
 * 유효한 통화인지 확인
 */
export const isValidCurrency = (currency: string): currency is Currency => {
  return Object.values(CURRENCIES).includes(currency as Currency);
};

/**
 * 통화 변환 (기본 환율 계산 - 실제로는 API에서 가져와야 함)
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate?: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // 기본 환율
  // TODO: 실제 서비스에서는 실시간 환율 API 사용
  const defaultRates: Record<string, number> = {
    'USD-KRW': 1300,
    'EUR-KRW': 1400,
    'JPY-KRW': 9.5,
    'CNY-KRW': 180,
    'GBP-KRW': 1600,
  };
  
  const rateKey = `${fromCurrency}-${toCurrency}`;
  const reverseRateKey = `${toCurrency}-${fromCurrency}`;
  
  if (exchangeRate) {
    return amount * exchangeRate;
  }
  
  if (defaultRates[rateKey]) {
    return amount * defaultRates[rateKey];
  }
  
  if (defaultRates[reverseRateKey]) {
    return amount / defaultRates[reverseRateKey];
  }
  
  // USD를 기준으로 한 변환
  if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
    const toUSD = convertCurrency(amount, fromCurrency, 'USD');
    return convertCurrency(toUSD, 'USD', toCurrency);
  }
  
  return amount; // 변환할 수 없는 경우 원래 금액 반환
};

/**
 * 통화 파싱 (문자열에서 숫자 추출)
 */
export const parseCurrency = (value: string, currency: Currency = 'KRW'): number => {
  const metadata = getCurrencyMetadata(currency);
  
  if (!metadata) {
    return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
  }
  
  // 통화 심볼과 콤마 제거
  const cleaned = value
    .replace(new RegExp(metadata.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '')
    .replace(/,/g, '')
    .trim();
  
  return parseFloat(cleaned) || 0;
};

/**
 * 지역별 통화 그룹 가져오기
 */
export const getCurrencyGroups = () => {
  return CURRENCY_GROUPS;
};

/**
 * 특정 지역의 통화들 가져오기
 */
export const getCurrenciesByRegion = (region: keyof typeof CURRENCY_GROUPS): Currency[] => {
  const group = CURRENCY_GROUPS[region];
  return group ? [...group.currencies] : [];
};

/**
 * 통화 옵션 생성 (드롭다운 등에서 사용)
 */
export const getCurrencyOptions = () => {
  return Object.values(CURRENCIES).map(currency => {
    const metadata = getCurrencyMetadata(currency);
    return {
      value: currency,
      label: `${metadata?.name || currency} (${metadata?.symbol || currency})`,
      symbol: metadata?.symbol || currency,
      name: metadata?.name || currency,
    };
  });
};

/**
 * 그룹별 통화 옵션 생성
 */
export const getGroupedCurrencyOptions = () => {
  return Object.entries(CURRENCY_GROUPS).map(([regionKey, group]) => ({
    label: group.name,
    options: group.currencies.map(currency => {
      const metadata = getCurrencyMetadata(currency);
      return {
        value: currency,
        label: `${metadata?.name || currency} (${metadata?.symbol || currency})`,
        symbol: metadata?.symbol || currency,
        name: metadata?.name || currency,
      };
    }),
  }));
};

/**
 * 금액 유효성 검사
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && isFinite(amount) && amount >= 0;
};

/**
 * 소수점 자릿수 맞추기
 */
export const roundToCurrencyPrecision = (amount: number, currency: Currency = 'KRW'): number => {
  const metadata = getCurrencyMetadata(currency);
  const decimalPlaces = metadata?.decimalPlaces || 0;
  
  return Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
};

/**
 * 통화별 최소 단위 가져오기
 */
export const getCurrencyMinUnit = (currency: Currency): number => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.decimalPlaces ? 1 / Math.pow(10, metadata.decimalPlaces) : 1;
};

/**
 * 큰 숫자 간소화 (1K, 1M 등)
 */
export const formatCompactCurrency = (
  amount: number, 
  currency: Currency = 'KRW',
  locale?: string
): string => {
  const metadata = getCurrencyMetadata(currency);
  const targetLocale = locale || metadata?.locale || 'ko-KR';
  
  try {
    const formatter = new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: currency,
      notation: 'compact',
      compactDisplay: 'short',
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback
    const absAmount = Math.abs(amount);
    const symbol = getCurrencySymbol(currency);
    
    if (absAmount >= 1000000000) {
      return `${symbol}${(amount / 1000000000).toFixed(1)}B`;
    } else if (absAmount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (absAmount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    } else {
      return formatCurrency(amount, currency);
    }
  }
};