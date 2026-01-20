-- ===========================================
-- FIX 1: Translator Contact Information Exposure
-- Add RLS to restrict email/phone to authenticated users only
-- ===========================================

-- Drop existing overly permissive policy if exists
DROP POLICY IF EXISTS "Translators are viewable by everyone" ON public.translators;

-- Create more restrictive policies
-- Allow anyone to view basic translator info (without sensitive contact info)
-- We'll handle this by creating a secure view instead

-- Create a public view that hides sensitive contact information
CREATE OR REPLACE VIEW public.translators_public
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
  user_id
  -- Excludes: email, phone
FROM public.translators;

-- Base table: deny direct SELECT access to prevent contact info exposure
CREATE POLICY "No direct translator access - use view"
ON public.translators FOR SELECT
USING (false);

-- Allow authenticated users to see full contact info (for contacting translators)
CREATE POLICY "Authenticated users can view translator contact info"
ON public.translators FOR SELECT
TO authenticated
USING (true);

-- ===========================================
-- FIX 2: Points Transaction Manipulation
-- Remove user INSERT policy and create secure server functions
-- ===========================================

-- Drop the insecure INSERT policy
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.points_transactions;

-- Add a constraint to prevent negative total_points
ALTER TABLE public.user_points 
DROP CONSTRAINT IF EXISTS non_negative_points;

ALTER TABLE public.user_points 
ADD CONSTRAINT non_negative_points CHECK (total_points >= 0);

-- ===========================================
-- FIX 3: Create atomic functions for points operations
-- ===========================================

-- Function to add cargo points atomically
CREATE OR REPLACE FUNCTION public.add_cargo_points(
  p_tracking_id UUID,
  p_points INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_tracking_number TEXT;
BEGIN
  -- Get user from session
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Verify tracking exists and belongs to user
  SELECT tracking_number INTO v_tracking_number
  FROM cargo_trackings
  WHERE id = p_tracking_id AND user_id = v_user_id;
  
  IF v_tracking_number IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tracking not found');
  END IF;
  
  -- Validate points is positive and within reasonable range
  IF p_points <= 0 OR p_points > 10000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid points amount');
  END IF;
  
  -- Update user points atomically
  UPDATE user_points 
  SET 
    total_points = total_points + p_points,
    lifetime_points = lifetime_points + p_points,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Create transaction record
  INSERT INTO points_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (v_user_id, p_points, 'earned', 'Cargo tracking: ' || v_tracking_number, p_tracking_id);
  
  RETURN jsonb_build_object('success', true, 'points_added', p_points);
END;
$$;

-- Function to redeem gift atomically
CREATE OR REPLACE FUNCTION public.redeem_gift(
  p_gift_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_points INTEGER;
  v_points_required INTEGER;
  v_gift_name TEXT;
  v_is_active BOOLEAN;
BEGIN
  -- Get user from session
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Verify gift exists and is active
  SELECT points_required, name, is_active 
  INTO v_points_required, v_gift_name, v_is_active
  FROM gifts
  WHERE id = p_gift_id;
  
  IF v_gift_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift not found');
  END IF;
  
  IF NOT v_is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift is not available');
  END IF;
  
  -- Lock the user_points row and check balance
  SELECT total_points INTO v_current_points
  FROM user_points
  WHERE user_id = v_user_id
  FOR UPDATE;
  
  IF v_current_points IS NULL OR v_current_points < v_points_required THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points atomically
  UPDATE user_points 
  SET 
    total_points = total_points - v_points_required,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Create redemption record
  INSERT INTO gift_redemptions (user_id, gift_id, points_spent)
  VALUES (v_user_id, p_gift_id, v_points_required);
  
  -- Create transaction record
  INSERT INTO points_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (v_user_id, -v_points_required, 'redeemed', 'Gift exchange: ' || v_gift_name, p_gift_id);
  
  RETURN jsonb_build_object('success', true, 'gift_name', v_gift_name, 'points_spent', v_points_required);
END;
$$;

-- Function to redeem points for deep check
CREATE OR REPLACE FUNCTION public.redeem_deep_check_points(
  p_deep_check_id UUID,
  p_points INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_points INTEGER;
  v_check_exists BOOLEAN;
  v_product_name TEXT;
BEGIN
  -- Get user from session
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Validate points amount
  IF p_points <= 0 OR p_points > 10000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid points amount');
  END IF;
  
  -- Verify deep check exists and belongs to user
  SELECT product_name INTO v_product_name
  FROM deep_checks
  WHERE id = p_deep_check_id AND user_id = v_user_id;
  
  IF v_product_name IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Deep check not found');
  END IF;
  
  -- Lock the user_points row and check balance
  SELECT total_points INTO v_current_points
  FROM user_points
  WHERE user_id = v_user_id
  FOR UPDATE;
  
  IF v_current_points IS NULL OR v_current_points < p_points THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points atomically
  UPDATE user_points 
  SET 
    total_points = total_points - p_points,
    updated_at = now()
  WHERE user_id = v_user_id;
  
  -- Create transaction record
  INSERT INTO points_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (v_user_id, -p_points, 'redeemed', 'Deep check: ' || v_product_name, p_deep_check_id);
  
  RETURN jsonb_build_object('success', true, 'points_spent', p_points);
END;
$$;