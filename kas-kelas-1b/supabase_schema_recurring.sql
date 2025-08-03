-- Tabel untuk recurring payment settings
CREATE TABLE IF NOT EXISTS recurring_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_type_id UUID REFERENCES payment_types(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 28), -- Max 28 to avoid month-end issues
  reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before due date to send reminders
  escalation_days INTEGER DEFAULT 3, -- Days after due date to escalate
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabel untuk tracking recurring payment generation
CREATE TABLE IF NOT EXISTS recurring_generation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_type_id UUID REFERENCES payment_types(id),
  generation_date DATE NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  total_generated INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabel untuk smart reminder tracking
CREATE TABLE IF NOT EXISTS reminder_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL, -- 'before_due', 'on_due', 'overdue', 'escalation'
  scheduled_date DATE NOT NULL,
  scheduled_time TIME DEFAULT '09:00:00',
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, cancelled
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabel untuk parent portal access
CREATE TABLE IF NOT EXISTS parent_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  access_token VARCHAR(255) UNIQUE NOT NULL,
  pin_code VARCHAR(6), -- Optional PIN for extra security
  is_active BOOLEAN DEFAULT true,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Function untuk generate monthly recurring payments
CREATE OR REPLACE FUNCTION generate_monthly_recurring_payments(p_payment_type_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_student RECORD;
  v_current_month VARCHAR(7);
  v_recurring_setting RECORD;
BEGIN
  -- Get current month
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Check if already generated for this month
  IF EXISTS (
    SELECT 1 FROM recurring_generation_log 
    WHERE payment_type_id = p_payment_type_id 
    AND month_year = v_current_month 
    AND status = 'completed'
  ) THEN
    RETURN 0;
  END IF;
  
  -- Get recurring settings
  SELECT * INTO v_recurring_setting
  FROM recurring_settings
  WHERE payment_type_id = p_payment_type_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Generate payment for each student
  FOR v_student IN SELECT * FROM students ORDER BY name
  LOOP
    -- Check if payment already exists for this month
    IF NOT EXISTS (
      SELECT 1 FROM transactions 
      WHERE student_id = v_student.id 
      AND payment_type_id = p_payment_type_id
      AND TO_CHAR(created_at, 'YYYY-MM') = v_current_month
    ) THEN
      -- Create transaction
      INSERT INTO transactions (
        student_id,
        payment_type_id,
        amount,
        order_id,
        status
      ) 
      SELECT 
        v_student.id,
        p_payment_type_id,
        pt.amount,
        CONCAT(TO_CHAR(CURRENT_DATE, 'YYMMDD'), UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 9))),
        'pending'
      FROM payment_types pt
      WHERE pt.id = p_payment_type_id;
      
      v_count := v_count + 1;
    END IF;
  END LOOP;
  
  -- Log generation
  INSERT INTO recurring_generation_log (
    payment_type_id,
    generation_date,
    month_year,
    total_generated,
    status
  ) VALUES (
    p_payment_type_id,
    CURRENT_DATE,
    v_current_month,
    v_count,
    'completed'
  );
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function untuk schedule reminders
CREATE OR REPLACE FUNCTION schedule_payment_reminders(p_transaction_id UUID)
RETURNS VOID AS $$
DECLARE
  v_transaction RECORD;
  v_recurring_setting RECORD;
  v_due_date DATE;
  v_reminder_day INTEGER;
BEGIN
  -- Get transaction details
  SELECT t.*, pt.is_recurring 
  INTO v_transaction
  FROM transactions t
  JOIN payment_types pt ON t.payment_type_id = pt.id
  WHERE t.id = p_transaction_id;
  
  IF NOT FOUND OR v_transaction.status != 'pending' THEN
    RETURN;
  END IF;
  
  -- Get recurring settings
  SELECT * INTO v_recurring_setting
  FROM recurring_settings
  WHERE payment_type_id = v_transaction.payment_type_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate due date (end of current month)
  v_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day';
  
  -- Schedule reminders before due date
  FOREACH v_reminder_day IN ARRAY v_recurring_setting.reminder_days
  LOOP
    INSERT INTO reminder_schedule (
      transaction_id,
      reminder_type,
      scheduled_date
    ) VALUES (
      p_transaction_id,
      'before_due',
      v_due_date - (v_reminder_day || ' days')::INTERVAL
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Schedule on due date reminder
  INSERT INTO reminder_schedule (
    transaction_id,
    reminder_type,
    scheduled_date
  ) VALUES (
    p_transaction_id,
    'on_due',
    v_due_date
  ) ON CONFLICT DO NOTHING;
  
  -- Schedule escalation reminder
  INSERT INTO reminder_schedule (
    transaction_id,
    reminder_type,
    scheduled_date
  ) VALUES (
    p_transaction_id,
    'escalation',
    v_due_date + (v_recurring_setting.escalation_days || ' days')::INTERVAL
  ) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX idx_recurring_settings_payment_type ON recurring_settings(payment_type_id);
CREATE INDEX idx_recurring_generation_log_date ON recurring_generation_log(generation_date);
CREATE INDEX idx_reminder_schedule_date ON reminder_schedule(scheduled_date, status);
CREATE INDEX idx_parent_access_token ON parent_access(access_token);
CREATE INDEX idx_parent_access_student ON parent_access(student_id);

-- RLS Policies
ALTER TABLE recurring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_access ENABLE ROW LEVEL SECURITY;

-- Admin access policies
CREATE POLICY "Admin full access to recurring_settings" ON recurring_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to recurring_generation_log" ON recurring_generation_log
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to reminder_schedule" ON reminder_schedule
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access to parent_access" ON parent_access
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default recurring settings for existing payment types
INSERT INTO recurring_settings (payment_type_id, day_of_month)
SELECT id, 1 FROM payment_types WHERE is_recurring = true
ON CONFLICT DO NOTHING;