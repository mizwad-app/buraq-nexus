-- Add missing translator columns (skip duplicates of existing ones)
ALTER TABLE public.translators
  ADD COLUMN IF NOT EXISTS available_today BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS available_dates JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rating_reliability NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS rating_negotiation NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS rating_punctuality NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS rating_knowledge NUMERIC(2,1),
  ADD COLUMN IF NOT EXISTS response_time_avg INTEGER;

-- Gender check constraint (only if missing)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'translators_gender_check') THEN
    ALTER TABLE public.translators ADD CONSTRAINT translators_gender_check
      CHECK (gender IS NULL OR gender IN ('male','female'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_translators_available_today ON public.translators(available_today) WHERE available_today = true;
CREATE INDEX IF NOT EXISTS idx_translators_hsk ON public.translators(hsk_level);
CREATE INDEX IF NOT EXISTS idx_translators_city ON public.translators(city);