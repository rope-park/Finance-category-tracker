/**
 * 거래(트랜잭션) 관련 공통 타입들
 */
import { TransactionType, Category } from '../constants';

// 거래 데이터 구조
export interface Transaction {
  id: number;                      // 거래의 고유 식별자
  user_id: number;                 // 거래를 생성한 사용자 ID
  category: Category;              // 거래 카테고리 (호환성을 위한 필드)
  category_key: Category;          // 거래 카테고리 키 (실제 사용되는 필드)
  category_name?: string;          // 카테고리의 한국어 이름 (선택적)
  transaction_type: TransactionType; // 거래 유형 (수입/지출)
  amount: number;                  // 거래 금액 (양수)
  description?: string;            // 거래 설명/메모 (선택적)
  merchant?: string;               // 거래처/상호명 (선택적)
  date: string;                    // 거래 날짜 (호환성을 위한 필드)
  transaction_date: string;        // 실제 거래 발생 날짜
  created_at: string;              // 레코드 생성 시각
  updated_at: string;              // 레코드 최종 수정 시각
}

// 거래 생성에 필요한 데이터 구조
export interface CreateTransactionData {
  category_key: Category;          // 거래 카테고리 (필수)
  transaction_type: TransactionType; // 거래 유형 - 수입 또는 지출 (필수)
  amount: number;                  // 거래 금액 (필수)
  description?: string;            // 거래 설명/메모 (선택)
  merchant?: string;               // 거래처/상호명 (선택)
  transaction_date?: string;       // 거래 날짜 (선택, 기본값: 현재 날짜)
}

// 거래 수정에 필요한 데이터 구조
export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: number;                      // 수정할 거래의 고유 식별자 (필수)
}

// API로 거래 생성 요청을 보낼 때 사용하는 데이터 구조
export interface CreateTransactionRequest {
  category_key: Category;          // 거래 카테고리
  transaction_type: TransactionType; // 거래 유형
  amount: number;                  // 거래 금액
  description?: string;            // 거래 설명
  merchant?: string;               // 거래처
  transaction_date?: string;       // 거래 날짜
}

// API로 거래 수정 요청을 보낼 때 사용하는 데이터 구조
export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
}

// 거래 필터링 옵션
export interface TransactionFilters {
  transaction_type?: TransactionType; // 거래 유형으로 필터링
  category_key?: Category;           // 지정 카테고리만 조회
  date_from?: string;               // 시작 날짜 (이 날짜 이후)
  date_to?: string;                 // 끝 날짜 (이 날짜 이전)
  min_amount?: number;              // 최소 금액 이상
  max_amount?: number;              // 최대 금액 이하
  merchant?: string;                // 특정 거래처만 조회
}

// 거래 통계 요약
export interface TransactionStats {
  total_income: number;            // 총 수입 금액
  total_expense: number;           // 총 지출 금액
  net_amount: number;              // 순 자산 (수입 - 지출)
  transaction_count: number;       // 총 거래 건수
  average_transaction: number;     // 거래당 평균 금액
  largest_expense: number;         // 가장 큰 지출 금액
  largest_income: number;          // 가장 큰 수입 금액
}

// 월별 거래 데이터 요약
export interface MonthlyTransactionSummary {
  year: number;                    // 년도
  month: number;                   // 월 (1-12)
  total_income: number;            // 해당 월 총 수입
  total_expense: number;           // 해당 월 총 지출
  net_amount: number;              // 해당 월 순 자산
  transaction_count: number;       // 해당 월 거래 건수
  top_expense_category: Category;  // 가장 많이 지출한 카테고리
  top_income_category: Category;   // 가장 많이 수입이 있었던 카테고리
}

// 카테고리별 거래 데이터 요약
export interface CategoryTransactionSummary {
  category_key: Category;          // 카테고리 키
  category_name: string;           // 카테고리 한국어 이름
  transaction_type: TransactionType; // 거래 유형
  total_amount: number;            // 해당 카테고리 총 금액
  transaction_count: number;       // 해당 카테고리 거래 건수
  average_amount: number;          // 해당 카테고리 평균 거래 금액
  percentage_of_total: number;     // 전체 거래대비 비율 (0-100)
}

// 월별 통계 타입
export interface MonthlyStats {
  year: number;                   // 년도
  month: number;                  // 월 (1-12)
  income: {
    total: number;                // 총 수입 금액
    categories: Array<{ 
      category_key: Category;     // 카테고리 키
      amount: number;             // 카테고리별 수입 금액
      count: number;              // 카테고리별 거래 건수
    }>;
  };
  expense: {
    total: number;                // 총 지출 금액
    categories: Array<{
      category_key: Category;     // 카테고리 키
      amount: number;             // 카테고리별 지출 금액
      count: number;              // 카테고리별 거래 건수
    }>;
  };
}

// 카테고리별 통계 타입
export interface CategoryStats {
  category_key: Category;         // 카테고리 키
  category_name: string;          // 카테고리 이름
  total_amount: number;          // 총 거래 금액
  transaction_count: number;     // 거래 건수
  average_amount: number;        // 평균 거래 금액
  percentage_of_total: number;   // 전체 대비 비율 (0-100)
}
