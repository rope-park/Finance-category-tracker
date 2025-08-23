// notificationService.ts
import { NotificationRepository, CreateNotificationData, Notification } from '../repositories/NotificationRepository';

export class NotificationService {
  private static repo = new NotificationRepository();

  static async sendNotification(data: CreateNotificationData): Promise<Notification> {
    return this.repo.createNotification(data);
  }

  static async getUserNotifications(user_id: number, onlyUnread = false): Promise<Notification[]> {
    return this.repo.getUserNotifications(user_id, onlyUnread);
  }

  static async markAsRead(id: number, user_id: number): Promise<boolean> {
    return this.repo.markAsRead(id, user_id);
  }
}
