import {
  Currency,
  CURRENCIES,
  CURRENCY_METADATA,
  CURRENCY_GROUPS,
  POPULAR_CURRENCIES,
  DEFAULT_CURRENCY,
  CurrencyMetadata,
  ExchangeRate,
} from './currencies';

/**
 * 통화 관련 유틸리티 함수들
 */

/**
 * 통화 메타데이터 가져오기
 */
export const getCurrencyMetadata = (currency: Currency): CurrencyMetadata | undefined => {
  return CURRENCY_METADATA[currency as keyof typeof CURRENCY_METADATA];
};

/**
 * 통화 이름 가져오기
 */
export const getCurrencyName = (currency: Currency): string => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.name || currency;
};

/**
 * 통화 심볼 가져오기
 */
export const getCurrencySymbol = (currency: Currency): string => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.symbol || currency;
};

/**
 * 통화 국가 가져오기
 */
export const getCurrencyCountry = (currency: Currency): string => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.country || '';
};

/**
 * 통화 플래그 이모지 가져오기
 */
export const getCurrencyFlag = (currency: Currency): string => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.flag || '🌍';
};

/**
 * 유효한 통화인지 확인
 */
export const isValidCurrency = (currency: string): currency is Currency => {
  return Object.values(CURRENCIES).includes(currency as Currency);
};

/**
 * 금액 포맷팅 (통화별)
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = DEFAULT_CURRENCY,
  options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    compact?: boolean;
  }
): string => {
  const metadata = getCurrencyMetadata(currency);
  if (!metadata) {
    return amount.toString();
  }

  const { showSymbol = true, showCode = false, compact = false } = options || {};

  // 컴팩트 표시 (1K, 1M 등)
  if (compact && Math.abs(amount) >= 1000) {
    return formatCompactCurrency(amount, currency);
  }

  // 숫자 포맷팅
  const formatter = new Intl.NumberFormat(metadata.locale, {
    minimumFractionDigits: metadata.decimalPlaces,
    maximumFractionDigits: metadata.decimalPlaces,
  });

  const formattedNumber = formatter.format(Math.abs(amount));
  const sign = amount < 0 ? '-' : '';

  // 심볼과 코드 처리
  let result = '';
  
  if (showSymbol) {
    if (metadata.symbolPosition === 'before') {
      result = `${sign}${metadata.symbol}${formattedNumber}`;
    } else {
      result = `${sign}${formattedNumber}${metadata.symbol}`;
    }
  } else {
    result = `${sign}${formattedNumber}`;
  }

  if (showCode) {
    result += ` ${currency}`;
  }

  return result;
};

/**
 * 컴팩트 통화 포맷팅 (1K, 1M 등)
 */
export const formatCompactCurrency = (
  amount: number,
  currency: Currency = DEFAULT_CURRENCY
): string => {
  const metadata = getCurrencyMetadata(currency);
  if (!metadata) {
    return amount.toString();
  }

  const formatter = new Intl.NumberFormat(metadata.locale, {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const formattedNumber = formatter.format(Math.abs(amount));
  const sign = amount < 0 ? '-' : '';

  if (metadata.symbolPosition === 'before') {
    return `${sign}${metadata.symbol}${formattedNumber}`;
  } else {
    return `${sign}${formattedNumber}${metadata.symbol}`;
  }
};

/**
 * 통화 문자열을 숫자로 파싱
 */
export const parseCurrency = (
  value: string,
  currency: Currency = DEFAULT_CURRENCY
): number => {
  const metadata = getCurrencyMetadata(currency);
  if (!metadata) {
    return parseFloat(value) || 0;
  }

  // 심볼, 통화 코드, 공백 제거
  let cleanValue = value
    .replace(new RegExp(`\\${metadata.symbol}`, 'g'), '')
    .replace(new RegExp(`\\b${currency}\\b`, 'g'), '')
    .replace(/\s/g, '');

  // 천 단위 구분자 제거
  if (metadata.thousandsSeparator !== '.') {
    cleanValue = cleanValue.replace(new RegExp(`\\${metadata.thousandsSeparator}`, 'g'), '');
  }

  // 소수점 구분자를 표준 '.'로 변환
  if (metadata.decimalSeparator !== '.') {
    cleanValue = cleanValue.replace(metadata.decimalSeparator, '.');
  }

  return parseFloat(cleanValue) || 0;
};

/**
 * 통화 변환 (환율 적용)
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  return amount * exchangeRate;
};

/**
 * 환율 계산
 */
export const calculateExchangeRate = (
  baseAmount: number,
  convertedAmount: number
): number => {
  if (baseAmount === 0) return 0;
  return convertedAmount / baseAmount;
};

/**
 * 통화 검색
 */
export const searchCurrencies = (query: string): Currency[] => {
  if (!query.trim()) {
    return Object.values(CURRENCIES);
  }

  const lowercaseQuery = query.toLowerCase();

  return Object.values(CURRENCIES).filter(currency => {
    const metadata = getCurrencyMetadata(currency);
    if (!metadata) return false;

    return (
      currency.toLowerCase().includes(lowercaseQuery) ||
      metadata.name.toLowerCase().includes(lowercaseQuery) ||
      metadata.country.toLowerCase().includes(lowercaseQuery) ||
      metadata.symbol.includes(query)
    );
  });
};

/**
 * 그룹별 통화 가져오기
 */
export const getCurrenciesByGroup = (groupKey: keyof typeof CURRENCY_GROUPS): Currency[] => {
  const group = CURRENCY_GROUPS[groupKey];
  return group ? [...group.currencies] : [];
};

/**
 * 통화가 속한 그룹 찾기
 */
export const findCurrencyGroup = (currency: Currency): keyof typeof CURRENCY_GROUPS | null => {
  for (const [groupKey, group] of Object.entries(CURRENCY_GROUPS)) {
    if ((group.currencies as readonly Currency[]).includes(currency)) {
      return groupKey as keyof typeof CURRENCY_GROUPS;
    }
  }
  return null;
};

/**
 * 인기 통화 목록 가져오기
 */
export const getPopularCurrencies = (): Currency[] => {
  return [...POPULAR_CURRENCIES];
};

/**
 * 통화 옵션 생성 (드롭다운 등에서 사용)
 */
export const getCurrencyOptions = (popular?: boolean) => {
  const currencies = popular ? getPopularCurrencies() : Object.values(CURRENCIES);

  return currencies.map(currency => ({
    value: currency,
    label: `${getCurrencyName(currency)} (${currency})`,
    symbol: getCurrencySymbol(currency),
    flag: getCurrencyFlag(currency),
    country: getCurrencyCountry(currency),
  }));
};

/**
 * 그룹별 통화 옵션 생성
 */
export const getGroupedCurrencyOptions = () => {
  const result: Record<string, any> = {};

  Object.entries(CURRENCY_GROUPS).forEach(([groupKey, group]) => {
    result[groupKey] = {
      label: group.name,
      icon: group.icon,
      options: group.currencies.map(currency => ({
        value: currency,
        label: `${getCurrencyName(currency)} (${currency})`,
        symbol: getCurrencySymbol(currency),
        flag: getCurrencyFlag(currency),
        country: getCurrencyCountry(currency),
      })),
    };
  });

  return result;
};

/**
 * 통화별 소수점 자릿수 가져오기
 */
export const getCurrencyDecimalPlaces = (currency: Currency): number => {
  const metadata = getCurrencyMetadata(currency);
  return metadata?.decimalPlaces || 2;
};

/**
 * 통화 비교 (알파벳 순)
 */
export const compareCurrencies = (a: Currency, b: Currency): number => {
  return a.localeCompare(b);
};

/**
 * 통화 비교 (이름 순)
 */
export const compareCurrenciesByName = (a: Currency, b: Currency): number => {
  const nameA = getCurrencyName(a);
  const nameB = getCurrencyName(b);
  return nameA.localeCompare(nameB);
};

/**
 * 환율 유효성 검사
 */
export const isValidExchangeRate = (rate: number): boolean => {
  return rate > 0 && isFinite(rate);
};

/**
 * 환율 데이터 생성
 */
export const createExchangeRate = (
  from: Currency,
  to: Currency,
  rate: number,
  provider: string = 'manual'
): ExchangeRate => {
  return {
    from,
    to,
    rate,
    timestamp: new Date().toISOString(),
    provider,
  };
};