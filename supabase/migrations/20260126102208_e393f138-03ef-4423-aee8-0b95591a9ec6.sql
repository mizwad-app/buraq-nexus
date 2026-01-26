-- Fix 1: Remove permissive UPDATE policy on user_points to prevent direct point manipulation
-- All point changes must go through SECURITY DEFINER functions (add_cargo_points, redeem_gift, redeem_deep_check_points)
DROP POLICY IF EXISTS "Users can update their own points" ON public.user_points;

-- Create a blocking policy that prevents all direct updates
CREATE POLICY "Block direct points updates"
  ON public.user_points FOR UPDATE
  USING (false);

-- Fix 2: Recreate the translators_public view WITHOUT security_definer
-- This ensures RLS policies are enforced based on the querying user
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
    city,
    city_en,
    city_ru,
    city_ar,
    city_uz,
    bio,
    bio_en,
    bio_ru,
    bio_ar,
    bio_uz,
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
    verified_at,
    has_personal_car,
    has_chinese_driving_license,
    intro_video_url,
    gender,
    age,
    created_at,
    updated_at
  FROM public.translators
  WHERE is_available = true;