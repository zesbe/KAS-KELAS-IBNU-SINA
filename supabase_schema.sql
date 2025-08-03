-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create payment_types table
CREATE TABLE IF NOT EXISTS payment_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_type_id UUID NOT NULL REFERENCES payment_types(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create payment_reminders table
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  payment_type_id UUID NOT NULL REFERENCES payment_types(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create whatsapp_logs table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_transactions_student_id ON transactions(student_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_payment_reminders_reminder_date ON payment_reminders(reminder_date);
CREATE INDEX idx_payment_reminders_status ON payment_reminders(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_types_updated_at BEFORE UPDATE ON payment_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reminders_updated_at BEFORE UPDATE ON payment_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial student data
INSERT INTO students (name, parent_phone) VALUES
  ('Ibnu Sina Azma', '+62 856-8500-062'),
  ('Ibnu Sina Dizya', '+62 812-8147-6276'),
  ('Ibnu Sina Khalifa', '+62 877-4168-6950'),
  ('Ibnu Sina Kirana', '+62 812-9759-7757'),
  ('Ibnu Sina Mikha', '+62 813-8241-6552'),
  ('Ibnu Shina Shahia', '+62 858-8163-6149'),
  ('Ibnu Sina Abil', '+62 812-1172-3429'),
  ('Ibnu Sina Adiba', '+62 813-2877-9423'),
  ('Ibnu Sina Arkaan', '+62 821-1475-9339'),
  ('Ibnu Sina Atha', '+62 812-9670-7505'),
  ('Ibnu Sina Nafi M', '+62 856-2468-7313'),
  ('Ibnu Sina Nia', '+62 812-9076-6367'),
  ('Ibnu Sina Radefa', '+62 811-9403-103'),
  ('Ibnu Sina Saga K.A', '+62 877-8539-3962'),
  ('Ibnu Sina Sekar', '+62 812-2595-0048'),
  ('Ibnu Sina Shanum', '+62 857-1663-5953'),
  ('Ibnu Sina Sheila', '+62 822-6021-8027'),
  ('Ibnu Sina Yumna', '+62 813-1007-5190'),
  ('Ibnu Sina Zaidan', '+62 813-1684-0991');

-- Insert initial payment types
INSERT INTO payment_types (name, amount, description, is_recurring) VALUES
  ('Kas Bulanan', 50000, 'Kas bulanan kelas 1B', true),
  ('Kegiatan Kelas', 100000, 'Dana kegiatan kelas', false),
  ('Study Tour', 250000, 'Dana study tour', false);