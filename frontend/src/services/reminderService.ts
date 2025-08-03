import { supabase } from './supabase';
import { PaymentReminder } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

export const reminderService = {
  async getAll(): Promise<PaymentReminder[]> {
    const { data, error } = await supabase
      .from('payment_reminders')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .order('reminder_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getPendingReminders(): Promise<PaymentReminder[]> {
    const { data, error } = await supabase
      .from('payment_reminders')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('status', 'pending')
      .lte('reminder_date', new Date().toISOString().split('T')[0])
      .order('reminder_date');
    
    if (error) throw error;
    return data || [];
  },

  async createMonthlyReminders(paymentTypeId: string): Promise<void> {
    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id');
    
    if (studentsError) throw studentsError;
    if (!students || students.length === 0) return;

    // Create reminders for each student for the current month
    const currentDate = new Date();
    const reminderDate = startOfMonth(currentDate).toISOString().split('T')[0];

    const reminders = students.map(student => ({
      student_id: student.id,
      payment_type_id: paymentTypeId,
      reminder_date: reminderDate,
      status: 'pending',
      whatsapp_sent: false
    }));

    const { error } = await supabase
      .from('payment_reminders')
      .insert(reminders);
    
    if (error) throw error;
  },

  async markAsSent(reminderId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_reminders')
      .update({
        status: 'sent',
        whatsapp_sent: true,
        whatsapp_sent_at: new Date().toISOString()
      })
      .eq('id', reminderId);
    
    if (error) throw error;
  },

  async markAsPaid(reminderId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_reminders')
      .update({
        status: 'paid'
      })
      .eq('id', reminderId);
    
    if (error) throw error;
  },

  async getByStudentAndMonth(studentId: string, month: Date): Promise<PaymentReminder[]> {
    const startDate = startOfMonth(month).toISOString().split('T')[0];
    const endDate = endOfMonth(month).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('payment_reminders')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('student_id', studentId)
      .gte('reminder_date', startDate)
      .lte('reminder_date', endDate);
    
    if (error) throw error;
    return data || [];
  },

  async checkAndCreateRecurringReminders(): Promise<void> {
    // Get all recurring payment types
    const { data: recurringTypes, error: typesError } = await supabase
      .from('payment_types')
      .select('*')
      .eq('is_recurring', true);
    
    if (typesError) throw typesError;
    if (!recurringTypes || recurringTypes.length === 0) return;

    const currentMonth = startOfMonth(new Date()).toISOString().split('T')[0];

    // Check if reminders already exist for this month
    const { data: existingReminders, error: existingError } = await supabase
      .from('payment_reminders')
      .select('payment_type_id')
      .eq('reminder_date', currentMonth);
    
    if (existingError) throw existingError;

    const existingTypeIds = new Set(existingReminders?.map(r => r.payment_type_id) || []);

    // Create reminders for payment types that don't have reminders yet
    for (const paymentType of recurringTypes) {
      if (!existingTypeIds.has(paymentType.id)) {
        await this.createMonthlyReminders(paymentType.id);
      }
    }
  }
};