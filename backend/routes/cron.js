const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { sendPaymentReminder } = require('../services/whatsappService');

// Store cron job status
let cronStatus = {
  dailyReminder: {
    enabled: false,
    lastRun: null,
    nextRun: null
  }
};

// Daily reminder cron job (runs at 8 AM every day)
const dailyReminderJob = cron.schedule('0 8 * * *', async () => {
  console.log('Running daily payment reminder...');
  
  try {
    const supabase = req.app.locals.supabase;
    
    // Get all pending transactions with student and payment type info
    const { data: pendingTransactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    let sent = 0;
    let failed = 0;

    for (const transaction of pendingTransactions || []) {
      if (transaction.student && transaction.payment_type && transaction.payment_url) {
        try {
          await sendPaymentReminder(
            transaction.student.parent_phone,
            transaction.student.name,
            transaction.payment_type.name,
            transaction.amount,
            transaction.payment_url
          );
          sent++;
          
          // Add delay between messages
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
        } catch (err) {
          console.error(`Failed to send reminder for ${transaction.student.name}:`, err);
          failed++;
        }
      }
    }

    cronStatus.dailyReminder.lastRun = new Date().toISOString();
    console.log(`Daily reminder completed. Sent: ${sent}, Failed: ${failed}`);
  } catch (error) {
    console.error('Error in daily reminder cron:', error);
  }
}, {
  scheduled: false,
  timezone: "Asia/Jakarta"
});

// Manual trigger for daily reminder
router.post('/daily', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Get all pending transactions with student and payment type info
    const { data: pendingTransactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const results = {
      sent: 0,
      failed: 0,
      details: []
    };

    for (const transaction of pendingTransactions || []) {
      if (transaction.student && transaction.payment_type && transaction.payment_url) {
        try {
          await sendPaymentReminder(
            transaction.student.parent_phone,
            transaction.student.name,
            transaction.payment_type.name,
            transaction.amount,
            transaction.payment_url
          );
          
          results.sent++;
          results.details.push({
            student: transaction.student.name,
            status: 'sent'
          });
          
          // Add delay between messages
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds delay
        } catch (err) {
          console.error(`Failed to send reminder for ${transaction.student.name}:`, err);
          results.failed++;
          results.details.push({
            student: transaction.student.name,
            status: 'failed',
            error: err.message
          });
        }
      }
    }

    cronStatus.dailyReminder.lastRun = new Date().toISOString();

    res.json({
      success: true,
      message: 'Daily reminder completed',
      results
    });
  } catch (error) {
    console.error('Error running daily reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run daily reminder',
      error: error.message
    });
  }
});

// Get cron status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: cronStatus
  });
});

// Enable/disable cron jobs
router.post('/toggle/:jobName', (req, res) => {
  const { jobName } = req.params;
  const { enabled } = req.body;

  if (jobName === 'dailyReminder') {
    if (enabled) {
      dailyReminderJob.start();
      cronStatus.dailyReminder.enabled = true;
      cronStatus.dailyReminder.nextRun = dailyReminderJob.nextDates(1)[0];
    } else {
      dailyReminderJob.stop();
      cronStatus.dailyReminder.enabled = false;
      cronStatus.dailyReminder.nextRun = null;
    }

    res.json({
      success: true,
      message: `Daily reminder ${enabled ? 'enabled' : 'disabled'}`,
      status: cronStatus.dailyReminder
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid job name'
    });
  }
});

module.exports = router;