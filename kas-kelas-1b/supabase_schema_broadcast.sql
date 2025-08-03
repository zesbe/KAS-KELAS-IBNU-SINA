-- Create broadcast_logs table for tracking broadcast activities
CREATE TABLE IF NOT EXISTS broadcast_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_recipients INTEGER NOT NULL,
  delay_seconds INTEGER NOT NULL DEFAULT 10,
  payment_type_id UUID REFERENCES payment_types(id),
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  metadata JSONB
);

-- Add indexes
CREATE INDEX idx_broadcast_logs_created_at ON broadcast_logs(created_at DESC);
CREATE INDEX idx_broadcast_logs_status ON broadcast_logs(status);
CREATE INDEX idx_broadcast_logs_payment_type ON broadcast_logs(payment_type_id);

-- Enable RLS
ALTER TABLE broadcast_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON broadcast_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON broadcast_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON broadcast_logs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create view for broadcast statistics
CREATE OR REPLACE VIEW broadcast_statistics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_broadcasts,
  SUM(total_recipients) as total_recipients,
  SUM(success_count) as total_success,
  SUM(failed_count) as total_failed,
  AVG(delay_seconds) as avg_delay_seconds
FROM broadcast_logs
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON broadcast_statistics TO authenticated;