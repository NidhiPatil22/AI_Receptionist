import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  JWT_SECRET: process.env.JWT_SECRET || 'bd007ae98e5a5cb0d87c8a6c93a56162',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dbname_f5dh_user:ZkFKbUnnnVq5awZnMloNpZe7yI80dF98@dpg-da79vfp5efls73ckebrg-a/dbname_f5dh',
  
  // Optional credentials
  AI_API_KEY: process.env.AI_API_KEY || '',
  VOICE_API_KEY: process.env.VOICE_API_KEY || '',
  MESSAGING_API_KEY: process.env.MESSAGING_API_KEY || '',
  
  // Twilio credentials
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  
  APP_URL: process.env.APP_URL || 'https://ai-receptionist-4w1qrki3d-gt-nids11s-projects.vercel.app/',
};
