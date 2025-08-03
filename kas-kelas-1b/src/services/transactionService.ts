import { supabase } from './supabase';
import { Transaction } from '../types';
import { format } from 'date-fns';

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByStatus(status: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByStudent(studentId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByOrderId(orderId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('order_id', orderId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(transaction: {
    student_id: string;
    payment_type_id: string;
    amount: number;
  }): Promise<Transaction> {
    // Validate input
    if (!transaction.student_id || !transaction.payment_type_id || transaction.amount <= 0) {
      throw new Error('Invalid transaction data');
    }
    
    // Generate unique order ID
    const orderId = `${format(new Date(), 'yyMMdd')}${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        order_id: orderId,
        status: 'pending'
      })
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string, paymentMethod?: string): Promise<Transaction> {
    const updateData: any = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Update daily balance if transaction is completed
    if (status === 'completed' && data.completed_at) {
      const completedDate = format(new Date(data.completed_at), 'yyyy-MM-dd');
      await this.updateDailyBalance(completedDate);
    }
    
    return data;
  },

  async updateByOrderId(orderId: string, updates: {
    status?: string;
    payment_method?: string;
    completed_at?: string;
  }): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('order_id', orderId)
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Update daily balance if transaction is completed
    if (updates.status === 'completed' && updates.completed_at) {
      const completedDate = format(new Date(updates.completed_at), 'yyyy-MM-dd');
      await this.updateDailyBalance(completedDate);
    }
    
    return data;
  },

  async updatePaymentUrl(id: string, paymentUrl: string): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({ payment_url: paymentUrl })
      .eq('id', id)
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    return this.getByStatus('pending');
  },

  async getCompletedTransactions(): Promise<Transaction[]> {
    return this.getByStatus('completed');
  },

  // Helper function to update daily balance
  async updateDailyBalance(date: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('calculate_daily_balance', {
        p_date: date
      });
      
      if (error) {
        console.error('Failed to update daily balance:', error);
      }
    } catch (err) {
      console.error('Error updating daily balance:', err);
    }
  }
};