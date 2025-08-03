import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = req.headers['x-vercel-cron-secret'];
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const today = new Date();
    const currentDay = today.getDate();
    const currentDate = today.toISOString().split('T')[0];
    
    console.log(`Running daily cron job for ${currentDate}`);

    // 1. Generate recurring payments
    const { data: recurringSettings } = await supabase
      .from('recurring_settings')
      .select('*, payment_type:payment_types(*)')
      .eq('is_active', true)
      .eq('day_of_month', currentDay);

    let recurringGenerated = 0;
    
    for (const setting of recurringSettings || []) {
      const { data: generated } = await supabase.rpc(
        'generate_monthly_recurring_payments',
        { p_payment_type_id: setting.payment_type_id }
      );
      
      recurringGenerated += generated || 0;
      
      // Schedule reminders for new transactions
      const { data: newTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('payment_type_id', setting.payment_type_id)
        .eq('status', 'pending')
        .gte('created_at', currentDate);
      
      for (const tx of newTransactions || []) {
        await supabase.rpc('schedule_payment_reminders', { p_transaction_id: tx.id });
      }
    }

    // 2. Process scheduled reminders
    const { data: pendingReminders } = await supabase
      .from('reminder_schedule')
      .select(`
        *,
        transaction:transactions(
          *,
          student:students(*),
          payment_type:payment_types(*)
        )
      `)
      .eq('scheduled_date', currentDate)
      .eq('status', 'pending');

    let remindersSent = 0;
    let remindersFailed = 0;

    for (const reminder of pendingReminders || []) {
      try {
        const { transaction } = reminder;
        if (!transaction?.student?.parent_phone) continue;

        // Generate message based on reminder type
        const message = generateReminderMessage(reminder, transaction);
        
        // Send WhatsApp
        const whatsappResponse = await axios.post(
          'https://api.dripsender.id/send',
          {
            api_key: process.env.DRIPSENDER_API_KEY,
            phone: transaction.student.parent_phone,
            text: message
          }
        );

        // Update reminder status
        await supabase
          .from('reminder_schedule')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        // Log WhatsApp
        await supabase.from('whatsapp_logs').insert({
          student_id: transaction.student_id,
          transaction_id: transaction.id,
          phone_number: transaction.student.parent_phone,
          message: message,
          status: 'sent',
          response: JSON.stringify(whatsappResponse.data)
        });

        remindersSent++;
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        
        await supabase
          .from('reminder_schedule')
          .update({
            attempts: reminder.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            error_message: error.message
          })
          .eq('id', reminder.id);
        
        remindersFailed++;
      }
    }

    // 3. Update daily cash balance
    await supabase.rpc('calculate_daily_balance', { p_date: currentDate });

    const result = {
      date: currentDate,
      recurringGenerated,
      remindersSent,
      remindersFailed,
      totalReminders: pendingReminders?.length || 0
    };

    console.log('Daily cron job completed:', result);

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

function generateReminderMessage(reminder, transaction) {
  const studentName = transaction.student?.name || '';
  const amount = transaction.amount?.toLocaleString('id-ID') || '0';
  const paymentType = transaction.payment_type?.name || '';
  const paymentUrl = transaction.payment_url || 
    `${process.env.PAKASIR_BASE_URL || 'https://pakasir.com'}/pay/${process.env.PAKASIR_SLUG}/${transaction.amount}?order_id=${transaction.order_id}&qris_only=1`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // Assuming 7 days payment term

  switch (reminder.reminder_type) {
    case 'before_due':
      return `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Kami ingin mengingatkan pembayaran ${paymentType} sebesar Rp ${amount}.

Silakan lakukan pembayaran melalui:
${paymentUrl}

Terima kasih atas perhatiannya.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

    case 'on_due':
      return `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Hari ini adalah batas akhir pembayaran ${paymentType} sebesar Rp ${amount}.

Mohon segera lakukan pembayaran:
${paymentUrl}

Terima kasih.
Admin Kas Kelas 1B`;

    case 'escalation':
      return `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Pembayaran ${paymentType} sebesar Rp ${amount} telah melewati jatuh tempo.

Mohon segera melakukan pembayaran:
${paymentUrl}

Jika ada kendala, silakan hubungi admin.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

    default:
      return `Reminder: Pembayaran ${paymentType} Rp ${amount} - ${paymentUrl}`;
  }
}