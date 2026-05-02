BEGIN;

ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.process_booking_payment(
  p_translator_id uuid,
  p_booking_date date,
  p_start_time time without time zone,
  p_end_time time without time zone,
  p_service_type text,
  p_specialization text,
  p_location text,
  p_description text,
  p_agreed_rate numeric,
  p_total_hours integer,
  p_translator_amount numeric,
  p_service_fee numeric,
  p_total_amount numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_current_balance DECIMAL(10,2);
  v_booking_id UUID;
  v_fee_rate NUMERIC(5,4) := 0.10;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_total_amount <= 0 OR p_translator_amount <= 0 OR p_service_fee < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;

  IF ROUND(p_total_amount, 2) <> ROUND(p_translator_amount + p_service_fee, 2) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Fee breakdown mismatch');
  END IF;

  IF p_translator_id IS NULL OR p_booking_date IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;

  INSERT INTO user_wallets (user_id, balance, held_balance)
  VALUES (v_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO v_current_balance
  FROM user_wallets
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL OR v_current_balance < p_total_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'current_balance', COALESCE(v_current_balance, 0));
  END IF;

  UPDATE user_wallets
  SET balance = balance - p_total_amount,
      held_balance = held_balance + p_total_amount,
      updated_at = NOW()
  WHERE user_id = v_user_id;

  INSERT INTO translator_bookings (
    translator_id, client_id, booking_date, start_time, end_time,
    service_type, specialization, location, description,
    agreed_rate, total_hours,
    translator_amount, service_fee, service_fee_rate, total_amount,
    status, confirmed_at
  )
  VALUES (
    p_translator_id, v_user_id, p_booking_date, p_start_time, p_end_time,
    p_service_type, NULLIF(p_specialization, ''), p_location, NULLIF(p_description, ''),
    p_agreed_rate, p_total_hours,
    p_translator_amount, p_service_fee, v_fee_rate, p_total_amount,
    'confirmed', NOW()
  )
  RETURNING id INTO v_booking_id;

  INSERT INTO wallet_transactions (
    booking_id, user_id, amount, transaction_type, status, description, reference_id, metadata
  ) VALUES (
    v_booking_id, v_user_id, -p_total_amount, 'booking_hold', 'held',
    'Tarjimon bron qilish', v_booking_id::text,
    jsonb_build_object(
      'translator_amount', p_translator_amount,
      'service_fee', p_service_fee,
      'service_fee_rate', v_fee_rate
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'new_balance', v_current_balance - p_total_amount,
    'amount_held', p_total_amount,
    'translator_amount', p_translator_amount,
    'service_fee', p_service_fee
  );
END;
$function$;

COMMIT;