# User Bot untuk Indexing Video Lama

## Mengapa User Bot?

Telegram Bot API memiliki keterbatasan:
- Tidak bisa mengakses pesan/video lama di grup
- Hanya bisa menerima update untuk pesan baru

Untuk mengatasi ini, kita menggunakan User Bot yang:
- Dibuat dengan akun Telegram biasa
- Bisa mengakses seluruh riwayat chat dan media
- Memungkinkan indexing 12.000+ video lama

## Prasyarat

1. Nomor telepon aktif (akan digunakan untuk login ke Telegram)
2. API ID dan API Hash dari [Telegram](https://my.telegram.org)
3. Jika diaktifkan, password 2FA untuk akun Telegram Anda

## Cara Mendapatkan API ID dan API Hash

1. Kunjungi [https://my.telegram.org](https://my.telegram.org)
2. Login dengan nomor telepon Anda
3. Klik "API development tools"
4. Isi form:
   - App title: Video Indexing Bot
   - Short name: videoindexingbot
5. Catat `api_id` dan `api_hash` yang diberikan

## Konfigurasi

Tambahkan ke file `.env` Anda:
```env
# User Bot Configuration
USER_BOT_API_ID=your_api_id_here
USER_BOT_API_HASH=your_api_hash_here
USER_BOT_PHONE=your_phone_number_here
USER_BOT_SESSION_STRING=your_session_string_here  # Akan di-generate saat login pertama
```

## Cara Menggunakan

### 1. Menjalankan Indexing

```bash
npm run index-videos <group_id> [limit]
```

Parameter:
- `group_id`: ID grup tempat video berada
- `limit`: (Opsional) Batas maksimal video yang akan diindex

Contoh:
```bash
# Index maksimal 1000 video dari grup dengan ID 123456789
npm run index-videos 123456789 1000

# Index semua video dari grup (hati-hati dengan 12.000+ video)
npm run index-videos 123456789
```

### 2. Proses Login Pertama

Saat pertama kali dijalankan, Anda akan diminta:
1. Konfirmasi nomor telepon
2. Masukkan kode verifikasi yang dikirim via SMS
3. Masukkan password 2FA jika diaktifkan

Setelah berhasil login, akan ditampilkan session string yang harus disimpan di `.env` untuk penggunaan selanjutnya.

### 3. Penggunaan Selanjutnya

Dengan session string yang tersimpan, Anda tidak perlu login ulang setiap kali menjalankan indexing.

## Mendapatkan Group ID

### Dari Bot:
1. Tambahkan bot Anda ke grup
2. Kirim pesan `/stats` di grup
3. Cek log bot untuk melihat chat ID

### Dari User Bot:
1. Jalankan indexing tanpa parameter group ID
2. Program akan menampilkan daftar grup yang tersedia

### Dari Telegram:
1. Buka grup di Telegram Desktop
2. Klik "..." (More) > "Copy Link"
3. ID grup ada dalam link: `https://t.me/+XXXXXXXXXXXX` (ID adalah angka/alfanumerik setelah "+")

## Rekomendasi untuk 12.000+ Video

1. **Gunakan limit**: Untuk menghindari rate limiting, gunakan limit batch kecil
   ```bash
   # Index 500 video per batch
   npm run index-videos 123456789 500
   ```

2. **Jeda antar batch**: Berikan jeda beberapa menit antar batch

3. **Monitoring**: Perhatikan log untuk error atau rate limiting

4. **Session persistence**: Simpan session string untuk menghindari login ulang

## Limitasi dan Pertimbangan

1. **Rate Limiting**: Telegram mungkin menerapkan rate limiting untuk permintaan banyak

2. **Waktu Proses**: Untuk 12.000+ video, proses bisa memakan waktu beberapa jam

3. **Akun Keamanan**: User Bot menggunakan akun Telegram pribadi, pastikan:
   - Nomor telepon aktif
   - Tidak digunakan untuk aktivitas mencurigakan
   - Mematuhi ToS Telegram

4. **Privasi**: User Bot bisa melihat semua pesan di grup tempat ia bergabung

## Troubleshooting

### Session Invalid
Jika session tidak valid:
1. Hapus `USER_BOT_SESSION_STRING` dari `.env`
2. Jalankan kembali indexing untuk login ulang

### Rate Limiting
Jika terkena rate limit:
1. Kurangi limit batch
2. Tambahkan jeda antar batch
3. Jalankan di waktu dengan aktivitas lebih rendah

### Error Authentication
Jika error autentikasi:
1. Pastikan API ID dan API Hash benar
2. Periksa koneksi internet
3. Verifikasi nomor telepon aktif