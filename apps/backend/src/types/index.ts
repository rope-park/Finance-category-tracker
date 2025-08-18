export interface User {
  id: number;
  email: string;
  password_hash?: string; // 응답에서는 제외
  name: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
  bio?: string;
  profile_completed: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  profile_picture?: string;
  phone_number?: string;
  age_group?: string;
  bio?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_key: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  transaction_date: string; // ISO date string
  created_at: Date;
  updated_at: Date;
}

export interface CreateTransactionRequest {
  category_key: string;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  transaction_date: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_key: string;
  amount: number;
  period_start: string;
  period_end: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBudgetRequest {
  category_key: string;
  amount: number;
  period_start: string;
  period_end: string;
}

export interface Category {
  id: number;
  category_key: string;
  transaction_type: 'income' | 'expense';
  primary_category: string;
  secondary_category: string;
  icon?: string;
  label_ko: string;
  color?: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}