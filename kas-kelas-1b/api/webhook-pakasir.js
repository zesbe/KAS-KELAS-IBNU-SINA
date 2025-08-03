import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id, status, payment_method, completed_at, amount } = req.body;

    console.log('Webhook received:', { order_id, status, payment_method, completed_at, amount });

    // Update transaction status in Supabase
    const { data: transaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: status === 'completed' ? 'completed' : 'failed',
        payment_method: payment_method || 'qris',
        completed_at: completed_at || new Date().toISOString()
      })
      .eq('order_id', order_id)
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return res.status(400).json({ error: 'Failed to update transaction' });
    }

    // Update daily balance
    if (status === 'completed' && transaction.completed_at) {
      const completedDate = new Date(transaction.completed_at).toISOString().split('T')[0];
      
      try {
        const { error: balanceError } = await supabase.rpc('calculate_daily_balance', {
          p_date: completedDate
        });
        
        if (balanceError) {
          console.error('Failed to update daily balance:', balanceError);
        }
      } catch (err) {
        console.error('Error updating daily balance:', err);
      }
    }

    // Send WhatsApp confirmation if payment is completed
    if (status === 'completed' && transaction.student?.parent_phone) {
      const message = `Terima kasih! Pembayaran ${transaction.payment_type?.name} sebesar Rp ${amount.toLocaleString('id-ID')} untuk ${transaction.student.name} telah berhasil diterima. Order ID: ${order_id}`;

      try {
        const whatsappResponse = await axios.post(
          'https://api.dripsender.id/send',
          {
            api_key: process.env.DRIPSENDER_API_KEY,
            phone: transaction.student.parent_phone,
            text: message
          }
        );

        // Log WhatsApp message
        await supabase.from('whatsapp_logs').insert({
          student_id: transaction.student_id,
          transaction_id: transaction.id,
          phone_number: transaction.student.parent_phone,
          message: message,
          status: 'sent',
          response: JSON.stringify(whatsappResponse.data)
        });

        console.log('WhatsApp confirmation sent successfully');
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp:', whatsappError);
        
        // Log failed WhatsApp attempt
        await supabase.from('whatsapp_logs').insert({
          student_id: transaction.student_id,
          transaction_id: transaction.id,
          phone_number: transaction.student.parent_phone,
          message: message,
          status: 'failed',
          response: whatsappError.message
        });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      transaction_id: transaction.id 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}