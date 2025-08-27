# Video Indexing Bot

Telegram bot untuk mengindex informasi video di grup Telegram, baik video lama maupun baru.

## Fitur

- ✅ Mengindex video yang ada di grup (lama dan baru)
- ✅ Menyimpan nama dan durasi video ke database SQLite
- ✅ Pencarian video berdasarkan nama
- ✅ Pencarian video berdasarkan durasi tetap atau range durasi
- ✅ Menampilkan statistik video yang telah diindex
- ✅ Dapat mengindex 12.000+ video lama dengan User Bot
- ✅ Menyertakan link langsung ke pesan video dalam hasil pencarian

## Teknologi

- Node.js dengan TypeScript
- Telegraf (Telegram Bot Framework)
- GramJS (Telegram User Bot Library)
- SQLite dengan Sequelize (ORM)
- dotenv untuk manajemen environment variables

## Instalasi

1. Clone repository ini:
   ```bash
   git clone <repository-url>
   cd video_indexing_bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Buat file `.env` berdasarkan `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Isi `TELEGRAM_BOT_TOKEN` di file `.env` dengan token bot Telegram Anda.

5. Untuk indexing video lama, Anda juga perlu:
   - Dapatkan API ID dan API Hash dari [Telegram](https://my.telegram.org)
   - Isi `USER_BOT_API_ID` dan `USER_BOT_API_HASH` di file `.env`

6. Build project:
   ```bash
   npm run build
   ```

7. Jalankan bot:
   ```bash
   npm start
   ```

## Penggunaan

### Bot Telegram (untuk video baru)
Setelah bot ditambahkan ke grup:

- Kirim video ke grup untuk diindex
- Gunakan perintah `/search <nama>` untuk mencari video berdasarkan nama
- Gunakan perintah `/search_duration <durasi>` untuk mencari video dengan durasi tertentu (dalam menit)
- Gunakan perintah `/search_range <min> <max>` untuk mencari video dalam range durasi (dalam menit)
- Gunakan perintah `/stats` untuk melihat statistik video yang telah diindex

Dalam hasil pencarian, setiap video akan menyertakan tautan "Lihat Video" yang mengarah ke pesan asli di grup.

### User Bot (untuk indexing video lama)
Untuk mengindex video lama dari grup:

1. Pastikan Anda telah mengisi `USER_BOT_API_ID` dan `USER_BOT_API_HASH` di `.env`

2. Jalankan script indexing:
   ```bash
   npm run index-videos <group_id> [limit]
   ```

3. Saat pertama kali dijalankan, Anda akan diminta:
   - Nomor telepon (akun Telegram Anda)
   - Kode verifikasi yang dikirim via SMS
   - Password 2FA jika diaktifkan

4. Setelah login berhasil, session string akan ditampilkan. Simpan ini di `.env` sebagai `USER_BOT_SESSION_STRING` untuk penggunaan selanjutnya.

5. Script akan mulai mengindex video dari grup yang ditentukan.

Contoh:
```bash
# Index maksimal 1000 video dari grup dengan ID 123456789
npm run index-videos 123456789 1000

# Index semua video dari grup (hati-hati, ini bisa memakan waktu lama untuk 12.000+ video)
npm run index-videos 123456789
```

## Deploy ke Platform Gratis

### Vercel

Bot ini dapat di-deploy ke Vercel, namun karena Vercel tidak support long-running processes, kita perlu menggunakan serverless functions. Untuk bot Telegram yang perlu selalu aktif, platform seperti:

### Alternatif Platform Gratis:
1. **Railway.app** - Support long-running processes
2. **Render.com** - Support free tier untuk web services
3. **Fly.io** - Support free tier untuk aplikasi kecil
4. **Heroku** - Free tier tersedia (dengan sleep mode)

Untuk Railway/Render/Fly.io:
1. Deploy repository ke platform
2. Set environment variable `TELEGRAM_BOT_TOKEN`
3. Pastikan proses bot tetap running

## Struktur Database

Bot menggunakan SQLite dengan tabel `videos` yang memiliki kolom:
- `id`: ID unik (auto-increment)
- `file_id`: ID file unik dari Telegram
- `file_name`: Nama file video
- `duration`: Durasi video dalam detik
- `mime_type`: Tipe MIME file
- `file_size`: Ukuran file dalam bytes
- `message_id`: ID pesan di Telegram
- `chat_id`: ID chat/grup
- `date`: Tanggal video diupload
- `createdAt`: Tanggal data dibuat
- `updatedAt`: Tanggal data terakhir diupdate

## Limitasi

### Telegram Bot API:
- Bot tidak bisa secara otomatis mengakses pesan/video lama di grup
- Hanya bisa mengindex video yang dikirim setelah bot bergabung ke grup

### User Bot:
- Memerlukan nomor telepon aktif
- Memerlukan verifikasi 2FA jika diaktifkan
- Proses indexing untuk 12.000+ video bisa memakan waktu beberapa jam
- Rate limiting dari Telegram mungkin diterapkan

## Pengembangan

### Mode Development
```bash
npm run dev
```

### Build Project
```bash
npm run build
```

### Indexing Video Lama
```bash
npm run index-videos <group_id> [limit]
```

### Testing
```bash
npm test
```

## Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Lisensi

MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.