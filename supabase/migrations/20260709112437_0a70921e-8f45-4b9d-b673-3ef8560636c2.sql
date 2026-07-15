ALTER TABLE public.mala_pareeksha_assessments
  ADD COLUMN IF NOT EXISTS varna TEXT,
  ADD COLUMN IF NOT EXISTS varna_note TEXT,
  ADD COLUMN IF NOT EXISTS akriti_bristol_type SMALLINT,
  ADD COLUMN IF NOT EXISTS pramana TEXT,
  ADD COLUMN IF NOT EXISTS gandha TEXT,
  ADD COLUMN IF NOT EXISTS ama_present BOOLEAN,
  ADD COLUMN IF NOT EXISTS ama_note TEXT,
  ADD COLUMN IF NOT EXISTS plava_pariksha TEXT,
  ADD COLUMN IF NOT EXISTS frequency_per_day NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS time_of_day_pattern TEXT,
  ADD COLUMN IF NOT EXISTS associated_symptoms TEXT[],
  ADD COLUMN IF NOT EXISTS suggested_dosha_correlation TEXT;

ALTER TABLE public.mala_pareeksha_assessments
  DROP CONSTRAINT IF EXISTS mala_varna_chk,
  DROP CONSTRAINT IF EXISTS mala_pramana_chk,
  DROP CONSTRAINT IF EXISTS mala_gandha_chk,
  DROP CONSTRAINT IF EXISTS mala_plava_chk,
  DROP CONSTRAINT IF EXISTS mala_tod_chk,
  DROP CONSTRAINT IF EXISTS mala_akriti_chk,
  DROP CONSTRAINT IF EXISTS mala_freq_chk;

ALTER TABLE public.mala_pareeksha_assessments
  ADD CONSTRAINT mala_varna_chk CHECK (varna IS NULL OR varna IN ('yellow_brown','pale_clay','black_tarry','blood_tinged','green','other')),
  ADD CONSTRAINT mala_pramana_chk CHECK (pramana IS NULL OR pramana IN ('scanty','normal','excessive')),
  ADD CONSTRAINT mala_gandha_chk CHECK (gandha IS NULL OR gandha IN ('normal','foul','sour','odorless')),
  ADD CONSTRAINT mala_plava_chk CHECK (plava_pariksha IS NULL OR plava_pariksha IN ('floats','sinks','not_observed')),
  ADD CONSTRAINT mala_tod_chk CHECK (time_of_day_pattern IS NULL OR time_of_day_pattern IN ('morning','afternoon','evening','irregular')),
  ADD CONSTRAINT mala_akriti_chk CHECK (akriti_bristol_type IS NULL OR (akriti_bristol_type BETWEEN 1 AND 7)),
  ADD CONSTRAINT mala_freq_chk CHECK (frequency_per_day IS NULL OR (frequency_per_day >= 0 AND frequency_per_day <= 30));