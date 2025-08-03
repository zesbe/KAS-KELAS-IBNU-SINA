# Panduan Deploy Kas Kelas 1B ke Railway

## Persiapan Sebelum Deploy

### 1. Buat Akun Railway
1. Buka https://railway.app
2. Klik "Start a New Project"
3. Login dengan GitHub (disarankan) atau email
4. Verifikasi akun Anda

### 2. Install Railway CLI (Opsional)
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 -useb | iex

# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh
```

### 3. Persiapkan Repository GitHub
1. Pastikan semua kode sudah di-push ke GitHub
2. Repository harus public atau Railway harus punya akses

## Deploy Backend ke Railway

### Step 1: Buat Project Backend
1. Login ke Railway Dashboard
2. Klik "New Project"
3. Pilih "Deploy from GitHub repo"
4. Pilih repository Anda
5. Railway akan mendeteksi project Anda

### Step 2: Konfigurasi Backend
1. Klik project yang baru dibuat
2. Pergi ke tab "Settings"
3. Di bagian "Service", set:
   - **Root Directory**: `kas-kelas-1b/backend`
   - **Start Command**: `npm start`

### Step 3: Setup Environment Variables Backend
Klik tab "Variables" dan tambahkan:

```env
# Server Configuration
NODE_ENV=production
PORT=3001

# Frontend URL (ganti dengan URL frontend Railway Anda)
FRONTEND_URL=https://kas-kelas-1b-frontend.up.railway.app

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# Dripsender Configuration  
DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa

# Pakasir Configuration
PAKASIR_SLUG=your-pakasir-slug
```

### Step 4: Deploy Redis untuk Message Queue
1. Di Railway Dashboard, klik "New" → "Database" → "Redis"
2. Tunggu Redis selesai deploy
3. Copy Redis URL dari tab "Connect"
4. Tambahkan ke environment variables backend:

```env
# Redis Configuration
REDIS_URL=redis://default:password@host:port
```

Atau pisahkan menjadi:
```env
REDIS_HOST=your-redis-host.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Step 5: Generate Domain Backend
1. Di tab "Settings" backend service
2. Scroll ke "Domains"
3. Klik "Generate Domain"
4. Copy URL yang diberikan (contoh: `kas-kelas-backend.up.railway.app`)

## Deploy Frontend ke Railway

### Step 1: Buat Service Frontend Baru
1. Di project yang sama, klik "New Service"
2. Pilih "GitHub Repo" lagi
3. Pilih repository yang sama

### Step 2: Konfigurasi Frontend
1. Klik service frontend yang baru
2. Di tab "Settings":
   - **Root Directory**: `kas-kelas-1b`
   - **Build Command**: `npm run build`
   - **Start Command**: `serve -s build -l $PORT`

### Step 3: Setup Environment Variables Frontend
Di tab "Variables", tambahkan:

```env
# React App Environment
GENERATE_SOURCEMAP=false

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

# Backend URL (ganti dengan URL backend Railway Anda)
REACT_APP_BACKEND_URL=https://kas-kelas-backend.up.railway.app

# Pakasir Configuration
REACT_APP_PAKASIR_URL=https://pakasir.com/payment
REACT_APP_PAKASIR_SLUG=your-pakasir-slug

# Dripsender Configuration
REACT_APP_DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
```

### Step 4: Generate Domain Frontend
1. Di tab "Settings" frontend service
2. Scroll ke "Domains"
3. Klik "Generate Domain"
4. Copy URL frontend

## Konfigurasi Webhook Pakasir

1. Login ke Pakasir Dashboard
2. Pergi ke Settings → Webhook
3. Set Webhook URL: `https://kas-kelas-backend.up.railway.app/api/webhook/pakasir`
4. Save

## Testing Deployment

### 1. Test Backend Health
```bash
curl https://kas-kelas-backend.up.railway.app/health
```

Response yang diharapkan:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "UP",
    "redis": "UP"
  }
}
```

### 2. Test Frontend
1. Buka URL frontend di browser
2. Login dengan kredensial yang sudah dibuat
3. Test fitur-fitur aplikasi

### 3. Test Broadcast dengan Delay
1. Login ke aplikasi
2. Pergi ke menu "Broadcast"
3. Set delay (misal 10 detik)
4. Kirim ke 2-3 siswa untuk test
5. Monitor di "Status Antrian Pesan"

## Monitoring dan Logs

### Melihat Logs
1. Di Railway Dashboard, klik service yang ingin dilihat
2. Klik tab "Logs"
3. Atau gunakan Railway CLI:
```bash
railway logs
```

### Monitoring Performa
1. Di tab "Metrics" untuk melihat:
   - CPU usage
   - Memory usage
   - Network I/O

## Troubleshooting

### Backend Tidak Bisa Start
- Cek logs untuk error message
- Pastikan semua environment variables terisi
- Cek apakah PORT diset dengan benar

### Frontend Build Error
- Pastikan semua dependencies terinstall
- Cek environment variables (harus pakai prefix REACT_APP_)
- Lihat build logs untuk detail error

### WhatsApp Tidak Terkirim
1. Cek API Key Dripsender
2. Cek logs backend untuk error
3. Pastikan Redis running untuk message queue
4. Test manual dengan curl:
```bash
curl -X POST https://kas-kelas-backend.up.railway.app/api/broadcast/status
```

### Redis Connection Error
- Pastikan Redis service running
- Cek Redis credentials di environment variables
- Test koneksi Redis dari logs

## Tips untuk Production

### 1. Scaling
- Railway otomatis handle scaling
- Untuk traffic tinggi, upgrade ke plan berbayar
- Monitor usage di dashboard

### 2. Backup Database
- Supabase otomatis backup database
- Buat backup manual regular dari Supabase Dashboard

### 3. Security
- Jangan share service role key
- Gunakan environment variables untuk semua secrets
- Enable 2FA di Railway dan GitHub

### 4. Cost Optimization
- Railway free tier: $5 credit/bulan
- Monitor usage di Settings → Usage
- Optimize dengan:
  - Mengurangi build frequency
  - Menggunakan caching
  - Optimize image sizes

## Update Aplikasi

### Deploy Update Otomatis
1. Push changes ke GitHub
2. Railway otomatis deploy dari branch yang di-set (default: main)

### Deploy Manual
```bash
# Dari folder project
railway up
```

### Rollback
1. Di Railway Dashboard, pergi ke "Deployments"
2. Klik deployment sebelumnya yang stable
3. Klik "Rollback to this deployment"

## Perintah Railway CLI Berguna

```bash
# Login
railway login

# Link project
railway link

# Lihat logs
railway logs

# Buka dashboard
railway open

# Run command di production
railway run echo "Hello"

# Lihat environment variables
railway variables
```

## Checklist Deployment

- [ ] Railway account created
- [ ] GitHub repository ready
- [ ] Backend deployed
- [ ] Redis deployed
- [ ] Backend environment variables set
- [ ] Frontend deployed  
- [ ] Frontend environment variables set
- [ ] Domains generated
- [ ] Pakasir webhook configured
- [ ] Health check passing
- [ ] Test broadcast working
- [ ] Monitoring active

## Support

Jika ada masalah:
1. Cek Railway Status: https://railway.app/status
2. Railway Discord: https://discord.gg/railway
3. Documentation: https://docs.railway.app