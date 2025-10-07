/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 날짜 포맷팅
 */
export const formatDate = (
  date: Date | string, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'ko-KR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const formatOptions = {
    short: { year: '2-digit' as const, month: 'numeric' as const, day: 'numeric' as const },
    medium: { year: 'numeric' as const, month: 'short' as const, day: 'numeric' as const },
    long: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const, weekday: 'short' as const },
    full: { year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const, weekday: 'long' as const },
  };
  
  const options: Intl.DateTimeFormatOptions = formatOptions[format];
  
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * 시간 포맷팅
 */
export const formatTime = (
  date: Date | string,
  format: '12' | '24' = '24',
  locale: string = 'ko-KR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12',
  };
  
  return dateObj.toLocaleTimeString(locale, options);
};

/**
 * 날짜와 시간 함께 포맷팅
 */
export const formatDateTime = (
  date: Date | string,
  dateFormat: 'short' | 'medium' | 'long' = 'medium',
  timeFormat: '12' | '24' = '24',
  locale: string = 'ko-KR'
): string => {
  const formattedDate = formatDate(date, dateFormat, locale);
  const formattedTime = formatTime(date, timeFormat, locale);
  
  return `${formattedDate} ${formattedTime}`;
};

/**
 * 상대적 시간 (몇 분 전, 몇 시간 전 등)
 */
export const formatRelativeTime = (
  date: Date | string,
  locale: string = 'ko-KR'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else {
      return formatDate(dateObj, 'short', locale);
    }
  }
};

/**
 * 날짜 유효성 검사
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * 날짜 문자열을 Date 객체로 변환
 */
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 월의 첫 번째 날
 */
export const getStartOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
};

/**
 * 월의 마지막 날
 */
export const getEndOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);
};

/**
 * 주의 첫 번째 날 (월요일)
 */
export const getStartOfWeek = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = dateObj.getDay();
  const diff = dateObj.getDate() - day + (day === 0 ? -6 : 1); // 월요일을 주의 시작으로
  return new Date(dateObj.setDate(diff));
};

/**
 * 주의 마지막 날 (일요일)
 */
export const getEndOfWeek = (date: Date | string): Date => {
  const startOfWeek = getStartOfWeek(date);
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
};

/**
 * 오늘인지 확인
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * 이번 주인지 확인
 */
export const isThisWeek = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const endOfWeek = getEndOfWeek(today);
  
  return dateObj >= startOfWeek && dateObj <= endOfWeek;
};

/**
 * 이번 달인지 확인
 */
export const isThisMonth = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * 이번 해인지 확인
 */
export const isThisYear = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.getFullYear() === today.getFullYear();
};

/**
 * 날짜 범위 생성
 */
export const getDateRange = (
  startDate: Date | string,
  endDate: Date | string
): Date[] => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const dates: Date[] = [];
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * 월 목록 생성 (특정 기간)
 */
export const getMonthRange = (
  startDate: Date | string,
  endDate: Date | string
): { year: number; month: number; date: Date }[] => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const months: { year: number; month: number; date: Date }[] = [];
  
  const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (currentDate <= endMonth) {
    months.push({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      date: new Date(currentDate),
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
};

/**
 * ISO 문자열로 변환 (시간대 고려)
 */
export const toISOStringLocal = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const offset = dateObj.getTimezoneOffset();
  const localDate = new Date(dateObj.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

/**
 * 예산 기간 계산 헬퍼
 */
export const getBudgetPeriodDates = (
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  referenceDate: Date | string = new Date()
): { startDate: Date; endDate: Date } => {
  const refDate = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate;
  
  switch (period) {
    case 'weekly': {
      const startOfWeek = getStartOfWeek(refDate);
      const endOfWeek = getEndOfWeek(refDate);
      return { startDate: startOfWeek, endDate: endOfWeek };
    }
    
    case 'monthly': {
      const startOfMonth = getStartOfMonth(refDate);
      const endOfMonth = getEndOfMonth(refDate);
      return { startDate: startOfMonth, endDate: endOfMonth };
    }
    
    case 'quarterly': {
      const quarter = Math.floor(refDate.getMonth() / 3);
      const startOfQuarter = new Date(refDate.getFullYear(), quarter * 3, 1);
      const endOfQuarter = new Date(refDate.getFullYear(), quarter * 3 + 3, 0);
      return { startDate: startOfQuarter, endDate: endOfQuarter };
    }
    
    case 'yearly': {
      const startOfYear = new Date(refDate.getFullYear(), 0, 1);
      const endOfYear = new Date(refDate.getFullYear(), 11, 31);
      return { startDate: startOfYear, endDate: endOfYear };
    }
    
    default:
      throw new Error(`Unsupported period: ${period}`);
  }
};