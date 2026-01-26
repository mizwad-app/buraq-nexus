-- ============================================================
-- Security Fix 1: Protect translator contact information
-- ============================================================

-- Drop the overly permissive policy that exposes all translator data
DROP POLICY IF EXISTS "Public can view available translators" ON public.translators;

-- Block direct SELECT access to translators table - force use of view
CREATE POLICY "Block direct translator access - use view"
ON public.translators FOR SELECT
USING (false);

-- Allow translators to view/update their own profile
CREATE POLICY "Translators can view own profile"
ON public.translators FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow booking parties to view translator contact info
CREATE POLICY "Booking parties can view translator contact info"
ON public.translators FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT translator_id 
    FROM translator_bookings 
    WHERE client_id = auth.uid()
      AND status IN ('confirmed', 'in_progress', 'completed')
  )
);

-- Recreate the public view without sensitive fields
DROP VIEW IF EXISTS public.translators_public;

CREATE VIEW public.translators_public
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  name_en,
  name_ru,
  name_ar,
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
  rating,
  total_reviews,
  total_bookings,
  completed_bookings,
  years_experience,
  language_pairs,
  specializations,
  hourly_rate,
  daily_rate,
  price_per_day,
  currency,
  hsk_level,
  self_declared_hsk,
  buraq_verified_hsk,
  buraq_verified_at,
  is_available,
  is_verified,
  has_personal_car,
  has_chinese_driving_license,
  intro_video_url,
  gender,
  age,
  user_id,
  created_at,
  updated_at
  -- EXCLUDES: email, phone, whatsapp_number, telegram_username
FROM public.translators
WHERE is_available = true;

-- Grant SELECT on the view to anon and authenticated users
GRANT SELECT ON public.translators_public TO anon, authenticated;

-- ============================================================
-- Security Fix 2: Make deep-checks storage bucket private
-- ============================================================

-- Make the bucket private to prevent direct URL access
UPDATE storage.buckets SET public = false WHERE id = 'deep-checks';

-- ============================================================
-- Security Fix 3: Add input validation constraints
-- ============================================================

-- Deep checks table constraints
ALTER TABLE public.deep_checks 
  ADD CONSTRAINT deep_checks_product_name_length CHECK (length(product_name) <= 200),
  ADD CONSTRAINT deep_checks_manufacturer_name_length CHECK (length(manufacturer_name) <= 200);

-- Service requests table constraints
ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_title_length CHECK (length(title) <= 200),
  ADD CONSTRAINT service_requests_description_length CHECK (length(description) <= 5000);

-- Cargo trackings table constraints
ALTER TABLE public.cargo_trackings
  ADD CONSTRAINT cargo_volume_non_negative CHECK (volume_m3 IS NULL OR volume_m3 >= 0),
  ADD CONSTRAINT cargo_tracking_number_length CHECK (length(tracking_number) <= 100);