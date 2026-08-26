import { prisma } from '../../config/db';
import { aiService } from '../ai/aiService';

export interface VoiceCallPayload {
  id: string;
  customerName?: string;
  customerPhone: string;
  status: string;
  duration: number;
  transcript: string;
  conversationId: string;
}

class VoiceServiceProviderImpl {
  /**
   * Initiates a phone call (can connect to Twilio or trigger a mock call simulator)
   */
  async initiateCall(businessId: string, customerPhone: string, customerName?: string): Promise<VoiceCallPayload> {
    console.log(`📞 [VoiceProvider] Initiating call to ${customerPhone} (${customerName || 'Unknown'})...`);
    
    // Create conversation for this call channel
    const conversation = await prisma.conversation.create({
      data: {
        customerName: customerName || 'Simulated Caller',
        customerPhone,
        channel: 'call',
        status: 'active',
        urgency: 'normal',
        businessId,
      },
    });

    // Create call record
    const call = await prisma.call.create({
      data: {
        duration: 0,
        status: 'ringing',
        conversationId: conversation.id,
        transcript: 'Call initiated. Ringing...',
      },
    });

    return {
      id: call.id,
      customerName: conversation.customerName || undefined,
      customerPhone,
      status: call.status,
      duration: call.duration,
      transcript: call.transcript || '',
      conversationId: conversation.id,
    };
  }

  /**
   * Handles incoming webhooks from Twilio/Vapi
   */
  async handleIncomingCall(businessId: string, fromNumber: string, callSid: string): Promise<string> {
    console.log(`📞 [VoiceProvider] Incoming webhook received from ${fromNumber} (Sid: ${callSid})`);
    
    // Check if we already have an active conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerPhone: fromNumber,
        status: 'active',
        businessId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerName: 'Phone Caller',
          customerPhone: fromNumber,
          channel: 'call',
          status: 'active',
          urgency: 'normal',
          businessId,
        },
      });
    }

    return conversation.id;
  }

  /**
   * Generates a voice-synthesized response transcript dialog
   */
  async generateResponse(conversationId: string, speechContent: string): Promise<string> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return 'Hello, thank you for calling. How can I help you?';

    // Store customer message in database
    await prisma.message.create({
      data: {
        sender: 'customer',
        content: speechContent,
        conversationId,
      },
    });

    // Determine AI response
    const history = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
    });

    const formattedHistory = history.map((h: any) => ({
      sender: h.sender,
      content: h.content,
    }));

    const responseText = await aiService.generateResponse(
      conversation.businessId,
      formattedHistory,
      speechContent
    );

    // Save AI response to DB
    await prisma.message.create({
      data: {
        sender: 'ai',
        content: responseText,
        conversationId,
      },
    });

    // Check and update urgency
    const urgencyInfo = await aiService.detectUrgency(speechContent);
    if (urgencyInfo.urgency === 'urgent') {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          urgency: 'urgent',
          urgencyReason: urgencyInfo.reason,
          requiresHuman: true,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          type: 'urgent_conversation',
          title: '🚨 Urgent Call Detected',
          message: `${conversation.customerName || 'Caller'} triggered escalation: "${speechContent.slice(0, 40)}..."`,
          conversationId,
        },
      });
    }

    // Append to call transcript log
    const call = await prisma.call.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });

    if (call) {
      const addition = `Customer: ${speechContent}\nAI: ${responseText}\n`;
      await prisma.call.update({
        where: { id: call.id },
        data: {
          transcript: (call.transcript || '') + addition,
          duration: call.duration + 15, // Increment simulated call seconds
          status: 'in-progress',
        },
      });
    }

    return responseText;
  }

  /**
   * Ends a voice call and updates transcript details
   */
  async endCall(callId: string, durationSeconds: number): Promise<void> {
    console.log(`📞 [VoiceProvider] Ending call ${callId} after ${durationSeconds} seconds.`);
    
    await prisma.call.update({
      where: { id: callId },
      data: {
        status: 'completed',
        duration: durationSeconds,
      },
    });
  }

  /**
   * Retrieves active transcript
   */
  async getCallTranscript(callId: string): Promise<string> {
    const call = await prisma.call.findUnique({
      where: { id: callId },
    });
    return call?.transcript || 'No transcript available.';
  }
}

export const voiceService = new VoiceServiceProviderImpl();
