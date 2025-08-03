import { supabase } from './supabase';
import { transactionService } from './transactionService';
import { whatsappService } from './whatsappService';
import { pakasirService } from './pakasirService';
import { Student, PaymentType, Transaction } from '../types';

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

  // Send broadcast messages to all parents
  async sendBroadcastMessages(
    broadcastPayments: BroadcastPayment[],
    messageTemplate: string
  ): Promise<BroadcastPayment[]> {
    const results: BroadcastPayment[] = [];
    
    for (const payment of broadcastPayments) {
      if (payment.status === 'failed' || !payment.payment_url) {
        results.push(payment);
        continue;
      }
      
      try {
        // Replace placeholders in message template
        const message = messageTemplate
          .replace('{nama_siswa}', payment.student_name)
          .replace('{jumlah}', payment.amount.toLocaleString('id-ID'))
          .replace('{order_id}', payment.order_id)
          .replace('{link_pembayaran}', payment.payment_url);
        
        // Send WhatsApp message
        await whatsappService.sendMessage(
          payment.parent_phone,
          message,
          payment.student_id
        );
        
        results.push({
          ...payment,
          status: 'sent',
          whatsapp_sent_at: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Failed to send WhatsApp to ${payment.parent_phone}:`, error);
        results.push({
          ...payment,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Failed to send WhatsApp'
        });
      }
    }
    
    return results;
  },

  // Get broadcast history
  async getBroadcastHistory(limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('whatsapp_logs')
      .select(`
        *,
        student:students(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Create custom broadcast message
  async sendCustomBroadcast(
    studentIds: string[],
    message: string
  ): Promise<{ success: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let success = 0;
    let failed = 0;
    
    // Get students
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds);
    
    if (error) throw error;
    
    for (const student of students || []) {
      try {
        await whatsappService.sendMessage(
          student.parent_phone,
          message,
          student.id
        );
        
        success++;
        results.push({
          student_id: student.id,
          student_name: student.name,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      } catch (error) {
        failed++;
        results.push({
          student_id: student.id,
          student_name: student.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return { success, failed, results };
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