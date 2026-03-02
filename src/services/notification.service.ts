import { AppDataSource } from "../config/database";
import { Notification } from "../entities/Notification";
import { NotificationType } from "../types";

const notifRepo = () => AppDataSource.getRepository(Notification);

export class NotificationService {
  static async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedLoadId?: string;
  }): Promise<Notification> {
    const notif = notifRepo().create({
      ...data,
      relatedLoadId: data.relatedLoadId || null,
    });
    return notifRepo().save(notif);
  }

  static async getForUser(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ notifications: Notification[]; total: number; unread: number }> {
    const [notifications, total] = await notifRepo().findAndCount({
      where: { userId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unread = await notifRepo().count({ where: { userId, isRead: false } });
    return { notifications, total, unread };
  }

  static async markRead(notifId: string, userId: string): Promise<void> {
    await notifRepo().update({ id: notifId, userId }, { isRead: true });
  }

  static async markAllRead(userId: string): Promise<void> {
    await notifRepo().update({ userId, isRead: false }, { isRead: true });
  }
}
