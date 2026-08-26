import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Test the connection
async function connectDb() {
  try {
    await prisma.$connect();
    console.log('🔌 Connected to the database successfully.');
  } catch (error) {
    console.error('❌ Database connection failure:', error);
  }
}

connectDb();
