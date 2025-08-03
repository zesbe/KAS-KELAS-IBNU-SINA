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

  async getByStudentId(studentId: string): Promise<Transaction[]> {
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
    
    if (error) throw error;
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

  async updateStatus(orderId: string, status: Transaction['status'], paymentMethod?: string): Promise<Transaction> {
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
      .eq('order_id', orderId)
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePaymentUrl(orderId: string, paymentUrl: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({ payment_url: paymentUrl })
      .eq('order_id', orderId);
    
    if (error) throw error;
  },

  async getPendingTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getCompletedTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        student:students(*),
        payment_type:payment_types(*)
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};