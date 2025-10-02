/**
 * 반복 거래 관련 유틸리티 함수들
 */

/** 반복 주기 타입 - 예산이나 예약 거래의 반복 주기 */
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * 다음 실행 예정일 계산
 * @param recurrenceType - 반복 주기 유형
 * @param recurrenceDay - 반복 실행 일자 (선택적)
 * @param lastExecuted - 마지막 실행일 (선택적)
 * @returns 다음 실행 예정일 (YYYY-MM-DD 형식)
 */
export const calculateNextDueDate = (
  recurrenceType: RecurrenceType,
  recurrenceDay: number | undefined,
  lastExecuted?: string
): string => {
  const baseDate = lastExecuted ? new Date(lastExecuted) : new Date();
  const nextDate = new Date(baseDate);

  switch (recurrenceType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;

    case 'weekly': {
      const currentDay = nextDate.getDay();
      const targetDay = recurrenceDay || 0; // 기본값: 일요일
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      nextDate.setDate(nextDate.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
      break;
    }

    case 'monthly': {
      const targetDate = recurrenceDay || 1; // 기본값: 매월 1일
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(targetDate);
      
      // 해당 월에 그 날짜가 없는 경우 (예: 2월 31일) 마지막 날로 설정
      if (nextDate.getDate() !== targetDate) {
        nextDate.setDate(0); // 전월 마지막 날
      }
      break;
    }

    case 'yearly': {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      if (recurrenceDay) {
        // recurrenceDay를 MMDD 형식으로 해석 (예: 1225 = 12월 25일)
        const month = Math.floor(recurrenceDay / 100) - 1; // 0-based month
        const day = recurrenceDay % 100;
        nextDate.setMonth(month);
        nextDate.setDate(day);
      }
      break;
    }
  }

  return nextDate.toISOString().split('T')[0];
};

/**
 * 반복 거래 실행 여부 확인
 * @param template - 반복 거래 템플릿
 * @returns 실행 가능 여부
 */
export const isDueForExecution = (template: {
  nextDueDate: string;
  isActive: boolean;
}): boolean => {
  if (!template.isActive) {
    return false;
  }

  const today = new Date().toISOString().split('T')[0];
  return template.nextDueDate <= today;
};

/**
 * 반복 주기 한글 라벨 반환
 * @param recurrenceType - 반복 주기 타입
 * @returns 한글 라벨
 */
export const getRecurrenceTypeLabel = (recurrenceType: RecurrenceType): string => {
  const labels = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년'
  };
  
  return labels[recurrenceType] || '알 수 없음';
};