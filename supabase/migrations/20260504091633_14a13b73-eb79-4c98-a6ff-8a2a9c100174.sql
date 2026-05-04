BEGIN;

ALTER TABLE public.mosques 
  ADD COLUMN IF NOT EXISTS built_year INTEGER,
  ADD COLUMN IF NOT EXISTS historical_period_uz TEXT,
  ADD COLUMN IF NOT EXISTS historical_period_ru TEXT,
  ADD COLUMN IF NOT EXISTS historical_period_en TEXT,
  ADD COLUMN IF NOT EXISTS historical_period_ar TEXT,
  ADD COLUMN IF NOT EXISTS historical_period_zh TEXT,
  ADD COLUMN IF NOT EXISTS historical_facts_uz TEXT,
  ADD COLUMN IF NOT EXISTS historical_facts_ru TEXT,
  ADD COLUMN IF NOT EXISTS historical_facts_en TEXT,
  ADD COLUMN IF NOT EXISTS historical_facts_ar TEXT,
  ADD COLUMN IF NOT EXISTS historical_facts_zh TEXT,
  ADD COLUMN IF NOT EXISTS notable_features JSONB,
  ADD COLUMN IF NOT EXISTS friday_prayer_time TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS data_sources JSONB;

ALTER TABLE public.mosques ALTER COLUMN has_friday_prayer DROP NOT NULL;
ALTER TABLE public.mosques ALTER COLUMN has_womens_section DROP NOT NULL;

ALTER TABLE public.mosques DROP CONSTRAINT IF EXISTS mosques_verification_status_check;
ALTER TABLE public.mosques ADD CONSTRAINT mosques_verification_status_check 
  CHECK (verification_status IN ('unverified', 'admin_verified', 'community_verified'));

COMMIT;