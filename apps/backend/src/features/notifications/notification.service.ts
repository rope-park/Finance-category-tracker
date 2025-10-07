/**
 * 알림 서비스 비즈니스 로직
 * 
 * 사용자에게 중요한 정보를 실시간으로 전달하는 알림 시스템의 핵심 비즈니스 로직.
 * 예산 초과, 목표 달성, 시스템 중요 이벤트 등을 사용자에게 효율적으로 알려주는 역할.
 * 
 * 주요 기능:
 * - 다양한 유형의 알림 생성 및 전송
 * - 사용자별 알림 내역 관리
 * - 읽음/읽지 않음 상태 관리
 * - 알림 필터링 및 정렬 기능
 * 
 * @author Ju Eul Park (rope-park)
 */

import { NotificationRepository, CreateNotificationData, Notification } from './notification.repository';

/**
 * 알림 서비스 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근 로직과 분리된 비즈니스 로직을 제공.
 * 정적 메서드로 구성되어 인스턴스 생성 없이 사용 가능.
 */
export class NotificationService {
    private static repo = new NotificationRepository();

  /**
   * 새로운 알림을 생성하고 전송하는 메서드
   * 
   * 시스템 전반에서 사용자에게 중요한 정보를 알리기 위해 호출됨.
   * 예산 초과, 목표 달성, 보안 알림 등 다양한 상황에서 사용.
   * 
   * @param data - 알림 생성에 필요한 데이터 (사용자 ID, 알림 유형, 메시지)
   * @returns 생성된 알림 객체
   */
  static async sendNotification(data: CreateNotificationData): Promise<Notification> {
    return this.repo.createNotification(data);
  }

  /**
   * 사용자의 알림 내역을 조회하는 메서드
   * 
   * 사용자가 자신의 알림을 확인하거나 알림 목록을 표시할 때 사용.
   * 읽지 않은 알림만 필터링하여 조회할 수도 있음.
   * 
   * @param user_id - 알림을 조회할 사용자 ID
   * @param onlyUnread - true이면 읽지 않은 알림만 조회 (기본값: false)
   * @returns 사용자의 알림 목록 (최신 순)
   */
  static async getUserNotifications(user_id: number, onlyUnread = false): Promise<Notification[]> {
    return this.repo.getUserNotifications(user_id, onlyUnread);
  }

  /**
   * 특정 알림을 읽음 상태로 표시하는 메서드
   * 
   * 사용자가 알림을 클릭하거나 확인했을 때 호출되어
   * 해당 알림의 읽음 상태를 업데이트하고 읽음 시각을 기록.
   * 
   * @param id - 읽음 처리할 알림 ID
   * @param user_id - 알림 소유자 ID (보안을 위한 권한 검사)
   * @returns 성공 여부
   */
  static async markAsRead(id: number, user_id: number): Promise<boolean> {
    return this.repo.markAsRead(id, user_id);
  }
}