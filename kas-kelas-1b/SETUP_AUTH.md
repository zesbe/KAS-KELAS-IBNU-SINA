# Setup Authentication di Supabase

Untuk menggunakan aplikasi ini, Anda perlu setup authentication di Supabase:

## 1. Enable Email Authentication

1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Pergi ke Authentication > Providers
4. Enable "Email" provider

## 2. Buat User Admin

Ada 2 cara untuk membuat user:

### Cara 1: Melalui Supabase Dashboard

1. Pergi ke Authentication > Users
2. Klik "Invite User"
3. Masukkan email admin
4. User akan menerima email invitation

### Cara 2: Melalui SQL Editor

```sql
-- Buat user admin
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  'admin@sdislamalhusna.com',
  crypt('password123', gen_salt('bf')), -- Ganti dengan password yang aman
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now()
);
```

## 3. Setup Row Level Security (RLS)

Jalankan SQL berikut untuk mengamankan tabel:

```sql
-- Enable RLS untuk semua tabel
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- Create policies untuk authenticated users
CREATE POLICY "Enable all access for authenticated users" ON students
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON payment_types
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON payment_reminders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON whatsapp_logs
  FOR ALL USING (auth.role() = 'authenticated');
```

## 4. Test Login

1. Jalankan aplikasi dengan `npm start`
2. Buka http://localhost:3000
3. Login dengan kredensial yang telah dibuat
4. Anda akan diarahkan ke dashboard

## Tips Keamanan

1. Gunakan password yang kuat
2. Aktifkan 2FA jika memungkinkan
3. Batasi akses hanya untuk admin yang dipercaya
4. Monitor login activity di Supabase Dashboard
5. Backup data secara berkala