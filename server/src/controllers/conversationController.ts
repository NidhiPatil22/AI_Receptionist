import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { messagingService } from '../services/messaging/messagingService';
import { notificationService } from '../services/notifications/notificationService';

export const conversationController = {
  /**
   * List business conversations (supports search, channel, urgency, status filters)
   */
  async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      const { status, urgency, channel, search } = req.query;

      const conversations = await prisma.conversation.findMany({
        where: {
          businessId,
          status: status ? String(status) : undefined,
          urgency: urgency ? String(urgency) : undefined,
          channel: channel ? String(channel) : undefined,
          OR: search ? [
            { customerName: { contains: String(search) } },
            { customerPhone: { contains: String(search) } },
            { customerEmail: { contains: String(search) } },
          ] : undefined,
        },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1, // Get only the last message for inbox listing preview
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      return res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to retrieve conversations.' });
    }
  },

  /**
   * Fetch single conversation details with messages list
   */
  async getConversationDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
          calls: {
            orderBy: { createdAt: 'desc' },
          },
          escalations: true,
        },
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      // Mark notification read as well
      await prisma.notification.updateMany({
        where: { conversationId: id, isRead: false },
        data: { isRead: true },
      });

      return res.json(conversation);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      return res.status(500).json({ error: 'Failed to retrieve conversation details.' });
    }
  },

  /**
   * Post standard message (either AI or Human reply)
   */
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params; // Conversation ID
      const { content, sender } = req.body; // sender: 'ai' or 'human'

      if (!content || !sender) {
        return res.status(400).json({ error: 'Content and sender fields are required.' });
      }

      const msg = await messagingService.sendMessage(id, content, sender);
      
      // If human agent typed a message, mark requiresHuman = true or status active
      if (sender === 'human') {
        await prisma.conversation.update({
          where: { id },
          data: {
            requiresHuman: true,
            status: 'active',
          },
        });
      }

      return res.status(201).json(msg);
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Failed to send message.' });
    }
  },

  /**
   * Add internal agent note (invisible to customer chat)
   */
  async addInternalNote(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Note content is required.' });
      }

      const note = await prisma.message.create({
        data: {
          sender: 'human',
          content,
          isNote: true,
          conversationId: id,
        },
      });

      await prisma.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() },
      });

      return res.status(201).json(note);
    } catch (error) {
      console.error('Error adding internal note:', error);
      return res.status(500).json({ error: 'Failed to save internal note.' });
    }
  },

  /**
   * Resolve / Archive conversation
   */
  async resolveConversation(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'resolved' or 'active'

      const updated = await prisma.conversation.update({
        where: { id },
        data: {
          status: status || 'resolved',
          requiresHuman: status === 'active', // If reactivated, might need attention
        },
      });

      // Update escalations linked to it
      if (status === 'resolved' || !status) {
        await prisma.escalation.updateMany({
          where: { conversationId: id, status: 'pending' },
          data: { status: 'resolved', resolvedAt: new Date() },
        });
      }

      return res.json(updated);
    } catch (error) {
      console.error('Error updating status:', error);
      return res.status(500).json({ error: 'Failed to update conversation status.' });
    }
  },

  /**
   * Manually take over from AI Receptionist
   */
  async takeover(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const updated = await prisma.conversation.update({
        where: { id },
        data: {
          requiresHuman: true,
        },
      });

      return res.json(updated);
    } catch (error) {
      console.error('Error taking over conversation:', error);
      return res.status(500).json({ error: 'Failed to execute takeover.' });
    }
  },

  /**
   * Fetch unread alerts
   */
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const alerts = await notificationService.getUnreadNotifications();
      return res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return res.status(500).json({ error: 'Failed to retrieve notification alerts.' });
    }
  },

  /**
   * Read notification logs
   */
  async markNotificationRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const alert = await notificationService.markAsRead(id);
      return res.json(alert);
    } catch (error) {
      console.error('Error reading alert:', error);
      return res.status(500).json({ error: 'Failed to update alert.' });
    }
  },

  /**
   * Read all notifications
   */
  async markAllNotificationsRead(req: AuthenticatedRequest, res: Response) {
    try {
      await notificationService.markAllAsRead();
      return res.json({ success: true });
    } catch (error) {
      console.error('Error reading all alerts:', error);
      return res.status(500).json({ error: 'Failed to read all alerts.' });
    }
  }
};
