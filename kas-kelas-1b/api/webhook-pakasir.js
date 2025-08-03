import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    console.log('Webhook received:', payload);

    // Get transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, student:students(*), payment_type:payment_types(*)')
      .eq('order_id', payload.order_id)
      .single();

    if (fetchError || !transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Validate webhook
    if (payload.amount !== transaction.amount || 
        payload.order_id !== transaction.order_id || 
        payload.project !== process.env.PAKASIR_SLUG) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
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
        throw updateError;
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

          // Log WhatsApp
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
          console.error('WhatsApp error:', waError);
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}