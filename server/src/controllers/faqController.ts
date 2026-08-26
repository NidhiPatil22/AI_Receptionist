import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const faqController = {
  /**
   * List business FAQs (supports category search filters)
   */
  async getFAQs(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      const { category, search } = req.query;

      const faqs = await prisma.fAQ.findMany({
        where: {
          businessId,
          category: category ? String(category) : undefined,
          OR: search ? [
            { question: { contains: String(search) } },
            { answer: { contains: String(search) } },
          ] : undefined,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json(faqs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return res.status(500).json({ error: 'Failed to retrieve FAQs.' });
    }
  },

  /**
   * Create an FAQ entry
   */
  async createFAQ(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      const { question, answer, category, active } = req.body;

      if (!question || !answer || !category) {
        return res.status(400).json({ error: 'Question, answer, and category are required.' });
      }

      const faq = await prisma.fAQ.create({
        data: {
          question,
          answer,
          category,
          active: active !== undefined ? Boolean(active) : true,
          businessId,
        },
      });

      return res.status(201).json(faq);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      return res.status(500).json({ error: 'Failed to create FAQ entry.' });
    }
  },

  /**
   * Update an FAQ entry
   */
  async updateFAQ(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { question, answer, category, active } = req.body;

      const faq = await prisma.fAQ.update({
        where: { id },
        data: {
          question,
          answer,
          category,
          active: active !== undefined ? Boolean(active) : undefined,
        },
      });

      return res.json(faq);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      return res.status(500).json({ error: 'Failed to update FAQ entry.' });
    }
  },

  /**
   * Delete an FAQ entry
   */
  async deleteFAQ(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.fAQ.delete({
        where: { id },
      });

      return res.json({ success: true, message: 'FAQ deleted successfully.' });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      return res.status(500).json({ error: 'Failed to delete FAQ entry.' });
    }
  },
};
