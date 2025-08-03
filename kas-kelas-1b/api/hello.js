// Ini adalah Vercel Function paling sederhana
export default function handler(req, res) {
  // req = request dari user
  // res = response yang kita kirim balik
  
  res.status(200).json({
    message: 'Hello dari Vercel Function!',
    method: req.method,
    time: new Date().toISOString()
  });
}