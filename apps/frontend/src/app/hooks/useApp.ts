/**
 * 앱 전역 상태 접근 훅
 * 
 * 주요 기능:
 * - AppContext에서 제공하는 상태와 메서드에 쉽게 접근할 수 있도록 함
 * - AppProvider 내부에서만 사용 가능하도록 안전장치 포함
 */
import { useContext } from 'react';
import { AppContext } from '../providers/AppContext';

/**
 * 앱 전역 상태 접근 훅
 * @returns AppContext의 상태와 메서드들
 * @throws AppProvider 외부에서 사용 시 에러 발생
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};
