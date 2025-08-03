# Panduan Deploy ke Railway untuk Pemula

## 📋 Persiapan Sebelum Deploy

### 1. Akun yang Dibutuhkan
- **Railway Account**: Daftar di [railway.app](https://railway.app)
- **GitHub Account**: Untuk connect repository
- **Supabase Account**: Database di [supabase.com](https://supabase.com)
- **Dripsender Account**: WhatsApp API di [dripsender.id](https://dripsender.id)
- **Pakasir Account**: Payment gateway di [pakasir.com](https://pakasir.com)

### 2. Persiapan API Keys
Kumpulkan semua API keys yang dibutuhkan:
- Supabase URL dan Keys
- Dripsender API Key
- Pakasir Slug dan API Key
- VAPID Keys untuk Push Notification

## 🚀 Langkah-langkah Deploy

### Step 1: Setup GitHub Repository

1. Upload project ke GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### Step 2: Setup Database di Supabase

1. Login ke [Supabase](https://supabase.com)
2. Create New Project
3. Simpan informasi berikut:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...`

4. Jalankan SQL Schema di Supabase SQL Editor:
   - Buka file `supabase_schema.sql`
   - Copy paste ke SQL Editor
   - Run query
   - Ulangi untuk file schema lainnya jika ada

### Step 3: Deploy Backend di Railway

1. Login ke [Railway](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select repository Anda
5. Railway akan auto-detect sebagai Node.js project

#### 3.1 Configure Backend Service

1. Di Railway dashboard, click service backend
2. Go to "Settings" tab
3. Set "Root Directory" ke: `/backend`
4. Set "Start Command" ke: `npm start`

#### 3.2 Setup Environment Variables

Click "Variables" tab dan add semua variable berikut:

```env
# Server Config
NODE_ENV=production
PORT=3001

# Supabase (ganti dengan value asli)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Dripsender
DRIPSENDER_API_KEY=your_dripsender_api_key

# Pakasir
PAKASIR_SLUG=your_pakasir_slug
PAKASIR_BASE_URL=https://pakasir.com

# Frontend URL (akan diisi nanti)
FRONTEND_URL=https://your-frontend.up.railway.app

# Cron Secret (buat random string)
CRON_SECRET=buat_random_string_panjang_disini

# Redis (optional - skip dulu)
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

#### 3.3 Generate Domain

1. Go to "Settings" tab
2. Click "Generate Domain"
3. Copy domain yang diberikan (contoh: `kas-backend.up.railway.app`)

### Step 4: Deploy Frontend di Railway

1. Di Railway project yang sama, click "New Service"
2. Choose "GitHub Repo" lagi
3. Select repository yang sama

#### 4.1 Configure Frontend Service

1. Click service frontend yang baru
2. Go to "Settings" tab
3. Set "Root Directory" ke: `/frontend`
4. Set "Build Command" ke: `npm run build`
5. Set "Start Command" ke: `npm run serve`

#### 4.2 Setup Environment Variables

Click "Variables" tab dan add:

```env
# React App Environment Variables
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
REACT_APP_BACKEND_URL=https://kas-backend.up.railway.app
REACT_APP_DRIPSENDER_API_KEY=your_dripsender_api_key
REACT_APP_PAKASIR_SLUG=your_pakasir_slug
REACT_APP_PAKASIR_API_KEY=your_pakasir_api_key
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
```

**PENTING**: Ganti `REACT_APP_BACKEND_URL` dengan domain backend dari Step 3.3

#### 4.3 Generate Domain

1. Go to "Settings" tab
2. Click "Generate Domain"
3. Copy domain frontend

#### 4.4 Update Backend FRONTEND_URL

1. Kembali ke service backend
2. Update variable `FRONTEND_URL` dengan domain frontend yang baru

### Step 5: Setup Redis (Optional tapi Recommended)

Untuk message queue WhatsApp yang lebih reliable:

1. Di Railway project, click "New Service"
2. Choose "Database" → "Redis"
3. Railway akan auto-create Redis instance
4. Copy Redis connection details
5. Update backend environment variables:
   - `REDIS_HOST`: dari Redis dashboard
   - `REDIS_PORT`: 6379
   - `REDIS_PASSWORD`: dari Redis dashboard

### Step 6: Setup Webhooks & Cron Jobs

#### 6.1 Pakasir Webhook
1. Login ke Pakasir dashboard
2. Go to Settings → Webhook
3. Set Webhook URL: `https://kas-backend.up.railway.app/api/webhook/pakasir`

#### 6.2 Daily Cron Job
Setup cron job untuk reminder otomatis:

**Option A - Menggunakan cron-job.org (Gratis)**:
1. Daftar di [cron-job.org](https://cron-job.org)
2. Create new cron job:
   - URL: `https://kas-backend.up.railway.app/api/cron/daily`
   - Schedule: `0 8 * * *` (setiap hari jam 8 pagi)
   - Method: POST
   - Headers: 
     ```
     Content-Type: application/json
     X-Cron-Secret: your_cron_secret_value
     ```

**Option B - Railway Cron (Berbayar)**:
Railway juga support cron jobs di paid plan.

### Step 7: Generate VAPID Keys

1. Clone project ke local
2. Run command:
```bash
cd scripts
node generate-vapid-keys.js
```
3. Update `REACT_APP_VAPID_PUBLIC_KEY` di Railway frontend service

## 🔍 Troubleshooting

### 1. Frontend tidak bisa connect ke Backend
- Pastikan `REACT_APP_BACKEND_URL` sudah benar
- Check CORS settings di backend
- Pastikan backend service running

### 2. Database Connection Error
- Verify Supabase credentials
- Check IP whitelist di Supabase (Railway IPs should be allowed)

### 3. WhatsApp tidak terkirim
- Verify Dripsender API key
- Check saldo Dripsender
- Lihat logs di Railway

### 4. Build Failed
**Frontend:**
- Check Node version compatibility
- Clear cache: Di Railway settings, click "Clear Build Cache"

**Backend:**
- Ensure all dependencies listed in package.json
- Check for missing environment variables

### 5. Redis Connection Failed
- Jika tidak pakai Redis, app tetap jalan tapi tanpa queue
- Pastikan Redis credentials benar jika menggunakan

## 📊 Monitoring

### Check Logs
1. Di Railway dashboard, click service
2. Go to "Logs" tab
3. Monitor real-time logs

### Health Check
- Frontend: `https://your-frontend.up.railway.app`
- Backend: `https://your-backend.up.railway.app/api/health`

## 💰 Estimasi Biaya Railway

- **Hobby Plan**: $5/month (recommended)
  - 500 hours/month execution time
  - Cukup untuk aplikasi kelas kecil-menengah
  
- **Pro Plan**: $20/month
  - Unlimited hours
  - Better performance
  - Priority support

## 📝 Post-Deployment Checklist

- [ ] Test login sebagai admin
- [ ] Test create student
- [ ] Test payment recording
- [ ] Test WhatsApp broadcast
- [ ] Test payment webhook dari Pakasir
- [ ] Verify daily cron job
- [ ] Test parent portal access
- [ ] Check PWA installation

## 🆘 Bantuan

Jika ada error, check:
1. Railway logs (both frontend & backend)
2. Browser console untuk frontend errors
3. Network tab untuk API errors
4. Supabase logs untuk database errors

### Common Errors dan Solusi

1. **"supabaseUrl is required"**
   - Environment variable `SUPABASE_URL` belum di-set

2. **"Failed to fetch"**
   - CORS issue atau backend tidak running
   - Check `FRONTEND_URL` di backend env

3. **"Build failed: npm ERR!"**
   - Clear build cache di Railway
   - Check Node.js version compatibility

4. **"Redis connection refused"**
   - Normal jika tidak pakai Redis
   - App tetap jalan tanpa message queue

## 🎯 Tips untuk Production

1. **Security**:
   - Ganti semua default passwords
   - Use strong CRON_SECRET
   - Enable Supabase RLS (Row Level Security)

2. **Performance**:
   - Enable Redis untuk better WhatsApp queue
   - Set proper build caching

3. **Monitoring**:
   - Setup uptime monitoring (UptimeRobot)
   - Enable error tracking (Sentry - optional)

4. **Backup**:
   - Regular Supabase backup
   - Keep GitHub repo updated

---

**Note**: Panduan ini untuk deployment basic. Untuk production scale besar, pertimbangkan:
- Custom domain
- CDN untuk assets
- Advanced monitoring
- Auto-scaling configuration