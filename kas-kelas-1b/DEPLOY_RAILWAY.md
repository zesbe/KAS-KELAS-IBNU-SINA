# Deploy ke Railway - Panduan Lengkap

## Persiapan

1. Buat akun di [Railway.app](https://railway.app)
2. Install Railway CLI (opsional):
```bash
npm install -g @railway/cli
```

## Deploy Backend

### 1. Melalui Railway Dashboard

1. Login ke Railway Dashboard
2. Klik "New Project" → "Deploy from GitHub repo"
3. Connect GitHub account dan pilih repository
4. Pilih folder `backend-example`
5. Railway akan auto-detect Node.js app

### 2. Set Environment Variables

Di Railway project settings, tambahkan environment variables:

```
SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
```

### 3. Deploy
- Railway akan otomatis deploy setelah environment variables di-set
- Catat URL backend (contoh: `https://kas-backend.up.railway.app`)

## Deploy Frontend

### 1. Update Environment Variables

Edit file `.env` di folder `kas-kelas-1b`:

```env
REACT_APP_SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucmp1aXdpcGduYmN4Z2dnZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTQ0NzYsImV4cCI6MjA2OTU3MDQ3Nn0.w_t5aAcbmvsTd1qFVl9orKTjTQNLAWJ7Be0QzeMFkZs
REACT_APP_DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
REACT_APP_PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
REACT_APP_PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
REACT_APP_WEBHOOK_URL=https://kas-backend.up.railway.app/api/webhook/pakasir
```

### 2. Deploy Frontend

1. Di Railway Dashboard, klik "New Project" lagi
2. Pilih repository yang sama
3. Kali ini pilih root folder (kas-kelas-1b)
4. Railway akan detect React app

### 3. Set Environment Variables di Railway

Tambahkan semua environment variables yang sama seperti di `.env`:

```
REACT_APP_SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
REACT_APP_PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
REACT_APP_PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
REACT_APP_WEBHOOK_URL=https://kas-backend.up.railway.app/api/webhook/pakasir
```

## Deploy dengan Railway CLI (Alternatif)

### Backend
```bash
cd backend-example
railway login
railway link
railway up
railway variables set SUPABASE_URL=xxx
railway variables set SUPABASE_SERVICE_ROLE_KEY=xxx
# ... set semua variables
```

### Frontend
```bash
cd kas-kelas-1b
railway login
railway link
railway up
railway variables set REACT_APP_SUPABASE_URL=xxx
# ... set semua variables
```

## Konfigurasi Pakasir

1. Login ke Pakasir Dashboard
2. Pergi ke Project Settings
3. Set Webhook URL: `https://kas-backend.up.railway.app/api/webhook/pakasir`

## Setup Supabase

1. Login ke Supabase Dashboard
2. Run SQL schema dari file `supabase_schema.sql`
3. Enable Email Authentication
4. Create admin user (lihat SETUP_AUTH.md)
5. Enable Row Level Security

## Testing

1. Akses frontend: `https://kas-frontend.up.railway.app`
2. Login dengan kredensial admin
3. Test buat transaksi
4. Cek apakah WhatsApp terkirim
5. Test pembayaran via Pakasir
6. Cek apakah webhook berfungsi

## Monitoring

Railway menyediakan:
- Logs real-time
- Metrics (CPU, Memory, Network)
- Deployment history
- Environment variables management

## Tips

1. **Domain Custom**: 
   - Railway support custom domain
   - Settings → Domains → Add Domain

2. **Auto Deploy**:
   - Railway auto-deploy setiap push ke GitHub
   - Bisa di-disable di Settings

3. **Scaling**:
   - Railway otomatis scale berdasarkan traffic
   - Bisa set resource limits di Settings

4. **Database**:
   - Jika perlu, Railway juga bisa host PostgreSQL
   - Tapi untuk project ini kita pakai Supabase

5. **Debugging**:
   - Check logs di Railway Dashboard
   - Gunakan `railway logs` di CLI

## Troubleshooting

### Frontend tidak bisa connect ke Backend
- Pastikan CORS di backend sudah benar
- Check URL backend di environment variables

### Webhook tidak berfungsi
- Check logs backend untuk error
- Pastikan Pakasir mengirim ke URL yang benar
- Test manual dengan Postman/curl

### WhatsApp tidak terkirim
- Check API key Dripsender
- Lihat logs untuk error message
- Pastikan format nomor telepon benar

## Biaya

Railway memberikan:
- $5 free credit per bulan
- Cukup untuk aplikasi kecil-menengah
- Monitor usage di Dashboard