import React, { createContext, useReducer, useEffect } from 'react';
import type { Transaction, CategoryBudget, Notification, TransactionCategory, RecurringTemplate, TransactionType } from '../../index';
import { getBudgetStatus } from '../../shared/utils';

interface AppState {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  recurringTemplates: RecurringTemplate[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  notificationsEnabled: boolean;
  amountHidden: boolean;
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
  | { type: 'TOGGLE_AMOUNT_HIDDEN' }
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

// 카테고리 이름을 프론트엔드 형식으로 매핑하는 함수
const mapCategoryToFrontend = (categoryName: string): string => {
  const categoryMap: { [key: string]: string } = {
    '급여': 'SALARY',
    '부업': 'BUSINESS',
    '투자수익': 'INVESTMENT',
    '기타수입': 'OTHER_INCOME',
    '식비': 'FOOD_RESTAURANT',
    '교통비': 'TRANSPORT_PUBLIC',
    '카페/음료': 'FOOD_COFFEE',
    '쇼핑/의류': 'SHOPPING_CLOTHING',
    '취미/문화': 'ENTERTAINMENT_MOVIES',
    '주거비': 'HOUSING_RENT',
    '통신비': 'UTILITIES_PHONE',
    '장보기': 'FOOD_GROCERIES',
    '육아용품': 'FAMILY_CHILDREN',
    '의료비': 'HEALTHCARE_MEDICAL',
    '교육비': 'EDUCATION_TUITION',
    '생활용품': 'SHOPPING_GENERAL',
    '사업수입': 'BUSINESS',
    '임대수입': 'RENTAL_INCOME',
    '사업경비': 'BUSINESS_EXPENSE',
    '세금': 'TAX',
    '보험료': 'INSURANCE',
    '용돈': 'ALLOWANCE',
    '아르바이트': 'PART_TIME',
    '등록금': 'EDUCATION_TUITION',
    '교재비': 'EDUCATION_BOOKS',
    '친구모임': 'ENTERTAINMENT_SOCIAL',
    '카페': 'FOOD_COFFEE'
  };
  
  return categoryMap[categoryName] || 'OTHER';
};

// localStorage에 설정을 저장하는 함수
const saveSettingsToStorage = (state: AppState) => {
  try {
    const settingsToSave = {
      darkMode: state.darkMode,
      notificationsEnabled: state.notificationsEnabled,
      amountHidden: state.amountHidden,
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
  amountHidden: false,
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
        transactions: state.transactions.filter(transaction => transaction.id.toString() !== action.payload)
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
    case 'TOGGLE_AMOUNT_HIDDEN': {
      console.log('🔒 TOGGLE_AMOUNT_HIDDEN 리듀서 실행');
      console.log('🔒 이전 amountHidden 상태:', state.amountHidden);
      const newState = { ...state, amountHidden: !state.amountHidden };
      console.log('🔒 새로운 amountHidden 상태:', newState.amountHidden);
      saveSettingsToStorage(newState);
      console.log('🔒 localStorage에 저장 완료');
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateBudget: (category: TransactionCategory, limit: number, warningThreshold: number) => void;
  deleteBudget: (category: TransactionCategory) => void;
  checkBudgetAlert: (category: TransactionCategory, amount: number) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleAmountHidden: () => void;
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
  amountHidden: boolean;
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

  // 초기 로드 시 localStorage에서 설정 불러오기 및 API에서 데이터 가져오기
  useEffect(() => {
    const loadInitialData = async () => {
      // localStorage에서 설정 불러오기
      const savedSettings = loadSettingsFromStorage();
      if (Object.keys(savedSettings).length > 0) {
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: savedSettings });
      }

      // API에서 실제 거래 데이터 가져오기 (개발용)
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('🔄 API에서 거래 데이터를 가져오는 중...');
        
        // 직접 fetch로 API 호출 - 김민수(직장인) 사용자 데이터
        const response = await fetch('http://localhost:3001/api/transactions/user/11111111-1111-1111-1111-111111111111');
        console.log('📡 API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
        }
        
        const apiData = await response.json();
        console.log('📦 API 응답 데이터:', apiData);
        
        if (apiData && Array.isArray(apiData)) {
          // API 응답 타입 정의
          type ApiTransactionResponse = {
            id: string;
            amount: number | string;
            description?: string;
            date: string;
            type: string;
            category_id: string;
            category_name?: string;
            account_id: string;
            account_name?: string;
          };
          
          // 새로운 API 응답 형식에 맞게 변환
          const transactions = apiData.map((t: ApiTransactionResponse) => ({
            id: typeof t.id === 'string' ? parseInt(t.id) : t.id,
            user_id: 1,
            category: mapCategoryToFrontend(t.category_name || t.category_id) as TransactionCategory,
            category_key: mapCategoryToFrontend(t.category_name || t.category_id) as TransactionCategory,
            category_name: t.category_name,
            transaction_type: (t.type === 'income' ? 'income' : 'expense') as TransactionType,
            amount: Math.abs(Number(t.amount)),
            description: t.description || '',
            merchant: t.description || '',
            date: t.date,
            transaction_date: t.date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
          console.log('✅ 김민수(직장인) 사용자의 거래 데이터를 성공적으로 가져왔습니다:', transactions.length, '개');
          console.log('🎯 변환된 거래 데이터:', transactions.slice(0, 3));
        } else {
          console.warn('⚠️ API 응답에 거래 데이터가 없습니다:', apiData);
        }
      } catch (error) {
        console.error('❌ API 호출 실패:', error);
        console.warn('⚠️ localStorage 데이터 사용');
        // API 실패 시 localStorage 데이터 사용 (이미 로드됨)
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      console.log('➕ 새 거래 추가 중...', transactionData);
      
      // API 요청을 위한 데이터 변환
      const apiData = {
        category_key: transactionData.category,
        transaction_type: transactionData.transaction_type,
        amount: transactionData.amount,
        description: transactionData.description,
        merchant: transactionData.merchant || '',
        transaction_date: transactionData.transaction_date,
        account_id: '11111111-1111-1111-1111-111111111111' // 김민수 사용자의 첫 번째 계정
      };
      
      const response = await fetch('http://localhost:3001/api/transactions/dev/11111111-1111-1111-1111-111111111111', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`거래 추가 실패: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ 거래 추가 성공:', result);
      
      // 서버에서 반환된 데이터로 로컬 상태 업데이트
      const transaction: Transaction = {
        id: result.data.id,
        user_id: 1,
        category: result.data.category_id,
        category_key: result.data.category_id,
        category_name: result.data.category_name,
        transaction_type: result.data.transaction_type || result.data.type,
        amount: result.data.amount,
        description: result.data.description,
        merchant: result.data.merchant || '',
        date: result.data.date || result.data.transaction_date,
        transaction_date: result.data.transaction_date || result.data.date,
        created_at: result.data.created_at || new Date().toISOString(),
        updated_at: result.data.updated_at || new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      
      // 예산 체크 및 경고
      if (transaction.transaction_type === 'expense') {
        checkBudgetAlert(transaction.category, transaction.amount);
      }
      
    } catch (error) {
      console.error('❌ 거래 추가 실패:', error);
      // 에러가 발생해도 로컬 상태는 업데이트 (낙관적 업데이트)
      const transaction: Transaction = {
        ...transactionData,
        id: Date.now(),
      };
      
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      
      if (transaction.transaction_type === 'expense') {
        checkBudgetAlert(transaction.category, transaction.amount);
      }
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    console.log('🔧 AppContext updateTransaction 함수 호출됨');
    console.log('📝 수정할 거래 데이터:', transaction);
    
    try {
      console.log('🔄 거래 수정 중...', transaction);
      
      // API 요청을 위한 데이터 변환
      const updateData = {
        category_key: transaction.category,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        description: transaction.description,
        merchant: transaction.merchant || '',
        transaction_date: transaction.transaction_date
      };
      
      console.log('🌐 API 요청 데이터:', updateData);
      
      const url = `http://localhost:3001/api/transactions/dev/11111111-1111-1111-1111-111111111111/${transaction.id}`;
      console.log('🔗 API URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('📡 API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 오류 응답:', errorText);
        throw new Error(`거래 수정 실패: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ 거래 수정 성공:', result);
      
      // 로컬 상태도 업데이트
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
      console.log('🔄 로컬 상태 업데이트 완료');
      
    } catch (error) {
      console.error('❌ 거래 수정 실패:', error);
      // 에러가 발생해도 로컬 상태는 업데이트 (낙관적 업데이트)
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      console.log('🗑️ 거래 삭제 중...', id);
      
      const response = await fetch(`http://localhost:3001/api/transactions/dev/11111111-1111-1111-1111-111111111111/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`거래 삭제 실패: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ 거래 삭제 성공:', result);
      
      // 로컬 상태에서도 제거
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      
    } catch (error) {
      console.error('❌ 거래 삭제 실패:', error);
      // 에러가 발생해도 로컬 상태는 업데이트 (낙관적 업데이트)
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  const updateBudget = (category: TransactionCategory, limit: number, warningThreshold: number) => {
    console.log('🏦 AppContext updateBudget 호출됨:');
    console.log('📂 카테고리:', category);
    console.log('💰 한도:', limit);
    console.log('⚠️ 경고 임계값:', warningThreshold);
    
    const spent = state.transactions
      .filter(t => t.category === category && t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const budget: CategoryBudget = {
      id: `${category}-${Date.now()}`,
      category,
      amount: limit,
      spent,
      remaining: limit - spent,
      period: 'monthly',
      limit,
      warningThreshold,
      currency: 'KRW'
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

  const toggleAmountHidden = () => {
    console.log('🔒 toggleAmountHidden 호출됨');
    console.log('🔒 현재 amountHidden 상태:', state.amountHidden);
    dispatch({ type: 'TOGGLE_AMOUNT_HIDDEN' });
    console.log('🔒 TOGGLE_AMOUNT_HIDDEN 액션 디스패치 완료');
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
        toggleAmountHidden,
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
        amountHidden: state.amountHidden,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};