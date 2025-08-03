# Setting Environment Variables di Vercel - SATU TEMPAT!

## 📍 Lokasi: Vercel Dashboard → Settings → Environment Variables

### ✅ Set SEMUA Variables di Satu Tempat:

```bash
# 1. UNTUK FRONTEND (React App) - Pakai prefix REACT_APP_
REACT_APP_SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
REACT_APP_PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
REACT_APP_PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg

# 2. UNTUK BACKEND (Vercel Functions) - TANPA prefix
SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service role!)
DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
```

## 🎯 Cara Vercel Membaca Environment Variables:

### Frontend (React):
```javascript
// src/services/supabase.ts
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
// ↑ Vercel kasih value dari REACT_APP_SUPABASE_URL
```

### Backend (Functions):
```javascript
// api/webhook-pakasir.js
const supabaseUrl = process.env.SUPABASE_URL;
// ↑ Vercel kasih value dari SUPABASE_URL (tanpa prefix)
```

## 📝 Step by Step di Vercel Dashboard:

1. **Login Vercel → Pilih Project**
2. **Click "Settings" tab**
3. **Scroll ke "Environment Variables"**
4. **Add variables satu per satu:**

   ```
   Name: REACT_APP_SUPABASE_URL
   Value: https://snrjuiwipgnbcxgggeiq.supabase.co
   Environment: ✓ Production ✓ Preview ✓ Development
   [Add]
   ```

5. **Repeat untuk semua variables**
6. **Redeploy** (Vercel akan prompt otomatis)

## ⚠️ PENTING: Service Role Key

```bash
# Frontend pakai ANON key (safe untuk public)
REACT_APP_SUPABASE_ANON_KEY=xxx  # ← Anon key

# Backend pakai SERVICE ROLE key (secret!)
SUPABASE_SERVICE_ROLE_KEY=xxx    # ← Service role key
```

Cari di Supabase Dashboard → Settings → API → Service Role Key

## 🔍 Verifikasi:

### Check Frontend:
```javascript
// Di browser console
console.log(process.env.REACT_APP_SUPABASE_URL); // undefined (normal!)
// Karena sudah di-compile saat build
```

### Check Backend:
```javascript
// api/test-env.js
export default function handler(req, res) {
  res.json({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasDripsenderKey: !!process.env.DRIPSENDER_API_KEY
  });
}
```

## 🎁 Tips:

1. **Copy-Paste Friendly**
   - Siapkan semua values di notepad dulu
   - Copy-paste satu per satu

2. **Double Check**
   - Tidak ada spasi di awal/akhir value
   - Tidak ada quotes di value

3. **Test After Deploy**
   - Frontend: Coba login
   - Backend: Test webhook dengan Postman

## ❌ TIDAK PERLU:

- Setting di `.env` untuk production (cuma untuk local dev)
- Setting di tempat lain
- Config server
- Setup Docker
- Anything else!

## ✅ SUMMARY:

**SATU TEMPAT** → Vercel Dashboard → Environment Variables → **DONE!** 🎉