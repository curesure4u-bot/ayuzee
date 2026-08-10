-- ============================================================
-- UNIFIED NOTIFICATION CENTER — Database Schema
-- Aggregates notifications from all modules into one place
-- ============================================================

CREATE TABLE IF NOT EXISTS unified_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  
  -- Categorization
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN (
    'task_overdue', 'task_due_today', 'task_assigned', 'task_completed',
    'appointment_upcoming', 'appointment_cancelled', 'appointment_reminder',
    'order_placed', 'order_shipped', 'order_delivered',
    'message_received', 'feedback_received',
    'system', 'info', 'warning', 'success'
  )),
  
  -- Source module linking
  source_module TEXT NOT NULL DEFAULT 'system' CHECK (source_module IN (
    'task_tracker', 'appointments', 'orders', 'messages', 'feedback',
    'hms', 'student', 'beyond', 'system'
  )),
  source_id TEXT DEFAULT NULL,       -- ID of the related record (task_id, appointment_id, etc.)
  source_url TEXT DEFAULT NULL,      -- Direct link to navigate to
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  
  -- Priority
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Auto-expiry (optional)
  expires_at TIMESTAMPTZ DEFAULT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_unified_notifs_user ON unified_notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unified_notifs_user_unread ON unified_notifications(user_id) WHERE is_read = false AND is_dismissed = false;
CREATE INDEX IF NOT EXISTS idx_unified_notifs_type ON unified_notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_unified_notifs_source ON unified_notifications(user_id, source_module);

-- RLS
ALTER TABLE unified_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON unified_notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON unified_notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON unified_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON unified_notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTION: Create notification (callable from triggers/functions)
-- ============================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT DEFAULT '',
  p_type TEXT DEFAULT 'info',
  p_source_module TEXT DEFAULT 'system',
  p_source_id TEXT DEFAULT NULL,
  p_source_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO unified_notifications (user_id, title, message, type, source_module, source_id, source_url, priority)
  VALUES (p_user_id, p_title, p_message, p_type, p_source_module, p_source_id, p_source_url, p_priority)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
