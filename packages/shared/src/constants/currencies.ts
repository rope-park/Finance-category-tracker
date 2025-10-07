/**
 * 통화 관련 상수 정의
 * 
 * 주요 통화 코드, 통화 메타데이터, 통화 그룹, 인기 통화, 기본 통화, 환율 API 설정 등 포함.
 */

// 주요 통화 코드
export const CURRENCIES = {
  KRW: 'KRW', // 한국 원
  JPY: 'JPY', // 일본 엔
  CNY: 'CNY', // 중국 위안
  USD: 'USD', // 미국 달러
  EUR: 'EUR', // 유로
  GBP: 'GBP', // 영국 파운드
  
} as const;

// 통화별 메타데이터
export const CURRENCY_METADATA = {
  [CURRENCIES.KRW]: {
    name: '한국 원',
    symbol: '₩',
    code: 'KRW',
    country: '대한민국',
    flag: '🇰🇷',
    decimalPlaces: 0,         // 소수점 이하 자릿수
    thousandsSeparator: ',',  // 천 단위 구분자
    decimalSeparator: '.',    // 소수점 구분자
    symbolPosition: 'before', // before | after
    format: '₩{amount}',
    locale: 'ko-KR',
  },
  [CURRENCIES.USD]: {
    name: '미국 달러',
    symbol: '$',
    code: 'USD',
    country: '미국',
    flag: '🇺🇸',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    format: '${amount}',
    locale: 'en-US',
  },
  [CURRENCIES.JPY]: {
    name: '일본 엔',
    symbol: '¥',
    code: 'JPY',
    country: '일본',
    flag: '🇯🇵',
    decimalPlaces: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    format: '¥{amount}',
    locale: 'ja-JP',
  },
  [CURRENCIES.EUR]: {
    name: '유로',
    symbol: '€',
    code: 'EUR',
    country: '유럽연합',
    flag: '🇪🇺',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    format: '€{amount}',
    locale: 'de-DE',
  },
  [CURRENCIES.GBP]: {
    name: '영국 파운드',
    symbol: '£',
    code: 'GBP',
    country: '영국',
    flag: '🇬🇧',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    format: '£{amount}',
    locale: 'en-GB',
  },
  [CURRENCIES.CNY]: {
    name: '중국 위안',
    symbol: '¥',
    code: 'CNY',
    country: '중국',
    flag: '🇨🇳',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolPosition: 'before',
    format: '¥{amount}',
    locale: 'zh-CN',
  },
} as const;

// 통화 그룹 정의
export const CURRENCY_GROUPS = {
  MAJOR: {
    name: '주요 통화',
    currencies: [
      CURRENCIES.KRW,
      CURRENCIES.USD,
      CURRENCIES.EUR,
      CURRENCIES.JPY,
      CURRENCIES.GBP,
      CURRENCIES.CNY,
    ],
    icon: '🌍',
  },
  ASIAN: {
    name: '아시아 통화',
    currencies: [
      CURRENCIES.KRW,
      CURRENCIES.JPY,
      CURRENCIES.CNY,
    ],
    icon: '🌏',
  },
  AMERICAS: {
    name: '아메리카 통화',
    currencies: [
      CURRENCIES.USD,
    ],
    icon: '🌎',
  },
    EUROPE: {
    name: '유럽 통화',
    currencies: [
      CURRENCIES.EUR,
      CURRENCIES.GBP,
    ],
    icon: '🇪🇺',
  },
} as const;

// 인기 통화 (자주 사용되는 순서)
export const POPULAR_CURRENCIES = [
  CURRENCIES.USD,
  CURRENCIES.EUR,
  CURRENCIES.KRW,
  CURRENCIES.JPY,
  CURRENCIES.GBP,
  CURRENCIES.CNY,
] as const;

// 기본 통화 설정
export const DEFAULT_CURRENCY = CURRENCIES.KRW;

// 환율 API 관련 상수
export const EXCHANGE_RATE_SETTINGS = {
  BASE_CURRENCY: CURRENCIES.KRW,
  UPDATE_INTERVAL: 60 * 60 * 1000, // 1시간
  CACHE_DURATION: 30 * 60 * 1000,  // 30분
  PROVIDERS: {
    FIXER: 'fixer.io',
    EXCHANGE_RATES: 'exchangerate-api.com',
    OPEN_EXCHANGE: 'openexchangerates.org',
  },
} as const;

// 타입 정의
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES];

// 통화 메타데이터 타입
export type CurrencyMetadata = {
  name: string;
  symbol: string;
  code: string;
  country: string;
  flag: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolPosition: 'before' | 'after';
  format: string;
  locale: string;
};

// 통화 그룹 타입
export type CurrencyGroup = {
  name: string;                     // 그룹 이름
  currencies: readonly Currency[];  // 그룹에 속한 통화 목록
  icon: string;                     // 그룹 아이콘
};

// 환율 정보 타입
export type ExchangeRate = {
  from: Currency;      // 기준 통화
  to: Currency;        // 변환할 통화
  rate: number;        // 환율
  timestamp: string;   // 타임스탬프
  provider: string;    // 데이터 제공자
};
