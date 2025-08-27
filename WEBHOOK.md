# Webhook Setup (Opsional)

Bot ini menggunakan polling default, tetapi Anda bisa mengatur webhook untuk performa yang lebih baik.

## Mengatur Webhook

1. Dapatkan URL publik (dengan HTTPS) untuk server Anda
2. Jalankan perintah ini untuk mengatur webhook:
   ```
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_PUBLIC_URL>/webhook"
   ```

3. Modifikasi src/index.ts untuk menggunakan webhook:
   ```typescript
   // Ganti bot.launch() dengan:
   bot.launch({
     webhook: {
       domain: 'YOUR_PUBLIC_URL',
       port: 3000, // atau port yang Anda inginkan
     },
   });
   ```

## Catatan Penting

- Webhook memerlukan HTTPS endpoint
- Untuk development lokal, Anda bisa menggunakan ngrok:
  1. Install ngrok: `npm install -g ngrok`
  2. Jalankan: `ngrok http 3000`
  3. Gunakan URL HTTPS yang diberikan ngrok untuk webhook