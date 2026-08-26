import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root folder
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  JWT_SECRET: process.env.JWT_SECRET || 'super_cute_pink_secret_key_12345',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  
  // Optional credentials
  AI_API_KEY: process.env.AI_API_KEY || '',
  VOICE_API_KEY: process.env.VOICE_API_KEY || '',
  MESSAGING_API_KEY: process.env.MESSAGING_API_KEY || '',
  
  // Twilio credentials
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
};
