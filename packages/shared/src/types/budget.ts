/**
 * 예산 및 목표 관리 관련 공통 타입 정의
 */
import { Category } from '../constants';

// 예산 기간 타입
export type BudgetPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

// 예산 상태 타입
export type BudgetStatus = 'active' | 'exceeded' | 'completed' | 'paused';

// 기본 Budget 인터페이스
export interface Budget {
  id: string;             // 예산의 고유 식별자
  userId: string;         // 사용자 ID
  user_id: number;        // 사용자 ID (숫자형)
  category: Category;     // 카테고리
  category_key: Category; // 카테고리 키
  category_name?: string; // 카테고리 이름 (선택적)
  amount: number;         // 예산 금액
  period: BudgetPeriod;   // 예산 기간
  startDate: string;      // 시작 날짜
  endDate: string;        // 종료 날짜
  period_start: string;   // 기간 시작
  period_end: string;     // 기간 종료
  spent_amount?: number;  // 사용 금액 (선택적)
  remaining_amount?: number; // 남은 금액 (선택적)
  status: BudgetStatus;   // 예산 상태
  createdAt: string;      // 생성 날짜
  updatedAt: string;      // 수정 날짜
  created_at: string;     // 생성 날짜 (snake_case)
  updated_at: string;     // 수정 날짜 (snake_case)
}

// 예산 생성용 타입
export interface CreateBudgetData {
  category_key: Category; // 카테고리 키
  amount: number;         // 예산 금액
  period: BudgetPeriod;   // 예산 기간
  period_start?: string;  // 기본값은 현재 날짜
  period_end?: string;    // period에 따라 자동 계산
}

// 예산 업데이트용 타입
export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  id: number;            // 수정할 예산의 고유 식별자
  status?: BudgetStatus; // 예산 상태 업데이트  
}

// 예산 생성 요청 타입
export interface CreateBudgetRequest {
  category_key: Category; // 카테고리 키
  amount: number;         // 예산 금액
  period: BudgetPeriod;   // 예산 기간
  period_start?: string;  // 기본값은 현재 날짜
  period_end?: string;    // period에 따라 자동 계산
}

// 예산 업데이트 요청 타입
export interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  status?: BudgetStatus;  // 예산 상태 업데이트
}

// 예산 요약 타입
export interface BudgetSummary {
  total_budget: number;       // 총 예산
  total_spent: number;        // 총 지출
  total_remaining: number;    // 총 남은 금액
  overall_percentage: number; // 전체 예산 대비 사용 비율
  over_budget_count: number;  // 예산 초과 건수
  budget_count: number;       // 예산 건수
}

// 예산 진행 상황
export interface BudgetProgress {
  budget_id: number;       // 예산 ID
  category_key: Category;  // 카테고리 키
  category_name: string;   // 카테고리 이름
  budgeted_amount: number; // 예산 금액
  spent_amount: number;    // 사용 금액
  remaining_amount: number; // 남은 금액
  percentage_used: number;  // 사용 비율
  days_remaining: number;   // 남은 일수
  daily_budget_remaining: number; // 남은 일일 예산
  status: BudgetStatus;     // 예산 상태
  is_over_budget: boolean;  // 예산 초과 여부
}

// 예산 알림 설정
export interface BudgetAlert {
  id: number;               // 알림 ID
  budget_id: number;        // 예산 ID
  user_id: number;          // 사용자 ID
  alert_type: 'warning' | 'exceeded' | 'completed'; // 알림 유형
  threshold_percentage: number; // 임계값 비율 (예: 80)
  is_enabled: boolean;      // 알림 활성화 여부
  last_triggered_at?: string; // 마지막 알림 발송 시각 (선택적)
  created_at: string;       // 생성 시각
}

// 예산 통계
export interface BudgetStats {
  total_budgets: number;        // 총 예산 수 
  active_budgets: number;       // 활성 예산 수
  exceeded_budgets: number;     // 초과 예산 수
  total_budgeted_amount: number; // 총 예산 금액
  total_spent_amount: number;   // 총 지출 금액
  average_budget_utilization: number; // 평균 예산 활용률
  budgets_on_track: number;     // 계획대로 진행 중인 예산 수
  budgets_at_risk: number;      // 위험 상태인 예산 수
}

// 월별 예산 요약
export interface MonthlyBudgetSummary {
  year: number;                    // 연도
  month: number;                   // 월
  total_budgeted: number;          // 총 예산
  total_spent: number;             // 총 지출
  budget_adherence_rate: number;   // 예산 준수율
  exceeded_budgets_count: number;  // 초과 예산 건수
  most_overspent_category: Category;  // 가장 많이 초과 지출된 카테고리
  best_performing_category: Category; // 가장 잘 관리된 카테고리
}

// 예산 vs 실제 비교
export interface BudgetVsActual {
  category_key: Category;    // 카테고리 키
  category_name: string;     // 카테고리 이름
  budgeted_amount: number;   // 예산 금액
  actual_amount: number;     // 실제 금액
  variance: number;          // 차이
  variance_percentage: number; // 차이 비율
  performance: 'under' | 'on_track' | 'over'; // 성과
}

// 목표 타입 정의
export type GoalType = 'saving' | 'spending_limit' | 'debt_payoff' | 'investment';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

// 목표 인터페이스
export interface Goal {
  id: string;            // 목표 고유 식별자
  userId: string;        // 사용자 ID
  title: string;         // 목표 제목
  description?: string;  // 목표 설명 (선택적)
  type: GoalType;        // 목표 유형
  category?: Category;   // 카테고리 (선택적)
  targetAmount: number;  // 목표 금액
  currentAmount: number; // 현재 금액
  startDate: string;     // 시작 날짜
  endDate: string;       // 종료 날짜
  status: GoalStatus;    // 목표 상태
  createdAt: string;     // 생성 날짜
  updatedAt: string;     // 수정 날짜
}
