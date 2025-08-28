import { Video } from '../models/video';
import { Markup } from 'telegraf';

interface GalleryOptions {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

class GalleryHelper {
  // Membuat inline keyboard untuk gallery
  createGalleryKeyboard(videos: Video[], options: GalleryOptions) {
    const { currentPage, itemsPerPage, totalItems } = options;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Membuat tombol untuk setiap video
    const videoButtons = videos.map((video, index) => {
      const displayIndex = (currentPage - 1) * itemsPerPage + index + 1;
      const fileName = video.file_name || `Video ${displayIndex}`;
      // Memotong nama file jika terlalu panjang
      const displayName = fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
      
      // Tombol untuk membuka video
      return Markup.button.url(
        `${displayIndex}. ${displayName}`,
        `https://t.me/c/${video.chat_id.toString().replace('-100', '')}/${video.message_id}`
      );
    });
    
    // Membuat tombol navigasi
    const navigationButtons = [];
    
    if (totalPages > 1) {
      // Tombol previous
      if (currentPage > 1) {
        navigationButtons.push(Markup.button.callback('⬅️ Previous', `gallery_prev_${currentPage - 1}`));
      }
      
      // Tombol next
      if (currentPage < totalPages) {
        navigationButtons.push(Markup.button.callback('Next ➡️', `gallery_next_${currentPage + 1}`));
      }
    }
    
    // Mengatur tombol dalam grid
    const keyboard = [];
    
    // Menambahkan tombol video (maksimal 5 per baris)
    for (let i = 0; i < videoButtons.length; i += 1) {
      keyboard.push([videoButtons[i]]);
    }
    
    // Menambahkan tombol navigasi jika ada
    if (navigationButtons.length > 0) {
      keyboard.push(navigationButtons);
    }
    
    return Markup.inlineKeyboard(keyboard);
  }
  
  // Membuat pesan gallery
  createGalleryMessage(videos: Video[], options: GalleryOptions): string {
    const { currentPage, itemsPerPage, totalItems } = options;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + videos.length - 1, totalItems);
    
    let message = `📹 *Hasil Pencarian Video*\n\n`;
    message += `Menampilkan ${startIndex}-${endIndex} dari ${totalItems} video\n\n`;
    
    if (videos.length === 0) {
      message += 'Tidak ada video yang ditemukan.';
    } else {
      message += 'Klik pada tombol di bawah untuk melihat video:\n';
    }
    
    return message;
  }
  
  // Mendapatkan subset video untuk halaman tertentu
  getVideosForPage(videos: Video[], page: number, itemsPerPage: number): Video[] {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return videos.slice(startIndex, endIndex);
  }
}

export default new GalleryHelper();