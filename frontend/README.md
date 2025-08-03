# Sistem Manajemen Kas Kelas 1B - SD Islam Al Husna

Aplikasi web untuk mengelola kas kelas 1B SD Islam Al Husna tahun ajaran 2025/2026. Aplikasi ini dibangun menggunakan React, TypeScript, Tailwind CSS, dan terintegrasi dengan Supabase, payment gateway Pakasir, dan WhatsApp gateway Dripsender.

## Fitur Utama

- **Dashboard**: Menampilkan ringkasan statistik kas kelas
- **Manajemen Siswa**: CRUD data siswa dan nomor telepon orang tua
- **Manajemen Transaksi**: Membuat dan melacak pembayaran kas
- **Integrasi Payment Gateway**: Pembayaran online melalui Pakasir dengan QRIS
- **Notifikasi WhatsApp**: Pengingat pembayaran otomatis via Dripsender
- **Laporan Keuangan**: Analisis dan export laporan kas kelas
- **Autentikasi**: Login aman menggunakan Supabase Auth

## Teknologi yang Digunakan

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Payment Gateway**: Pakasir
- **WhatsApp Gateway**: Dripsender
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Utils**: date-fns
- **HTTP Client**: Axios

## Instalasi

1. Clone repository ini
```bash
git clone [repository-url]
cd kas-kelas-1b
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
Buat file `.env` di root folder dan isi dengan konfigurasi berikut:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_DRIPSENDER_API_KEY=your_dripsender_api_key
REACT_APP_PAKASIR_SLUG=your_pakasir_slug
REACT_APP_PAKASIR_API_KEY=your_pakasir_api_key
REACT_APP_WEBHOOK_URL=your_webhook_url
```

4. Setup database di Supabase
Jalankan SQL script yang ada di file `supabase_schema.sql` di Supabase SQL Editor

5. Jalankan aplikasi
```bash
npm start
```

## Konfigurasi Webhook

Untuk menerima notifikasi pembayaran dari Pakasir, Anda perlu:

1. Deploy backend server untuk handle webhook (contoh implementasi ada di `src/pages/api/webhook.ts`)
2. Set webhook URL di dashboard Pakasir ke endpoint backend Anda
3. Pastikan backend dapat mengakses Supabase untuk update status transaksi

## Penggunaan

### Login
Gunakan email dan password yang telah didaftarkan di Supabase Auth

### Membuat Transaksi
1. Buka halaman Transaksi
2. Klik tombol "Buat Transaksi"
3. Pilih siswa dan jenis pembayaran
4. Sistem akan otomatis:
   - Generate link pembayaran
   - Kirim notifikasi WhatsApp ke orang tua

### Melihat Laporan
1. Buka halaman Laporan
2. Pilih bulan yang ingin dilihat
3. Export ke CSV jika diperlukan

## Struktur Folder

```
kas-kelas-1b/
├── public/
├── src/
│   ├── components/     # Komponen React
│   ├── contexts/       # Context providers
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Halaman aplikasi
│   ├── services/       # Service layer (API calls)
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── index.tsx       # Entry point
├── .env               # Environment variables
├── package.json       # Dependencies
└── README.md          # Documentation
```

## API Services

### Supabase
- Authentication
- Database operations (students, transactions, payment types, etc.)

### Pakasir
- Generate payment URL
- Check transaction status
- Webhook handler untuk payment notification

### Dripsender
- Send WhatsApp messages
- Payment reminders
- Payment confirmations

## Deployment

1. Build aplikasi
```bash
npm run build
```

2. Deploy ke hosting service (Vercel, Netlify, etc.)

3. Set environment variables di hosting service

4. Setup webhook endpoint untuk Pakasir

## Maintenance

- Backup database Supabase secara berkala
- Monitor WhatsApp API usage di Dripsender
- Check payment gateway status di Pakasir

## Support

Untuk bantuan atau pertanyaan, silakan hubungi admin.

## License

Private - SD Islam Al Husna
