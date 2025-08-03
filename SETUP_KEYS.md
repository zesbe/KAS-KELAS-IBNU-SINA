# 🔑 Setup Keys & Environment Variables

## 1. **CRON_SECRET**

**Apa itu?**
- Secret key untuk mengamankan Vercel Cron Job endpoint
- Mencegah orang lain trigger cron job tanpa izin

**Cara Generate:**
```bash
# Option 1: Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using openssl
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**Contoh hasil:**
```
CRON_SECRET=kK8Qh5bT3mN9pL2wX6vZ4cF7jR1yS0aE
```

## 2. **VAPID Keys (Push Notifications)**

**Apa itu?**
- VAPID = Voluntary Application Server Identification
- Keys untuk push notification authentication
- Public key untuk frontend, Private key untuk backend

**Cara Generate:**

### Option 1: Using web-push library (RECOMMENDED)
```bash
# Install web-push
npm install -g web-push

# Generate keys
web-push generate-vapid-keys

# Or use our script
cd kas-kelas-1b
npm install web-push
node scripts/generate-vapid-keys.js
```

### Option 2: Online Generator
Visit: https://vapidkeys.com/

### Option 3: Manual dengan Node.js
```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

**Contoh hasil:**
```
REACT_APP_VAPID_PUBLIC_KEY=BKd0F7QwPYSJHkp6LvnCwWquUELwg2eWibiGKmM5BZjqGHny9kogGMuUFXhBnzjMd1tWRLBhp_7Vj0jE8qc1mTU
VAPID_PRIVATE_KEY=4huQhkTB7UmFSuFhLzkdO9I3FBVh3x7iUTpYmBOG3Qw
VAPID_SUBJECT=mailto:admin@kaskelasb.com
```

## 3. **Setup di Vercel**

### Step 1: Add Environment Variables
1. Login ke [Vercel Dashboard](https://vercel.com)
2. Pilih project Anda
3. Go to Settings → Environment Variables
4. Add semua variables:

```bash
# Frontend Variables (add REACT_APP_ prefix)
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_DRIPSENDER_API_KEY=your-dripsender-key
REACT_APP_PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
REACT_APP_PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
REACT_APP_PAKASIR_BASE_URL=https://pakasir.com
REACT_APP_VAPID_PUBLIC_KEY=your-vapid-public-key

# Backend Variables (no prefix)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
DRIPSENDER_API_KEY=your-dripsender-key
PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg
CRON_SECRET=your-cron-secret
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@kaskelasb.com
```

### Step 2: Setup Cron Job
Vercel akan otomatis detect cron configuration dari `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron-daily",
    "schedule": "0 2 * * *"  // 09:00 WIB
  }]
}
```

### Step 3: Verify Cron Secret
Di `api/cron-daily.js`, cron secret di-verify dengan:
```javascript
const cronSecret = req.headers['x-vercel-cron-secret'];
if (cronSecret !== process.env.CRON_SECRET) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

## 4. **Testing**

### Test VAPID Keys:
1. Buka aplikasi di browser
2. Go to Settings → Enable Push Notifications
3. Check browser console untuk errors

### Test Cron Job:
1. Go to Settings page
2. Click "Test Cron Job"
3. Check hasil di console

### Manual Test Cron Endpoint:
```bash
curl -X POST https://your-app.vercel.app/api/cron-daily \
  -H "x-vercel-cron-secret: your-cron-secret"
```

## 5. **Security Best Practices**

1. **Never commit keys to Git**
   - Always use `.env` files
   - Add `.env` to `.gitignore`

2. **Use different keys for environments**
   - Development: `.env.local`
   - Production: Vercel Environment Variables

3. **Rotate keys regularly**
   - Change CRON_SECRET every 3-6 months
   - Update VAPID keys if compromised

4. **Limit access**
   - Only share keys with trusted team members
   - Use Vercel's team features for access control

## 6. **Troubleshooting**

### Push Notifications Not Working?
- Check if HTTPS is enabled (required for service workers)
- Verify VAPID keys are correct
- Check browser notification permissions

### Cron Job Not Running?
- Verify CRON_SECRET matches in Vercel
- Check Vercel Functions logs
- Ensure cron schedule is correct (UTC timezone)

### Keys Not Loading?
- Restart development server after changing .env
- Clear browser cache
- Check variable names (REACT_APP_ prefix for frontend)

## 📝 **Quick Copy-Paste**

Untuk development (`.env.local`):
```env
CRON_SECRET=kK8Qh5bT3mN9pL2wX6vZ4cF7jR1yS0aE
REACT_APP_VAPID_PUBLIC_KEY=BKd0F7QwPYSJHkp6LvnCwWquUELwg2eWibiGKmM5BZjqGHny9kogGMuUFXhBnzjMd1tWRLBhp_7Vj0jE8qc1mTU
VAPID_PRIVATE_KEY=4huQhkTB7UmFSuFhLzkdO9I3FBVh3x7iUTpYmBOG3Qw
VAPID_SUBJECT=mailto:admin@kaskelasb.com
```

**Note:** Ganti dengan keys yang Anda generate sendiri untuk production!