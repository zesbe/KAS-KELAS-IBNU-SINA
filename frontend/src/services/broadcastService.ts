import { supabase } from './supabase';
import { transactionService } from './transactionService';
import { pakasirService } from './pakasirService';
import { Student, PaymentType, Transaction } from '../types';
import axios from 'axios';

// Get backend URL from environment or use default
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

// Helper function to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

export interface BroadcastPayment {
  student_id: string;
  student_name: string;
  parent_phone: string;
  payment_url: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'sent' | 'failed';
  whatsapp_sent_at?: string;
  error_message?: string;
}

export interface BroadcastOptions {
  delaySeconds?: number; // Delay between messages in seconds
  messageTemplate?: string;
  paymentTypeId?: string;
}

export const broadcastService = {
  // Generate payment links for all students for a specific payment type
  async generatePaymentLinksForAll(paymentTypeId: string): Promise<BroadcastPayment[]> {
    try {
      // Get all students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('name');
      
      if (studentsError) throw studentsError;
      
      // Get payment type details
      const { data: paymentType, error: paymentTypeError } = await supabase
        .from('payment_types')
        .select('*')
        .eq('id', paymentTypeId)
        .single();
      
      if (paymentTypeError) throw paymentTypeError;
      
      const broadcastPayments: BroadcastPayment[] = [];
      
      // Generate payment link for each student
      for (const student of students || []) {
        try {
          // Check if transaction already exists
          const existingTransactions = await transactionService.getByStudent(student.id);
          const hasExisting = existingTransactions.some(
            t => t.payment_type_id === paymentTypeId && t.status === 'pending'
          );
          
          if (hasExisting) {
            // Use existing transaction
            const existingTx = existingTransactions.find(
              t => t.payment_type_id === paymentTypeId && t.status === 'pending'
            );
            
            if (existingTx) {
              broadcastPayments.push({
                student_id: student.id,
                student_name: student.name,
                parent_phone: student.parent_phone,
                payment_url: existingTx.payment_url || '',
                order_id: existingTx.order_id,
                amount: existingTx.amount,
                status: 'pending'
              });
            }
          } else {
            // Create new transaction
            const transaction = await transactionService.create({
              student_id: student.id,
              payment_type_id: paymentTypeId,
              amount: paymentType.amount
            });
            
            // Generate payment URL
            const paymentUrl = pakasirService.generatePaymentUrl(
              transaction.order_id,
              transaction.amount
            );
            
            // Update transaction with payment URL
            await transactionService.updatePaymentUrl(transaction.id, paymentUrl);
            
            broadcastPayments.push({
              student_id: student.id,
              student_name: student.name,
              parent_phone: student.parent_phone,
              payment_url: paymentUrl,
              order_id: transaction.order_id,
              amount: transaction.amount,
              status: 'pending'
            });
          }
        } catch (error) {
          console.error(`Failed to generate payment for ${student.name}:`, error);
          broadcastPayments.push({
            student_id: student.id,
            student_name: student.name,
            parent_phone: student.parent_phone,
            payment_url: '',
            order_id: '',
            amount: paymentType.amount,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return broadcastPayments;
    } catch (error) {
      console.error('Failed to generate payment links:', error);
      throw error;
    }
  },

  // Send broadcast messages to all parents using backend API
  async sendBroadcastMessages(
    broadcastPayments: BroadcastPayment[],
    messageTemplate: string,
    options: BroadcastOptions = {}
  ): Promise<{ success: boolean; jobIds?: any[]; error?: string }> {
    try {
      const messages = broadcastPayments
        .filter(payment => payment.status !== 'failed' && payment.payment_url)
        .map(payment => ({
          phoneNumber: payment.parent_phone,
          studentId: payment.student_id,
          studentName: payment.student_name,
          amount: payment.amount,
          orderId: payment.order_id,
          paymentUrl: payment.payment_url,
          message: messageTemplate
        }));

      // Send to backend API with configurable delay
      const response = await axios.post(`${BACKEND_URL}/api/broadcast/send`, {
        messages,
        delaySeconds: options.delaySeconds || 10, // Default 10 seconds
        messageTemplate,
        paymentTypeId: options.paymentTypeId
      }, {
        headers: await getAuthHeaders()
      });

      return {
        success: true,
        jobIds: response.data.jobs
      };
    } catch (error) {
      console.error('Failed to send broadcast messages:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send messages'
      };
    }
  },

  // Get broadcast status from backend
  async getBroadcastStatus(): Promise<any> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/broadcast/status`, {
      headers: await getAuthHeaders()
    });
      return response.data.status;
    } catch (error) {
      console.error('Failed to get broadcast status:', error);
      return null;
    }
  },

  // Get job status from backend
  async getJobStatus(jobId: string): Promise<any> {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/broadcast/status/${jobId}`, {
      headers: await getAuthHeaders()
    });
      return response.data.job;
    } catch (error) {
      console.error('Failed to get job status:', error);
      return null;
    }
  },

  // Get broadcast history
  async getBroadcastHistory(limit = 50): Promise<any[]> {
    try {
          const response = await axios.get(`${BACKEND_URL}/api/broadcast/history`, {
      params: { limit },
      headers: await getAuthHeaders()
    });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get broadcast history:', error);
      
      // Fallback to direct Supabase query
      const { data, error: dbError } = await supabase
        .from('whatsapp_logs')
        .select(`
          *,
          student:students(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (dbError) throw dbError;
      return data || [];
    }
  },

  // Create custom broadcast message
  async sendCustomBroadcast(
    studentIds: string[],
    message: string,
    delaySeconds: number = 10
  ): Promise<{ success: boolean; jobIds?: any[]; error?: string }> {
    try {
      // Get students
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .in('id', studentIds);
      
      if (error) throw error;
      
      const messages = (students || []).map(student => ({
        phoneNumber: student.parent_phone,
        studentId: student.id,
        studentName: student.name,
        message
      }));

      // Send to backend API
      const response = await axios.post(`${BACKEND_URL}/api/broadcast/send`, {
        messages,
        delaySeconds
      }, {
        headers: await getAuthHeaders()
      });

      return {
        success: true,
        jobIds: response.data.jobs
      };
    } catch (error) {
      console.error('Failed to send custom broadcast:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send messages'
      };
    }
  },

  // Get message templates
  getMessageTemplates() {
    return [
      {
        id: 'payment_reminder',
        name: 'Pengingat Pembayaran',
        template: `Assalamu'alaikum Bapak/Ibu wali murid {nama_siswa},

Kami ingin mengingatkan pembayaran kas kelas sebesar Rp {jumlah}.

Silakan lakukan pembayaran melalui link berikut:
{link_pembayaran}

Order ID: {order_id}

Terima kasih atas kerjasamanya.

Wassalamu'alaikum
Admin Kas Kelas 1B`
      },
      {
        id: 'payment_urgent',
        name: 'Pembayaran Mendesak',
        template: `Assalamu'alaikum Bapak/Ibu wali murid {nama_siswa},

Mohon segera melakukan pembayaran kas kelas sebesar Rp {jumlah}.

Link Pembayaran:
{link_pembayaran}

Pembayaran dapat dilakukan via QRIS.

Terima kasih.
Admin Kas Kelas 1B`
      },
      {
        id: 'custom',
        name: 'Pesan Custom',
        template: ''
      }
    ];
  }
};