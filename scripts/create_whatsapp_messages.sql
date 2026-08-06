-- ═══════════════════════════════════════════════════════════════════════════════
-- WhatsApp Messages Log — Stores incoming patient messages for tracking
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS spine_whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  message_body TEXT,
  message_type TEXT DEFAULT 'inquiry' CHECK (message_type IN ('daily_checkin', 'inquiry', 'feedback', 'booking', 'other')),
  vas_score INTEGER CHECK (vas_score >= 0 AND vas_score <= 10),
  exercise_done BOOLEAN,
  processed BOOLEAN DEFAULT false,
  responded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE spine_whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Only authenticated staff can view messages
CREATE POLICY "Staff can view whatsapp messages"
  ON spine_whatsapp_messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow inserts from service role (webhook)
CREATE POLICY "Service can insert messages"
  ON spine_whatsapp_messages FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_wa_phone ON spine_whatsapp_messages(phone_number);
CREATE INDEX idx_wa_type ON spine_whatsapp_messages(message_type, created_at DESC);
