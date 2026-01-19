-- Add travel_tips column to wholesale_markets for storing metro, taxi, and distance info
ALTER TABLE public.wholesale_markets 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS address_uz TEXT,
ADD COLUMN IF NOT EXISTS address_ru TEXT,
ADD COLUMN IF NOT EXISTS address_en TEXT,
ADD COLUMN IF NOT EXISTS address_ar TEXT,
ADD COLUMN IF NOT EXISTS address_chinese TEXT,
ADD COLUMN IF NOT EXISTS travel_tips TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_uz TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_ru TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_en TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_ar TEXT,
ADD COLUMN IF NOT EXISTS working_hours TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS market_type TEXT DEFAULT 'wholesale';

-- Add travel_tips column to production_hubs
ALTER TABLE public.production_hubs 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS address_uz TEXT,
ADD COLUMN IF NOT EXISTS address_ru TEXT,
ADD COLUMN IF NOT EXISTS address_en TEXT,
ADD COLUMN IF NOT EXISTS address_ar TEXT,
ADD COLUMN IF NOT EXISTS address_chinese TEXT,
ADD COLUMN IF NOT EXISTS travel_tips TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_uz TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_ru TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_en TEXT,
ADD COLUMN IF NOT EXISTS travel_tips_ar TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;