-- =============================================
-- TRANSLATOR MARKETPLACE - EXTENDED SCHEMA
-- (Fixes: translator_reviews already exists)
-- =============================================

-- 1. TRANSLATOR SPECIALIZATIONS ENUM (if not exists)
DO $$ BEGIN
  CREATE TYPE public.translator_specialization AS ENUM (
    'medical', 'legal', 'it', 'construction', 'manufacturing', 
    'electronics', 'furniture', 'textile', 'automotive', 'trade', 
    'tourism', 'education', 'finance', 'general'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. BOOKING STATUS ENUM
DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. PAYMENT STATUS ENUM
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM (
    'pending', 'held', 'released', 'refunded', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. EXTEND EXISTING TRANSLATORS TABLE with new fields
ALTER TABLE public.translators 
  ADD COLUMN IF NOT EXISTS intro_video_url TEXT,
  ADD COLUMN IF NOT EXISTS self_declared_hsk INTEGER CHECK (self_declared_hsk >= 1 AND self_declared_hsk <= 6),
  ADD COLUMN IF NOT EXISTS buraq_verified_hsk INTEGER CHECK (buraq_verified_hsk >= 1 AND buraq_verified_hsk <= 6),
  ADD COLUMN IF NOT EXISTS buraq_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_documents TEXT[],
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_bookings INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 5. TRANSLATOR AVAILABILITY (Calendar)
CREATE TABLE IF NOT EXISTS public.translator_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translator_id UUID REFERENCES public.translators(id) ON DELETE CASCADE NOT NULL,
  
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  specific_date DATE,
  
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  is_recurring BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 6. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.translator_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  translator_id UUID REFERENCES public.translators(id) ON DELETE CASCADE NOT NULL,
  client_id UUID NOT NULL,
  
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  service_type TEXT NOT NULL,
  specialization TEXT,
  description TEXT,
  location TEXT,
  
  agreed_rate DECIMAL(10,2) NOT NULL,
  total_hours DECIMAL(4,2),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  status booking_status DEFAULT 'pending',
  
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID,
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ESCROW/WALLET TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  booking_id UUID REFERENCES public.translator_bookings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  transaction_type TEXT NOT NULL,
  
  status payment_status DEFAULT 'pending',
  
  description TEXT,
  reference_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- 8. USER WALLETS
CREATE TABLE IF NOT EXISTS public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  balance DECIMAL(12,2) DEFAULT 0,
  held_balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CHAT CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  booking_id UUID REFERENCES public.translator_bookings(id) ON DELETE SET NULL,
  translator_id UUID REFERENCES public.translators(id) ON DELETE CASCADE NOT NULL,
  client_id UUID NOT NULL,
  
  last_message_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EXTEND EXISTING translator_reviews with matrix ratings
ALTER TABLE public.translator_reviews
  ADD COLUMN IF NOT EXISTS booking_id UUID,
  ADD COLUMN IF NOT EXISTS language_proficiency INTEGER CHECK (language_proficiency >= 1 AND language_proficiency <= 5),
  ADD COLUMN IF NOT EXISTS work_expertise INTEGER CHECK (work_expertise >= 1 AND work_expertise <= 5),
  ADD COLUMN IF NOT EXISTS reliability INTEGER CHECK (reliability >= 1 AND reliability <= 5),
  ADD COLUMN IF NOT EXISTS punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  ADD COLUMN IF NOT EXISTS overall_rating DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS translator_response TEXT,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- 12. BOOKING REMINDERS
CREATE TABLE IF NOT EXISTS public.booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.translator_bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  
  reminder_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  is_sent BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_translator_availability_translator ON public.translator_availability(translator_id);
CREATE INDEX IF NOT EXISTS idx_translator_bookings_translator ON public.translator_bookings(translator_id);
CREATE INDEX IF NOT EXISTS idx_translator_bookings_client ON public.translator_bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_translator_bookings_date ON public.translator_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_translator_bookings_status ON public.translator_bookings(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_translators_city ON public.translators(city);
CREATE INDEX IF NOT EXISTS idx_translators_verified ON public.translators(is_verified);
CREATE INDEX IF NOT EXISTS idx_translators_rating ON public.translators(rating DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.translator_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translator_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;

-- Availability: Public read
CREATE POLICY "Availability is publicly readable"
  ON public.translator_availability FOR SELECT
  USING (true);

CREATE POLICY "Translators manage own availability"
  ON public.translator_availability FOR ALL
  TO authenticated
  USING (translator_id IN (SELECT id FROM public.translators WHERE user_id = auth.uid()))
  WITH CHECK (translator_id IN (SELECT id FROM public.translators WHERE user_id = auth.uid()));

-- Bookings: Parties can view their bookings
CREATE POLICY "Users can view own bookings"
  ON public.translator_bookings FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    translator_id IN (SELECT id FROM public.translators WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can create bookings"
  ON public.translator_bookings FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Parties can update bookings"
  ON public.translator_bookings FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    translator_id IN (SELECT id FROM public.translators WHERE user_id = auth.uid())
  );

-- Wallets: Users see only their own
CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own wallet"
  ON public.user_wallets FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Transactions: Users see only their own
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Chat Conversations: Parties only
CREATE POLICY "Chat participants can view conversations"
  ON public.chat_conversations FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    translator_id IN (SELECT id FROM public.translators WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations"
  ON public.chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Chat Messages: Conversation participants only
CREATE POLICY "Participants can view messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations 
      WHERE client_id = auth.uid() OR
      translator_id IN (SELECT id FROM public.translators WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.chat_conversations 
      WHERE client_id = auth.uid() OR
      translator_id IN (SELECT id FROM public.translators WHERE user_id = auth.uid())
    )
  );

-- Reminders: Users see own reminders
CREATE POLICY "Users can view own reminders"
  ON public.booking_reminders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to calculate overall rating before insert
CREATE OR REPLACE FUNCTION public.calculate_translator_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.language_proficiency IS NOT NULL AND NEW.work_expertise IS NOT NULL 
     AND NEW.reliability IS NOT NULL AND NEW.punctuality IS NOT NULL THEN
    NEW.overall_rating := (
      COALESCE(NEW.language_proficiency, 0) +
      COALESCE(NEW.work_expertise, 0) +
      COALESCE(NEW.reliability, 0) +
      COALESCE(NEW.punctuality, 0)
    ) / 4.0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop if exists and recreate trigger
DROP TRIGGER IF EXISTS calculate_overall_rating_trigger ON public.translator_reviews;
CREATE TRIGGER calculate_overall_rating_trigger
  BEFORE INSERT OR UPDATE ON public.translator_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_translator_overall_rating();

-- Function to update translator stats after review
CREATE OR REPLACE FUNCTION public.update_translator_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.translators
  SET 
    rating = (
      SELECT COALESCE(AVG(
        CASE 
          WHEN overall_rating IS NOT NULL THEN overall_rating 
          ELSE rating::decimal 
        END
      ), 0)
      FROM public.translator_reviews
      WHERE translator_id = NEW.translator_id
    ),
    total_reviews = (
      SELECT COUNT(*) FROM public.translator_reviews WHERE translator_id = NEW.translator_id
    ),
    updated_at = NOW()
  WHERE id = NEW.translator_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_translator_rating_trigger ON public.translator_reviews;
CREATE TRIGGER update_translator_rating_trigger
  AFTER INSERT OR UPDATE ON public.translator_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_translator_avg_rating();

-- Function to update booking stats
CREATE OR REPLACE FUNCTION public.update_translator_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.translators
  SET 
    total_bookings = (
      SELECT COUNT(*) FROM public.translator_bookings WHERE translator_id = NEW.translator_id
    ),
    completed_bookings = (
      SELECT COUNT(*) FROM public.translator_bookings WHERE translator_id = NEW.translator_id AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = NEW.translator_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_booking_stats_trigger ON public.translator_bookings;
CREATE TRIGGER update_booking_stats_trigger
  AFTER INSERT OR UPDATE ON public.translator_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_translator_booking_stats();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;