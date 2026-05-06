-- Add Mizwad TOP recommendation fields to travel tables
ALTER TABLE public.parks
  ADD COLUMN IF NOT EXISTS mizwad_rank integer,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_uz text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_ru text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_en text,
  ADD COLUMN IF NOT EXISTS recommended_duration text,
  ADD COLUMN IF NOT EXISTS best_for text[];

ALTER TABLE public.shopping_malls
  ADD COLUMN IF NOT EXISTS mizwad_rank integer,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_uz text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_ru text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_en text,
  ADD COLUMN IF NOT EXISTS recommended_duration text,
  ADD COLUMN IF NOT EXISTS best_for text[];

ALTER TABLE public.historical_sites
  ADD COLUMN IF NOT EXISTS mizwad_rank integer,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_uz text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_ru text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_en text,
  ADD COLUMN IF NOT EXISTS recommended_duration text,
  ADD COLUMN IF NOT EXISTS best_for text[];

ALTER TABLE public.markets
  ADD COLUMN IF NOT EXISTS mizwad_rank integer,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_uz text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_ru text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_en text,
  ADD COLUMN IF NOT EXISTS recommended_duration text,
  ADD COLUMN IF NOT EXISTS best_for text[];

ALTER TABLE public.mosques
  ADD COLUMN IF NOT EXISTS mizwad_rank integer,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_uz text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_ru text,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_en text,
  ADD COLUMN IF NOT EXISTS recommended_duration text,
  ADD COLUMN IF NOT EXISTS best_for text[];

CREATE INDEX IF NOT EXISTS idx_parks_mizwad_rank ON public.parks(mizwad_rank) WHERE mizwad_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shopping_malls_mizwad_rank ON public.shopping_malls(mizwad_rank) WHERE mizwad_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_historical_sites_mizwad_rank ON public.historical_sites(mizwad_rank) WHERE mizwad_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_markets_mizwad_rank ON public.markets(mizwad_rank) WHERE mizwad_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mosques_mizwad_rank ON public.mosques(mizwad_rank) WHERE mizwad_rank IS NOT NULL;