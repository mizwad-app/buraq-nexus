
ALTER TABLE public.historical_sites
  ADD COLUMN IF NOT EXISTS mizwad_pick_rank INTEGER,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_uz TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_ru TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_en TEXT;

ALTER TABLE public.shopping_malls
  ADD COLUMN IF NOT EXISTS mizwad_pick_rank INTEGER,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_uz TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_ru TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_en TEXT;

ALTER TABLE public.markets
  ADD COLUMN IF NOT EXISTS mizwad_pick_rank INTEGER,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_uz TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_ru TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_en TEXT;

ALTER TABLE public.mosques
  ADD COLUMN IF NOT EXISTS mizwad_pick_rank INTEGER,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_uz TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_ru TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_pick_reason_en TEXT;

CREATE INDEX IF NOT EXISTS idx_hist_mizwad_pick ON public.historical_sites(city, mizwad_pick_rank) WHERE mizwad_pick_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_malls_mizwad_pick ON public.shopping_malls(city, mizwad_pick_rank) WHERE mizwad_pick_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_markets_mizwad_pick ON public.markets(city, mizwad_pick_rank) WHERE mizwad_pick_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mosques_mizwad_pick ON public.mosques(city, mizwad_pick_rank) WHERE mizwad_pick_rank IS NOT NULL;
