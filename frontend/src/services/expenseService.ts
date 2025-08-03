import { supabase } from './supabase';
import { Expense, ExpenseCategory, CashBalance } from '../types';
import { format } from 'date-fns';

export const expenseService = {
  // Expense Categories
  async getCategories(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  // Expenses
  async getAllExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*)
      `)
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(*)
      `)
      .gte('expense_date', startDate)
      .lte('expense_date', endDate)
      .order('expense_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Update daily balance
    await this.updateDailyBalance(expense.expense_date);
    
    return data;
  },

  async updateExpense(id: string, expense: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category'>>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Update daily balance for the expense date
    if (data.expense_date) {
      await this.updateDailyBalance(data.expense_date);
    }
    
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    // Get expense date before deletion
    const { data: expense } = await supabase
      .from('expenses')
      .select('expense_date')
      .eq('id', id)
      .single();
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Update daily balance
    if (expense?.expense_date) {
      await this.updateDailyBalance(expense.expense_date);
    }
  },

  async approveExpense(id: string, approvedBy: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        approved: true,
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        category:expense_categories(*)
      `)
      .single();
    
    if (error) throw error;
    
    // Update daily balance
    await this.updateDailyBalance(data.expense_date);
    
    return data;
  },

  // Cash Balance
  async getDailyBalance(date: string): Promise<CashBalance | null> {
    const { data, error } = await supabase
      .from('cash_balance')
      .select('*')
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getBalanceHistory(startDate: string, endDate: string): Promise<CashBalance[]> {
    const { data, error } = await supabase
      .from('cash_balance')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateDailyBalance(date: string): Promise<void> {
    // Call the PostgreSQL function to calculate balance
    const { error } = await supabase.rpc('calculate_daily_balance', {
      p_date: date
    });
    
    if (error) throw error;
  },

  async getCurrentBalance(): Promise<number> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const balance = await this.getDailyBalance(today);
    
    if (balance) {
      return balance.closing_balance;
    }
    
    // If no balance for today, get the latest balance
    const { data } = await supabase
      .from('cash_balance')
      .select('closing_balance')
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    return data?.closing_balance || 0;
  },

  // Summary functions
  async getMonthlyExpenseSummary(month: string): Promise<{
    totalExpense: number;
    byCategory: { category: string; amount: number }[];
  }> {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    
    const expenses = await this.getExpensesByDateRange(startDate, endDate);
    
    const totalExpense = expenses
      .filter(e => e.approved)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const byCategory = expenses
      .filter(e => e.approved)
      .reduce((acc, e) => {
        const categoryName = e.category?.name || 'Lainnya';
        const existing = acc.find(c => c.category === categoryName);
        
        if (existing) {
          existing.amount += e.amount;
        } else {
          acc.push({ category: categoryName, amount: e.amount });
        }
        
        return acc;
      }, [] as { category: string; amount: number }[]);
    
    return { totalExpense, byCategory };
  }
};