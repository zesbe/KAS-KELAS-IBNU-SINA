# Panduan Mengatasi Error Deployment Frontend di Railway

## Masalah
Error `npm error code ENOENT` dan `Could not read package.json: Error: ENOENT: no such file or directory, open '/app/package.json'` terjadi karena Railway mencari file `package.json` di direktori `/app/` tapi file tersebut tidak ada di sana. Ini terjadi karena struktur proyek Anda adalah monorepo dengan frontend dan backend terpisah.

## Solusi yang Telah Diterapkan

### 1. File nixpacks.toml
Saya telah membuat file `nixpacks.toml` di root directory yang memberitahu Railway cara build dan run aplikasi Anda:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
dependsOn = ["setup"]
cmds = ["npm install"]

[phases.build]
dependsOn = ["install"]
cmds = ["npm run build:frontend"]

[start]
cmd = "npm run start:frontend"
```

### 2. Root package.json
File `package.json` di root sudah dikonfigurasi dengan benar untuk:
- Mendefinisikan workspaces (frontend dan backend)
- Menyediakan scripts untuk build dan start
- Menentukan versi Node.js dan npm yang diperlukan

### 3. Dockerfile.railway (Alternatif)
Saya juga telah membuat `Dockerfile.railway` sebagai alternatif jika nixpacks tidak bekerja.

## Langkah-langkah Deploy di Railway

### Opsi 1: Deploy sebagai Monorepo (Rekomendasi Saat Ini)
1. Push semua perubahan ke GitHub:
   ```bash
   git add nixpacks.toml railway.json Dockerfile.railway
   git commit -m "Fix Railway deployment configuration"
   git push
   ```

2. Di Railway Dashboard:
   - Pastikan service Anda terhubung ke repository GitHub
   - Railway akan otomatis deploy dengan konfigurasi baru

### Opsi 2: Deploy Frontend sebagai Service Terpisah (Rekomendasi untuk Production)
1. Di Railway Dashboard, buat service baru
2. Connect ke repository GitHub yang sama
3. Di Settings → General:
   - Set **Root Directory** ke `/frontend`
   - Railway akan otomatis mendeteksi package.json di frontend/
4. Deploy

### Opsi 3: Gunakan Dockerfile
Jika nixpacks masih bermasalah:
1. Edit `railway.json`:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "./Dockerfile.railway"
     },
     "deploy": {
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```
2. Push perubahan dan deploy

## Environment Variables yang Diperlukan
Pastikan Anda sudah set environment variables di Railway:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_URL` (URL backend Anda)
- Port akan otomatis disediakan oleh Railway

## Troubleshooting

### Jika masih error:
1. **Cek Build Logs di Railway**
   - Lihat apakah npm install berhasil
   - Pastikan build command menemukan semua dependencies

2. **Verifikasi Structure**
   - Pastikan `frontend/package.json` ada
   - Pastikan `frontend/build/` folder tergenerate setelah build

3. **Clear Cache**
   - Di Railway Settings, coba "Clear Build Cache"
   - Deploy ulang

4. **Manual Root Directory**
   - Di Railway Settings → General
   - Set Root Directory ke `/frontend` (tanpa nixpacks.toml)

## Command untuk Test Lokal
Test build process secara lokal:
```bash
# Di root directory
npm install
npm run build:frontend
npm run start:frontend
```

Jika berhasil di lokal tapi gagal di Railway, kemungkinan masalah ada di konfigurasi Railway.

## Kontak Support
Jika semua solusi di atas tidak berhasil, hubungi Railway support dengan informasi:
- Repository structure (monorepo)
- Error logs lengkap
- Konfigurasi yang sudah dicoba