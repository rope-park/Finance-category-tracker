import type { RecurringTemplate, RecurrenceType } from '../types';

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

export const isDue = (dueDate: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dueDate <= today;
};

export const getOverdueTemplates = (templates: RecurringTemplate[]): RecurringTemplate[] => {
  return templates.filter(template => 
    template.isActive && isDue(template.nextDueDate)
  );
};

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

export const formatRecurrenceType = (type: RecurrenceType): string => {
  const types = {
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
    yearly: '매년'
  };
  return types[type];
};

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
      return formatRecurrenceType(recurrenceType);
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