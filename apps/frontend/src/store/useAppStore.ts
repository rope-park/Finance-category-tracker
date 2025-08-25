import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Transaction, Budget } from '@finance-tracker/shared';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Data state
  transactions: Transaction[];
  budgets: Budget[];
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  transactions: [],
  budgets: [],
};

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