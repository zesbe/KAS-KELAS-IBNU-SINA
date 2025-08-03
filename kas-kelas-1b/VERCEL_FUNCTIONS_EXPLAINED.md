# Vercel Functions - Penjelasan Lengkap

## 🤔 Apa itu Vercel Functions?

Vercel Functions adalah **serverless functions** yang berjalan di cloud. Bayangkan seperti mini backend yang hanya jalan saat dipanggil.

### Analogi Sederhana:
- **Traditional Backend**: Seperti toko yang buka 24/7 (server selalu running)
- **Serverless Functions**: Seperti tukang ojek online (aktif hanya saat ada order)

## 📂 Cara Setup

### 1. Struktur Folder
```
kas-kelas-1b/
├── api/                    ← Folder wajib namanya "api"
│   ├── webhook-pakasir.js  ← Akan jadi endpoint: /api/webhook-pakasir
│   ├── test.js            ← Akan jadi endpoint: /api/test
│   └── hello.js           ← Akan jadi endpoint: /api/hello
├── src/                   ← React app biasa
└── package.json
```

### 2. Format Function
Setiap file di folder `api/` harus export default function:

```javascript
// api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello World' });
}
```

### 3. Akses di Browser/Postman
- Local: `http://localhost:3000/api/hello`
- Production: `https://your-app.vercel.app/api/hello`

## 🔨 Contoh Real untuk Project Ini

### Webhook Handler (`api/webhook-pakasir.js`)
```javascript
export default async function handler(req, res) {
  // 1. Cek method (hanya terima POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Ambil data dari Pakasir
  const { order_id, amount, status } = req.body;

  // 3. Update database
  // 4. Kirim WhatsApp
  // 5. Return response
  res.status(200).json({ success: true });
}
```

## 🚀 Deploy ke Vercel

### Step 1: Push ke GitHub
```bash
git add .
git commit -m "Add Vercel Functions"
git push
```

### Step 2: Import di Vercel
1. Login [vercel.com](https://vercel.com)
2. "New Project"
3. Import repository GitHub
4. Vercel otomatis detect folder `api/`

### Step 3: Set Environment Variables
Di Vercel Dashboard → Settings → Environment Variables:

```
# Untuk React App (prefix REACT_APP_)
REACT_APP_SUPABASE_URL=xxx
REACT_APP_SUPABASE_ANON_KEY=xxx

# Untuk Functions (tanpa prefix)
SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DRIPSENDER_API_KEY=xxx
```

### Step 4: Deploy!
Vercel otomatis build dan deploy. Done! 🎉

## 📍 URL Mapping

| File di `api/` | URL Endpoint |
|----------------|--------------|
| `api/webhook-pakasir.js` | `/api/webhook-pakasir` |
| `api/check-status.js` | `/api/check-status` |
| `api/send-reminder.js` | `/api/send-reminder` |

## 🧪 Testing Locally

### Install Vercel CLI
```bash
npm i -g vercel
```

### Run Development
```bash
vercel dev
```

Ini akan run:
- React app di `http://localhost:3000`
- Functions di `http://localhost:3000/api/*`

## ❓ FAQ

### Q: Bisa pakai Express.js?
A: Tidak perlu! Vercel Functions sudah handle routing.

### Q: Bisa connect database?
A: Bisa! Tapi gunakan connection pooling karena serverless.

### Q: Ada timeout?
A: Ya, max 10 detik untuk free plan (cukup untuk webhook).

### Q: Bisa debug?
A: Ya, lihat logs di Vercel Dashboard → Functions → Logs

## 🎁 Bonus: Test Function

Buat file `api/test.js`:
```javascript
export default function handler(req, res) {
  const { name = 'World' } = req.query;
  res.status(200).json({ 
    message: `Hello ${name}!`,
    time: new Date().toISOString()
  });
}
```

Test:
- GET `/api/test` → `{"message": "Hello World!"}`
- GET `/api/test?name=Budi` → `{"message": "Hello Budi!"}`

## 💡 Tips

1. **Satu File = Satu Endpoint**
   - Tidak seperti Express dengan banyak routes
   - Simple dan predictable

2. **Environment Variables**
   - Frontend: `REACT_APP_*`
   - Functions: Tanpa prefix

3. **Error Handling**
   - Always return proper status codes
   - Log errors untuk debugging

4. **Security**
   - Validate input
   - Check API keys
   - Use CORS if needed

## 🚨 Common Mistakes

1. **Lupa export default**
   ```javascript
   // ❌ Wrong
   function handler(req, res) {}
   
   // ✅ Correct
   export default function handler(req, res) {}
   ```

2. **Salah folder**
   ```
   ❌ src/api/webhook.js
   ❌ functions/webhook.js
   ✅ api/webhook.js
   ```

3. **Import path**
   ```javascript
   // ❌ Wrong (can't import from src)
   import { supabase } from '../src/services/supabase';
   
   // ✅ Correct (install dependencies or inline)
   import { createClient } from '@supabase/supabase-js';
   ```

## 🎯 Kesimpulan

Vercel Functions = Simple way to add backend logic without managing servers!

Perfect untuk:
- Webhooks
- API endpoints
- Background jobs
- Authentication
- Payment processing