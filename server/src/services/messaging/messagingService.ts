import { prisma } from '../../config/db';
import { aiService } from '../ai/aiService';

class MessagingServiceProviderImpl {
  /**
   * Sends a message to a customer (from AI or human agent)
   */
  async sendMessage(conversationId: string, content: string, sender: 'ai' | 'human'): Promise<any> {
    console.log(`💬 [MessagingProvider] Sending message to conversation ${conversationId} from ${sender}`);

    const message = await prisma.message.create({
      data: {
        sender,
        content,
        conversationId,
      },
    });

    // Update conversation last message timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        // If human responds, clear the escalation tag or requiresHuman tag depending on preference
        ...(sender === 'human' ? { requiresHuman: true, status: 'active' } : {}),
      },
    });

    return message;
  }

  /**
   * Simulates receiving a message from a customer
   */
  async receiveMessage(
    businessId: string,
    customerName: string,
    customerPhone: string,
    customerEmail: string,
    channel: string, // 'chat', 'sms', 'whatsapp', 'instagram'
    content: string
  ): Promise<any> {
    console.log(`💬 [MessagingProvider] Message received on ${channel} from ${customerName}: "${content}"`);

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        businessId,
        channel,
        status: 'active',
        OR: [
          { customerPhone: customerPhone || undefined },
          { customerEmail: customerEmail || undefined },
          { customerName: customerName || undefined }
        ]
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerName,
          customerPhone,
          customerEmail,
          channel,
          status: 'active',
          urgency: 'normal',
          businessId,
        },
      });
    }

    // Save customer message
    const customerMsg = await prisma.message.create({
      data: {
        sender: 'customer',
        content,
        conversationId: conversation.id,
      },
    });

    // Fetch message history for context
    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: 'asc' },
    });

    const formattedHistory = history.map((h: any) => ({
      sender: h.sender,
      content: h.content,
    }));

    // Perform urgency detection
    const urgencyInfo = await aiService.detectUrgency(content);
    
    // Update conversation details
    const updatedConv = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        ...(urgencyInfo.urgency !== 'normal' ? { 
          urgency: urgencyInfo.urgency, 
          urgencyReason: urgencyInfo.reason,
          requiresHuman: true 
        } : {}),
      },
    });

    // Send notification if urgent
    if (urgencyInfo.urgency === 'urgent') {
      await prisma.notification.create({
        data: {
          type: 'urgent_conversation',
          title: `🚨 Urgent ${channel.toUpperCase()} Alert`,
          message: `${customerName} reported: "${content.slice(0, 45)}..."`,
          conversationId: conversation.id,
        },
      });

      await prisma.escalation.create({
        data: {
          reason: urgencyInfo.reason,
          status: 'pending',
          conversationId: conversation.id,
        },
      });
    }

    // Generate AI response ONLY if conversation doesn't strictly block AI (e.g. human didn't manually pause it)
    let aiMsg = null;
    if (conversation.status === 'active') {
      const reply = await aiService.generateResponse(businessId, formattedHistory, content);
      aiMsg = await prisma.message.create({
        data: {
          sender: 'ai',
          content: reply,
          conversationId: conversation.id,
        },
      });
    }

    return {
      conversation: updatedConv,
      customerMsg,
      aiMsg,
    };
  }

  /**
   * Fetches conversation details with message threads
   */
  async getConversation(conversationId: string): Promise<any> {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        calls: true,
      },
    });
  }

  /**
   * Clears notification statuses
   */
  async markAsRead(conversationId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { conversationId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const messagingService = new MessagingServiceProviderImpl();
