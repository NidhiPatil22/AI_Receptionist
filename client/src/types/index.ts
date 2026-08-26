export interface Business {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  industry?: string;
  services?: string;
  pricing?: string;
  createdAt: string;
  updatedAt: string;
  businessHours?: BusinessHours[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  businessId: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHours {
  id: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  businessId: string;
}

export interface Message {
  id: string;
  sender: 'customer' | 'ai' | 'human';
  content: string;
  timestamp: string;
  isNote: boolean;
  conversationId: string;
}

export interface Call {
  id: string;
  duration: number;
  status: 'completed' | 'missed' | 'ringing' | 'in-progress';
  recordingUrl?: string;
  transcript?: string;
  conversationId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  channel: 'chat' | 'sms' | 'whatsapp' | 'instagram' | 'call';
  status: 'active' | 'resolved' | 'paused';
  urgency: 'normal' | 'important' | 'urgent';
  urgencyReason?: string;
  requiresHuman: boolean;
  lastMessageAt: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  calls?: Call[];
}

export interface NotificationAlert {
  id: string;
  type: 'urgent_conversation' | 'missed_call' | 'new_message' | 'ai_escalation' | 'ai_failed';
  title: string;
  message: string;
  isRead: boolean;
  conversationId?: string;
  createdAt: string;
  conversation?: Conversation;
}
