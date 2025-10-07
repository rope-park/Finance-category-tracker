/**
 * 목표 설정 데이터 접근 레이어 (Repository)
 * 
 * 사용자의 재정 목표 설정과 관리에 관련된 모든 데이터베이스 작업 처리.
 * 저축 목표, 지출 목표 등 다양한 재정 목표 추적 및 관리 기능 제공.
 * 
 * 주요 기능:
 * - 목표 CRUD 작업 및 데이터 정합성 보장
 * - 사용자별 목표 관리 및 접근 권한 제어
 * - 목표 달성률 추적 및 진행 상황 모니터링
 * - 카테고리별, 기간별 목표 설정 지원
 * 
 * @author Ju Eul Park (rope-park)
 */
import pool from '../../core/config/database';

/**
 * 목표 설정 데이터 접근 클래스
 * 
 * PostgreSQL 데이터베이스와 연동하여 사용자의 재정 목표 데이터 관리.
 * 각 메서드는 사용자 권한을 검증하여 본인의 목표만 접근할 수 있도록 보장.
 */
export class GoalRepository {
  /**
   * 새로운 목표 생성 메서드
   * 
   * 사용자가 설정한 재정 목표를 데이터베이스에 저장.
   * 카테고리, 목표 금액, 기간, 시작일 등의 정보 포함.
   * 
   * @param userId - 목표를 생성하는 사용자 ID
   * @param data - 목표 생성에 필요한 데이터 객체
   * @param data.category_key - 목표가 적용될 카테고리 키
   * @param data.target_amount - 목표 금액
   * @param data.period - 목표 달성 기간 (monthly, yearly 등)
   * @param data.start_date - 목표 시작일
   * @param data.description - 목표 설명 (선택사항)
   * @returns 생성된 목표 객체
   */
  async create(userId: number, data: any) {
    const { category_key, target_amount, period, start_date, description } = data;
    const result = await pool.query(
      `INSERT INTO goals (user_id, category_key, target_amount, period, start_date, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, category_key, target_amount, period, start_date, description || null]
    );
    return result.rows[0];
  }

  /**
   * 사용자의 모든 목표 조회 메서드
   * 
   * 특정 사용자가 설정한 모든 목표를 시작일 역순으로 정렬하여 반환.
   * 최근에 설정한 목표가 먼저 표시되도록 구성.
   * 
   * @param userId - 목표를 조회할 사용자 ID
   * @returns 사용자의 모든 목표 배열
   */
  async findAll(userId: number) {
    const result = await pool.query(
      `SELECT * FROM goals WHERE user_id = $1 ORDER BY start_date DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * 특정 목표를 ID로 조회 메서드
   * 
   * 목표 ID와 사용자 ID를 함께 검증하여 본인의 목표만 조회 가능.
   * 목표 상세 정보 조회나 수정/삭제 전 검증에 사용.
   * 
   * @param userId - 목표를 조회할 사용자 ID
   * @param id - 조회할 목표의 ID
   * @returns 해당 목표 객체 (없으면 undefined)
   */
  async findById(userId: number, id: string) {
    const result = await pool.query(
      `SELECT * FROM goals WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0];
  }

  /**
   * 기존 목표 수정 메서드
   * 
   * 사용자가 설정한 목표의 정보를 업데이트.
   * 모든 필드를 함께 업데이트하며, 사용자 권한을 검증하여 본인의 목표만 수정 가능.
   * 
   * @param userId - 목표를 수정할 사용자 ID
   * @param id - 수정할 목표의 ID
   * @param data - 수정할 목표 데이터 객체
   * @returns 수정된 목표 객체
   */
  async update(userId: number, id: string, data: any) {
    const { category_key, target_amount, period, start_date, description } = data;
    const result = await pool.query(
      `UPDATE goals SET category_key = $1, target_amount = $2, period = $3, start_date = $4, description = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [category_key, target_amount, period, start_date, description || null, id, userId]
    );
    return result.rows[0];
  }

  /**
   * 목표 삭제 메서드
   * 
   * 사용자가 설정한 목표를 완전히 삭제.
   * 사용자 권한을 검증하여 본인의 목표만 삭제 가능.
   * 
   * @param userId - 목표를 삭제할 사용자 ID
   * @param id - 삭제할 목표의 ID
   * @returns 삭제된 목표 객체
   */
  async delete(userId: number, id: string) {
    const result = await pool.query(
      `DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }
}