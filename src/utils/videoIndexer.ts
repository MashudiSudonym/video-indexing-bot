import { Telegraf, Context } from 'telegraf';
import { Video } from '../models/video';
import videoService from '../services/videoService';
import autoDeleteService from '../services/autoDeleteService';

interface MessageWithVideo {
  message_id: number;
  video?: any;
  date: number;
  chat: { id: number };
}

class VideoIndexer {
  // Memproses pesan yang mengandung video
  async processVideoMessage(ctx: Context, bot: Telegraf<Context>): Promise<void> {
    try {
      // Cek apakah pesan mengandung video
      if (ctx.message && 'video' in ctx.message) {
        const video = ctx.message.video;
        const messageId = ctx.message.message_id;
        const chatId = ctx.message.chat.id;
        const date = new Date(ctx.message.date * 1000);

        // Simpan informasi video ke database
        const savedVideo = await videoService.saveVideo({
          file_id: video.file_id,
          file_name: video.file_name,
          duration: video.duration,
          mime_type: video.mime_type,
          file_size: video.file_size,
          message_id: messageId,
          chat_id: chatId,
          date: date,
        });

        console.log(`Indexed video: ${video.file_name || 'Unnamed'} (${video.duration}s)`);
      }
    } catch (error) {
      console.error('Error processing video message:', error);
    }
  }

  // Mengindex video lama dari grup
  async indexOldVideos(bot: Telegraf<Context>, chatId: number): Promise<void> {
    try {
      console.log(`Starting to index old videos from chat ${chatId}`);
      
      // Karena Telegram Bot API memiliki keterbatasan, kita tidak bisa secara langsung
      // mengambil semua pesan lama. Sebagai gantinya, kita akan menunggu pesan baru
      // dan memprosesnya saat diterima.
      
      // Untuk implementasi yang lebih lengkap, kita bisa menggunakan
      // bot.telegram.getChatHistory(chatId) jika tersedia
      // atau menggunakan user bot untuk mengakses pesan lama
      
      console.log('Note: Due to Telegram Bot API limitations, only new messages will be indexed.');
      console.log('To index old videos, we would need to use a user bot or manually forward messages.');
    } catch (error) {
      console.error('Error indexing old videos:', error);
    }
  }
}

export default new VideoIndexer();