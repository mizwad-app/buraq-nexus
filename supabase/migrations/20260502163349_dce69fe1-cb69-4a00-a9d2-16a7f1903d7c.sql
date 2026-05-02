
BEGIN;

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text,
  ADD COLUMN IF NOT EXISTS industry_zh text;

ALTER TABLE public.production_hubs
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS travel_tips_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text,
  ADD COLUMN IF NOT EXISTS industry_zh text,
  ADD COLUMN IF NOT EXISTS specializations_zh text[];

ALTER TABLE public.product_categories
  ADD COLUMN IF NOT EXISTS name_zh text;

ALTER TABLE public.exhibitions
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS venue_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text,
  ADD COLUMN IF NOT EXISTS category_zh text;

ALTER TABLE public.mosques
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text;

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS cuisine_type_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text,
  ADD COLUMN IF NOT EXISTS nearest_metro_zh text,
  ADD COLUMN IF NOT EXISTS halal_status_note_zh text;

ALTER TABLE public.halal_shops
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text;

ALTER TABLE public.shopping_malls
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text;

ALTER TABLE public.parks
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text;

ALTER TABLE public.embassies
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS working_hours_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text;

ALTER TABLE public.law_firms
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS city_zh text,
  ADD COLUMN IF NOT EXISTS specialization_zh text;

ALTER TABLE public.legal_templates
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text;

ALTER TABLE public.gifts
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS description_zh text;

COMMIT;
