Saya ingin dibuatkan aplikasi web untuk manajemen kas kelas SD Islam Al Husna (tahun ajaran 2025/2026) kelas 1B, berbasis React + Tailwind dan terintegrasi full dengan Supabase, terintegrasi Whatsap gateway dripsender, terintegrasi dengan pakasir fan semua serba otomatis.
saya lampirkan beberapa dokumentas:

dokumentasi dari pakasir :
Integrasi Pembayaran
Untuk mengarahkan pelanggan ke halaman pembayaran, cukup gunakan URL berikut:
https://pakasir.zone.id/pay/{slug}/{amount}?order_id={order_id}

https://pakasir.zone.id/pay/uangkasalhusna/22000?order_id=240910HDE7C9&qris_only=1

Tambahkan redirect
Untuk memunculkan tombol "← Kembali ke halaman merchant" setelah pengunjung berhasil melakukan pembayaran.
Tambahkan redirect=https://berbagiakun.com pada URL contoh :
https://pakasir.zone.id/pay/uangkasalhusna/7000?order_id=240910HDE7C9&qris_only=1&redirect=https://berbagiakun.com/invoices

Webhook
Ketika pelanggan berhasil melakukan pembayaran dan dana masuk ke sistem kami, maka kami akan memberitahukan sistem Anda melalui webhook.

Kami akan mengirimkan http POST dengan struktur body sebagai berikut:
{
"amount": 22000,
"order_id": "240910HDE7C9",
"project": "uangkasalhusna",
"status": "completed",
"payment_method": "qris",
"completed_at": "2024-09-10T08:07:02.819+07:00"
}

Untuk menerima webhook tersebut, silakan isi Webhook URL pada proyek Anda (yaitu melalui form Edit Proyek).

Penting: Saat menerima webhook pastikan amount dan order_id sesuai dengan transaksi di sistem Anda. Kami sarankan untuk tetap menggunakan API dibawah ini untuk pengecekan status yang lebih valid.

Transaction Detail API
Untuk mengetahui status sebuah transaksi Anda bisa lakukan melalui API ini. Disini Anda membutuhkan API Key yang terdapat di halaman detail Proyek.

Berikut ini adalah API yang bisa Anda panggil:
GET https://pakasir.zone.id/api/transactiondetail?project={slug}&amount={amount}&order_id={order_id}&api_key={api_key}

Contoh penggunaan yang benar dengan CURL:
curl https://pakasir.zone.id/api/transactiondetail?project=uangkasalhusna&amount=22000&order_id=240910HDE7C9&api_key=JHGejwhe237dkhjeukyw8e33
Untuk response yang akan Anda dapatkan kurang lebih seperti berikut:
{
"transaction": {
"amount": 22000,
"order_id": "240910HDE7C9",
"project": "uangkasalhusna",
"status": "completed",
"payment_method": "qris",
"completed_at": "2024-09-10T08:07:02.819+07:00"
}
}

Catatan :
Slug yang dimiliki : "uang-kas-kelas-1-ibnu-sina"
Api yang dimiliki "u8e0CphRmRVuNwDyqnfNoeOwHa6UBpLg"
Website yang saya miliki : berbagiakun.com

supabase:
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucmp1aXdpcGduYmN4Z2dnZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTQ0NzYsImV4cCI6MjA2OTU3MDQ3Nn0.w_t5aAcbmvsTd1qFVl9orKTjTQNLAWJ7Be0QzeMFkZs

service role key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucmp1aXdpcGduYmN4Z2dnZWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTQ0NzYsImV4cCI6MjA2OTU3MDQ3Nn0.w_t5aAcbmvsTd1qFVl9orKTjTQNLAWJ7Be0QzeMFkZs

url supabase: https://snrjuiwipgnbcxgggeiq.supabase.co

dokumentasi dripsender:
Dokumentasi Whatsap gateway:
Kirim Pesan Text + File (optional)
POST https://api.dripsender.id/send
Gunakan Endpoint ini untuk mengirimkan pesan dari aplikasi kamu via dripsender.id

Get List
GET https://api.dripsender.id/lists/
Gunakan Endpoint ini untuk melihat list dari whatsapp kamu di dripsender.id

Get Contact dari list
GET https://api.dripsender.id/lists/:id
Gunakan Endpoint ini untuk melihat contact dari list  whatsapp kamu di dripsender.id, ubah :id dengan list id kamu

Dan ini api saya: bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
