
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL,
  place_type TEXT NOT NULL CHECK (place_type IN ('park','mall','historical','market','restaurant','mosque')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, place_id, place_type)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_place ON public.user_favorites(place_id, place_type);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.parks
  ADD COLUMN IF NOT EXISTS metro_line TEXT,
  ADD COLUMN IF NOT EXISTS metro_station TEXT,
  ADD COLUMN IF NOT EXISTS metro_exit TEXT,
  ADD COLUMN IF NOT EXISTS walking_distance_meters INTEGER;

ALTER TABLE public.shopping_malls
  ADD COLUMN IF NOT EXISTS metro_line TEXT,
  ADD COLUMN IF NOT EXISTS metro_station TEXT,
  ADD COLUMN IF NOT EXISTS metro_exit TEXT,
  ADD COLUMN IF NOT EXISTS walking_distance_meters INTEGER;

ALTER TABLE public.historical_sites
  ADD COLUMN IF NOT EXISTS metro_line TEXT,
  ADD COLUMN IF NOT EXISTS metro_station TEXT,
  ADD COLUMN IF NOT EXISTS metro_exit TEXT,
  ADD COLUMN IF NOT EXISTS walking_distance_meters INTEGER;

ALTER TABLE public.markets
  ADD COLUMN IF NOT EXISTS metro_line TEXT,
  ADD COLUMN IF NOT EXISTS metro_station TEXT,
  ADD COLUMN IF NOT EXISTS metro_exit TEXT,
  ADD COLUMN IF NOT EXISTS walking_distance_meters INTEGER;

ALTER TABLE public.mosques
  ADD COLUMN IF NOT EXISTS metro_line TEXT,
  ADD COLUMN IF NOT EXISTS metro_station TEXT,
  ADD COLUMN IF NOT EXISTS metro_exit TEXT,
  ADD COLUMN IF NOT EXISTS walking_distance_meters INTEGER;

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS metro_line TEXT,
  ADD COLUMN IF NOT EXISTS metro_station TEXT,
  ADD COLUMN IF NOT EXISTS metro_exit TEXT,
  ADD COLUMN IF NOT EXISTS walking_distance_meters INTEGER;
