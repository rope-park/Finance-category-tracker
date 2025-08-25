// NotificationRepository.ts
import { BaseRepository } from './BaseRepository';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

export interface CreateNotificationData {
  user_id: number;
  type: string;
  message: string;
}

export class NotificationRepository extends BaseRepository {
  private readonly tableName = 'notifications';

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    return await super.create<Notification>(this.tableName, data);
  }

  async getUserNotifications(user_id: number, onlyUnread = false): Promise<Notification[]> {
    const where: any = { user_id };
    if (onlyUnread) where.is_read = false;
    return await super.findMany<Notification>(this.tableName, where, 'created_at DESC');
  }

  async markAsRead(id: number, user_id: number): Promise<boolean> {
    const result = await super.update<Notification>(this.tableName, { is_read: true, read_at: new Date() }, { id, user_id });
    return !!result;
  }
}