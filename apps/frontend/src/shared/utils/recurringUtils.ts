/**
 * 반복 거래 관련 유틸리티 함수들 (Frontend 전용)
 * 
 * 주요 기능:
 * - 반복 거래 템플릿 관리 및 상태 확인
 * - 반복 주기별 상세 설명 생성
 * - 반복 주기 옵션 제공 (UI용)
 * - packages/shared의 핵심 로직 재사용
 * 
 * 공통 로직은 packages/shared에서 import하여 사용하고,
 * Frontend 전용 UI 관련 기능들만 여기에 정의
 * 
 * @author Finance Category Tracker Team
 * @version 1.0.0
 */

import type { RecurringTemplate, RecurrenceType } from '../types';
import {
  calculateNextDueDate,
  isDueForExecution,
  getRecurrenceTypeLabel
} from '@finance-tracker/shared';

// ==================================================
// packages/shared 공통 함수들 재export
// ==================================================

/**
 * 다음 실행 예정일 계산 (packages/shared에서 재export)
 * @param recurrenceType - 반복 주기 유형
 * @param recurrenceDay - 반복 실행 일자 (선택적)
 * @param lastExecuted - 마지막 실행일 (선택적)
 * @returns 다음 실행 예정일 (YYYY-MM-DD 형식)
 */
export { calculateNextDueDate };

/**
 * 반복 거래 실행 여부 확인 (packages/shared에서 재export)
 * @param template - 반복 거래 템플릿
 * @returns 실행 가능 여부
 */
export { isDueForExecution };

/**
 * 반복 주기 한글 라벨 반환 (packages/shared에서 재export)
 * @param recurrenceType - 반복 주기 타입
 * @returns 한글 라벨
 */
export { getRecurrenceTypeLabel };

// ==================================================
// Frontend 전용 유틸리티 함수들
// ==================================================

/**
 * 지정된 날짜가 오늘 이전인지 확인 (기한 도래 여부)
 * @param dueDate - 확인할 날짜 (YYYY-MM-DD 형식)
 * @returns 오늘 이전 날짜이면 true, 그렇지 않으면 false
 * @example
 * isDue('2024-01-01') // 오늘이 2024-01-02라면 true
 * isDue('2024-12-31') // 오늘이 2024-01-02라면 false
 */
export const isDue = (dueDate: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dueDate <= today;
};

/**
 * 기한이 지난 반복 거래 템플릿들을 찾아서 반환
 * @param templates - 반복 거래 템플릿 배열
 * @returns 기한이 지난 템플릿들의 배열
 * @example
 * const overdueTemplates = getOverdueTemplates(allTemplates);
 * console.log(`기한 지난 템플릿: ${overdueTemplates.length}개`);
 */
export const getOverdueTemplates = (templates: RecurringTemplate[]): RecurringTemplate[] => {
  return templates.filter(template => 
    template.isActive && isDue(template.nextDueDate)
  );
};

/**
 * 지정된 기간 내에 실행 예정인 반복 거래 템플릿들을 반환
 * @param templates - 반복 거래 템플릿 배열
 * @param days - 예정 기간 (일 단위, 기본값: 7일)
 * @returns 예정된 템플릿들의 배열
 * @example
 * const upcomingTemplates = getUpcomingTemplates(allTemplates, 3); // 3일 내 예정
 * console.log(`예정된 템플릿: ${upcomingTemplates.length}개`);
 */
export const getUpcomingTemplates = (templates: RecurringTemplate[], days: number = 7): RecurringTemplate[] => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  const targetDateStr = targetDate.toISOString().split('T')[0];
  
  return templates.filter(template => 
    template.isActive && 
    template.nextDueDate <= targetDateStr && 
    !isDue(template.nextDueDate)
  );
};

/**
 * 반복 거래 템플릿의 반복 주기를 사용자가 이해하기 쉬운 형태로 포맷팅
 * @param template - 반복 거래 템플릿
 * @returns 포맷팅된 반복 주기 설명 문자열
 * @example
 * formatRecurrenceDetails({ recurrenceType: 'weekly', recurrenceDay: 1 }) // '매주 월요일'
 * formatRecurrenceDetails({ recurrenceType: 'monthly', recurrenceDay: 15 }) // '매월 15일'
 */
export const formatRecurrenceDetails = (template: RecurringTemplate): string => {
  const { recurrenceType, recurrenceDay } = template;
  
  switch (recurrenceType) {
    case 'daily':
      return '매일';
      
    case 'weekly': {
      const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      return `매주 ${weekdays[recurrenceDay || 0]}`;
    }
      
    case 'monthly':
      return `매월 ${recurrenceDay || 1}일`;
      
    case 'yearly': {
      if (recurrenceDay) {
        const month = Math.floor(recurrenceDay / 100);
        const day = recurrenceDay % 100;
        return `매년 ${month}월 ${day}일`;
      }
      return '매년';
    }
      
    default:
      return getRecurrenceTypeLabel(recurrenceType);
  }
};

export const getRecurrenceDayOptions = (type: RecurrenceType) => {
  switch (type) {
    case 'weekly':
      return [
        { value: 0, label: '일요일' },
        { value: 1, label: '월요일' },
        { value: 2, label: '화요일' },
        { value: 3, label: '수요일' },
        { value: 4, label: '목요일' },
        { value: 5, label: '금요일' },
        { value: 6, label: '토요일' }
      ];
      
    case 'monthly':
      return Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}일`
      }));
      
    case 'yearly': {
      const months = [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월'
      ];
      const yearlyOptions = [];
      
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = new Date(2024, month, 0).getDate(); // 윤년 고려
        for (let day = 1; day <= daysInMonth; day++) {
          yearlyOptions.push({
            value: month * 100 + day,
            label: `${months[month - 1]} ${day}일`
          });
        }
      }
      return yearlyOptions;
    }
      
    default:
      return [];
  }
};