
-- 1. Translators: revoke sensitive columns from anon role (column-level privileges)
REVOKE SELECT ON public.translators FROM anon;
GRANT SELECT (
  id, user_id, name, name_uz, name_ru, name_en, name_ar,
  city, city_uz, city_ru, city_en, city_ar,
  hsk_level, specializations, bio, bio_uz, bio_ru, bio_en, bio_ar,
  price_per_day, is_verified, is_available, avatar_url,
  rating, total_reviews, created_at, updated_at,
  intro_video_url, self_declared_hsk, buraq_verified_hsk, buraq_verified_at,
  verified_at, hourly_rate, daily_rate, currency,
  total_bookings, completed_bookings, years_experience,
  language_pairs, has_personal_car, has_chinese_driving_license,
  available_today, available_dates, languages,
  rating_reliability, rating_negotiation, rating_punctuality, rating_knowledge,
  response_time_avg
) ON public.translators TO anon;

-- 2. Deep-check storage: drop public report read, require auth; restrict report uploads to admins
DROP POLICY IF EXISTS "Anyone can view reports" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload reports" ON storage.objects;

CREATE POLICY "Authenticated users can view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'deep-checks'
  AND (storage.foldername(name))[1] = 'reports'
);

CREATE POLICY "Only admins can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deep-checks'
  AND (storage.foldername(name))[1] = 'reports'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 3. Realtime: scope chat channel subscriptions to participants
DROP POLICY IF EXISTS "Chat participants can subscribe" ON realtime.messages;
CREATE POLICY "Chat participants can subscribe"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'chat:%' THEN EXISTS (
      SELECT 1
      FROM public.chat_conversations c
      WHERE c.id::text = substring(realtime.topic() from 6)
        AND (
          c.client_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.translators t
            WHERE t.id = c.translator_id AND t.user_id = auth.uid()
          )
        )
    )
    ELSE false
  END
);
