import { supabase } from './supabase';
import { whatsappService } from './whatsappService';
import { pakasirService } from './pakasirService';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

export interface RecurringSetting {
  id: string;
  payment_type_id: string;
  is_active: boolean;
  day_of_month: number;
  reminder_days: number[];
  escalation_days: number;
  created_at: string;
  updated_at: string;
  payment_type?: {
    id: string;
    name: string;
    amount: number;
  };
}

export interface ReminderSchedule {
  id: string;
  transaction_id: string;
  reminder_type: 'before_due' | 'on_due' | 'overdue' | 'escalation';
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  last_attempt_at?: string;
  sent_at?: string;
  error_message?: string;
  transaction?: any;
}

export interface ParentAccess {
  id: string;
  student_id: string;
  access_token: string;
  pin_code?: string;
  is_active: boolean;
  last_accessed_at?: string;
  access_count: number;
  student?: any;
}

export const recurringService = {
  // Recurring Settings Management
  async getRecurringSettings(): Promise<RecurringSetting[]> {
    const { data, error } = await supabase
      .from('recurring_settings')
      .select(`
        *,
        payment_type:payment_types(id, name, amount)
      `)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async updateRecurringSetting(
    paymentTypeId: string, 
    settings: Partial<RecurringSetting>
  ): Promise<RecurringSetting> {
    const { data, error } = await supabase
      .from('recurring_settings')
      .upsert({
        payment_type_id: paymentTypeId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Generate Monthly Recurring Payments
  async generateMonthlyPayments(paymentTypeId?: string): Promise<{
    success: boolean;
    generated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let totalGenerated = 0;

    try {
      if (paymentTypeId) {
        // Generate for specific payment type
        const { data, error } = await supabase.rpc(
          'generate_monthly_recurring_payments',
          { p_payment_type_id: paymentTypeId }
        );
        
        if (error) throw error;
        totalGenerated = data || 0;
      } else {
        // Generate for all active recurring payment types
        const { data: recurringTypes } = await supabase
          .from('payment_types')
          .select('id, name')
          .eq('is_recurring', true);
        
        for (const type of recurringTypes || []) {
          try {
            const { data, error } = await supabase.rpc(
              'generate_monthly_recurring_payments',
              { p_payment_type_id: type.id }
            );
            
            if (error) throw error;
            totalGenerated += data || 0;
          } catch (err) {
            errors.push(`Failed to generate for ${type.name}: ${err}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        generated: totalGenerated,
        errors
      };
    } catch (error) {
      return {
        success: false,
        generated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  },

  // Smart Reminder Management
  async getScheduledReminders(date?: string): Promise<ReminderSchedule[]> {
    let query = supabase
      .from('reminder_schedule')
      .select(`
        *,
        transaction:transactions(
          *,
          student:students(*),
          payment_type:payment_types(*)
        )
      `)
      .eq('status', 'pending')
      .order('scheduled_date');
    
    if (date) {
      query = query.eq('scheduled_date', date);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async processReminders(): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const reminders = await this.getScheduledReminders(today);
    
    let sent = 0;
    let failed = 0;
    
    for (const reminder of reminders) {
      try {
        await this.sendReminder(reminder);
        sent++;
      } catch (error) {
        failed++;
        console.error(`Failed to send reminder ${reminder.id}:`, error);
      }
    }
    
    return {
      processed: reminders.length,
      sent,
      failed
    };
  },

  async sendReminder(reminder: ReminderSchedule): Promise<void> {
    if (!reminder.transaction?.student?.parent_phone) {
      throw new Error('No parent phone number');
    }

    const { transaction } = reminder;
    const dueDate = endOfMonth(new Date());
    const message = this.generateReminderMessage(reminder, transaction, dueDate);

    try {
      // Send WhatsApp
      await whatsappService.sendMessage(
        transaction.student.parent_phone,
        message,
        transaction.student_id,
        transaction.id
      );

      // Update reminder status
      await supabase
        .from('reminder_schedule')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          attempts: reminder.attempts + 1
        })
        .eq('id', reminder.id);
    } catch (error) {
      // Update with error
      await supabase
        .from('reminder_schedule')
        .update({
          attempts: reminder.attempts + 1,
          last_attempt_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', reminder.id);
      
      throw error;
    }
  },

  generateReminderMessage(
    reminder: ReminderSchedule, 
    transaction: any, 
    dueDate: Date
  ): string {
    const studentName = transaction.student?.name || '';
    const amount = transaction.amount?.toLocaleString('id-ID') || '0';
    const paymentType = transaction.payment_type?.name || '';
    const dueDateStr = format(dueDate, 'dd MMMM yyyy', { locale: id });
    
    // Generate payment URL if not exists
    const paymentUrl = transaction.payment_url || pakasirService.generatePaymentUrl(
      transaction.order_id,
      transaction.amount
    );

    switch (reminder.reminder_type) {
      case 'before_due':
        return `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Kami ingin mengingatkan pembayaran ${paymentType} sebesar Rp ${amount} yang jatuh tempo pada ${dueDateStr}.

Silakan lakukan pembayaran melalui link berikut:
${paymentUrl}

Terima kasih atas perhatiannya.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

      case 'on_due':
        return `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Hari ini adalah batas akhir pembayaran ${paymentType} sebesar Rp ${amount}.

Mohon segera lakukan pembayaran melalui:
${paymentUrl}

Terima kasih.
Admin Kas Kelas 1B`;

      case 'escalation':
        return `Assalamu'alaikum Bapak/Ibu wali murid ${studentName},

Pembayaran ${paymentType} sebesar Rp ${amount} telah melewati jatuh tempo (${dueDateStr}).

Mohon segera melakukan pembayaran untuk menghindari denda keterlambatan.

Link pembayaran:
${paymentUrl}

Jika ada kendala, silakan hubungi admin.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

      default:
        return `Reminder: Pembayaran ${paymentType} Rp ${amount} - ${paymentUrl}`;
    }
  },

  // Parent Portal Access
  async generateParentAccess(studentId: string): Promise<ParentAccess> {
    // Generate unique access token
    const accessToken = this.generateAccessToken();
    const pinCode = this.generatePinCode();

    const { data, error } = await supabase
      .from('parent_access')
      .upsert({
        student_id: studentId,
        access_token: accessToken,
        pin_code: pinCode,
        is_active: true
      })
      .select(`
        *,
        student:students(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getParentAccessByToken(token: string): Promise<ParentAccess | null> {
    const { data, error } = await supabase
      .from('parent_access')
      .select(`
        *,
        student:students(*)
      `)
      .eq('access_token', token)
      .eq('is_active', true)
      .single();

    if (error) return null;

    // Update access count and last accessed
    await supabase
      .from('parent_access')
      .update({
        access_count: (data.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', data.id);

    return data;
  },

  async sendParentPortalAccess(studentId: string): Promise<void> {
    const access = await this.generateParentAccess(studentId);
    const { data: student } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (!student) throw new Error('Student not found');

    const portalUrl = `${window.location.origin}/parent/${access.access_token}`;
    const message = `Assalamu'alaikum Bapak/Ibu wali murid ${student.name},

Berikut adalah akses portal pembayaran online Anda:

🔗 Link Portal: ${portalUrl}
🔑 PIN: ${access.pin_code}

Melalui portal ini, Anda dapat:
✅ Cek status pembayaran
✅ Lihat riwayat pembayaran
✅ Download kwitansi
✅ Lakukan pembayaran langsung

Simpan pesan ini untuk akses di kemudian hari.

Wassalamu'alaikum
Admin Kas Kelas 1B`;

    await whatsappService.sendMessage(
      student.parent_phone,
      message,
      student.id
    );
  },

  // Helper functions
  generateAccessToken(): string {
    return Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('');
  },

  generatePinCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Cron job simulation (to be called by Vercel Cron or external service)
  async runDailyCron(): Promise<{
    recurringGenerated: number;
    remindersProcessed: number;
  }> {
    const today = new Date().getDate();
    let recurringGenerated = 0;

    // Check if today is the day to generate recurring payments
    const { data: settings } = await supabase
      .from('recurring_settings')
      .select('*, payment_type:payment_types(*)')
      .eq('is_active', true)
      .eq('day_of_month', today);

    for (const setting of settings || []) {
      const result = await this.generateMonthlyPayments(setting.payment_type_id);
      recurringGenerated += result.generated;
    }

    // Process today's reminders
    const reminderResult = await this.processReminders();

    return {
      recurringGenerated,
      remindersProcessed: reminderResult.processed
    };
  }
};