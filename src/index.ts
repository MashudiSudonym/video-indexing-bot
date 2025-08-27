import { Telegraf, Context } from 'telegraf';
import { sequelize } from './models/video';
import { TELEGRAM_BOT_TOKEN } from './config/env';
import videoIndexer from './utils/videoIndexer';
import commandHandler from './handlers/commandHandler';

// Validasi token bot
if (!TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN tidak ditemukan di file .env');
  process.exit(1);
}

// Inisialisasi bot
const bot = new Telegraf<Context>(TELEGRAM_BOT_TOKEN);

// Sinkronisasi database
async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Koneksi database berhasil.');
    
    // Sinkronisasi model dengan database
    await sequelize.sync({ alter: true });
    console.log('Database dan model telah disinkronkan.');
  } catch (error) {
    console.error('Gagal menghubungkan ke database:', error);
    process.exit(1);
  }
}

// Handler untuk pesan yang mengandung video
bot.on('video', async (ctx) => {
  await videoIndexer.processVideoMessage(ctx, bot);
});

// Handler untuk perintah
bot.command('start', async (ctx) => {
  await commandHandler.handleStart(ctx);
});

bot.command('search', async (ctx) => {
  await commandHandler.handleSearch(ctx);
});

bot.command('search_duration', async (ctx) => {
  await commandHandler.handleSearchDuration(ctx);
});

bot.command('search_range', async (ctx) => {
  await commandHandler.handleSearchRange(ctx);
});

bot.command('stats', async (ctx) => {
  await commandHandler.handleStats(ctx);
});

// Handler untuk error
bot.catch((err, ctx) => {
  console.error(`Error untuk ${ctx.updateType}:`, err);
});

// Fungsi untuk menjalankan bot
async function startBot() {
  // Sinkronisasi database terlebih dahulu
  await syncDatabase();
  
  // Jalankan bot
  bot.launch()
    .then(() => {
      console.log('Bot berhasil dijalankan!');
    })
    .catch((error) => {
      console.error('Gagal menjalankan bot:', error);
      process.exit(1);
    });

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Jalankan bot
startBot();