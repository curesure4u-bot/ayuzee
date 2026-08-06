-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE — Eka.care-Inspired Features
-- Feature 1: Medical Document Parsing (OCR → Structured Data)
-- Feature 2: Patient MedAssist AI Agent
-- Feature 3: Open Developer API
-- Feature 4: Wearable/Device Vitals Sync
-- Feature 5: MCP Server
-- Feature 6: Voice Agent
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FEATURE 1: MEDICAL DOCUMENT PARSING (OCR → STRUCTURED DATA)                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1A. Parsed Medical Documents (main table for uploaded + processed docs)       │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS parsed_medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Upload details
  original_file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('pdf', 'image', 'jpg', 'png', 'jpeg', 'dicom')),
  file_size_bytes INTEGER,
  upload_source TEXT DEFAULT 'manual' CHECK (upload_source IN (
    'manual', 'whatsapp', 'email', 'camera', 'abdm_pull', 'hms_auto'
  )),
  -- Document classification (AI-detected)
  document_type TEXT CHECK (document_type IN (
    'lab_report', 'prescription', 'discharge_summary', 'imaging_report',
    'insurance_card', 'id_proof', 'vaccination_certificate', 'surgical_note',
    'consultation_note', 'bill_receipt', 'other'
  )),
  document_date DATE,
  issuing_facility TEXT,
  issuing_doctor TEXT,
  -- Parsing status
  parse_status TEXT DEFAULT 'uploaded' CHECK (parse_status IN (
    'uploaded', 'queued', 'processing', 'parsed', 'verified', 'failed'
  )),
  parse_started_at TIMESTAMPTZ,
  parse_completed_at TIMESTAMPTZ,
  parse_duration_ms INTEGER,
  confidence_score DECIMAL(5,2),
  -- Extracted structured data (FHIR-like JSON)
  extracted_data JSONB DEFAULT '{}',
  extracted_text TEXT,
  -- Specific extractions for quick access
  extracted_lab_values JSONB DEFAULT '[]',
  extracted_medications JSONB DEFAULT '[]',
  extracted_diagnoses JSONB DEFAULT '[]',
  extracted_vitals JSONB DEFAULT '{}',
  extracted_procedures JSONB DEFAULT '[]',
  -- Verification
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  corrections JSONB DEFAULT '{}',
  -- Linking
  linked_to_folder_id UUID,
  linked_to_appointment_id UUID,
  clinic_id UUID,
  -- Meta
  ai_model_used TEXT DEFAULT 'gpt-4-vision',
  tokens_used INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parsed_medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own parsed docs"
  ON parsed_medical_documents FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Patient can upload docs"
  ON parsed_medical_documents FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage parsed docs"
  ON parsed_medical_documents FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_parsed_docs_patient ON parsed_medical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_parsed_docs_status ON parsed_medical_documents(parse_status);
CREATE INDEX IF NOT EXISTS idx_parsed_docs_type ON parsed_medical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_parsed_docs_date ON parsed_medical_documents(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1B. Extracted Lab Values (normalized for trend tracking)                      │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS parsed_lab_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES parsed_medical_documents(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Lab value details
  test_name TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  value DECIMAL(12,4),
  value_text TEXT,
  unit TEXT,
  normal_range_min DECIMAL(12,4),
  normal_range_max DECIMAL(12,4),
  normal_range_text TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  -- LOINC mapping
  loinc_code TEXT,
  snomed_code TEXT,
  -- Context
  sample_date DATE,
  lab_name TEXT,
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parsed_lab_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own lab values"
  ON parsed_lab_values FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "System can insert lab values"
  ON parsed_lab_values FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_parsed_labs_patient ON parsed_lab_values(patient_id, test_name);
CREATE INDEX IF NOT EXISTS idx_parsed_labs_doc ON parsed_lab_values(document_id);
CREATE INDEX IF NOT EXISTS idx_parsed_labs_abnormal ON parsed_lab_values(patient_id, is_abnormal) WHERE is_abnormal = true;
CREATE INDEX IF NOT EXISTS idx_parsed_labs_date ON parsed_lab_values(sample_date DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1C. Document Parsing Queue (for async processing)                             │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS document_parsing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES parsed_medical_documents(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retrying')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  worker_id TEXT,
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE document_parsing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage parsing queue"
  ON document_parsing_queue FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_parse_queue_status ON document_parsing_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_parse_queue_retry ON document_parsing_queue(next_retry_at) WHERE status = 'retrying';


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FEATURE 2: PATIENT MEDASSIST AI AGENT (HEALTH BOT)                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2A. MedAssist Chat Sessions                                                   │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS medassist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Session meta
  session_type TEXT DEFAULT 'general' CHECK (session_type IN (
    'general', 'symptom_check', 'appointment_booking', 'medicine_info',
    'report_query', 'diet_advice', 'ayush_guidance', 'emergency_triage'
  )),
  language TEXT DEFAULT 'en' CHECK (language IN (
    'en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or', 'ur'
  )),
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'expired')),
  resolved_action TEXT,
  escalated_to TEXT,
  escalated_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Outcome
  appointment_booked_id UUID,
  symptom_summary TEXT,
  triage_level TEXT CHECK (triage_level IN ('emergency', 'urgent', 'routine', 'self_care', NULL)),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  -- Metrics
  message_count INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medassist_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own sessions"
  ON medassist_sessions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patient can create sessions"
  ON medassist_sessions FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "System can manage sessions"
  ON medassist_sessions FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_medassist_sessions_patient ON medassist_sessions(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_medassist_sessions_type ON medassist_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_medassist_sessions_date ON medassist_sessions(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2B. MedAssist Messages (individual chat messages)                             │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS medassist_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES medassist_sessions(id) ON DELETE CASCADE,
  -- Message
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN (
    'text', 'quick_reply', 'card', 'image', 'action_button', 'form'
  )),
  -- Structured data (for action messages)
  action_data JSONB DEFAULT '{}',
  quick_replies JSONB DEFAULT '[]',
  -- AI meta
  model_used TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  latency_ms INTEGER,
  -- Context used
  patient_context_used BOOLEAN DEFAULT false,
  records_referenced JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medassist_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own messages"
  ON medassist_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM medassist_sessions s WHERE s.id = session_id AND s.patient_id = auth.uid()
  ) OR auth.uid() IS NOT NULL);

CREATE POLICY "System can insert messages"
  ON medassist_messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_medassist_messages_session ON medassist_messages(session_id, created_at);


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FEATURE 3: OPEN DEVELOPER API / SDK                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3A. API Keys (for third-party developers)                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS developer_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Key details
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  api_secret_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  -- Permissions
  scopes TEXT[] DEFAULT ARRAY['patients:read', 'appointments:read'],
  allowed_endpoints TEXT[] DEFAULT ARRAY['*'],
  -- Plan & limits
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  rate_limit_per_minute INTEGER DEFAULT 10,
  rate_limit_per_day INTEGER DEFAULT 1000,
  monthly_quota INTEGER DEFAULT 10000,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked', 'expired')),
  last_used_at TIMESTAMPTZ,
  total_requests INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  -- App info
  app_name TEXT,
  app_description TEXT,
  app_url TEXT,
  redirect_uri TEXT,
  webhook_url TEXT,
  -- Meta
  ip_whitelist TEXT[] DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE developer_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own API keys"
  ON developer_api_keys FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can manage own API keys"
  ON developer_api_keys FOR ALL
  USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON developer_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON developer_api_keys(owner_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON developer_api_keys(status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3B. API Usage Log                                                             │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS developer_api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES developer_api_keys(id) ON DELETE CASCADE,
  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  status_code INTEGER,
  response_time_ms INTEGER,
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  request_body_size INTEGER,
  response_body_size INTEGER,
  -- Error tracking
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE developer_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own usage"
  ON developer_api_usage FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM developer_api_keys k WHERE k.id = api_key_id AND k.owner_id = auth.uid()
  ));

CREATE POLICY "System can insert usage"
  ON developer_api_usage FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_api_usage_key ON developer_api_usage(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON developer_api_usage(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON developer_api_usage(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3C. Webhook Subscriptions                                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS developer_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES developer_api_keys(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['appointment.created'],
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE developer_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage webhooks"
  ON developer_webhooks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM developer_api_keys k WHERE k.id = api_key_id AND k.owner_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_webhooks_key ON developer_webhooks(api_key_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON developer_webhooks USING GIN(events);


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FEATURE 4: WEARABLE / DEVICE VITALS SYNC                                     ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4A. Connected Devices (patient's linked wearables/devices)                    │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_connected_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN (
    'smartwatch', 'bp_monitor', 'glucometer', 'pulse_oximeter',
    'weighing_scale', 'thermometer', 'ecg_monitor', 'fitness_band', 'cgm'
  )),
  brand TEXT,
  model TEXT,
  -- Integration
  sync_source TEXT NOT NULL CHECK (sync_source IN (
    'google_fit', 'apple_health', 'health_connect', 'bluetooth_direct',
    'manual_entry', 'api_push'
  )),
  connection_status TEXT DEFAULT 'connected' CHECK (connection_status IN (
    'connected', 'disconnected', 'pairing', 'error'
  )),
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'realtime' CHECK (sync_frequency IN (
    'realtime', 'hourly', 'daily', 'manual'
  )),
  -- Auth tokens (encrypted in production)
  access_token_hash TEXT,
  refresh_token_hash TEXT,
  token_expires_at TIMESTAMPTZ,
  -- Meta
  battery_level INTEGER,
  firmware_version TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_connected_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own devices"
  ON patient_connected_devices FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patient can manage own devices"
  ON patient_connected_devices FOR ALL
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_devices_patient ON patient_connected_devices(patient_id);
CREATE INDEX IF NOT EXISTS idx_devices_type ON patient_connected_devices(device_type);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4B. Vitals Readings (time-series data from devices)                           │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_vitals_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES patient_connected_devices(id) ON DELETE SET NULL,
  -- Vital type
  vital_type TEXT NOT NULL CHECK (vital_type IN (
    'blood_pressure', 'heart_rate', 'spo2', 'blood_glucose',
    'body_temperature', 'weight', 'bmi', 'steps', 'sleep',
    'respiratory_rate', 'ecg', 'hrv', 'stress_level', 'calories'
  )),
  -- Values
  value_primary DECIMAL(10,2) NOT NULL,
  value_secondary DECIMAL(10,2),
  unit TEXT NOT NULL,
  -- Context
  measurement_context TEXT CHECK (measurement_context IN (
    'resting', 'active', 'fasting', 'post_meal', 'pre_sleep', 'waking', 'random', NULL
  )),
  -- AI analysis
  is_abnormal BOOLEAN DEFAULT false,
  is_critical BOOLEAN DEFAULT false,
  ai_flag TEXT,
  ai_recommendation TEXT,
  -- Source
  source TEXT DEFAULT 'device' CHECK (source IN ('device', 'manual', 'clinic', 'lab')),
  sync_source TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  -- Alert
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_vitals_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own vitals"
  ON patient_vitals_readings FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "System can insert vitals"
  ON patient_vitals_readings FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_vitals_patient_type ON patient_vitals_readings(patient_id, vital_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_abnormal ON patient_vitals_readings(patient_id, is_abnormal) WHERE is_abnormal = true;
CREATE INDEX IF NOT EXISTS idx_vitals_date ON patient_vitals_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_device ON patient_vitals_readings(device_id, recorded_at DESC);


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FEATURE 5: MCP SERVER (MODEL CONTEXT PROTOCOL)                                ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 5A. MCP Tool Invocations Log (tracks AI agent actions)                        │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS mcp_tool_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES developer_api_keys(id) ON DELETE SET NULL,
  session_id TEXT,
  -- Tool details
  tool_name TEXT NOT NULL,
  tool_category TEXT CHECK (tool_category IN (
    'patient_management', 'appointments', 'prescriptions', 'lab',
    'formulary', 'vitals', 'abdm', 'medications', 'clinic'
  )),
  -- Input/Output
  input_params JSONB DEFAULT '{}',
  output_result JSONB DEFAULT '{}',
  -- Status
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
  error_message TEXT,
  execution_time_ms INTEGER,
  -- Context
  ai_client TEXT,
  model_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mcp_tool_invocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own MCP logs"
  ON mcp_tool_invocations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert MCP logs"
  ON mcp_tool_invocations FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_mcp_tool ON mcp_tool_invocations(tool_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_session ON mcp_tool_invocations(session_id);
CREATE INDEX IF NOT EXISTS idx_mcp_api_key ON mcp_tool_invocations(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_date ON mcp_tool_invocations(created_at DESC);


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FEATURE 6: VOICE-ENABLED PATIENT ENGAGEMENT (WebRTC)                          ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 6A. Voice Agent Sessions                                                      │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS voice_agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Session meta
  session_type TEXT DEFAULT 'inbound' CHECK (session_type IN (
    'inbound', 'outbound_reminder', 'outbound_followup', 'outbound_feedback', 'widget'
  )),
  language TEXT DEFAULT 'en' CHECK (language IN (
    'en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa'
  )),
  channel TEXT DEFAULT 'webrtc' CHECK (channel IN ('webrtc', 'telephony', 'widget', 'ivr')),
  -- Call details
  caller_phone TEXT,
  call_duration_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  -- AI processing
  transcript TEXT,
  transcript_segments JSONB DEFAULT '[]',
  intent_detected TEXT,
  entities_extracted JSONB DEFAULT '{}',
  -- Outcome
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'completed', 'dropped', 'transferred', 'voicemail'
  )),
  outcome TEXT CHECK (outcome IN (
    'appointment_booked', 'symptom_collected', 'information_provided',
    'transferred_to_human', 'feedback_collected', 'reminder_acknowledged',
    'medicine_reminder_confirmed', 'no_action', NULL
  )),
  outcome_data JSONB DEFAULT '{}',
  -- Transfer
  transferred_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transfer_reason TEXT,
  -- Quality
  patient_satisfaction INTEGER CHECK (patient_satisfaction >= 1 AND patient_satisfaction <= 5),
  ai_confidence DECIMAL(5,2),
  -- Meta
  clinic_id UUID,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE voice_agent_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view voice sessions"
  ON voice_agent_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage voice sessions"
  ON voice_agent_sessions FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_patient ON voice_agent_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_agent_sessions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_date ON voice_agent_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_outcome ON voice_agent_sessions(outcome);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ALL EKA.CARE-INSPIRED FEATURES COMPLETE
-- Tables created: parsed_medical_documents, parsed_lab_values, document_parsing_queue,
--   medassist_sessions, medassist_messages, developer_api_keys, developer_api_usage,
--   developer_webhooks, patient_connected_devices, patient_vitals_readings,
--   mcp_tool_invocations, voice_agent_sessions
-- Total: 12 new tables
-- ═══════════════════════════════════════════════════════════════════════════════


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ TELEGRAM BOT USERS (for sending notifications)                                ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS telegram_bot_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT UNIQUE NOT NULL,
  chat_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  phone TEXT,
  -- Link to Ayuzee patient
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_linked BOOLEAN DEFAULT false,
  -- Preferences
  notifications_enabled BOOLEAN DEFAULT true,
  medicine_reminders BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  lab_alerts BOOLEAN DEFAULT true,
  preferred_language TEXT DEFAULT 'en',
  -- Meta
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE telegram_bot_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage telegram users"
  ON telegram_bot_users FOR ALL
  USING (true);

CREATE INDEX IF NOT EXISTS idx_tg_users_telegram_id ON telegram_bot_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tg_users_patient ON telegram_bot_users(patient_id);
CREATE INDEX IF NOT EXISTS idx_tg_users_chat ON telegram_bot_users(chat_id);
