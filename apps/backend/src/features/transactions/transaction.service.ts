/**
 * 거래 관리 서비스
 * 
 * 사용자의 모든 금융 거래(수입, 지출, 이체 등) 관리하는 핵심 서비스.
 * 거래 데이터의 CRUD 작업과 필터링, 검색 기능 제공.
 * 
 * 주요 기능:
 * - 거래 내역 조회 및 필터링
 * - 새로운 거래 등록 및 카테고리 자동 분류
 * - 거래 정보 수정 및 삭제
 * - 거래 내역 검색 및 정렬
 * 
 * @author Ju Eul Park (rope-park)
 */

import { TransactionRepository, CreateTransactionData, UpdateTransactionData, TransactionFilters, TransactionRecord } from './transaction.repository';

/**
 * 거래 관리 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직 분리.
 * 모든 거래 관련 작업을 처리하는 중심 서비스 레이어.
 */
export class TransactionService {
  /** 거래 데이터 접근을 위한 리포지토리 인스턴스 */
  private static repo = new TransactionRepository();

  /**
   * 사용자의 거래 내역 조회
   * 
   * 다양한 필터 옵션을 사용하여 거래를 검색하고 정렬.
   * 카테고리, 기간, 금액 범위, 거래 유형 등으로 필터링 가능.
   * 
   * @param userId - 거래를 조회할 사용자 ID
   * @param filters - 검색 필터 옵션 (기간, 카테고리, 금액 등)
   * @returns 필터링된 거래 목록과 전체 개수
   */
  static async getTransactions(userId: string, filters: TransactionFilters = {}): Promise<{ transactions: TransactionRecord[]; total: number }> {
    return this.repo.findWithFilters({ ...filters, user_id: userId });
  }

  /**
   * 특정 거래를 ID로 조회
   * 
   * 단일 거래를 고유 ID로 조회.
   * 
   * @param transactionId - 조회할 거래 ID
   * @param userId - 거래 소유자 ID (보안 검사용)
   * @returns 거래 객체 (없으면 null)
   */
  static async getTransactionById(transactionId: string, userId: string): Promise<TransactionRecord | null> {
    return this.repo.findById(transactionId, userId);
  }

  /**
   * 새로운 거래 등록
   * 
   * 사용자가 새로운 거래 등록.
   * 
   * @param data - 거래 생성에 필요한 데이터
   * @returns 생성된 거래 객체
   */
  static async createTransaction(data: CreateTransactionData): Promise<TransactionRecord> {
    return this.repo.createTransaction(data);
  }

  /**
   * 기존 거래 수정
   * 
   * 사용자가 등록한 거래 정보 수정.
   * 
   * @param transactionId - 수정할 거래 ID
   * @param userId - 거래 소유자 ID (보안 검사용)
   * @param data - 수정할 데이터
   * @returns 수정된 거래 객체 (실패 시 null)
   */
  static async updateTransaction(transactionId: string, userId: string, data: UpdateTransactionData): Promise<TransactionRecord | null> {
    return this.repo.updateTransaction(transactionId, userId, data);
  }

  /**
   * 거래 삭제
   * 
   * 사용자가 등록한 거래 삭제.
   * 
   * @param transactionId - 삭제할 거래 ID
   * @param userId - 거래 소유자 ID (보안 검사용)
   * @returns 삭제 성공 여부
   */
  static async deleteTransaction(transactionId: string, userId: string): Promise<boolean> {
    return this.repo.deleteTransaction(transactionId, userId);
  }


  /**
   * 거래 통계 조회
   * 
   * 사용자의 거래 내역에 대한 통계 정보를 조회.
   * 
   * @param userId - 통계를 조회할 사용자 ID
   * @param startDate - 통계 시작일 (선택 사항)
   * @param endDate - 통계 종료일 (선택 사항)
   * @returns 거래 통계 객체
   */
  static async getTransactionStats(userId: string, startDate?: Date, endDate?: Date) {
    return this.repo.getStatistics(userId, startDate, endDate);
  }

  /**
   * 상위 카테고리별 거래 요약 조회
   * 
   * 사용자의 거래 내역을 상위 카테고리별로 요약하여 제공.
   * 
   * @param userId - 거래 요약을 조회할 사용자 ID
   * @param startDate - 조회 시작일 (선택 사항)
   * @param endDate - 조회 종료일 (선택 사항)
   * @returns 상위 카테고리별 거래 요약 정보
   */
    static async getTopCategories(userId: number, startDate?: Date, endDate?: Date) {
      return this.repo.getCategorySummary(userId, startDate, endDate);
    }
  }
