const express = require('express');
const router = express.Router();
const { sendPaymentConfirmation } = require('../services/whatsappService');

// Pakasir webhook endpoint
router.post('/pakasir', async (req, res) => {
  try {
    const payload = req.body;
    const supabase = req.app.locals.supabase;
    
    console.log('Received webhook from Pakasir:', payload);

    // Get the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*, student:students(*), payment_type:payment_types(*)')
      .eq('order_id', payload.order_id)
      .single();

    if (fetchError || !transaction) {
      console.error('Transaction not found:', payload.order_id);
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }

    // Validate the webhook payload
    if (payload.amount !== transaction.amount || 
        payload.order_id !== transaction.order_id || 
        payload.project !== process.env.PAKASIR_SLUG) {
      console.error('Invalid webhook payload');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid webhook payload' 
      });
    }

    // Update transaction status
    if (payload.status === 'completed') {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          payment_method: payload.payment_method,
          completed_at: payload.completed_at || new Date().toISOString()
        })
        .eq('order_id', payload.order_id);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return res.status(500).json({ 
          success: false, 
          message: 'Error updating transaction' 
        });
      }

      // Send WhatsApp confirmation
      if (transaction.student && transaction.payment_type) {
        try {
          await sendPaymentConfirmation(
            transaction.student.parent_phone,
            transaction.student.name,
            transaction.payment_type.name,
            transaction.amount,
            payload.payment_method
          );
          
          console.log('WhatsApp confirmation sent successfully');
        } catch (waError) {
          console.error('Error sending WhatsApp:', waError);
          // Don't fail the webhook if WhatsApp fails
        }
      }

      // Update student's last payment date
      if (transaction.student_id) {
        await supabase
          .from('students')
          .update({
            last_payment_date: new Date().toISOString()
          })
          .eq('id', transaction.student_id);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

module.exports = router;