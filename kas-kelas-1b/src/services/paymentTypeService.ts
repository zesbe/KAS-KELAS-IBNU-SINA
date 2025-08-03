import { supabase } from './supabase';
import { PaymentType } from '../types';

export const paymentTypeService = {
  async getAll(): Promise<PaymentType[]> {
    const { data, error } = await supabase
      .from('payment_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<PaymentType | null> {
    const { data, error } = await supabase
      .from('payment_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(paymentType: Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentType> {
    const { data, error } = await supabase
      .from('payment_types')
      .insert(paymentType)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, paymentType: Partial<Omit<PaymentType, 'id' | 'created_at' | 'updated_at'>>): Promise<PaymentType> {
    const { data, error } = await supabase
      .from('payment_types')
      .update(paymentType)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payment_types')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};