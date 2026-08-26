import { prisma } from '../../config/db';

class NotificationServiceImpl {
  async createNotification(
    type: 'urgent_conversation' | 'missed_call' | 'new_message' | 'ai_escalation' | 'ai_failed',
    title: string,
    message: string,
    conversationId?: string
  ) {
    console.log(`🔔 [NotificationService] Creating alert: [${type}] ${title} - ${message}`);
    return prisma.notification.create({
      data: {
        type,
        title,
        message,
        conversationId,
        isRead: false,
      },
    });
  }

  async getUnreadNotifications() {
    return prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: true
      }
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead() {
    return prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationServiceImpl();
