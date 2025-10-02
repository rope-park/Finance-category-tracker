import { TransactionType, Category } from '../constants';

// 기본 Transaction 인터페이스
export interface Transaction {
  id: number;
  user_id: number;
  category: Category;
  category_key: Category;
  category_name?: string;
  transaction_type: TransactionType;
  amount: number;
  description?: string;
  merchant?: string;
  date: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

// 트랜잭션 생성용 타입
export interface CreateTransactionData {
  category_key: Category;
  transaction_type: TransactionType;
  amount: number;
  description?: string;
  merchant?: string;
  transaction_date?: string; // 기본값은 현재 날짜
}

// 트랜잭션 업데이트용 타입
export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: number;
}

// 트랜잭션 생성 요청 타입
export interface CreateTransactionRequest {
  category_key: Category;
  transaction_type: TransactionType;
  amount: number;
  description?: string;
  merchant?: string;
  transaction_date?: string;
}

// 트랜잭션 업데이트 요청 타입
export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
}

// 트랜잭션 필터 타입
export interface TransactionFilters {
  transaction_type?: TransactionType;
  category_key?: Category;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  merchant?: string;
}

// 트랜잭션 통계 타입
export interface TransactionStats {
  total_income: number;
  total_expense: number;
  net_amount: number;
  transaction_count: number;
  average_transaction: number;
  largest_expense: number;
  largest_income: number;
}

// 월별 트랜잭션 요약
export interface MonthlyTransactionSummary {
  year: number;
  month: number;
  total_income: number;
  total_expense: number;
  net_amount: number;
  transaction_count: number;
  top_expense_category: Category;
  top_income_category: Category;
}

// 카테고리별 트랜잭션 요약
export interface CategoryTransactionSummary {
  category_key: Category;
  category_name: string;
  transaction_type: TransactionType;
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  percentage_of_total: number;
}

// 월별 통계 타입
export interface MonthlyStats {
  year: number;
  month: number;
  income: {
    total: number;
    categories: Array<{
      category_key: Category;
      amount: number;
      count: number;
    }>;
  };
  expense: {
    total: number;
    categories: Array<{
      category_key: Category;
      amount: number;
      count: number;
    }>;
  };
}

// 카테고리별 통계 타입
export interface CategoryStats {
  category_key: Category;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  average_amount: number;
  percentage_of_total: number;
}
