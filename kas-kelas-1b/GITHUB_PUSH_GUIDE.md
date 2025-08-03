# 📤 Panduan Push ke GitHub

## 1. **Buat Repository di GitHub**

1. Login ke [GitHub](https://github.com)
2. Klik tombol **"New"** atau **"+"** → **"New repository"**
3. Isi detail repository:
   - **Repository name**: `kas-kelas-1b`
   - **Description**: "Sistem Manajemen Kas Kelas 1B SD Islam Al Husna - React + Supabase + WhatsApp Gateway"
   - **Public/Private**: Pilih sesuai kebutuhan
   - **JANGAN** centang "Initialize this repository with a README"
   - **JANGAN** tambahkan .gitignore atau license

4. Klik **"Create repository"**

## 2. **Push ke GitHub**

Setelah repository dibuat, jalankan perintah berikut di terminal:

```bash
# Tambahkan remote origin (ganti USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/USERNAME/kas-kelas-1b.git

# Push ke GitHub
git push -u origin main
```

Jika diminta username dan password:
- **Username**: Username GitHub Anda
- **Password**: Personal Access Token (bukan password biasa)

### Cara membuat Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Beri nama token dan pilih scope "repo"
4. Copy token dan gunakan sebagai password

## 3. **Setup Vercel dengan GitHub**

1. Login ke [Vercel](https://vercel.com)
2. Click **"Import Project"**
3. Pilih **"Import Git Repository"**
4. Authorize Vercel untuk akses GitHub
5. Pilih repository `kas-kelas-1b`
6. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)

7. **PENTING**: Add Environment Variables di Vercel:
   ```
   REACT_APP_SUPABASE_URL=your-value
   REACT_APP_SUPABASE_ANON_KEY=your-value
   REACT_APP_DRIPSENDER_API_KEY=your-value
   REACT_APP_PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
   REACT_APP_PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
   REACT_APP_PAKASIR_BASE_URL=https://pakasir.com
   REACT_APP_VAPID_PUBLIC_KEY=your-value
   
   SUPABASE_URL=your-value
   SUPABASE_SERVICE_KEY=your-value
   DRIPSENDER_API_KEY=your-value
   PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
   PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
   CRON_SECRET=your-value
   VAPID_PRIVATE_KEY=your-value
   VAPID_SUBJECT=mailto:admin@kaskelasb.com
   ```

8. Click **"Deploy"**

## 4. **Update Webhook URL di Pakasir**

Setelah deploy berhasil:
1. Copy URL deployment Vercel (misal: `https://kas-kelas-1b.vercel.app`)
2. Login ke Pakasir Dashboard
3. Update webhook URL menjadi: `https://kas-kelas-1b.vercel.app/api/webhook-pakasir`

## 5. **Test Aplikasi**

1. Buka URL deployment
2. Login dengan credentials Supabase
3. Test semua fitur:
   - ✅ Dashboard
   - ✅ Transaksi & Pembayaran
   - ✅ Pengeluaran
   - ✅ Laporan Keuangan
   - ✅ Broadcast WhatsApp
   - ✅ Parent Portal
   - ✅ Auto-Recurring
   - ✅ PWA & Push Notifications

## 📝 **Checklist Deployment**

- [ ] Repository GitHub dibuat
- [ ] Code di-push ke GitHub
- [ ] Vercel connected dengan GitHub
- [ ] Environment variables di-set di Vercel
- [ ] Deploy berhasil
- [ ] Webhook URL diupdate di Pakasir
- [ ] Cron job berjalan (cek Vercel Functions logs)
- [ ] Aplikasi bisa diakses
- [ ] Test pembayaran berhasil
- [ ] WhatsApp notification terkirim

## 🎉 **Selamat!**

Aplikasi Kas Kelas 1B Anda sudah live dan siap digunakan!

### Support & Maintenance:
- Monitor logs di Vercel Dashboard
- Check Supabase usage
- Update dependencies secara berkala
- Backup database Supabase