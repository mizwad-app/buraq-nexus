-- Create translators table for marketplace
CREATE TABLE public.translators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL, -- Optional: if translator registers as a user
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  phone TEXT,
  email TEXT,
  city TEXT NOT NULL,
  city_uz TEXT,
  city_ru TEXT,
  city_en TEXT,
  city_ar TEXT,
  hsk_level INTEGER CHECK (hsk_level >= 1 AND hsk_level <= 6),
  specializations TEXT[] DEFAULT '{}',
  bio TEXT,
  bio_uz TEXT,
  bio_ru TEXT,
  bio_en TEXT,
  bio_ar TEXT,
  price_per_day NUMERIC,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  avatar_url TEXT,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create translator reviews table
CREATE TABLE public.translator_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  translator_id UUID NOT NULL REFERENCES public.translators(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create travel checklist items table
CREATE TABLE public.travel_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false, -- true for predefined items
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service requests table (for cargo inspection, concierge services)
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL, -- 'cargo_inspection', 'vpn_setup', 'flight_booking', 'train_booking', 'concierge'
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  contact_method TEXT DEFAULT 'telegram', -- 'telegram', 'whatsapp'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add detailed rating columns to restaurants table
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS rating_service NUMERIC,
ADD COLUMN IF NOT EXISTS rating_taste NUMERIC,
ADD COLUMN IF NOT EXISTS rating_cleanliness NUMERIC,
ADD COLUMN IF NOT EXISTS has_prayer_room BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_currency_exchange_nearby BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nearest_metro TEXT,
ADD COLUMN IF NOT EXISTS nearest_metro_uz TEXT,
ADD COLUMN IF NOT EXISTS nearest_metro_ru TEXT,
ADD COLUMN IF NOT EXISTS nearest_metro_en TEXT,
ADD COLUMN IF NOT EXISTS nearest_metro_ar TEXT;

-- Enable RLS on new tables
ALTER TABLE public.translators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translator_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Translators are viewable by everyone
CREATE POLICY "Translators are viewable by everyone" 
ON public.translators 
FOR SELECT 
USING (true);

-- Translator reviews are viewable by everyone
CREATE POLICY "Translator reviews are viewable by everyone" 
ON public.translator_reviews 
FOR SELECT 
USING (true);

-- Users can insert their own reviews
CREATE POLICY "Users can insert their own translator reviews" 
ON public.translator_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Travel checklist: users can manage their own items
CREATE POLICY "Users can view their own checklist items" 
ON public.travel_checklist_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklist items" 
ON public.travel_checklist_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items" 
ON public.travel_checklist_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items" 
ON public.travel_checklist_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Service requests: users can manage their own requests
CREATE POLICY "Users can view their own service requests" 
ON public.service_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all service requests
CREATE POLICY "Admins can view all service requests" 
ON public.service_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update any service request" 
ON public.service_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage translators
CREATE POLICY "Admins can insert translators" 
ON public.translators 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update translators" 
ON public.translators 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete translators" 
ON public.translators 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on translators
CREATE TRIGGER update_translators_updated_at
BEFORE UPDATE ON public.translators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on service_requests
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();