import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  // 편의 메서드 추가하여 기존 컴포넌트들과 호환성 제공
  return {
    ...context,
    transactions: context.state.transactions,
    budgets: context.state.budgets,
    notifications: context.state.notifications,
    loading: context.state.loading,
    error: context.state.error,
  };
};
