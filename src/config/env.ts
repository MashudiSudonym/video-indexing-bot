import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('USER_BOT_API_ID:', process.env.USER_BOT_API_ID ? 'SET' : 'NOT SET');
console.log('USER_BOT_API_HASH:', process.env.USER_BOT_API_HASH ? 'SET' : 'NOT SET');

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';