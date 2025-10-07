/**
 * 반복 거래 템플릿 서비스
 *
 * 정기적으로 반복되는 거래(월급, 구독료, 공과금 등) 미리 설정하고 관리하는 서비스.
 * 사용자가 매번 수동으로 입력할 필요 없이 자동으로 거래가 생성되도록 도와주는 편의 기능.
 * 
 * 주요 기능:
 * - 반복 거래 템플릿 생성 및 관리
 * - 다양한 반복 주기 지원 (매일, 매주, 매월, 매년)
 * - 반복 거래 예약 및 실행 시점 관리
 * - 템플릿 활성화/비활성화 관리
 * 
 * @author Ju Eul Park (rope-park)
 */

import { RecurringTemplateRepository, CreateRecurringTemplateData } from './recurring-template.repository';

/**
 * 반복 거래 템플릿 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직 분리.
 * 사용자는 반복 거래 템플릿을 CRUD 작업으로 관리함.
 */
export class RecurringTemplateService {
  /** 반복 템플릿 데이터 접근을 위한 리포지토리 인스턴스 */
  private static repo = new RecurringTemplateRepository();

  /**
   * 새로운 반복 거래 템플릿 생성 메서드
   * 
   * 사용자가 정기적으로 발생하는 거래(월급, 구독료 등)를 템플릿으로 등록.
   * 등록된 템플릿은 스케줄러에 의해 자동으로 실제 거래로 변환됨.
   * 
   * @param data - 반복 템플릿 생성 데이터 (사용자 ID, 금액, 주기, 설명 등)
   * @returns 생성된 템플릿 객체
   */
  static async createTemplate(data: CreateRecurringTemplateData) {
    return this.repo.createTemplate(data);
  }

  /**
   * 특정 사용자의 모든 반복 템플릿 조회
   * 
   * 사용자가 등록한 모든 반복 거래 템플릿을 목록으로 반환.
   * 활성/비활성 상태와 관계없이 모든 템플릿을 조회.
   * 
   * @param userId - 템플릿을 조회할 사용자 ID
   * @returns 사용자의 반복 템플릿 목록
   */
  static async getTemplates(userId: number) {
    return this.repo.findByUser(userId);
  }

  /**
   * 기존 반복 템플릿 수정
   * 
   * 이미 등록된 템플릿의 정보(금액, 주기, 설명 등) 수정.
   * 부분 업데이트를 지원하여 필요한 필드만 변경 가능.
   * 
   * @param id - 수정할 템플릿 ID
   * @param userId - 템플릿 소유자 ID (보안 검사용)
   * @param data - 수정할 데이터 (부분적 업데이트 지원)
   * @returns 수정된 템플릿 객체
   */
  static async updateTemplate(id: number, userId: number, data: Partial<CreateRecurringTemplateData>) {
    return this.repo.updateTemplate(id, userId, data);
  }

  /**
   * 반복 템플릿 삭제
   * 
   * 더 이상 사용하지 않는 반복 거래 템플릿을 완전히 삭제.
   * 사용자 권한 검사를 통해 본인의 템플릿만 삭제 가능.
   * 
   * @param id - 삭제할 템플릿 ID
   * @param userId - 템플릿 소유자 ID (보안 검사용)
   * @returns 삭제 성공 여부
   */
  static async deleteTemplate(id: number, userId: number) {
    return this.repo.deleteTemplate(id, userId);
  }
}