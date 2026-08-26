import { Router } from 'express';
import { authController } from '../controllers/authController';
import { businessController } from '../controllers/businessController';
import { faqController } from '../controllers/faqController';
import { conversationController } from '../controllers/conversationController';
import { analyticsController } from '../controllers/analyticsController';
import { webhookController } from '../controllers/webhookController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// --- Auth Routes ---
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/demo', authController.continueWithDemo);

// --- Business & Settings (Protected) ---
router.get('/business/profile', authenticateToken as any, businessController.getProfile as any);
router.put('/business/profile', authenticateToken as any, businessController.updateProfile as any);
router.put('/business/hours', authenticateToken as any, businessController.updateHours as any);

// --- FAQ Knowledge Base (Protected) ---
router.get('/faqs', authenticateToken as any, faqController.getFAQs as any);
router.post('/faqs', authenticateToken as any, faqController.createFAQ as any);
router.put('/faqs/:id', authenticateToken as any, faqController.updateFAQ as any);
router.delete('/faqs/:id', authenticateToken as any, faqController.deleteFAQ as any);

// --- Conversation Threads (Protected) ---
router.get('/conversations', authenticateToken as any, conversationController.getConversations as any);
router.get('/conversations/:id', authenticateToken as any, conversationController.getConversationDetails as any);
router.post('/conversations/:id/messages', authenticateToken as any, conversationController.sendMessage as any);
router.post('/conversations/:id/notes', authenticateToken as any, conversationController.addInternalNote as any);
router.put('/conversations/:id/resolve', authenticateToken as any, conversationController.resolveConversation as any);
router.post('/conversations/:id/takeover', authenticateToken as any, conversationController.takeover as any);

// --- Notifications Alerts (Protected) ---
router.get('/notifications', authenticateToken as any, conversationController.getNotifications as any);
router.post('/notifications/read-all', authenticateToken as any, conversationController.markAllNotificationsRead as any);
router.put('/notifications/:id/read', authenticateToken as any, conversationController.markNotificationRead as any);

// --- Analytics (Protected) ---
router.get('/analytics', authenticateToken as any, analyticsController.getAnalytics as any);

// --- Webhook / Simulation Handlers (Public for Demo / Interfacing) ---
router.post('/webhooks/simulate-message', webhookController.simulateMessage);
router.post('/webhooks/simulate-call', webhookController.simulateCallSpeak);
router.post('/webhooks/simulate-hangup', webhookController.simulateEndCall);

export default router;
