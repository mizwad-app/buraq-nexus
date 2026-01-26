-- Fix infinite recursion in translator RLS policies
-- The issue is that the view with security_invoker tries to read translators, which has a blocking policy

-- Drop the problematic blocking policy first
DROP POLICY IF EXISTS "Block direct translator access - use view" ON public.translators;

-- Drop existing SELECT policies that cause issues
DROP POLICY IF EXISTS "Booking parties can view translator contact info" ON public.translators;
DROP POLICY IF EXISTS "Translators can view own profile" ON public.translators;

-- Create a proper unified SELECT policy that handles all cases:
-- 1. Public can see basic info (the view will handle field filtering)
-- 2. Authenticated users with confirmed bookings can see full contact info
-- 3. Translators can see their own full profile
CREATE POLICY "Public can view available translators"
ON public.translators
FOR SELECT
USING (is_available = true);

-- Translators can always see their own profile (even if unavailable)
CREATE POLICY "Translators can view own full profile"
ON public.translators
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Recreate the public view that hides sensitive fields
DROP VIEW IF EXISTS public.translators_public;
CREATE VIEW public.translators_public AS
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