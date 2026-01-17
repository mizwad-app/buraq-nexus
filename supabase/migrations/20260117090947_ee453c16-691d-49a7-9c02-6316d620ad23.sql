-- Create restaurants table for halal food
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  city TEXT NOT NULL,
  city_uz TEXT,
  city_ru TEXT,
  city_en TEXT,
  city_ar TEXT,
  country TEXT NOT NULL DEFAULT 'China',
  cuisine_type TEXT NOT NULL,
  cuisine_type_uz TEXT,
  cuisine_type_ru TEXT,
  cuisine_type_en TEXT,
  cuisine_type_ar TEXT,
  address TEXT,
  address_uz TEXT,
  address_ru TEXT,
  address_en TEXT,
  address_ar TEXT,
  description TEXT,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  description_ar TEXT,
  rating NUMERIC,
  is_halal_certified BOOLEAN DEFAULT true,
  contact_info TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_malls table
CREATE TABLE public.shopping_malls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  city TEXT NOT NULL,
  city_uz TEXT,
  city_ru TEXT,
  city_en TEXT,
  city_ar TEXT,
  country TEXT NOT NULL DEFAULT 'China',
  address TEXT,
  address_uz TEXT,
  address_ru TEXT,
  address_en TEXT,
  address_ar TEXT,
  description TEXT,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  description_ar TEXT,
  has_halal_food BOOLEAN DEFAULT false,
  rating NUMERIC,
  contact_info TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mosques table
CREATE TABLE public.mosques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  city TEXT NOT NULL,
  city_uz TEXT,
  city_ru TEXT,
  city_en TEXT,
  city_ar TEXT,
  country TEXT NOT NULL DEFAULT 'China',
  address TEXT,
  address_uz TEXT,
  address_ru TEXT,
  address_en TEXT,
  address_ar TEXT,
  description TEXT,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  description_ar TEXT,
  has_friday_prayer BOOLEAN DEFAULT true,
  has_womens_section BOOLEAN DEFAULT false,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_malls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosques ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Shopping malls are viewable by everyone" ON public.shopping_malls FOR SELECT USING (true);
CREATE POLICY "Mosques are viewable by everyone" ON public.mosques FOR SELECT USING (true);