import React, { createContext, useReducer, useEffect } from 'react';
import type { Transaction, CategoryBudget, Notification, TransactionCategory, RecurringTemplate } from '../types';
import { getBudgetStatus } from '../utils';

interface AppState {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  recurringTemplates: RecurringTemplate[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_BUDGETS'; payload: CategoryBudget[] }
  | { type: 'UPDATE_BUDGET'; payload: CategoryBudget }
  | { type: 'DELETE_BUDGET'; payload: TransactionCategory }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> }
  // 반복 거래 템플릿 관련
  | { type: 'SET_RECURRING_TEMPLATES'; payload: RecurringTemplate[] }
  | { type: 'ADD_RECURRING_TEMPLATE'; payload: RecurringTemplate }
  | { type: 'UPDATE_RECURRING_TEMPLATE'; payload: RecurringTemplate }
  | { type: 'DELETE_RECURRING_TEMPLATE'; payload: string };

// localStorage에서 설정을 읽어오는 함수
const loadSettingsFromStorage = (): Partial<AppState> => {
  try {
    const storedSettings = localStorage.getItem('finance-app-settings');
    if (storedSettings) {
      return JSON.parse(storedSettings);
    }
  } catch (error) {
    console.error('설정 불러오기 실패:', error);
  }
  return {};
};

// localStorage에 설정을 저장하는 함수
const saveSettingsToStorage = (state: AppState) => {
  try {
    const settingsToSave = {
      darkMode: state.darkMode,
      notificationsEnabled: state.notificationsEnabled,
      transactions: state.transactions,
      budgets: state.budgets
    };
    localStorage.setItem('finance-app-settings', JSON.stringify(settingsToSave));
  } catch (error) {
    console.error('설정 저장 실패:', error);
  }
};

const initialState: AppState = {
  transactions: [],
  budgets: [],
  recurringTemplates: [],
  notifications: [],
  loading: false,
  error: null,
  darkMode: false, // 기본값을 라이트모드로 변경
  notificationsEnabled: true,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // 반복 거래 템플릿 관련
    case 'SET_RECURRING_TEMPLATES':
      return { ...state, recurringTemplates: action.payload };
    case 'ADD_RECURRING_TEMPLATE':
      return { ...state, recurringTemplates: [...state.recurringTemplates, action.payload] };
    case 'UPDATE_RECURRING_TEMPLATE':
      return {
        ...state,
        recurringTemplates: state.recurringTemplates.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_RECURRING_TEMPLATE':
      return {
        ...state,
        recurringTemplates: state.recurringTemplates.filter(t => t.id !== action.payload)
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION': {
      const newState = { ...state, transactions: [...state.transactions, action.payload] };
      saveSettingsToStorage(newState);
      return newState;
    }
    case 'UPDATE_TRANSACTION': {
      const newState = {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
      saveSettingsToStorage(newState);
      return newState;
    }
    case 'DELETE_TRANSACTION': {
      const newState = {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
      };
      saveSettingsToStorage(newState);
      return newState;
    }
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'UPDATE_BUDGET': {
      const existingBudgetIndex = state.budgets.findIndex(budget => budget.category === action.payload.category);
      
      let newBudgets;
      if (existingBudgetIndex >= 0) {
        // 기존 예산 업데이트
        newBudgets = state.budgets.map(budget =>
          budget.category === action.payload.category ? action.payload : budget
        );
      } else {
        // 새 예산 추가
        newBudgets = [...state.budgets, action.payload];
      }
      
      const newState = {
        ...state,
        budgets: newBudgets,
      };
      saveSettingsToStorage(newState);
      return newState;
    }
    case 'DELETE_BUDGET': {
      const newState = {
        ...state,
        budgets: state.budgets.filter(budget => budget.category !== action.payload),
      };
      saveSettingsToStorage(newState);
      return newState;
    }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, is_read: true } : notification
        ),
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };
    case 'TOGGLE_DARK_MODE': {
      const newState = { ...state, darkMode: !state.darkMode };
      saveSettingsToStorage(newState);
      return newState;
    }
    case 'TOGGLE_NOTIFICATIONS': {
      const newState = { ...state, notificationsEnabled: !state.notificationsEnabled };
      saveSettingsToStorage(newState);
      return newState;
    }
    case 'LOAD_FROM_STORAGE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (category: TransactionCategory, limit: number, warningThreshold: number) => void;
  deleteBudget: (category: TransactionCategory) => void;
  checkBudgetAlert: (category: TransactionCategory, amount: number) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  // 반복 거래 템플릿 관련
  fetchRecurringTemplates: () => Promise<void>;
  addRecurringTemplate: (templateData: Partial<RecurringTemplate>) => Promise<void>;
  updateRecurringTemplate: (id: string, templateData: Partial<RecurringTemplate>) => Promise<void>;
  deleteRecurringTemplate: (id: string) => Promise<void>;
  // 편의 속성들 추가
  transactions: Transaction[];
  budgets: CategoryBudget[];
  recurringTemplates: RecurringTemplate[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };


import * as api from '../services/api';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  // 반복 거래 템플릿 API 연동
  const fetchRecurringTemplates = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.getRecurringTemplates();
      if (res.success && res.data) {
        dispatch({ type: 'SET_RECURRING_TEMPLATES', payload: res.data.templates });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 템플릿 목록 불러오기 실패' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addRecurringTemplate = async (templateData: Partial<RecurringTemplate>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.createRecurringTemplate(templateData);
      if (res.success && res.data) {
        dispatch({ type: 'ADD_RECURRING_TEMPLATE', payload: res.data.template });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 템플릿 추가 실패' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateRecurringTemplate = async (id: string, templateData: Partial<RecurringTemplate>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.updateRecurringTemplate(id, templateData);
      if (res.success && res.data) {
        dispatch({ type: 'UPDATE_RECURRING_TEMPLATE', payload: res.data.template });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 템플릿 수정 실패' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteRecurringTemplate = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.deleteRecurringTemplate(id);
      if (res.success) {
        dispatch({ type: 'DELETE_RECURRING_TEMPLATE', payload: id });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: '반복 거래 템플릿 삭제 실패' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 초기 로드 시 localStorage에서 설정 불러오기
  useEffect(() => {
    const savedSettings = loadSettingsFromStorage();
    if (Object.keys(savedSettings).length > 0) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: savedSettings });
    }
  }, []);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    
    // 예산 체크 및 경고
    if (transaction.type === 'expense') {
      checkBudgetAlert(transaction.category, transaction.amount);
    }
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const updateBudget = (category: TransactionCategory, limit: number, warningThreshold: number) => {
    console.log('🏦 AppContext updateBudget 호출됨:');
    console.log('📂 카테고리:', category);
    console.log('💰 한도:', limit);
    console.log('⚠️ 경고 임계값:', warningThreshold);
    
    const spent = state.transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const budget: CategoryBudget = {
      id: `${category}-${Date.now()}`,
      category,
      limit,
      spent,
      warningThreshold,
    };

    console.log('📊 생성된 예산 객체:', budget);
    console.log('📋 현재 예산 목록:', state.budgets);

    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
    
    console.log('🎯 UPDATE_BUDGET 액션 디스패치 완료');
  };

  const deleteBudget = (category: TransactionCategory) => {
    console.log('🗑️ AppContext deleteBudget 호출됨:');
    console.log('📂 삭제할 카테고리:', category);
    
    dispatch({ type: 'DELETE_BUDGET', payload: category });
    
    console.log('🎯 DELETE_BUDGET 액션 디스패치 완료');
  };

  const checkBudgetAlert = (category: TransactionCategory, amount: number) => {
    const budget = state.budgets.find(b => b.category === category);
    if (!budget) return;

    const newSpent = budget.spent + amount;
    const status = getBudgetStatus(newSpent, budget.limit, budget.warningThreshold);

    let notification: Notification | null = null;

    if (status === 'danger') {
      notification = {
        id: Date.now().toString(),
        type: 'error',
        message: `${category} 카테고리 예산을 초과했습니다! (${newSpent.toLocaleString()}원 / ${budget.limit.toLocaleString()}원)`,
        timestamp: Date.now()
      };
    } else if (status === 'warning') {
      notification = {
        id: Date.now().toString(),
        type: 'warning',
        message: `${category} 카테고리 예산 한도에 가까워지고 있습니다. (${newSpent.toLocaleString()}원 / ${budget.limit.toLocaleString()}원)`,
        timestamp: Date.now()
      };
    }

    if (notification) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }

    // 예산 업데이트
    const updatedBudget: CategoryBudget = {
      ...budget,
      spent: newSpent,
    };
    dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });
  };

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        deleteBudget,
        checkBudgetAlert,
        toggleDarkMode,
        toggleNotifications,
        // 반복 거래 템플릿 관련
        fetchRecurringTemplates,
        addRecurringTemplate,
        updateRecurringTemplate,
        deleteRecurringTemplate,
        // 편의 속성들 추가
        transactions: state.transactions,
        budgets: state.budgets,
        recurringTemplates: state.recurringTemplates,
        notifications: state.notifications,
        loading: state.loading,
        error: state.error,
        darkMode: state.darkMode,
        notificationsEnabled: state.notificationsEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
