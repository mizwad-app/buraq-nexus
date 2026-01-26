-- Fix security definer view - recreate with security_invoker
DROP VIEW IF EXISTS public.translators_public;

CREATE VIEW public.translators_public 
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  name_uz,
  name_ru,
  name_en,
  name_ar,
  city,
  city_uz,
  city_ru,
  city_en,
  city_ar,
  hsk_level,
  self_declared_hsk,
  buraq_verified_hsk,
  buraq_verified_at,
  specializations,
  bio,
  bio_uz,
  bio_ru,
  bio_en,
  bio_ar,
  price_per_day,
  hourly_rate,
  daily_rate,
  currency,
  is_verified,
  is_available,
  avatar_url,
  intro_video_url,
  rating,
  total_reviews,
  total_bookings,
  completed_bookings,
  years_experience,
  age,
  gender,
  language_pairs,
  user_id,
  has_personal_car,
  has_chinese_driving_license,
  created_at,
  updated_at
  -- Explicitly excluding: email, phone, whatsapp_number, telegram_username, verification_documents
FROM public.translators
WHERE is_available = true;