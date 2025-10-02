import { Category } from '../constants';

// 예산 기간 타입
export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

// 예산 상태 타입
export type BudgetStatus = 'active' | 'exceeded' | 'completed' | 'paused';

// 기본 Budget 인터페이스
export interface Budget {
  id: string;
  userId: string;
  user_id: number;
  category: Category;
  category_key: Category;
  category_name?: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  period_start: string;
  period_end: string;
  spent_amount?: number;
  remaining_amount?: number;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
  created_at: string;
  updated_at: string;
}

// 예산 생성용 타입
export interface CreateBudgetData {
  category_key: Category;
  amount: number;
  period: BudgetPeriod;
  period_start?: string; // 기본값은 현재 날짜
  period_end?: string;   // period에 따라 자동 계산
}

// 예산 업데이트용 타입
export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  id: number;
  status?: BudgetStatus;
}

// 예산 생성 요청 타입
export interface CreateBudgetRequest {
  category_key: Category;
  amount: number;
  period: BudgetPeriod;
  period_start?: string;
  period_end?: string;
}

// 예산 업데이트 요청 타입
export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  status?: BudgetStatus;
}

// 예산 요약 타입
export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  overall_percentage: number;
  over_budget_count: number;
  budget_count: number;
}

// 예산 진행 상황
export interface BudgetProgress {
  budget_id: number;
  category_key: Category;
  category_name: string;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  days_remaining: number;
  daily_budget_remaining: number;
  status: BudgetStatus;
  is_over_budget: boolean;
}

// 예산 알림 설정
export interface BudgetAlert {
  id: number;
  budget_id: number;
  user_id: number;
  alert_type: 'warning' | 'exceeded' | 'completed';
  threshold_percentage: number; // 50, 80, 100 등
  is_enabled: boolean;
  last_triggered_at?: string;
  created_at: string;
}

// 예산 통계
export interface BudgetStats {
  total_budgets: number;
  active_budgets: number;
  exceeded_budgets: number;
  total_budgeted_amount: number;
  total_spent_amount: number;
  average_budget_utilization: number;
  budgets_on_track: number;
  budgets_at_risk: number;
}

// 월별 예산 요약
export interface MonthlyBudgetSummary {
  year: number;
  month: number;
  total_budgeted: number;
  total_spent: number;
  budget_adherence_rate: number;
  exceeded_budgets_count: number;
  most_overspent_category: Category;
  best_performing_category: Category;
}

// 예산 vs 실제 비교
export interface BudgetVsActual {
  category_key: Category;
  category_name: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percentage: number;
  performance: 'under' | 'on_track' | 'over';
}

// 목표 타입 정의
export type GoalType = 'saving' | 'spending_limit' | 'debt_payoff' | 'investment';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

// 목표 인터페이스
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  category?: Category;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}
