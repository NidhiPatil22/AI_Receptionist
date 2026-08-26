import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { messagingService } from '../services/messaging/messagingService';
import { voiceService } from '../services/voice/voiceService';

export const webhookController = {
  /**
   * Simulates receiving a customer DM/SMS message
   */
  async simulateMessage(req: Request, res: Response) {
    try {
      const { businessId, customerName, customerPhone, customerEmail, channel, content } = req.body;

      if (!businessId || !channel || !content) {
        return res.status(400).json({ error: 'businessId, channel, and content are required for simulation.' });
      }

      const result = await messagingService.receiveMessage(
        businessId,
        customerName || 'Demo Customer',
        customerPhone || '+1 (555) 000-0000',
        customerEmail || 'demo@example.com',
        channel,
        content
      );

      return res.json(result);
    } catch (error) {
      console.error('Simulation message error:', error);
      return res.status(500).json({ error: 'Simulation message failed.' });
    }
  },

  /**
   * Simulates initiating or speaking on a voice call
   */
  async simulateCallSpeak(req: Request, res: Response) {
    try {
      const { businessId, customerPhone, customerName, speechContent, conversationId } = req.body;

      if (!businessId || !speechContent) {
        return res.status(400).json({ error: 'businessId and speechContent are required.' });
      }

      let activeConvId = conversationId;

      // If no conversationId is active, initiate a call
      if (!activeConvId) {
        const phone = customerPhone || '+1 (555) 111-2222';
        const name = customerName || 'Simulated Caller';
        
        // Initiate call conversation
        const callPayload = await voiceService.initiateCall(businessId, phone, name);
        activeConvId = callPayload.conversationId;
      }

      // Generate voice reply (which adds messages and appends transcripts)
      const aiVoiceReply = await voiceService.generateResponse(activeConvId, speechContent);

      const conversation = await prisma.conversation.findUnique({
        where: { id: activeConvId },
        include: {
          messages: { orderBy: { timestamp: 'asc' } },
          calls: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      });

      return res.json({
        conversation,
        aiVoiceReply,
      });
    } catch (error) {
      console.error('Simulation call speech error:', error);
      return res.status(500).json({ error: 'Simulation voice call failed.' });
    }
  },

  /**
   * Simulates ending a voice call
   */
  async simulateEndCall(req: Request, res: Response) {
    try {
      const { conversationId, duration } = req.body;

      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId is required.' });
      }

      const call = await prisma.call.findFirst({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
      });

      if (call) {
        await voiceService.endCall(call.id, duration || 45);
      }

      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: 'resolved' }, // Resolve the call conversation once hung up
      });

      return res.json({ success: true, conversation });
    } catch (error) {
      console.error('Simulation end call error:', error);
      return res.status(500).json({ error: 'Failed to end call.' });
    }
  }
};
