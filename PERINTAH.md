Saya ingin dibuatkan aplikasi web untuk manajemen kas kelas SD Islam Al Husna (tahun ajaran 2025/2026) kelas 1B, berbasis React + Tailwind dan terintegrasi full dengan Supabase, terintegrasi Whatsap gateway dripsender, terintegrasi dengan pakasir dan semua serba otomatis.
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

dan ini data orang tua siswa:
1. Ibnu Sina Azma - +62 856-8500-062  
2. Ibnu Sina Dizya - +62 812-8147-6276  
3. Ibnu Sina Khalifa - +62 877-4168-6950  
4. Ibnu Sina Kirana - +62 812-9759-7757  
5. Ibnu Sina Mikha - +62 813-8241-6552  
6. Ibnu Shina Shahia - +62 858-8163-6149  
7. Ibnu Sina Abil - +62 812-1172-3429  
8. Ibnu Sina Adiba - +62 813-2877-9423  
9. Ibnu Sina Arkaan - +62 821-1475-9339  
10. Ibnu Sina Atha - +62 812-9670-7505  
11. Ibnu Sina Nafi M - +62 856-2468-7313  
12. Ibnu Sina Nia - +62 812-9076-6367  
13. Ibnu Sina Radefa - +62 811-9403-103  
14. Ibnu Sina Saga K.A - +62 877-8539-3962  
15. Ibnu Sina Sekar - +62 812-2595-0048  
16. Ibnu Sina Shanum - +62 857-1663-5953  
17. Ibnu Sina Sheila - +62 822-6021-8027  
18. Ibnu Sina Yumna - +62 813-1007-5190  
19. Ibnu Sina Zaidan - +62 813-1684-0991
