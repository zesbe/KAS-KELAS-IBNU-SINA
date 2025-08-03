const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const DRIPSENDER_API_URL = 'https://api.dripsender.id';
const DRIPSENDER_API_KEY = process.env.DRIPSENDER_API_KEY;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sendWhatsAppMessage(phoneNumber, message, studentId = null) {
  try {
    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    
    const payload = {
      api_key: DRIPSENDER_API_KEY,
      phone: cleanPhone,
      text: message
    };

    console.log(`Sending WhatsApp to ${cleanPhone}`);

    const response = await axios.post(
      `${DRIPSENDER_API_URL}/send`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Log the message
    await logWhatsAppMessage({
      phone_number: cleanPhone,
      message,
      student_id: studentId,
      status: response.data.success ? 'success' : 'failed',
      response: JSON.stringify(response.data)
    });

    return {
      success: response.data.success,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
    
    // Log the failed message
    await logWhatsAppMessage({
      phone_number: phoneNumber,
      message,
      student_id: studentId,
      status: 'error',
      response: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
}

async function logWhatsAppMessage(log) {
  try {
    const { error } = await supabase
      .from('whatsapp_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  } catch (err) {
    console.error('Failed to log WhatsApp message:', err);
  }
}

async function sendPaymentReminder(phoneNumber, studentName, paymentType, amount, paymentUrl) {
  const message = `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Kami ingin mengingatkan pembayaran ${paymentType} sebesar Rp ${amount.toLocaleString('id-ID')} untuk kelas 1B SD Islam Al Husna.

Silakan lakukan pembayaran melalui link berikut:
${paymentUrl}

Pembayaran dapat dilakukan menggunakan QRIS untuk kemudahan Anda.

Terima kasih atas perhatian dan kerjasamanya.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

  return sendWhatsAppMessage(phoneNumber, message);
}

async function sendPaymentConfirmation(phoneNumber, studentName, paymentType, amount, paymentMethod) {
  const message = `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Alhamdulillah, pembayaran ${paymentType} sebesar Rp ${amount.toLocaleString('id-ID')} telah kami terima melalui ${paymentMethod}.

Terima kasih atas pembayaran yang tepat waktu.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

  return sendWhatsAppMessage(phoneNumber, message);
}

module.exports = {
  sendWhatsAppMessage,
  sendPaymentReminder,
  sendPaymentConfirmation
};