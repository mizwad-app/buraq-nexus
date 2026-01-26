-- Fix wallet race condition: Create atomic booking payment function
-- This prevents double-spend attacks by using FOR UPDATE row locking

-- Add non-negative balance constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'positive_wallet_balance'
  ) THEN
    ALTER TABLE public.user_wallets 
    ADD CONSTRAINT positive_wallet_balance CHECK (balance >= 0);
  END IF;
END $$;

-- Create atomic booking payment function
CREATE OR REPLACE FUNCTION public.process_booking_payment(
  p_translator_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_service_type TEXT,
  p_specialization TEXT,
  p_location TEXT,
  p_description TEXT,
  p_agreed_rate DECIMAL,
  p_total_hours INTEGER,
  p_total_amount DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_balance DECIMAL(10,2);
  v_current_held DECIMAL(10,2);
  v_booking_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate input
  IF p_total_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;
  
  IF p_translator_id IS NULL OR p_booking_date IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Missing required fields');
  END IF;
  
  -- Create wallet if doesn't exist
  INSERT INTO user_wallets (user_id, balance, held_balance)
  VALUES (v_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Lock row and get current balance atomically
  SELECT balance, held_balance INTO v_current_balance, v_current_held
  FROM user_wallets
  WHERE user_id = v_user_id
  FOR UPDATE;
  
  -- Check sufficient balance
  IF v_current_balance IS NULL OR v_current_balance < p_total_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'current_balance', COALESCE(v_current_balance, 0));
  END IF;
  
  -- Update wallet atomically (deduct from balance, add to held)
  UPDATE user_wallets
  SET 
    balance = balance - p_total_amount,
    held_balance = held_balance + p_total_amount,
    updated_at = NOW()
  WHERE user_id = v_user_id;
  
  -- Create booking record
  INSERT INTO translator_bookings (
    translator_id,
    client_id,
    booking_date,
    start_time,
    end_time,
    service_type,
    specialization,
    location,
    description,
    agreed_rate,
    total_hours,
    total_amount,
    status,
    confirmed_at
  )
  VALUES (
    p_translator_id,
    v_user_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    p_service_type,
    NULLIF(p_specialization, ''),
    p_location,
    NULLIF(p_description, ''),
    p_agreed_rate,
    p_total_hours,
    p_total_amount,
    'confirmed',
    NOW()
  )
  RETURNING id INTO v_booking_id;
  
  -- Record wallet transaction
  INSERT INTO wallet_transactions (
    booking_id,
    user_id,
    amount,
    transaction_type,
    status,
    description
  ) VALUES (
    v_booking_id,
    v_user_id,
    -p_total_amount,
    'booking_payment',
    'held',
    'Booking payment held in escrow'
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'booking_id', v_booking_id,
    'new_balance', v_current_balance - p_total_amount,
    'amount_held', p_total_amount
  );
END;
$$;

-- Drop all existing wallet policies and recreate
DROP POLICY IF EXISTS "Users can manage own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Users can create own wallet" ON public.user_wallets;
DROP POLICY IF EXISTS "Block direct wallet updates" ON public.user_wallets;

-- Allow users to read their own wallet
CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow insert for wallet creation (handled by RPC function with ON CONFLICT)
CREATE POLICY "Users can create own wallet"
  ON public.user_wallets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Block direct updates (all updates must go through SECURITY DEFINER functions)
CREATE POLICY "Block direct wallet updates"
  ON public.user_wallets FOR UPDATE
  USING (false);