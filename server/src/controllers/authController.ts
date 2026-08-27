import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { env } from '../config/env';

// Helper to sign JWT tokens
function generateToken(user: { id: string; email: string; businessId: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, businessId: user.businessId, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const authController = {
  /**
   * Handle user registration
   */
  async signup(req: Request, res: Response) {
    try {
      const { email, password, name, businessName } = req.body;

      if (!email || !password || !name || !businessName) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
      }

      // Check if email already registered
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already in use.' });
      }

      // Create new business
      const business = await prisma.business.create({
        data: {
          name: businessName,
          description: `A boutique ${businessName} dedicated to providing great client service.`,
          industry: 'General Business',
          services: 'Consultation, Support',
          pricing: 'Please inquire for pricing schedules.',
        },
      });

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create User
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          businessId: business.id,
        },
      });

      // Seed default business hours
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const day of days) {
        await prisma.businessHours.create({
          data: {
            dayOfWeek: day,
            openTime: '09:00',
            closeTime: '18:00',
            isClosed: day === 'Sunday',
            businessId: business.id,
          },
        });
      }

      // Seed default FAQ
      await prisma.fAQ.create({
        data: {
          question: 'What are your opening hours?',
          answer: 'We are open Monday through Friday from 9 AM to 6 PM, and Saturday from 9 AM to 6 PM. We are closed on Sundays.',
          category: 'Hours',
          businessId: business.id,
          active: true,
        },
      });

      const token = generateToken({
        id: user.id,
        email: user.email,
        businessId: user.businessId,
        name: user.name,
      });

      return res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
        business,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Internal server registration error.' });
    }
  },

  /**
   * Handle user login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password.' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { business: true },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        businessId: user.businessId,
        name: user.name,
      });

      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
        business: user.business,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal login error.' });
    }
  },

  /**
   * Continue with Demo (Bypasses traditional logins)
   */
  async continueWithDemo(req: Request, res: Response) {
    try {
      const maskedDbUrl = (env.DATABASE_URL || '').replace(/:[^:@/]+@/, ':****@');
      console.log(`🔑 [AuthController] Resolving bypass for Demo Mode. Target DB URL: ${maskedDbUrl}`);
      
      // Fetch the pre-seeded Bloom Dental Studio business
      let business = await prisma.business.findFirst({
        where: { name: 'Bloom Dental Studio' },
      });

      // If business was deleted or db is empty, create a fallback
      if (!business) {
        console.log('🔑 [AuthController] Seeded Bloom Dental Studio not found. Generating fallback record...');
        business = await prisma.business.create({
          data: {
            name: 'Bloom Dental Studio',
            description: 'A boutique dental studio focusing on gentle, aesthetic care in a calming, friendly space.',
            phone: '+1 (555) 010-2020',
            email: 'hello@bloomdental.studio',
            website: 'www.bloomdental.studio',
            address: '123 Main Street, Suite 100, Sparkle City',
            industry: 'Healthcare / Dental',
            services: 'Dental Cleaning, Teeth Whitening, Emergency Care',
            pricing: 'Cleaning: $150, Whitening: $399',
          },
        });
      }

      // Fetch the pre-seeded admin user
      let user = await prisma.user.findFirst({
        where: { email: 'admin@bloomdental.studio' },
      });

      if (!user) {
        console.log('🔑 [AuthController] Seeded admin user not found. Generating fallback record...');
        user = await prisma.user.create({
          data: {
            name: 'Dr. Sarah Bloom',
            email: 'admin@bloomdental.studio',
            password: bcrypt.hashSync('bloom123', 10),
            businessId: business.id,
          },
        });
      }

      console.log(`🔑 [AuthController] Demo bypass successful for user: ${user.email}`);

      const token = generateToken({
        id: user.id,
        email: user.email,
        businessId: user.businessId,
        name: user.name,
      });

      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
        business,
      });
    } catch (error) {
      console.error('🔑 [AuthController] Demo bypass failure stack:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ 
        error: `Could not establish simulation session. Database error: ${errorMsg}` 
      });
    }
  },
};
