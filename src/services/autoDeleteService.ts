import { Telegraf, Context } from 'telegraf';
import { Video } from '../models/video';
import { Op } from 'sequelize';

class AutoDeleteService {
  private bot: Telegraf<Context> | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  // Inisialisasi service dengan bot instance
  initialize(bot: Telegraf<Context>): void {
    this.bot = bot;
    this.startAutoDeleteScheduler();
  }

  // Memulai scheduler untuk auto-delete
  private startAutoDeleteScheduler(): void {
    // Jalankan setiap 1 jam (3600000 ms) untuk memeriksa response yang perlu dihapus
    this.intervalId = setInterval(async () => {
      await this.deleteExpiredResponses();
    }, 3600000); // 1 jam

    console.log('Auto-delete scheduler started');
  }

  // Menghentikan scheduler
  stopAutoDeleteScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Auto-delete scheduler stopped');
    }
  }

  // Menghapus response yang sudah lebih dari 12 jam
  private async deleteExpiredResponses(): Promise<void> {
    if (!this.bot) {
      console.error('Bot instance not initialized');
      return;
    }

    try {
      // Hitung waktu 12 jam yang lalu
      const twelveHoursAgo = new Date(Date.now() - (12 * 60 * 60 * 1000));

      // Cari video dengan response_message_id yang dikirim lebih dari 12 jam yang lalu
      const expiredVideos = await Video.findAll({
        where: {
          response_message_id: {
            [Op.not]: null
          },
          createdAt: {
            [Op.lt]: twelveHoursAgo
          }
        }
      });

      console.log(`Found ${expiredVideos.length} expired responses to delete`);

      // Hapus setiap response yang sudah expired
      for (const video of expiredVideos) {
        try {
          // Hapus pesan di Telegram
          await this.bot.telegram.deleteMessage(
            video.chat_id, 
            video.response_message_id
          );
          
          // Hapus reference message_id dari database
          await video.update({ response_message_id: null });
          
          console.log(`Deleted response message ${video.response_message_id} for video ${video.file_id}`);
        } catch (error) {
          console.error(`Error deleting message ${video.response_message_id}:`, error);
          
          // Jika error karena message tidak ditemukan, tetap hapus reference dari database
          if (error instanceof Error && error.message.includes('message to delete not found')) {
            await video.update({ response_message_id: null });
          }
        }
      }
    } catch (error) {
      console.error('Error in deleteExpiredResponses:', error);
    }
  }

  // Menyimpan message_id response ke database
  async saveResponseMessageId(videoId: number, responseMessageId: number): Promise<void> {
    try {
      await Video.update(
        { response_message_id: responseMessageId },
        { where: { id: videoId } }
      );
    } catch (error) {
      console.error('Error saving response message ID:', error);
    }
  }
}

export default new AutoDeleteService();