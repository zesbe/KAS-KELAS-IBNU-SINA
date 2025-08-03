# Deploy ke Vercel - Panduan Lengkap

Vercel adalah pilihan terbaik karena bisa handle Frontend + Backend (serverless functions) dalam satu deployment.

## 🚀 Quick Deploy

1. **Push ke GitHub**
2. **Import di Vercel**
   - Login ke [vercel.com](https://vercel.com)
   - New Project → Import Git Repository
   - Pilih repository Anda

3. **Environment Variables**
   Di Vercel dashboard, tambahkan:
   ```
   REACT_APP_SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   REACT_APP_DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
   REACT_APP_PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
   REACT_APP_PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
   
   # Untuk serverless functions
   SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
   DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
   PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
   ```

4. **Deploy!**
   Vercel akan otomatis build dan deploy

## 📍 Webhook URL

Setelah deploy, webhook URL Anda adalah:
```
https://your-app.vercel.app/api/webhook-pakasir
```

Set ini di Pakasir dashboard.

## 🆚 Perbandingan Deployment Options

### **Vercel (Recommended)**
✅ **Pros:**
- Frontend + Backend dalam satu deployment
- Serverless functions untuk webhook
- Auto HTTPS
- Preview deployments
- Great DX (Developer Experience)
- Generous free tier

❌ **Cons:**
- Serverless functions max 10 seconds (cukup untuk webhook)
- Cold start bisa lambat (1-2 detik pertama)

### **Netlify**
✅ **Pros:**
- Similar dengan Vercel
- Netlify Functions support
- Good for static sites

❌ **Cons:**
- Functions lebih terbatas
- Setup sedikit lebih complex

### **Railway**
✅ **Pros:**
- Full Node.js server (not serverless)
- No cold starts
- Better untuk complex backends

❌ **Cons:**
- Perlu 2 deployment (frontend + backend)
- $5/month setelah free credit habis

### **Vercel + Supabase Edge Functions**
✅ **Pros:**
- Webhook di Supabase langsung
- Satu ecosystem

❌ **Cons:**
- Learning curve Supabase Edge Functions
- Deno runtime (bukan Node.js)

## 🎯 Kesimpulan

**Untuk project ini, Vercel adalah pilihan terbaik karena:**
1. Satu deployment untuk semua
2. Gratis untuk traffic normal
3. Setup paling mudah
4. Performance bagus
5. Preview deployments untuk testing

## 📝 Checklist Deployment

- [ ] Push code ke GitHub
- [ ] Import di Vercel
- [ ] Set semua environment variables
- [ ] Deploy dan catat URL
- [ ] Update webhook URL di Pakasir
- [ ] Test payment flow end-to-end
- [ ] Monitor logs di Vercel dashboard

## 🔧 Tips

1. **Environment Variables**
   - Gunakan prefix `REACT_APP_` untuk frontend
   - Tanpa prefix untuk serverless functions

2. **Debugging**
   - Check Function Logs di Vercel dashboard
   - Gunakan `console.log` untuk debugging

3. **Performance**
   - First request mungkin lambat (cold start)
   - Subsequent requests akan cepat

4. **Custom Domain**
   - Vercel support custom domain gratis
   - Settings → Domains

## 🚨 Troubleshooting

### Webhook tidak berfungsi
1. Check Function Logs di Vercel
2. Pastikan URL benar di Pakasir
3. Test dengan Postman/curl

### Environment variables tidak terbaca
1. Re-deploy setelah add env vars
2. Check typo di variable names

### Build error
1. Check build logs
2. Pastikan semua dependencies ter-install