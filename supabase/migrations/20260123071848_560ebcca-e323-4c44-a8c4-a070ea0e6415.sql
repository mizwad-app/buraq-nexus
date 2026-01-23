-- Add transport & driving fields to translators table
ALTER TABLE public.translators 
ADD COLUMN has_personal_car BOOLEAN DEFAULT false,
ADD COLUMN has_chinese_driving_license BOOLEAN DEFAULT false;

-- Drop and recreate the public view to include new fields
DROP VIEW IF EXISTS public.translators_public;

CREATE VIEW public.translators_public AS
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
    age,
    language_pairs,
    phone,
    has_personal_car,
    has_chinese_driving_license
FROM translators
WHERE is_available = true;