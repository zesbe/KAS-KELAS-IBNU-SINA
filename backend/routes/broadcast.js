const express = require('express');
const router = express.Router();
const { addToQueue, getQueueStatus, getJobStatus } = require('../services/messageQueue');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Send broadcast messages with configurable delay
// Protected route - requires authentication
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { 
      messages, 
      delaySeconds = 10, // Default 10 seconds delay between messages
      messageTemplate,
      paymentTypeId 
    } = req.body;

    const supabase = req.app.locals.supabase;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required'
      });
    }

    // Validate delay
    const delay = Math.max(1, Math.min(300, delaySeconds)); // Between 1 and 300 seconds

    // If payment type is provided, get payment type details
    let paymentType = null;
    if (paymentTypeId) {
      const { data, error } = await supabase
        .from('payment_types')
        .select('*')
        .eq('id', paymentTypeId)
        .single();
      
      if (error) {
        console.error('Error fetching payment type:', error);
      } else {
        paymentType = data;
      }
    }

    // Prepare messages for queue
    const queueMessages = messages.map(msg => {
      let finalMessage = msg.message || messageTemplate || '';
      
      // Replace placeholders if template is used
      if (messageTemplate || paymentType) {
        finalMessage = finalMessage
          .replace('{nama_siswa}', msg.studentName || '')
          .replace('{jumlah}', msg.amount?.toLocaleString('id-ID') || '')
          .replace('{order_id}', msg.orderId || '')
          .replace('{link_pembayaran}', msg.paymentUrl || '')
          .replace('{jenis_pembayaran}', paymentType?.name || '');
      }

      return {
        phoneNumber: msg.phoneNumber,
        message: finalMessage,
        studentId: msg.studentId,
        studentName: msg.studentName
      };
    });

    // Add messages to queue
    const jobs = await addToQueue(queueMessages, delay);

    // Log broadcast activity
    await supabase
      .from('broadcast_logs')
      .insert({
        total_recipients: messages.length,
        delay_seconds: delay,
        payment_type_id: paymentTypeId,
        status: 'queued',
        created_at: new Date().toISOString()
      });

    res.json({
      success: true,
      message: `${jobs.length} messages queued successfully`,
      delaySeconds: delay,
      jobs: jobs.map(job => ({
        id: job.id,
        studentName: job.studentName,
        scheduledFor: job.scheduledFor
      }))
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast',
      error: error.message
    });
  }
});

// Get queue status
// Protected route - requires authentication
router.get('/status', verifyToken, async (req, res) => {
  try {
    const status = await getQueueStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status',
      error: error.message
    });
  }
});

// Get job status
router.get('/status/:jobId', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      job: status
    });
  } catch (error) {
    console.error('Error getting job status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job status',
      error: error.message
    });
  }
});

// Get broadcast history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { limit = 50 } = req.query;
    
    const { data, error } = await supabase
      .from('whatsapp_logs')
      .select(`
        *,
        student:students(name)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error getting broadcast history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get broadcast history',
      error: error.message
    });
  }
});

module.exports = router;