import { sequelize } from './models/video';
import UserBotService from './services/userBotService';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Debug: Log environment variables
console.log('Environment variables check:');
console.log('USER_BOT_API_ID:', process.env.USER_BOT_API_ID);
console.log('USER_BOT_API_HASH:', process.env.USER_BOT_API_HASH);
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');

async function indexOldVideos() {
  // Validasi environment variables
  if (!process.env.USER_BOT_API_ID || !process.env.USER_BOT_API_HASH) {
    console.error('USER_BOT_API_ID and USER_BOT_API_HASH must be set in .env file');
    process.exit(1);
  }

  // Sinkronisasi database
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  // Inisialisasi User Bot
  const userBot = new UserBotService();
  
  try {
    // Cek apakah ada session string tersimpan
    const sessionString = process.env.USER_BOT_SESSION_STRING;
    
    if (sessionString) {
      console.log('Using saved session string');
      await userBot.initializeWithSession(sessionString);
    } else {
      console.log('Starting new authentication process');
      await userBot.initialize();
      
      // Simpan session string untuk penggunaan selanjutnya
      console.log('Save this session string to USER_BOT_SESSION_STRING in your .env file for future use:');
      console.log(userBot['stringSession'].save());
    }
    
    // Dapatkan daftar grup
    console.log('Fetching groups...');
    const groups = await userBot.getGroups();
    
    if (groups.length === 0) {
      console.log('No groups found. Make sure the user bot is a member of at least one group.');
      process.exit(1);
    }
    
    console.log('Available groups:');
    groups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.title} (ID: ${group.id}, Type: ${group.type})`);
    });
    
    // Minta input grup untuk diindex
    const groupId = process.argv[2];
    const limit = process.argv[3] ? parseInt(process.argv[3]) : 0;
    
    if (!groupId) {
      console.log('Please provide group ID as command line argument');
      console.log('Usage: npm run index-videos <group_id> [limit]');
      console.log('Example: npm run index-videos -1001234567890');
      process.exit(1);
    }
    
    // Validasi ID grup
    const groupIdNum = parseInt(groupId);
    if (isNaN(groupIdNum)) {
      console.log('Invalid group ID. Please provide a valid numeric ID.');
      process.exit(1);
    }
    
    // Index video dari grup yang ditentukan
    console.log(`Starting to index videos from group ${groupId}`);
    await userBot.indexOldVideosFromGroup(groupIdNum, limit);
    
    console.log('Video indexing completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during video indexing:', error);
    process.exit(1);
  }
}

// Jalankan fungsi indexing
indexOldVideos();