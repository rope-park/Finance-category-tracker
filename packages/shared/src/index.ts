// Shared types and interfaces
export interface User {
  id: number;
  email: string;
  name: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: string;
  bio?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface UserSettings {
  id: number;
  user_id: number;
  currency: string;
  dark_mode: boolean;
  notification_budget_warning: boolean;
  notification_budget_exceeded: boolean;
  budget_warning_threshold: number;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_key: string;
  category_name?: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_key: string;
  category_name?: string;
  amount: number;
  period_start: string;
  period_end: string;
  spent_amount?: number;
  remaining_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_key: string;
  category_name: string;
  transaction_type: 'income' | 'expense';
  category_group: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// User profile and settings update types
export interface ProfileUpdateRequest {
  name?: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: string;
  bio?: string;
}

export interface SettingsUpdateRequest {
  currency?: string;
  dark_mode?: boolean;
  notification_budget_warning?: boolean;
  notification_budget_exceeded?: boolean;
  budget_warning_threshold?: number;
  language?: string;
}

// Transaction related types
export interface CreateTransactionRequest {
  category_key: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  transaction_date: string;
}

export interface UpdateTransactionRequest {
  category_key?: string;
  transaction_type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  merchant?: string;
  transaction_date?: string;
}

// Budget related types
export interface CreateBudgetRequest {
  category_key: string;
  amount: number;
  period_start: string;
  period_end: string;
}

export interface UpdateBudgetRequest {
  amount?: number;
  period_start?: string;
  period_end?: string;
}

// Statistics types
export interface MonthlyStats {
  month: string;
  total_income: number;
  total_expense: number;
  net_amount: number;
  transaction_count: number;
  top_categories: Array<{
    category_name: string;
    amount: number;
    percentage: number;
  }>;
}

export interface CategoryStats {
  category_key: string;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  transaction_type: 'income' | 'expense';
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  categories: Array<{
    category_name: string;
    budget_amount: number;
    spent_amount: number;
    remaining_amount: number;
    percentage_used: number;
    is_over_budget: boolean;
  }>;
}

// Utility types
export type TransactionType = 'income' | 'expense';
export type CategoryGroup = 'food' | 'transport' | 'entertainment' | 'utilities' | 'healthcare' | 'shopping' | 'income' | 'other';
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY';
export type Language = 'ko' | 'en';
export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60+';

// Constants
export const TRANSACTION_TYPES: TransactionType[] = ['income', 'expense'];
export const CURRENCIES: Currency[] = ['KRW', 'USD', 'EUR', 'JPY'];
export const LANGUAGES: Language[] = ['ko', 'en'];
export const AGE_GROUPS: AgeGroup[] = ['10s', '20s', '30s', '40s', '50s', '60+'];

export const CATEGORY_GROUPS: Record<CategoryGroup, string> = {
  food: '식비',
  transport: '교통',
  entertainment: '엔터테인먼트',
  utilities: '공과금',
  healthcare: '의료',
  shopping: '쇼핑',
  income: '수입',
  other: '기타'
};
