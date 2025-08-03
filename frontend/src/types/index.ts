export interface Student {
  id: string;
  name: string;
  parent_phone: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentType {
  id: string;
  name: string;
  amount: number;
  description?: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  student_id: string;
  payment_type_id: string;
  amount: number;
  order_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method?: string;
  payment_url?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  payment_type?: PaymentType;
}

export interface PaymentReminder {
  id: string;
  student_id: string;
  payment_type_id: string;
  reminder_date: string;
  status: 'pending' | 'sent' | 'paid';
  whatsapp_sent: boolean;
  whatsapp_sent_at?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  payment_type?: PaymentType;
}

export interface WhatsappLog {
  id: string;
  student_id?: string;
  transaction_id?: string;
  phone_number: string;
  message: string;
  status: string;
  response?: string;
  created_at: string;
}

export interface PakasirWebhookPayload {
  amount: number;
  order_id: string;
  project: string;
  status: string;
  payment_method: string;
  completed_at: string;
}

export interface PakasirResponse {
  amount: number;
  order_id: string;
  project: string;
  status: string;
  payment_method: string;
  completed_at: string;
}

export interface DripsenderResponse {
  success: boolean;
  message: string;
  data?: any;
}

// New expense-related types
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category_id?: string;
  expense_date: string;
  receipt_url?: string;
  notes?: string;
  created_by?: string;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface CashBalance {
  id: string;
  date: string;
  opening_balance: number;
  total_income: number;
  total_expense: number;
  closing_balance: number;
  created_at: string;
  updated_at: string;
}