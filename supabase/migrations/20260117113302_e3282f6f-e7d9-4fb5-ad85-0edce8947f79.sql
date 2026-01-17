-- Create parks table with multilingual support
CREATE TABLE public.parks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  description TEXT,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  description_ar TEXT,
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
  image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  park_type TEXT DEFAULT 'park',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Parks are viewable by everyone" 
ON public.parks 
FOR SELECT 
USING (true);