# Rencana Fitur Pengeluaran

## 🎯 Fitur yang Bisa Ditambahkan:

### 1. **Tabel Pengeluaran**
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  description VARCHAR(255),
  amount DECIMAL(10,2),
  category VARCHAR(100),
  receipt_url TEXT,
  expense_date DATE,
  created_by UUID,
  created_at TIMESTAMP
);
```

### 2. **Halaman Pengeluaran**
- Form input pengeluaran
- Upload bukti/kwitansi
- Kategori (ATK, Snack, Transport, dll)
- Approval workflow

### 3. **Update Dashboard**
- Total Pemasukan
- Total Pengeluaran
- **Saldo Akhir** (Pemasukan - Pengeluaran)
- Cash flow chart

### 4. **Laporan Lengkap**
```
LAPORAN KAS KELAS 1B - JANUARI 2025
=====================================
PEMASUKAN:
- Kas Bulanan: Rp 950.000
- Study Tour: Rp 2.500.000
Total Pemasukan: Rp 3.450.000

PENGELUARAN:
- ATK: Rp 150.000
- Snack Rapat: Rp 200.000
Total Pengeluaran: Rp 350.000

SALDO AKHIR: Rp 3.100.000
=====================================
```

### 5. **Export Options**
- CSV dengan pemasukan & pengeluaran
- PDF report
- Excel format

## 🚀 Mau Ditambahkan?

Jika mau, saya bisa:
1. Buat tabel expenses di Supabase
2. Buat halaman kelola pengeluaran
3. Update dashboard dengan cash flow
4. Update export CSV dengan data lengkap

Tinggal bilang aja! 😊