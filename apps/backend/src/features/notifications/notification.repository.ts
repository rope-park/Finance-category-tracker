/**
 * 알림 데이터 접근 레이어 (Repository)
 *
 * 사용자의 알림 데이터에 대한 데이터베이스 작업을 처리하는 데이터 접근 계층.
 *
 * 주요 기능:
 * - 알림 CRUD 작업 및 데이터 정합성 보장
 * - 사용자별 알림 관리 및 접근 권한 제어
 * - 읽음/안읽음 상태 관리
 * - 다양한 알림 유형 지원 (예: 거래 알림, 목표 달성 알림 등)
 * 
 * @author Ju Eul Park (rope-park)
 */
import { BaseRepository } from '../../shared/repositories/BaseRepository';

/**
 * 알림 인터페이스
 * 
 * 데이터베이스의 알림 테이블 구조를 반영.
 * 각 필드는 알림의 속성을 나타내며, 사용자에게 전달되는 알림 정보를 포함.
 */
export interface Notification {
  id: number;          // 알림 고유 ID
  user_id: number;     // 알림을 받을 사용자 ID
  type: string;        // 알림 유형 (예: 'transaction', 'goal', 'reminder' 등)
  message: string;     // 알림 메시지 내용
  is_read: boolean;    // 읽음 상태
  created_at: Date;    // 생성일시
  read_at?: Date;      // 읽음일시 (선택적)
}

/**
 * 새로운 알림 생성 데이터 인터페이스
 * 
 * 새로운 알림을 생성할 때 필요한 데이터 구조.
 * 자동 생성되는 필드(ID, 생성일시 등) 제외.
 */
export interface CreateNotificationData {
  user_id: number;    // 알림을 받을 사용자 ID
  type: string;       // 알림 유형 (예: 'transaction', 'goal', 'reminder' 등)
  message: string;    // 알림 메시지 내용
}

/**
 * 알림 리포지토리 클래스
 * 
 * BaseRepository를 확장하여 알림 관련 데이터베이스 작업 구현.
 * 사용자 알림 생성, 조회, 읽음 상태 업데이트 등의 기능 제공.
 */
export class NotificationRepository extends BaseRepository {
  private readonly tableName = 'notifications';

  /**
   * 새로운 알림 생성
   * @param data - 생성할 알림 데이터
   * @return 생성된 알림 객체
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    return await super.create<Notification>(this.tableName, data);
  }

  /**
   * 사용자 알림 목록 조회
   * @param user_id - 알림을 조회할 사용자 ID
   * @param onlyUnread - 읽지 않은 알림만 조회할지 여부
   * @return 사용자 알림 목록
   */
  async getUserNotifications(user_id: number, onlyUnread = false): Promise<Notification[]> {
    const where: any = { user_id };
    if (onlyUnread) where.is_read = false;
    return await super.findMany<Notification>(this.tableName, where, 'created_at DESC');
  }

  /**
   * 알림 읽음 상태로 표시
   * @param id - 읽음 상태로 변경할 알림 ID
   * @param user_id - 알림 소유자 사용자 ID (보안 검증용)
   * @return 성공 여부
   */
  async markAsRead(id: number, user_id: number): Promise<boolean> {
    const result = await super.update<Notification>(this.tableName, { is_read: true, read_at: new Date() }, { id, user_id });
    return !!result;
  }
}