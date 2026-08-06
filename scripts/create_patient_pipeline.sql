-- Patient Pipeline Stage Tracking
CREATE TABLE IF NOT EXISTS spine_patient_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage INTEGER NOT NULL DEFAULT 1 CHECK (stage >= 1 AND stage <= 6),
  stage_name TEXT NOT NULL DEFAULT 'Registration',
  entered_stage_at TIMESTAMPTZ DEFAULT NOW(),
  sessions_completed INTEGER DEFAULT 0,
  modules_completed INTEGER DEFAULT 0,
  total_vas_improvement INTEGER DEFAULT 0,
  referrals_made INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'silver', 'gold', 'diamond')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id)
);
ALTER TABLE spine_patient_pipeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view pipeline" ON spine_patient_pipeline FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage pipeline" ON spine_patient_pipeline FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX idx_pipeline_patient ON spine_patient_pipeline(patient_id);
CREATE INDEX idx_pipeline_stage ON spine_patient_pipeline(stage);
