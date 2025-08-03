# Kas Kelas 1B Backend

Backend server untuk aplikasi Kas Kelas 1B dengan fitur WhatsApp broadcast menggunakan message queue.

## Fitur Utama

- **WhatsApp Broadcast dengan Delay**: Kirim pesan ke banyak orang dengan jeda waktu yang dapat dikonfigurasi
- **Message Queue**: Menggunakan Bull + Redis untuk antrian pesan yang reliable
- **Webhook Integration**: Terima notifikasi pembayaran dari Pakasir
- **Rate Limiting**: Proteksi API dari spam
- **Health Check**: Monitor status server dan services
- **Cron Jobs**: Pengingat pembayaran otomatis

## Tech Stack

- Node.js + Express.js
- Bull (Message Queue)
- Redis (Queue Storage)
- Supabase (Database)
- Dripsender (WhatsApp Gateway)

## API Endpoints

### Broadcast
- `POST /api/broadcast/send` - Kirim broadcast dengan delay
- `GET /api/broadcast/status` - Cek status antrian
- `GET /api/broadcast/status/:jobId` - Cek status job tertentu
- `GET /api/broadcast/history` - Riwayat broadcast

### Webhook
- `POST /api/webhook/pakasir` - Webhook untuk Pakasir payment

### Cron
- `POST /api/cron/daily` - Trigger pengingat harian manual
- `GET /api/cron/status` - Status cron jobs
- `POST /api/cron/toggle/:jobName` - Enable/disable cron job

### Health
- `GET /health` - Health check endpoint

## Environment Variables

```env
# Server
NODE_ENV=production
PORT=3001

# Frontend URL
FRONTEND_URL=https://your-frontend.up.railway.app

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Dripsender
DRIPSENDER_API_KEY=xxx

# Pakasir
PAKASIR_SLUG=xxx

# Redis (optional, untuk message queue)
REDIS_URL=redis://xxx
# atau
REDIS_HOST=xxx
REDIS_PORT=6379
REDIS_PASSWORD=xxx
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

## Broadcast dengan Delay

Contoh request broadcast:
```json
POST /api/broadcast/send
{
  "messages": [
    {
      "phoneNumber": "628123456789",
      "studentId": "uuid",
      "studentName": "John Doe",
      "message": "Pesan WhatsApp"
    }
  ],
  "delaySeconds": 10,
  "messageTemplate": "Template pesan dengan {nama_siswa}",
  "paymentTypeId": "uuid"
}
```

Response:
```json
{
  "success": true,
  "message": "3 messages queued successfully",
  "delaySeconds": 10,
  "jobs": [
    {
      "id": "1",
      "studentName": "John Doe",
      "scheduledFor": "2024-01-01T10:00:10.000Z"
    }
  ]
}
```

## Queue Status

```json
GET /api/broadcast/status

{
  "success": true,
  "status": {
    "waiting": 5,
    "active": 1,
    "completed": 10,
    "failed": 2,
    "total": 18
  }
}
```

## Testing

```bash
# Test health check
curl http://localhost:3001/health

# Test queue status
curl http://localhost:3001/api/broadcast/status

# Test broadcast (dengan delay 5 detik)
curl -X POST http://localhost:3001/api/broadcast/send \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "phoneNumber": "628123456789",
      "studentName": "Test",
      "message": "Test message"
    }],
    "delaySeconds": 5
  }'
```

## Deployment

Lihat [RAILWAY_DEPLOYMENT_GUIDE.md](../RAILWAY_DEPLOYMENT_GUIDE.md) untuk panduan deployment ke Railway.

## Monitoring

- Logs: Railway Dashboard → Logs
- Metrics: Railway Dashboard → Metrics
- Queue: Monitor via `/api/broadcast/status`

## Troubleshooting

### Redis Connection Error
- Pastikan Redis URL benar
- Cek firewall/network settings
- Fallback: Aplikasi tetap jalan tanpa Redis, tapi tanpa delay

### WhatsApp Gagal Terkirim
- Cek API Key Dripsender
- Cek format nomor telepon (harus 628xxx)
- Lihat logs untuk detail error

### Memory Issues
- Queue cleanup otomatis setiap 24 jam
- Adjust `cleanOldJobs()` interval jika perlu
- Monitor memory usage di Railway