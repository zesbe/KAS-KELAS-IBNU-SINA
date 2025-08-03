# Panduan Deploy Frontend ke Railway (Production)

## Setup untuk Production - Deploy Frontend dan Backend Terpisah

### Langkah 1: Deploy Frontend Service

1. **Di Railway Dashboard:**
   - Klik "New Project"
   - Pilih "Deploy from GitHub repo"
   - Connect repository GitHub Anda

2. **Konfigurasi Frontend Service:**
   - Di Settings → General
   - Set **Root Directory** ke `/frontend`
   - Railway akan otomatis mendeteksi `frontend/package.json`

3. **Set Environment Variables untuk Frontend:**
   - `REACT_APP_SUPABASE_URL` - URL Supabase Anda
   - `REACT_APP_SUPABASE_ANON_KEY` - Anon key dari Supabase
   - `REACT_APP_API_URL` - URL backend service Railway Anda (lihat langkah 2)

### Langkah 2: Deploy Backend Service

1. **Buat Service Baru:**
   - Di project yang sama, klik "New" → "GitHub Repo"
   - Pilih repository yang sama

2. **Konfigurasi Backend Service:**
   - Di Settings → General
   - Set **Root Directory** ke `/backend`

3. **Set Environment Variables untuk Backend:**
   - `SUPABASE_URL` - URL Supabase Anda
   - `SUPABASE_SERVICE_KEY` - Service key dari Supabase (RAHASIA!)
   - `PORT` - Railway akan set otomatis
   - `NODE_ENV` - Set ke `production`

4. **Generate Domain:**
   - Di Settings → Networking
   - Klik "Generate Domain"
   - Copy URL ini untuk `REACT_APP_API_URL` di frontend

### Struktur File yang Diperlukan

```
project-root/
├── frontend/
│   ├── package.json
│   ├── railway.json     # Konfigurasi Railway untuk frontend
│   ├── src/
│   └── ...
├── backend/
│   ├── package.json
│   ├── railway.json     # Konfigurasi Railway untuk backend
│   ├── server.js
│   └── ...
└── package.json         # Root package.json untuk monorepo (opsional untuk production)
```

### Verifikasi Deployment

1. **Backend Service:**
   - Cek logs untuk memastikan server running
   - Test endpoint: `https://your-backend-domain.railway.app/api/health`

2. **Frontend Service:**
   - Cek build logs berhasil
   - Akses domain frontend
   - Pastikan bisa connect ke backend

### Tips untuk Production

1. **Security:**
   - Jangan expose `SUPABASE_SERVICE_KEY` di frontend
   - Gunakan CORS configuration di backend
   - Set proper authentication headers

2. **Performance:**
   - Enable caching di frontend
   - Gunakan CDN untuk static assets
   - Optimize bundle size

3. **Monitoring:**
   - Setup error tracking (Sentry, etc)
   - Monitor Railway metrics
   - Setup health checks

### Troubleshooting

**Frontend tidak bisa connect ke backend:**
- Pastikan `REACT_APP_API_URL` benar
- Cek CORS settings di backend
- Verifikasi backend service running

**Build failed:**
- Cek Node version di `engines` field
- Clear build cache di Railway
- Verifikasi semua dependencies ada di `dependencies` (bukan `devDependencies`)

**Environment variables tidak terbaca:**
- Frontend: Variables harus prefix `REACT_APP_`
- Deploy ulang setelah set environment variables
- Cek typo di variable names