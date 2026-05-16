
-- 1) Booking payment: verify amount against translator's stored rate
CREATE OR REPLACE FUNCTION public.process_booking_payment(
  p_translator_id uuid, p_booking_date date, p_start_time time without time zone,
  p_end_time time without time zone, p_service_type text, p_specialization text,
  p_location text, p_description text, p_agreed_rate numeric, p_total_hours integer,
  p_translator_amount numeric, p_service_fee numeric, p_total_amount numeric
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_current_balance numeric(10,2);
  v_booking_id uuid;
  v_fee_rate numeric(5,4) := 0.10;
  v_daily numeric(10,2);
  v_hourly numeric(10,2);
  v_expected_translator numeric(10,2);
  v_expected_fee numeric(10,2);
  v_expected_total numeric(10,2);
  v_tolerance numeric(10,2) := 0.02;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_translator_id IS NULL OR p_booking_date IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;

  -- Server-side rate lookup: trust DB, not client
  SELECT COALESCE(daily_rate, price_per_day), hourly_rate
    INTO v_daily, v_hourly
  FROM public.translators WHERE id = p_translator_id;

  IF v_daily IS NULL AND v_hourly IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Translator rates not set');
  END IF;

  IF p_service_type = 'daily' THEN
    IF v_daily IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Daily rate not available');
    END IF;
    v_expected_translator := v_daily;
  ELSIF p_service_type = 'hourly' THEN
    IF v_hourly IS NULL OR p_total_hours IS NULL OR p_total_hours <= 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid hourly booking');
    END IF;
    v_expected_translator := v_hourly * p_total_hours;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid service_type');
  END IF;

  v_expected_fee   := ROUND(v_expected_translator * v_fee_rate, 2);
  v_expected_total := ROUND(v_expected_translator + v_expected_fee, 2);

  IF ABS(ROUND(p_translator_amount, 2) - v_expected_translator) > v_tolerance
     OR ABS(ROUND(p_total_amount, 2) - v_expected_total) > v_tolerance
     OR ABS(ROUND(p_service_fee, 2) - v_expected_fee) > v_tolerance THEN
    RETURN jsonb_build_object('success', false, 'error', 'Price mismatch',
      'expected_total', v_expected_total, 'expected_translator', v_expected_translator,
      'expected_fee', v_expected_fee);
  END IF;

  INSERT INTO public.user_wallets (user_id, balance, held_balance)
  VALUES (v_user_id, 0, 0) ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO v_current_balance FROM public.user_wallets
  WHERE user_id = v_user_id FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < v_expected_total THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance',
      'current_balance', COALESCE(v_current_balance, 0));
  END IF;

  UPDATE public.user_wallets
  SET balance = balance - v_expected_total,
      held_balance = held_balance + v_expected_total,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  INSERT INTO public.translator_bookings (
    translator_id, client_id, booking_date, start_time, end_time,
    service_type, specialization, location, description,
    agreed_rate, total_hours, translator_amount, service_fee,
    service_fee_rate, total_amount, status, confirmed_at
  ) VALUES (
    p_translator_id, v_user_id, p_booking_date, p_start_time, p_end_time,
    p_service_type, NULLIF(p_specialization, ''), p_location, NULLIF(p_description, ''),
    CASE WHEN p_service_type = 'daily' THEN v_daily ELSE v_hourly END,
    p_total_hours, v_expected_translator, v_expected_fee,
    v_fee_rate, v_expected_total, 'confirmed', NOW()
  ) RETURNING id INTO v_booking_id;

  INSERT INTO public.wallet_transactions (
    booking_id, user_id, amount, transaction_type, status, description, reference_id, metadata
  ) VALUES (
    v_booking_id, v_user_id, -v_expected_total, 'booking_hold', 'held',
    'Tarjimon bron qilish', v_booking_id::text,
    jsonb_build_object('translator_amount', v_expected_translator,
                       'service_fee', v_expected_fee,
                       'service_fee_rate', v_fee_rate)
  );

  RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id,
    'new_balance', v_current_balance - v_expected_total,
    'amount_held', v_expected_total,
    'translator_amount', v_expected_translator,
    'service_fee', v_expected_fee);
END;
$function$;

-- 2) Prevent clients/translators from editing financial fields on their bookings
CREATE OR REPLACE FUNCTION public.guard_translator_booking_financials()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.total_amount       IS DISTINCT FROM OLD.total_amount
     OR NEW.translator_amount IS DISTINCT FROM OLD.translator_amount
     OR NEW.service_fee       IS DISTINCT FROM OLD.service_fee
     OR NEW.service_fee_rate  IS DISTINCT FROM OLD.service_fee_rate
     OR NEW.agreed_rate       IS DISTINCT FROM OLD.agreed_rate
     OR NEW.client_id         IS DISTINCT FROM OLD.client_id
     OR NEW.translator_id     IS DISTINCT FROM OLD.translator_id THEN
    RAISE EXCEPTION 'Financial fields cannot be modified';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_booking_financials ON public.translator_bookings;
CREATE TRIGGER trg_guard_booking_financials
BEFORE UPDATE ON public.translator_bookings
FOR EACH ROW EXECUTE FUNCTION public.guard_translator_booking_financials();

-- 3) Translators: revoke contact columns from authenticated; expose via secure RPC
REVOKE SELECT ON public.translators FROM authenticated;
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
) ON public.translators TO authenticated;

-- Translators retain SELECT on all columns of their own row via existing RLS policy
-- "Translators can view own full profile" — but column-level grants override.
-- Provide a secure RPC for sensitive contact lookup.
CREATE OR REPLACE FUNCTION public.get_translator_contact(_translator_id uuid)
RETURNS TABLE(phone text, email text, telegram_username text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_allowed boolean := false;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Self
  IF EXISTS (SELECT 1 FROM public.translators t
             WHERE t.id = _translator_id AND t.user_id = v_uid) THEN
    v_allowed := true;
  END IF;

  -- Admin
  IF NOT v_allowed AND public.has_role(v_uid, 'admin'::public.app_role) THEN
    v_allowed := true;
  END IF;

  -- Confirmed/active booking participant
  IF NOT v_allowed AND EXISTS (
    SELECT 1 FROM public.translator_bookings b
    WHERE b.translator_id = _translator_id
      AND b.client_id = v_uid
      AND b.status IN ('confirmed','in_progress','completed')
  ) THEN
    v_allowed := true;
  END IF;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Not authorized to view contact details';
  END IF;

  RETURN QUERY
    SELECT t.phone, t.email, t.telegram_username
    FROM public.translators t WHERE t.id = _translator_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_translator_contact(uuid) TO authenticated;

-- 4) Storage: restrict deep-check report reads to the owning user (or admin)
DROP POLICY IF EXISTS "Authenticated users can view reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own deep check files" ON storage.objects;

-- Re-create owner-image policy WITHOUT the reports-folder bypass
CREATE POLICY "Users can view their own deep check uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'deep-checks'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Reports: only the deep_check owner or admins
CREATE POLICY "Owners and admins can view deep-check reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'deep-checks'
  AND (storage.foldername(name))[1] = 'reports'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.deep_checks dc
      WHERE dc.user_id = auth.uid()
        AND dc.id::text = split_part(split_part(name, 'reports/', 2), '_', 1)
    )
  )
);
