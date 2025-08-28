import { Context } from 'telegraf';
import videoService from '../services/videoService';
import autoDeleteService from '../services/autoDeleteService';
import galleryHelper from '../utils/galleryHelper';

class CommandHandler {
  // Menangani perintah /start
  async handleStart(ctx: Context): Promise<void> {
    const welcomeMessage = `
🎥 *Video Indexing Bot*

Saya akan mengindex video yang ada di grup ini, baik yang sudah ada sebelum saya bergabung maupun yang baru dikirim.

📋 *Perintah yang tersedia:*
- /search <nama> - Cari video berdasarkan nama
- /search_duration <durasi> - Cari video dengan durasi tertentu (dalam menit)
- /search_range <min> <max> - Cari video dalam range durasi (dalam menit)
- /stats - Lihat statistik video yang telah diindex

🔍 Hasil pencarian akan menyertakan tautan langsung ke pesan video!
💡 Kirimkan video ke grup ini untuk diindex!
    `;

    const sentMessage = await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
    
    // Simpan message_id response untuk auto-delete
    // Untuk pesan start, kita bisa menyimpan ID dari video terbaru sebagai contoh
    const latestVideo = await videoService.getLatestVideo();
    if (latestVideo) {
      await autoDeleteService.saveResponseMessageId(latestVideo.id, sentMessage.message_id);
    }
  }

  // Menangani perintah /search
  async handleSearch(ctx: Context): Promise<void> {
    const query = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1).join(' ') : '';

    if (!query) {
      await ctx.reply('Silakan masukkan kata kunci pencarian. Contoh: /search tutorial');
      return;
    }

    try {
      const videos = await videoService.searchVideos({ name: query });

      if (videos.length === 0) {
        await ctx.reply(`Tidak ditemukan video dengan nama mengandung "${query}"`);
        return;
      }

      // Membuat gallery untuk halaman pertama
      const itemsPerPage = 5;
      const currentPage = 1;
      const videosForPage = galleryHelper.getVideosForPage(videos, currentPage, itemsPerPage);
      
      const galleryMessage = galleryHelper.createGalleryMessage(videos, {
        currentPage,
        itemsPerPage,
        totalItems: videos.length
      });
      
      const galleryKeyboard = galleryHelper.createGalleryKeyboard(videosForPage, {
        currentPage,
        itemsPerPage,
        totalItems: videos.length
      });
      
      const sentMessage = await ctx.reply(galleryMessage, {
        parse_mode: 'Markdown',
        ...galleryKeyboard
      });
      
      // Simpan message_id response untuk auto-delete
      if (videos.length > 0) {
        await autoDeleteService.saveResponseMessageId(videos[0].id, sentMessage.message_id);
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      await ctx.reply('Terjadi kesalahan saat mencari video');
    }
  }

  // Menangani perintah /search_duration
  async handleSearchDuration(ctx: Context): Promise<void> {
    const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1) : [];

    if (args.length === 0) {
      await ctx.reply('Silakan masukkan durasi dalam menit. Contoh: /search_duration 5');
      return;
    }

    const duration = parseInt(args[0]);
    if (isNaN(duration)) {
      await ctx.reply('Durasi harus berupa angka. Contoh: /search_duration 5');
      return;
    }

    try {
      const videos = await videoService.searchVideos({ exactDuration: duration });

      if (videos.length === 0) {
        await ctx.reply(`Tidak ditemukan video dengan durasi ${duration} menit`);
        return;
      }

      // Membuat gallery untuk halaman pertama
      const itemsPerPage = 5;
      const currentPage = 1;
      const videosForPage = galleryHelper.getVideosForPage(videos, currentPage, itemsPerPage);
      
      const galleryMessage = galleryHelper.createGalleryMessage(videos, {
        currentPage,
        itemsPerPage,
        totalItems: videos.length
      });
      
      const galleryKeyboard = galleryHelper.createGalleryKeyboard(videosForPage, {
        currentPage,
        itemsPerPage,
        totalItems: videos.length
      });
      
      const sentMessage = await ctx.reply(galleryMessage, {
        parse_mode: 'Markdown',
        ...galleryKeyboard
      });
      
      // Simpan message_id response untuk auto-delete
      if (videos.length > 0) {
        await autoDeleteService.saveResponseMessageId(videos[0].id, sentMessage.message_id);
      }
    } catch (error) {
      console.error('Error searching videos by duration:', error);
      await ctx.reply('Terjadi kesalahan saat mencari video berdasarkan durasi');
    }
  }

  // Menangani perintah /search_range
  async handleSearchRange(ctx: Context): Promise<void> {
    const args = ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ').slice(1) : [];

    if (args.length < 2) {
      await ctx.reply('Silakan masukkan range durasi dalam menit. Contoh: /search_range 1 5');
      return;
    }

    const minDuration = parseInt(args[0]);
    const maxDuration = parseInt(args[1]);

    if (isNaN(minDuration) || isNaN(maxDuration)) {
      await ctx.reply('Durasi harus berupa angka. Contoh: /search_range 1 5');
      return;
    }

    if (minDuration > maxDuration) {
      await ctx.reply('Durasi minimum tidak boleh lebih besar dari durasi maksimum');
      return;
    }

    try {
      const videos = await videoService.searchVideos({ 
        minDuration: minDuration, 
        maxDuration: maxDuration 
      });

      if (videos.length === 0) {
        await ctx.reply(`Tidak ditemukan video dengan durasi antara ${minDuration} - ${maxDuration} menit`);
        return;
      }

      // Membuat gallery untuk halaman pertama
      const itemsPerPage = 5;
      const currentPage = 1;
      const videosForPage = galleryHelper.getVideosForPage(videos, currentPage, itemsPerPage);
      
      const galleryMessage = galleryHelper.createGalleryMessage(videos, {
        currentPage,
        itemsPerPage,
        totalItems: videos.length
      });
      
      const galleryKeyboard = galleryHelper.createGalleryKeyboard(videosForPage, {
        currentPage,
        itemsPerPage,
        totalItems: videos.length
      });
      
      const sentMessage = await ctx.reply(galleryMessage, {
        parse_mode: 'Markdown',
        ...galleryKeyboard
      });
      
      // Simpan message_id response untuk auto-delete
      if (videos.length > 0) {
        await autoDeleteService.saveResponseMessageId(videos[0].id, sentMessage.message_id);
      }
    } catch (error) {
      console.error('Error searching videos by duration range:', error);
      await ctx.reply('Terjadi kesalahan saat mencari video berdasarkan range durasi');
    }
  }

  // Menangani perintah /stats
  async handleStats(ctx: Context): Promise<void> {
    try {
      const totalVideos = await videoService.getTotalVideos();
      
      const response = `
📊 *Statistik Video Indexing Bot*

📂 Total video yang diindex: ${totalVideos}

Video yang diindex akan terus bertambah setiap kali ada video baru di grup ini.
      `;
      
      const sentMessage = await ctx.reply(response, { parse_mode: 'Markdown' });
      
      // Simpan message_id response untuk auto-delete
      // Untuk statistik, kita bisa menyimpan ID dari video terbaru sebagai contoh
      const latestVideo = await videoService.getLatestVideo();
      if (latestVideo) {
        await autoDeleteService.saveResponseMessageId(latestVideo.id, sentMessage.message_id);
      }
    } catch (error) {
      console.error('Error getting stats:', error);
      await ctx.reply('Terjadi kesalahan saat mengambil statistik');
    }
  }
}

export default new CommandHandler();