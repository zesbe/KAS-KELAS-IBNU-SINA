-- Tabel untuk kategori pengeluaran
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabel pengeluaran
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES expense_categories(id),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  notes TEXT,
  created_by VARCHAR(255),
  approved BOOLEAN DEFAULT false,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabel saldo (untuk tracking saldo real-time)
CREATE TABLE IF NOT EXISTS cash_balance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  opening_balance DECIMAL(10, 2) DEFAULT 0,
  total_income DECIMAL(10, 2) DEFAULT 0,
  total_expense DECIMAL(10, 2) DEFAULT 0,
  closing_balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert kategori pengeluaran default
INSERT INTO expense_categories (name, description, icon) VALUES
  ('ATK', 'Alat Tulis Kantor', 'PenTool'),
  ('Konsumsi', 'Makanan dan Minuman', 'Coffee'),
  ('Transport', 'Biaya Transportasi', 'Car'),
  ('Kegiatan', 'Biaya Kegiatan Kelas', 'Calendar'),
  ('Dekorasi', 'Hiasan dan Dekorasi Kelas', 'Palette'),
  ('Hadiah', 'Hadiah dan Reward Siswa', 'Gift'),
  ('Fotokopi', 'Biaya Fotokopi dan Print', 'Printer'),
  ('Lainnya', 'Pengeluaran Lainnya', 'MoreHorizontal');

-- Create indexes
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_approved ON expenses(approved);
CREATE INDEX idx_cash_balance_date ON cash_balance(date);

-- Trigger untuk update timestamp
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_balance_updated_at BEFORE UPDATE ON cash_balance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function untuk auto-calculate saldo
CREATE OR REPLACE FUNCTION calculate_daily_balance(p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_income DECIMAL(10,2);
  v_expense DECIMAL(10,2);
  v_prev_balance DECIMAL(10,2);
BEGIN
  -- Get total income for the date
  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM transactions
  WHERE DATE(completed_at) = p_date AND status = 'completed';
  
  -- Get total expense for the date
  SELECT COALESCE(SUM(amount), 0) INTO v_expense
  FROM expenses
  WHERE expense_date = p_date AND approved = true;
  
  -- Get previous day's closing balance
  SELECT COALESCE(closing_balance, 0) INTO v_prev_balance
  FROM cash_balance
  WHERE date = p_date - INTERVAL '1 day';
  
  -- Insert or update balance
  INSERT INTO cash_balance (date, opening_balance, total_income, total_expense, closing_balance)
  VALUES (
    p_date,
    v_prev_balance,
    v_income,
    v_expense,
    v_prev_balance + v_income - v_expense
  )
  ON CONFLICT (date) DO UPDATE SET
    opening_balance = v_prev_balance,
    total_income = v_income,
    total_expense = v_expense,
    closing_balance = v_prev_balance + v_income - v_expense,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON expense_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON expenses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON cash_balance
  FOR ALL USING (auth.role() = 'authenticated');