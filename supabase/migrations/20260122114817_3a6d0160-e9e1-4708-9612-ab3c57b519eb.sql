-- Add age column to translators table
ALTER TABLE public.translators ADD COLUMN IF NOT EXISTS age integer;

-- Update the translators_public view to include the age field
DROP VIEW IF EXISTS public.translators_public;

CREATE VIEW public.translators_public
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  name_en,
  name_ar,
  name_ru,
  name_uz,
  bio,
  bio_en,
  bio_ar,
  bio_ru,
  bio_uz,
  city,
  city_en,
  city_ar,
  city_ru,
  city_uz,
  avatar_url,
  hsk_level,
  is_available,
  is_verified,
  price_per_day,
  rating,
  specializations,
  total_reviews,
  created_at,
  updated_at,
  user_id,
  intro_video_url,
  self_declared_hsk,
  buraq_verified_hsk,
  buraq_verified_at,
  hourly_rate,
  daily_rate,
  currency,
  total_bookings,
  completed_bookings,
  gender,
  years_experience,
  age
FROM public.translators
WHERE is_available = true;

-- Update existing translators with sample ages based on their bio data
UPDATE public.translators SET age = 29 WHERE name = 'Sardor Alimov';
UPDATE public.translators SET age = 26 WHERE name = 'Ali Karimov';
UPDATE public.translators SET age = 28 WHERE name = 'Bekzod Umarov';
UPDATE public.translators SET age = 31 WHERE name = 'Jamshid Tursunov';