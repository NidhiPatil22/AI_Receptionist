import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const analyticsController = {
  /**
   * Fetch aggregated analytics dashboard numbers from PostgreSQL
   */
  async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      console.log(`[ANALYTICS] authenticated businessId: ${businessId}`);

      // 1. Query Real Database Counts for Authenticated Business
      const totalConversations = await prisma.conversation.count({ where: { businessId } });
      const urgentConversations = await prisma.conversation.count({ where: { businessId, urgency: 'urgent' } });
      const importantConversations = await prisma.conversation.count({ where: { businessId, urgency: 'important' } });
      
      const channelSMS = await prisma.conversation.count({ where: { businessId, channel: 'sms' } });
      const channelWeb = await prisma.conversation.count({ where: { businessId, channel: 'chat' } });
      const channelInsta = await prisma.conversation.count({ where: { businessId, channel: 'instagram' } });
      const channelWhatsApp = await prisma.conversation.count({ where: { businessId, channel: 'whatsapp' } });
      const channelCall = await prisma.conversation.count({ where: { businessId, channel: 'call' } });

      // 2. Query Calls for Authenticated Business
      const calls = await prisma.call.findMany({
        where: { conversation: { businessId } },
      });
      const totalCalls = calls.length;
      const missedCalls = calls.filter((c: any) => c.status === 'missed').length;
      const completedCalls = calls.filter((c: any) => c.status === 'completed').length;

      // 3. Query Messages for Authenticated Business
      const messages = await prisma.message.findMany({
        where: { conversation: { businessId } },
        orderBy: { createdAt: 'asc' },
      });
      const totalMessages = messages.length;
      const aiMessages = messages.filter((m: any) => m.sender === 'ai').length;
      const customerMessages = messages.filter((m: any) => m.sender === 'customer').length;
      const humanAgentMessages = messages.filter((m: any) => m.sender === 'human' && !m.isNote).length;

      // 4. Query Escalations for Authenticated Business
      const escalationsCount = await prisma.escalation.count({
        where: { conversation: { businessId } },
      });

      // 5. Calculate Real Average Response Time from Message Timestamp Deltas
      let totalResponseTimeMs = 0;
      let responseCount = 0;
      const convMap: { [id: string]: typeof messages } = {};
      messages.forEach(m => {
        if (!convMap[m.conversationId]) convMap[m.conversationId] = [];
        convMap[m.conversationId].push(m);
      });

      Object.values(convMap).forEach(msgList => {
        for (let i = 1; i < msgList.length; i++) {
          const prev = msgList[i - 1];
          const curr = msgList[i];
          if (prev.sender === 'customer' && (curr.sender === 'ai' || curr.sender === 'human')) {
            const diff = curr.createdAt.getTime() - prev.createdAt.getTime();
            if (diff > 0 && diff < 86400000) { // under 24 hours
              totalResponseTimeMs += diff;
              responseCount++;
            }
          }
        }
      });

      let avgResponseTime = '0s';
      if (responseCount > 0) {
        const avgSeconds = totalResponseTimeMs / (responseCount * 1000);
        if (avgSeconds < 60) {
          avgResponseTime = `${avgSeconds.toFixed(1)}s`;
        } else {
          const mins = Math.floor(avgSeconds / 60);
          const secs = Math.round(avgSeconds % 60);
          avgResponseTime = `${mins}m ${secs}s`;
        }
      }

      // 6. Calculate Real AI Auto-Handling Rate
      const aiHandlingRate = totalConversations > 0
        ? Math.max(0, Math.min(100, Math.round(((totalConversations - escalationsCount) / totalConversations) * 100)))
        : 0;

      // 7. Timeline Charts (Past 7 Days) - Return Empty Array if Zero Data
      let callsOverTime: { date: string; calls: number }[] = [];
      if (totalCalls > 0) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const callsMap: { [dateStr: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          callsMap[dateStr] = 0;
        }

        calls.forEach((c: any) => {
          if (new Date(c.createdAt) >= sevenDaysAgo) {
            const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (callsMap[dateStr] !== undefined) {
              callsMap[dateStr]++;
            }
          }
        });

        callsOverTime = Object.keys(callsMap).map(date => ({
          date,
          calls: callsMap[date]
        }));
      }

      let messagesOverTime: { date: string; messages: number }[] = [];
      if (totalMessages > 0) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const messagesMap: { [dateStr: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          messagesMap[dateStr] = 0;
        }

        messages.forEach((m: any) => {
          if (new Date(m.createdAt) >= sevenDaysAgo) {
            const dateStr = new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (messagesMap[dateStr] !== undefined) {
              messagesMap[dateStr]++;
            }
          }
        });

        messagesOverTime = Object.keys(messagesMap).map(date => ({
          date,
          messages: messagesMap[date]
        }));
      }

      // 8. Breakdown Distributions - Return Empty Arrays if Zero Data
      let channelsData: { name: string; value: number }[] = [];
      if (totalConversations > 0) {
        const rawChannels = [
          { name: 'Website Chat', value: channelWeb },
          { name: 'SMS Texting', value: channelSMS },
          { name: 'WhatsApp', value: channelWhatsApp },
          { name: 'Instagram DM', value: channelInsta },
          { name: 'Phone Voice', value: channelCall },
        ];
        channelsData = rawChannels.filter(c => c.value > 0);
      }

      let handlingData: { name: string; value: number }[] = [];
      if (totalMessages > 0) {
        const rawHandling = [
          { name: 'AI Auto-Answered', value: aiMessages },
          { name: 'Human Takeover', value: humanAgentMessages },
        ];
        handlingData = rawHandling.filter(h => h.value > 0);
      }

      let urgencyDistribution: { name: string; value: number }[] = [];
      if (totalConversations > 0) {
        const normalcyCount = totalConversations - urgentConversations - importantConversations;
        const rawUrgency = [
          { name: 'Normal Queries', value: Math.max(0, normalcyCount) },
          { name: 'Important', value: importantConversations },
          { name: 'Urgent Alert Escalated', value: urgentConversations },
        ];
        urgencyDistribution = rawUrgency.filter(u => u.value > 0);
      }

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
          avgResponseTime,
          aiHandlingRate,
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
