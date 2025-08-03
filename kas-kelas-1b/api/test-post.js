// Contoh function yang terima POST request
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Ambil data dari body request
    const { name, amount } = req.body;
    
    // Process data
    res.status(200).json({
      success: true,
      message: `Received payment from ${name} for Rp ${amount}`,
      data: req.body
    });
  } else {
    // Kalau bukan POST, return error
    res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }
}