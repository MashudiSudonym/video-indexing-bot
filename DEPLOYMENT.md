# Deployment Guide

## Vercel

**Catatan Penting**: Vercel tidak cocok untuk bot Telegram karena:
1. Vercel berbasis serverless functions, bukan long-running processes
2. Bot Telegram memerlukan proses yang selalu aktif untuk menerima update

## Platform yang Direkomendasikan

### Railway.app

1. Daftar di [railway.app](https://railway.app/)
2. Klik "New Project" > "Deploy from GitHub"
3. Pilih repository ini
4. Railway akan mendeteksi aplikasi Node.js secara otomatis
5. Tambahkan environment variable:
   - `TELEGRAM_BOT_TOKEN` = token bot Telegram Anda
6. Deploy!

**Catatan**: Untuk indexing video lama, Anda perlu menjalankan User Bot secara terpisah menggunakan komputer atau server Anda sendiri.

### Render.com

1. Daftar di [render.com](https://render.com/)
2. Buat "Web Service" baru
3. Hubungkan dengan GitHub repository
4. Konfigurasi:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Tambahkan environment variable:
   - `TELEGRAM_BOT_TOKEN` = token bot Telegram Anda
6. Deploy!

**Catatan**: Untuk indexing video lama, Anda perlu menjalankan User Bot secara terpisah menggunakan komputer atau server Anda sendiri.

### Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Daftar di [fly.io](https://fly.io/)
3. Login: `flyctl auth login`
4. Buat app: `flyctl launch`
5. Set environment variable:
   ```bash
   flyctl secrets set TELEGRAM_BOT_TOKEN=your_token_here
   ```
6. Deploy: `flyctl deploy`

**Catatan**: Untuk indexing video lama, Anda perlu menjalankan User Bot secara terpisah menggunakan komputer atau server Anda sendiri.

### Heroku (dengan sleep mode)

1. Daftar di [heroku.com](https://heroku.com/)
2. Install Heroku CLI
3. Login: `heroku login`
4. Buat app: `heroku create your-app-name`
5. Set environment variable:
   ```bash
   heroku config:set TELEGRAM_BOT_TOKEN=your_token_here
   ```
6. Deploy:
   ```bash
   git push heroku main
   ```

**Catatan**: Untuk indexing video lama, Anda perlu menjalankan User Bot secara terpisah menggunakan komputer atau server Anda sendiri.

## Mengatasi Limitasi Platform Gratis

1. **Sleep Mode**: Platform gratis seperti Heroku akan "sleep" jika tidak ada aktivitas
   - Solusi: Gunakan service seperti UptimeRobot untuk ping aplikasi setiap 25 menit

2. **Storage Persistence**: 
   - SQLite bekerja di filesystem lokal
   - Di platform seperti Vercel/Railway, pastikan database file disimpan dengan benar
   - Untuk produksi, pertimbangkan database eksternal seperti PostgreSQL

3. **Webhook vs Long Polling**:
   - Bot ini menggunakan long polling secara default
   - Untuk produksi, pertimbangkan menggunakan webhook dengan HTTPS endpoint

## Indexing Video Lama

Platform deployment gratis tidak cocok untuk menjalankan User Bot karena:
1. Batasan waktu eksekusi (timeout)
2. Kebutuhan interaksi manual untuk login (nomor telepon, kode verifikasi)
3. Kemungkinan pemblokiran oleh Telegram karena aktivitas mencurigakan

Untuk indexing 12.000+ video lama:
1. Jalankan User Bot di komputer pribadi atau server VPS
2. Gunakan command: `npm run index-videos <group_id>`
3. Proses bisa memakan waktu beberapa jam, jadi pastikan koneksi stabil