/**
 * 반복 거래 템플릿 데이터 접근 레이어 (Repository)
 * 
 * 사용자가 설정한 반복 거래 템플릿 관리 데이터 접근 레이어.
 * 월세, 통신비, 구독료 등 정기적인 거래를 자동화로 사용자 편의성 제공.
 * 
 * 주요 기능:
 * - 반복 거래 템플릿 CRUD 작업
 * - 다양한 반복 주기 지원 (일별, 주별, 월별, 연별)
 * - 다음 실행 예정일 자동 계산
 * - 템플릿 활성/비활성 상태 관리
 * 
 * 반복 주기 예시:
 * - 일별: 매일 커피 구매
 * - 주별: 매주 장보기
 * - 월별: 월세, 통신비, 구독료
 * - 연별: 보험료, 연회비
 * 
 * @author Ju Eul Park (rope-park)
 */

import { BaseRepository } from '../../shared/repositories/BaseRepository';

/**
 * 반복 거래 템플릿 인터페이스
 * 
 * 데이터베이스의 반복 거래 템플릿 테이블 구조 반영.
 * 각 필드는 템플릿의 속성을 나타내며, 사용자가 설정한 반복 거래 정보를 포함.
 */
export interface RecurringTemplate {
  id: number;           // 템플릿 고유 ID
  user_id: number;      // 소유자 사용자 ID
  category_key: number; // 거래 카테고리 키 (선택사항)
  transaction_type: 'income' | 'expense'; // 거래 유형
  amount: number;       // 거래 금액
  description?: string; // 거래 설명 (선택사항)
  merchant?: string;    // 가맹점 이름 (선택사항)
  start_date: Date;     // 반복 시작일
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; // 반복 주기 (선택사항)
  interval: number;     // 반복 간격 (선택사항)
  next_occurrence: Date; // 다음 실행 예정일 (선택사항)
  is_active: boolean;   // 활성 상태
  created_at: Date;     // 생성 일시
  updated_at: Date;     // 수정 일시
}

/**
 * 반복 거래 템플릿 생성 데이터 인터페이스
 * 
 * 새로운 반복 거래 템플릿 생성 시 필요한 데이터 구조.
 * 자동 생성되는 필드(ID, 생성일시 등) 제외.
 */
export interface CreateRecurringTemplateData {
  user_id: number;
  category_key: number;
  transaction_type: 'income' | 'expense';
  amount: number;
  description?: string;
  merchant?: string;
  start_date: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
}

/**
 * 반복 거래 템플릿 데이터 접근 클래스
 * 
 * BaseRepository를 상속받아 공통 데이터베이스 작업 기능 활용.
 * 반복 거래에 특화된 로직과 다음 실행일 계산 등 추가 구현.
 */
export class RecurringTemplateRepository extends BaseRepository {
  // 대상 테이블 이름
  private readonly tableName = 'recurring_templates';

  /**
   * 새로운 반복 거래 템플릿 생성
   * @param data 생성할 템플릿 데이터
   * @returns 생성된 템플릿 객체
   */
  async createTemplate(data: CreateRecurringTemplateData): Promise<RecurringTemplate> {
    return await super.create<RecurringTemplate>(this.tableName, {
      ...data,
      is_active: true,
      next_occurrence: data.start_date,
    });
  }

  /**
   * 사용자의 활성 반복 템플릿 목록 조회
   * @param user_id 사용자 ID
   * @returns 활성화된 반복 템플릿 배열
   */
  async findByUser(user_id: number): Promise<RecurringTemplate[]> {
    return await super.findMany<RecurringTemplate>(this.tableName, { user_id, is_active: true });
  }

  /**
   * 기존 반복 템플릿의 정보 업데이트
   * @param id 템플릿 ID
   * @param user_id 사용자 ID
   * @param data 업데이트할 데이터
   * @returns 업데이트된 템플릿 또는 null (없을 경우)
   */
  async updateTemplate(id: number, user_id: number, data: Partial<CreateRecurringTemplateData>): Promise<RecurringTemplate | null> {
    return await super.update<RecurringTemplate>(this.tableName, data, { id, user_id });
  }

  /**
   * 반복 템플릿 삭제
   * @param id 템플릿 ID
   * @param user_id 사용자 ID
   * @returns 삭제 성공 여부
   */
  async deleteTemplate(id: number, user_id: number): Promise<boolean> {
    return await super.delete(this.tableName, { id, user_id });
  }

  /**
   * 다음 실행 예정일 업데이트
   * @param id 템플릿 ID
   * @param next_occurrence 새로운 다음 실행 예정일
   */
  async updateNextOccurrence(id: number, next_occurrence: Date): Promise<void> {
    await this.db.query(
      `UPDATE recurring_templates SET next_occurrence = $1, updated_at = NOW() WHERE id = $2`,
      [next_occurrence, id]
    );
  }
}