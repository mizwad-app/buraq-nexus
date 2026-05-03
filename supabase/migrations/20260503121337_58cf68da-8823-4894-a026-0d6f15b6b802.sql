-- Add enrichment columns to existing parks and shopping_malls tables
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY['parks', 'shopping_malls'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS address_local text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS coordinates jsonb', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS opening_hours jsonb', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS phone text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS website text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS entry_fee text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS price_range text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS buraq_recommendation text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS buraq_recommendation_uz text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS buraq_recommendation_ru text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS buraq_recommendation_en text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS buraq_recommendation_ar text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS buraq_recommendation_fr text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS buraq_recommendation_zh text', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS mall_brands text[]', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS amenities text[]', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS features text[]', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS gallery_images text[]', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS transport_info jsonb', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS has_prayer_room boolean DEFAULT false', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true', tbl);
  END LOOP;
END $$;

ALTER TABLE public.parks ADD COLUMN IF NOT EXISTS has_halal_food boolean DEFAULT false;

-- Create historical_sites table
CREATE TABLE IF NOT EXISTS public.historical_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_uz text, name_ru text, name_en text, name_ar text, name_fr text, name_zh text,
  city text NOT NULL,
  city_uz text, city_ru text, city_en text, city_ar text, city_fr text, city_zh text,
  country text NOT NULL DEFAULT 'China',
  address text,
  address_uz text, address_ru text, address_en text, address_ar text, address_fr text, address_zh text,
  address_local text,
  description text,
  description_uz text, description_ru text, description_en text, description_ar text, description_fr text, description_zh text,
  image_url text,
  gallery_images text[],
  latitude numeric, longitude numeric,
  coordinates jsonb,
  opening_hours jsonb,
  phone text, website text,
  entry_fee text, price_range text,
  buraq_recommendation text,
  buraq_recommendation_uz text, buraq_recommendation_ru text, buraq_recommendation_en text,
  buraq_recommendation_ar text, buraq_recommendation_fr text, buraq_recommendation_zh text,
  amenities text[], features text[], mall_brands text[],
  transport_info jsonb,
  has_prayer_room boolean DEFAULT false,
  has_halal_food boolean DEFAULT false,
  rating numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create markets table (different from existing market_product_categories)
CREATE TABLE IF NOT EXISTS public.markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_uz text, name_ru text, name_en text, name_ar text, name_fr text, name_zh text,
  city text NOT NULL,
  city_uz text, city_ru text, city_en text, city_ar text, city_fr text, city_zh text,
  country text NOT NULL DEFAULT 'China',
  address text,
  address_uz text, address_ru text, address_en text, address_ar text, address_fr text, address_zh text,
  address_local text,
  description text,
  description_uz text, description_ru text, description_en text, description_ar text, description_fr text, description_zh text,
  image_url text,
  gallery_images text[],
  latitude numeric, longitude numeric,
  coordinates jsonb,
  opening_hours jsonb,
  phone text, website text,
  entry_fee text, price_range text,
  buraq_recommendation text,
  buraq_recommendation_uz text, buraq_recommendation_ru text, buraq_recommendation_en text,
  buraq_recommendation_ar text, buraq_recommendation_fr text, buraq_recommendation_zh text,
  amenities text[], features text[], mall_brands text[],
  transport_info jsonb,
  has_prayer_room boolean DEFAULT false,
  has_halal_food boolean DEFAULT false,
  rating numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.historical_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Historical sites are viewable by everyone" ON public.historical_sites
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage historical sites" ON public.historical_sites
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Markets are viewable by everyone" ON public.markets
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage markets" ON public.markets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin-write policies for parks and shopping_malls (read policies already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='parks' AND policyname='Admins manage parks') THEN
    CREATE POLICY "Admins manage parks" ON public.parks
      FOR ALL TO authenticated
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='shopping_malls' AND policyname='Admins manage shopping malls') THEN
    CREATE POLICY "Admins manage shopping malls" ON public.shopping_malls
      FOR ALL TO authenticated
      USING (has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

CREATE TRIGGER update_historical_sites_updated_at BEFORE UPDATE ON public.historical_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON public.markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();