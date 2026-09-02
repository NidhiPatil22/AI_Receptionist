import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const businessController = {
  /**
   * Fetch business profile and hours
   */
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      console.log(`[BUSINESS PROFILE] authenticated businessId: ${businessId}`);

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          businessHours: {
            orderBy: {
              createdAt: 'asc', // Or just standard sorting in code
            },
          },
        },
      });

      if (!business) return res.status(404).json({ error: 'Business not found.' });

      return res.json(business);
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
  },

  /**
   * Update business profile fields
   */
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      const { 
        name, description, phone, email, website, address, industry, services, pricing,
        receptionistName, receptionistActive, voiceEnabled, messagingEnabled, autoAnswer, humanEscalation 
      } = req.body;

      const updated = await prisma.business.update({
        where: { id: businessId },
        data: {
          name,
          description,
          phone,
          email,
          website,
          address,
          industry,
          services,
          pricing,
          receptionistName,
          receptionistActive: receptionistActive !== undefined ? Boolean(receptionistActive) : undefined,
          voiceEnabled: voiceEnabled !== undefined ? Boolean(voiceEnabled) : undefined,
          messagingEnabled: messagingEnabled !== undefined ? Boolean(messagingEnabled) : undefined,
          autoAnswer: autoAnswer !== undefined ? Boolean(autoAnswer) : undefined,
          humanEscalation: humanEscalation !== undefined ? Boolean(humanEscalation) : undefined,
        },
      });

      return res.json(updated);
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update business profile.' });
    }
  },

  /**
   * Update weekly business hours settings
   */
  async updateHours(req: AuthenticatedRequest, res: Response) {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) return res.status(400).json({ error: 'Business ID missing.' });

      const { hours } = req.body; // Expects array of hours object { dayOfWeek, openTime, closeTime, isClosed }

      if (!Array.isArray(hours)) {
        return res.status(400).json({ error: 'Invalid hours payload structure.' });
      }

      // We can update each day
      for (const h of hours) {
        await prisma.businessHours.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId,
              dayOfWeek: h.dayOfWeek,
            },
          },
          update: {
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          },
          create: {
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
            businessId,
          },
        });
      }

      const updatedHours = await prisma.businessHours.findMany({
        where: { businessId },
      });

      return res.json(updatedHours);
    } catch (error) {
      console.error('Error updating hours:', error);
      return res.status(500).json({ error: 'Failed to update business hours.' });
    }
  },
};
