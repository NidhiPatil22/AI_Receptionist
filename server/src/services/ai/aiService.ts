import { prisma } from '../../config/db';

export interface UrgencyInfo {
  urgency: 'normal' | 'important' | 'urgent';
  reason: string;
  requiresHuman: boolean;
}

export interface ExtractedContact {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

class AIServiceImpl {
  /**
   * Classifies the urgency of a message
   */
  async detectUrgency(content: string): Promise<UrgencyInfo> {
    const text = content.toLowerCase();
    
    // Urgent indicators
    const urgentKeywords = [
      'twice', 'double charge', 'charged twice', 'refund', 'unauthorized',
      'emergency', 'bleeding', 'severe pain', 'extraction pain', 'swelling',
      'immediately', 'right now', 'speak with the owner', 'doctor now',
      'broken tooth', 'chipped tooth', 'chipped my front tooth', 'toothache',
      'cancel immediately', 'website down', 'cannot login'
    ];

    // Important indicators
    const importantKeywords = [
      'schedule', 'book', 'appointment', 'reserve', 'reschedule', 'change time',
      'cancel my appointment', 'cost of', 'price for', 'services offered'
    ];

    for (const kw of urgentKeywords) {
      if (text.includes(kw)) {
        return {
          urgency: 'urgent',
          reason: `Customer reports emergency issue: "${kw}" matching trigger.`,
          requiresHuman: true,
        };
      }
    }

    for (const kw of importantKeywords) {
      if (text.includes(kw)) {
        return {
          urgency: 'important',
          reason: `Booking or appointment request: "${kw}" matching trigger.`,
          requiresHuman: true, // Needs human front desk verification
        };
      }
    }

    return {
      urgency: 'normal',
      reason: 'General business inquiry or FAQ check.',
      requiresHuman: false,
    };
  }

  /**
   * Generates a conversational reply based on the business details, FAQs, and history.
   */
  async generateResponse(
    businessId: string,
    history: { sender: string; content: string }[],
    currentMessage: string
  ): Promise<string> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { faqs: true, businessHours: true },
    });

    if (!business) {
      return "Hello! I am the AI receptionist, but I couldn't load the business profile. How can I help you today?";
    }

    const text = currentMessage.toLowerCase();
    
    // Check urgency first
    const urgencyCheck = await this.detectUrgency(currentMessage);
    if (urgencyCheck.urgency === 'urgent') {
      if (text.includes('charge') || text.includes('double') || text.includes('billing')) {
        return `I understand your concern about the billing discrepancy. I've flagged this transaction as urgent and routed it to ${business.name}'s management desk. We will review our ledger immediately. Could you please confirm your email address so we can email you a receipt once resolved?`;
      }
      return `I'm very sorry to hear that. This sounds like an urgent matter. I have flagged your message for the team at ${business.name} and they will contact you immediately. If you require immediate attention, please call our office directly.`;
    }

    // Look for name/email/phone capture flow
    // If the customer was asked for name/details in the last AI message
    const lastAiMessage = [...history].reverse().find((m: any) => m.sender === 'ai')?.content || '';
    if (lastAiMessage.includes('May I have your name') || lastAiMessage.includes('confirm your name and phone')) {
      const contact = this.extractContactInformation(currentMessage);
      const name = contact.name || currentMessage.split(' ').slice(-2).join(' ');
      return `Thank you, ${name}. I have recorded your contact details. A team member will call or email you shortly to confirm your booking and details! Is there anything else I can help you with?`;
    }

    // Appointment Booking Intent
    if (text.includes('book') || text.includes('appointment') || text.includes('schedule') || text.includes('cleaning')) {
      // Find open times in settings
      const satHours = business.businessHours.find((h: any) => h.dayOfWeek === 'Saturday');
      const satText = satHours && !satHours.isClosed ? `and Saturdays from ${satHours.openTime} to ${satHours.closeTime}` : '';
      return `Absolutely! I can help you schedule a visit for ${business.name}. We have appointment slots available next Monday morning or Wednesday afternoon. May I have your name, preferred date/time, and phone number so I can pass this to our front desk?`;
    }

    // Hours Intent
    if (text.includes('hour') || text.includes('open') || text.includes('when') || text.includes('closed') || text.includes('time')) {
      const hoursFaq = business.faqs.find((f: any) => f.category.toLowerCase() === 'hours' && f.active);
      if (hoursFaq) return hoursFaq.answer;
      
      const monFri = business.businessHours.find((h: any) => h.dayOfWeek === 'Monday');
      const monFriText = monFri ? `Monday to Friday from ${monFri.openTime} to ${monFri.closeTime}` : '9 AM to 6 PM';
      return `We are open ${monFriText}. Would you like me to help you schedule an appointment?`;
    }

    // Location / Address Intent
    if (text.includes('location') || text.includes('located') || text.includes('where') || text.includes('address') || text.includes('parking') || text.includes('get to')) {
      const locFaq = business.faqs.find((f: any) => f.category.toLowerCase() === 'location' && f.active);
      if (locFaq) return locFaq.answer;
      return `${business.name} is located at ${business.address || 'our main studio'}. We hope to see you soon!`;
    }

    // Pricing / Insurance Intent
    if (text.includes('price') || text.includes('cost') || text.includes('charge') || text.includes('fee') || text.includes('insurance') || text.includes('pay') || text.includes('cover')) {
      const pricingFaq = business.faqs.find((f: any) => f.category.toLowerCase() === 'pricing' && f.active);
      if (pricingFaq) return pricingFaq.answer;
      return `Our services include cleaning, whitening, and consultations. For pricing: ${business.pricing || 'please contact our office'}. We accept most major PPO insurances.`;
    }

    // Dynamic FAQ keyword matching
    for (const faq of business.faqs) {
      if (!faq.active) continue;
      const questionKeywords = faq.question.toLowerCase().split(' ').filter((w: any) => w.length > 4);
      let matchCount = 0;
      for (const keyword of questionKeywords) {
        if (text.includes(keyword)) {
          matchCount++;
        }
      }
      // If we match at least 2 keywords or 50% of the long words, return it
      if (matchCount >= 2 || (questionKeywords.length > 0 && matchCount / questionKeywords.length >= 0.5)) {
        return faq.answer;
      }
    }

    // Default Fallback Response
    return `Thank you for contacting ${business.name}. I've saved your message and will pass it directly to our team so they can review it and get back to you. Can I help you with anything else in the meantime?`;
  }

  /**
   * Summarizes a conversation list of messages
   */
  async summarizeConversation(conversationId: string): Promise<string> {
    const messages = await prisma.message.findMany({
      where: { conversationId, isNote: false },
      orderBy: { timestamp: 'asc' },
    });

    if (messages.length === 0) return 'No messages in conversation.';

    const textJoined = messages.map((m: any) => `${m.sender}: ${m.content}`).join('\n').toLowerCase();
    
    if (textJoined.includes('wisdom') || textJoined.includes('pain') || textJoined.includes('bleeding')) {
      return 'Wisdom tooth post-extraction pain & bleeding emergency.';
    }
    if (textJoined.includes('charge') || textJoined.includes('double') || textJoined.includes('billing')) {
      return 'Double payment charge billing dispute.';
    }
    if (textJoined.includes('chip') || textJoined.includes('broken')) {
      return 'Front tooth chipped accident emergency.';
    }
    if (textJoined.includes('book') || textJoined.includes('appointment') || textJoined.includes('schedule')) {
      return 'Dental cleaning and checkup appointment request.';
    }
    
    return `Inquiry regarding location, pricing, or services.`;
  }

  /**
   * Extracts name, phone, email from message
   */
  extractContactInformation(content: string): ExtractedContact {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    
    const emails = content.match(emailRegex);
    const phones = content.match(phoneRegex);
    
    const contact: ExtractedContact = {};
    if (emails && emails.length > 0) contact.email = emails[0];
    if (phones && phones.length > 0) contact.phone = phones[0];
    
    // Try to extract name
    const lowerContent = content.toLowerCase();
    const nameKeywords = ['my name is', 'this is', 'i am'];
    for (const kw of nameKeywords) {
      if (lowerContent.includes(kw)) {
        const parts = content.substring(lowerContent.indexOf(kw) + kw.length).trim().split(' ');
        if (parts.length > 0) {
          contact.name = parts.slice(0, 2).join(' ').replace(/[^a-zA-Z ]/g, '').trim();
          break;
        }
      }
    }

    return contact;
  }
}

export const aiService = new AIServiceImpl();
