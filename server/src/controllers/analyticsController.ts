import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const analyticsController = {
  /**
   * Fetch aggregated analytics dashboard numbers
   */
  async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      // Aggregate Conversations
      const totalConversations = await prisma.conversation.count({ where: { businessId } });
      const urgentConversations = await prisma.conversation.count({ where: { businessId, urgency: 'urgent' } });
      const importantConversations = await prisma.conversation.count({ where: { businessId, urgency: 'important' } });
      
      const channelSMS = await prisma.conversation.count({ where: { businessId, channel: 'sms' } });
      const channelWeb = await prisma.conversation.count({ where: { businessId, channel: 'chat' } });
      const channelInsta = await prisma.conversation.count({ where: { businessId, channel: 'instagram' } });
      const channelWhatsApp = await prisma.conversation.count({ where: { businessId, channel: 'whatsapp' } });
      const channelCall = await prisma.conversation.count({ where: { businessId, channel: 'call' } });

      const resolvedConversations = await prisma.conversation.count({ where: { businessId, status: 'resolved' } });
      const activeConversations = await prisma.conversation.count({ where: { businessId, status: 'active' } });

      // Calls count
      const calls = await prisma.call.findMany({
        where: { conversation: { businessId } },
      });
      const totalCalls = calls.length;
      const missedCalls = calls.filter((c: any) => c.status === 'missed').length;
      const completedCalls = calls.filter((c: any) => c.status === 'completed').length;

      // Messages Handled by AI vs Human
      const messages = await prisma.message.findMany({
        where: { conversation: { businessId } },
      });
      const totalMessages = messages.length;
      const aiMessages = messages.filter((m: any) => m.sender === 'ai').length;
      const customerMessages = messages.filter((m: any) => m.sender === 'customer').length;
      const humanAgentMessages = messages.filter((m: any) => m.sender === 'human' && !m.isNote).length;

      // Escalation metrics
      const escalationsCount = await prisma.escalation.count({
        where: { conversation: { businessId } },
      });

      // Simulated timeline details
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const lastSevenDaysCalls = await prisma.call.findMany({
        where: {
          conversation: { businessId },
          createdAt: { gte: sevenDaysAgo }
        }
      });

      const lastSevenDaysMessages = await prisma.message.findMany({
        where: {
          conversation: { businessId },
          createdAt: { gte: sevenDaysAgo }
        }
      });

      // Group calls and messages by day (past 7 days)
      const callsMap: { [dateStr: string]: number } = {};
      const messagesMap: { [dateStr: string]: number } = {};

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        callsMap[dateStr] = 0;
        messagesMap[dateStr] = 0;
      }

      lastSevenDaysCalls.forEach((c: any) => {
        const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (callsMap[dateStr] !== undefined) {
          callsMap[dateStr]++;
        }
      });

      lastSevenDaysMessages.forEach((m: any) => {
        const dateStr = new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (messagesMap[dateStr] !== undefined) {
          messagesMap[dateStr]++;
        }
      });

      const callsOverTime = Object.keys(callsMap).map(date => ({
        date,
        calls: callsMap[date]
      }));

      const messagesOverTime = Object.keys(messagesMap).map(date => ({
        date,
        messages: messagesMap[date]
      }));

      const channelsData = [
        { name: 'Website Chat', value: channelWeb },
        { name: 'SMS Texting', value: channelSMS },
        { name: 'WhatsApp', value: channelWhatsApp },
        { name: 'Instagram DM', value: channelInsta },
        { name: 'Phone Voice', value: channelCall },
      ];

      const handlingData = [
        { name: 'AI Auto-Answered', value: aiMessages },
        { name: 'Human Takeover', value: humanAgentMessages },
      ];

      const normalcyCount = totalConversations - urgentConversations - importantConversations;
      const urgencyDistribution = [
        { name: 'Normal Queries', value: normalcyCount >= 0 ? normalcyCount : 0 },
        { name: 'Important (Booking etc.)', value: importantConversations },
        { name: 'Urgent Alert Escalated', value: urgentConversations },
      ];

      return res.json({
        stats: {
          totalConversations,
          urgentConversations,
          totalCalls,
          missedCalls,
          completedCalls,
          totalMessages,
          aiMessagesCount: aiMessages,
          humanAgentMessagesCount: humanAgentMessages,
          customerMessagesCount: customerMessages,
          escalationsCount,
          avgResponseTime: '2.4s (AI) / 4.8m (Human)',
          aiHandlingRate: totalConversations ? Math.round(((totalConversations - escalationsCount) / totalConversations) * 100) : 100,
        },
        charts: {
          callsOverTime,
          messagesOverTime,
          channelsData,
          handlingData,
          urgencyDistribution,
        },
      });
    } catch (error) {
      console.error('Error compiling analytics:', error);
      return res.status(500).json({ error: 'Failed to aggregate analytics.' });
    }
  },
};
