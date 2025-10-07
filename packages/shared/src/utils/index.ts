/**
 * 공통 유틸리티 모음
 * 
 * 다양한 유틸리티 함수들을 한 곳에 모아 관리.
 * 배열, 객체, 문자열, 숫자, 날짜 등 자주 사용되는 기능 포함.
 * 프로젝트 전반에서 재사용 가능하도록 설계.
 */

// 통화 유틸리티
export * from './currency';

// 날짜 유틸리티
export * from './date';

// 반복 거래 유틸리티
export * from './recurring';

/**
 * 디바운스 함수
 *
 * 주어진 함수의 호출을 지연시켜, 지정된 시간 동안 추가 호출이 없을 경우에만 실행되도록 함.
 *
 * @param func 실행할 함수
 * @param wait 대기 시간 (밀리초)
 * @returns 디바운스된 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 스로틀 함수
 * 
 * 주어진 함수의 호출 빈도를 제한하여, 지정된 시간 간격 내에 한 번만 실행되도록 함.
 * 
 * @param func - 실행할 함수
 * @param limit - 제한 시간 (밀리초)
 * @returns 스로틀된 함수
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * 깊은 복사
 * @param obj - 복제할 객체
 * @returns 복제된 객체
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
};

/**
 * 배열을 청크 단위로 분할
 * @param array - 분할할 배열
 * @param size - 청크 크기
 * @returns 청크 배열
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * 배열의 중복된 값 제거
 * @param array - 중복 제거할 배열
 * @returns 중복이 제거된 배열
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * 객체에서 특정 키를 제거
 * @param obj - 원본 객체
 * @param keys - 제거할 키 목록
 * @returns 키가 제거된 새로운 객체
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

/**
 * 객체에서 특정 키만 선택
 * @param obj - 원본 객체
 * @param keys - 선택할 키 목록
 * @returns 선택된 키만 포함된 새로운 객체
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * 랜덤 ID 생성
 * @param length - ID 길이 (기본값: 8)
 * @returns 생성된 랜덤 ID 문자열
 */
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 숫자 포맷팅
 * @param num - 포맷할 숫자
 * @param locale - 로케일 (기본값: 'ko-KR')
 * @returns 포맷된 문자열
 */
export const formatNumber = (num: number, locale: string = 'ko-KR'): string => {
  return num.toLocaleString(locale);
};

/**
 * 백분율 계산
 * @param value - 부분 값
 * @param total - 전체 값
 * @returns 백분율 (소수점 둘째 자리까지)
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100; // 소수점 둘째 자리까지
};

/**
 * 숫자가 특정 범위 내에 있는지 확인
 * @param value - 검사할 숫자
 * @param min - 최소값 (포함)
 * @param max - 최대값 (포함)
 * @return 범위 내에 있으면 true, 아니면 false
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * 문자열 자르기
 * @param str - 원본 문자열
 * @param length - 자를 길이
 * @param suffix - 말줄임표 (기본값: '...')
 * @return 자른 문자열
 */
export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

/**
 * 문자열의 첫 글자를 대문자로 변환
 * @param str - 문자열
 * @returns 대문자로 변환된 문자열
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * camelCase를 kebab-case로 변환
 * @param str - camelCase 문자열
 * @returns kebab-case 문자열
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * kebab-case를 camelCase로 변환
 * @param str - kebab-case 문자열
 * @returns camelCase 문자열
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * 스토리지 유틸리티
 * 
 * 로컬 스토리지에 데이터를 저장, 조회, 삭제하는 간단한 래퍼 함수들.
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn('Failed to save to localStorage');
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn('Failed to remove from localStorage');
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch {
      console.warn('Failed to clear localStorage');
    }
  },
};