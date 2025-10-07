/**
 * 앱 전역 상태 관리를 위한 Zustand 스토어
 * 
 * 앱 상태 관리를 위한 Zustand 스토어 정의 및 초기 상태 설정
 * 사용자 인증 상태, 로딩 상태, 에러 상태, 거래 내역 및 예산 데이터를 포함
 * 상태 변경을 위한 액션 메서드 제공
 * 상태를 로컬 스토리지에 영구 저장하여 새로고침 후에도 유지
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Transaction, Budget } from '@finance-tracker/shared';

// 앱 상태 인터페이스 정의
interface AppState {
  // 인증 상태
  user: User | null;
  isAuthenticated: boolean;
  
  // UI 상태
  isLoading: boolean;
  error: string | null;
  
  // 데이터 상태
  transactions: Transaction[];
  budgets: Budget[];
  
  // 액션
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  
  // 상태 초기화
  reset: () => void;
}

// 초기 상태 설정
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  transactions: [],
  budgets: [],
};

/**
 * Zustand 스토어 생성
 */
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        setUser: (user) => set({ user }),
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setTransactions: (transactions) => set({ transactions }),
        setBudgets: (budgets) => set({ budgets }),
        
        reset: () => set(initialState),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);