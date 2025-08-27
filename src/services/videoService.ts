import { Video } from '../models/video';
import { Op } from 'sequelize';

interface VideoSearchOptions {
  name?: string;
  exactDuration?: number;
  minDuration?: number;
  maxDuration?: number;
}

class VideoService {
  // Menyimpan atau memperbarui informasi video
  async saveVideo(videoData: {
    file_id: string;
    file_name?: string;
    duration: number;
    mime_type?: string;
    file_size?: number;
    message_id: number;
    chat_id: number;
    date: Date;
  }): Promise<Video> {
    const [video, created] = await Video.findOrCreate({
      where: { file_id: videoData.file_id },
      defaults: videoData,
    });

    // Jika video sudah ada, kita perbarui informasinya
    if (!created) {
      await video.update(videoData);
    }

    return video;
  }

  // Mencari video berdasarkan kriteria
  async searchVideos(options: VideoSearchOptions): Promise<Video[]> {
    const whereConditions: any = {};

    // Filter berdasarkan nama
    if (options.name) {
      whereConditions.file_name = {
        [Op.like]: `%${options.name}%`,
      };
    }

    // Filter berdasarkan durasi
    if (options.exactDuration) {
      whereConditions.duration = options.exactDuration;
    } else if (options.minDuration !== undefined || options.maxDuration !== undefined) {
      whereConditions.duration = {};
      if (options.minDuration !== undefined) {
        whereConditions.duration[Op.gte] = options.minDuration * 60; // Konversi menit ke detik
      }
      if (options.maxDuration !== undefined) {
        whereConditions.duration[Op.lte] = options.maxDuration * 60; // Konversi menit ke detik
      }
    }

    return await Video.findAll({
      where: whereConditions,
      order: [['date', 'DESC']],
    });
  }

  // Mendapatkan semua video dari chat tertentu
  async getVideosByChatId(chatId: number): Promise<Video[]> {
    return await Video.findAll({
      where: { chat_id: chatId },
      order: [['date', 'DESC']],
    });
  }

  // Menghitung total video dalam database
  async getTotalVideos(): Promise<number> {
    return await Video.count();
  }
}

export default new VideoService();