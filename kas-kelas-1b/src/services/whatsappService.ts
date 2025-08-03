import axios from 'axios';
import { DripsenderResponse, WhatsappLog } from '../types';
import { supabase } from './supabase';

const DRIPSENDER_API_URL = 'https://api.dripsender.id';
const DRIPSENDER_API_KEY = process.env.REACT_APP_DRIPSENDER_API_KEY!;

export const whatsappService = {
  async sendMessage(phoneNumber: string, message: string, fileUrl?: string): Promise<boolean> {
    try {
      // Clean phone number format
      const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
      
      const payload: any = {
        api_key: DRIPSENDER_API_KEY,
        phone: cleanPhone,
        text: message
      };

      if (fileUrl) {
        payload.file = fileUrl;
      }

      const response = await axios.post<DripsenderResponse>(
        `${DRIPSENDER_API_URL}/send`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Log the message
      await this.logMessage({
        phone_number: cleanPhone,
        message,
        status: response.data.success ? 'success' : 'failed',
        response: JSON.stringify(response.data)
      });

      return response.data.success;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      // Log the failed message
      await this.logMessage({
        phone_number: phoneNumber,
        message,
        status: 'error',
        response: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  },

  async sendPaymentReminder(phoneNumber: string, studentName: string, paymentType: string, amount: number, paymentUrl: string): Promise<boolean> {
    const message = `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Kami ingin mengingatkan pembayaran ${paymentType} sebesar Rp ${amount.toLocaleString('id-ID')} untuk kelas 1B SD Islam Al Husna.

Silakan lakukan pembayaran melalui link berikut:
${paymentUrl}

Pembayaran dapat dilakukan menggunakan QRIS untuk kemudahan Anda.

Terima kasih atas perhatian dan kerjasamanya.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

    return this.sendMessage(phoneNumber, message);
  },

  async sendPaymentConfirmation(phoneNumber: string, studentName: string, paymentType: string, amount: number, paymentMethod: string): Promise<boolean> {
    const message = `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Alhamdulillah, pembayaran ${paymentType} sebesar Rp ${amount.toLocaleString('id-ID')} telah kami terima melalui ${paymentMethod}.

Terima kasih atas pembayaran yang tepat waktu.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

    return this.sendMessage(phoneNumber, message);
  },

  async sendBulkReminders(reminders: Array<{
    phoneNumber: string;
    studentName: string;
    paymentType: string;
    amount: number;
    paymentUrl: string;
  }>): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const reminder of reminders) {
      const success = await this.sendPaymentReminder(
        reminder.phoneNumber,
        reminder.studentName,
        reminder.paymentType,
        reminder.amount,
        reminder.paymentUrl
      );

      if (success) {
        sent++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { sent, failed };
  },

  async logMessage(log: Omit<WhatsappLog, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_logs')
      .insert(log);

    if (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  },

  async getLists(): Promise<any> {
    try {
      const response = await axios.get(`${DRIPSENDER_API_URL}/lists/`, {
        params: {
          api_key: DRIPSENDER_API_KEY
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting lists:', error);
      return null;
    }
  },

  async getContactsFromList(listId: string): Promise<any> {
    try {
      const response = await axios.get(`${DRIPSENDER_API_URL}/lists/${listId}`, {
        params: {
          api_key: DRIPSENDER_API_KEY
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting contacts from list:', error);
      return null;
    }
  }
};