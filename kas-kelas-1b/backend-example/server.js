require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, you should specify exact origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://kas-kelas-1b.up.railway.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Supabase client with service role key for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for backend
);

// Pakasir webhook endpoint
app.post('/api/webhook/pakasir', async (req, res) => {
  try {
    const payload = req.body;
    console.log('Received webhook:', payload);

    // Get the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, student:students(*), payment_type:payment_types(*)')
      .eq('order_id', payload.order_id)
      .single();

    if (fetchError || !transaction) {
      console.error('Transaction not found:', payload.order_id);
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Validate the webhook payload
    if (payload.amount !== transaction.amount || 
        payload.order_id !== transaction.order_id || 
        payload.project !== process.env.PAKASIR_SLUG) {
      console.error('Invalid webhook payload');
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' });
    }

    // Update transaction status
    if (payload.status === 'completed') {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          payment_method: payload.payment_method,
          completed_at: payload.completed_at
        })
        .eq('order_id', payload.order_id);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return res.status(500).json({ success: false, message: 'Error updating transaction' });
      }

      // Send WhatsApp confirmation
      if (transaction.student && transaction.payment_type) {
        const message = `Assalamu'alaikum Bapak/Ibu wali murid ${transaction.student.name},

Alhamdulillah, pembayaran ${transaction.payment_type.name} sebesar Rp ${transaction.amount.toLocaleString('id-ID')} telah kami terima melalui ${payload.payment_method}.

Terima kasih atas pembayaran yang tepat waktu.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

        try {
          await axios.post('https://api.dripsender.id/send', {
            api_key: process.env.DRIPSENDER_API_KEY,
            phone: transaction.student.parent_phone.replace(/[\s-]/g, ''),
            text: message
          });

          // Log WhatsApp message
          await supabase
            .from('whatsapp_logs')
            .insert({
              student_id: transaction.student_id,
              transaction_id: transaction.id,
              phone_number: transaction.student.parent_phone,
              message: message,
              status: 'success'
            });
        } catch (waError) {
          console.error('Error sending WhatsApp:', waError);
        }
      }
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Error processing webhook' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kas Kelas 1B Backend Server',
    endpoints: {
      webhook: 'POST /api/webhook/pakasir',
      health: 'GET /health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});