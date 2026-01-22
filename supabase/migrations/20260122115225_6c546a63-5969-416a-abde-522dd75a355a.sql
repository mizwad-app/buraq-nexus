-- Create halal_shops table for grocery stores
CREATE TABLE public.halal_shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  address TEXT,
  address_uz TEXT,
  address_ru TEXT,
  address_en TEXT,
  address_ar TEXT,
  address_chinese TEXT,
  city TEXT NOT NULL,
  city_uz TEXT,
  city_ru TEXT,
  city_en TEXT,
  city_ar TEXT,
  country TEXT NOT NULL DEFAULT 'China',
  phone TEXT,
  description TEXT,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  description_ar TEXT,
  image_url TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  rating NUMERIC,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.halal_shops ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view halal shops" 
  ON public.halal_shops 
  FOR SELECT 
  USING (true);

-- Insert sample data for Guangzhou shop
INSERT INTO public.halal_shops (
  name, name_uz, name_en, name_ru,
  address, address_uz, address_en, address_ru, address_chinese,
  city, city_uz, city_en, city_ru,
  phone, description, description_uz, description_en, description_ru,
  is_verified
) VALUES (
  'Al-Baraka Halal Shop',
  'Al-Baraka Halol Do''koni',
  'Al-Baraka Halal Shop',
  'Магазин Халяль Аль-Барака',
  'Guangzhou, Yuexiu District, Sanyuanli',
  'Guanchzhou, Yuexiu tumani, Sanyuanli',
  'Guangzhou, Yuexiu District, Sanyuanli',
  'Гуанчжоу, район Юэсю, Саньюаньли',
  '广州市越秀区三元里',
  'Guangzhou',
  'Guanchzhou',
  'Guangzhou',
  'Гуанчжоу',
  '+86 138 0000 1111',
  'Premium halal groceries and imported products',
  'Yuqori sifatli halol oziq-ovqat va import mahsulotlar',
  'Premium halal groceries and imported products',
  'Премиальные халяльные продукты и импортные товары',
  true
);

-- Insert sample data for Yiwu shop
INSERT INTO public.halal_shops (
  name, name_uz, name_en, name_ru,
  address, address_uz, address_en, address_ru, address_chinese,
  city, city_uz, city_en, city_ru,
  phone, description, description_uz, description_en, description_ru,
  is_verified
) VALUES (
  'Yiwu Central Halal Market',
  'Yiwu Markaziy Halol Bozori',
  'Yiwu Central Halal Market',
  'Центральный Халяль Рынок Иу',
  'Yiwu, Chouzhou North Road, near Binwang Market',
  'Yiwu, Chouzhou shimoliy ko''chasi, Binwang bozori yaqinida',
  'Yiwu, Chouzhou North Road, near Binwang Market',
  'Иу, Северная дорога Чжоучжоу, рядом с рынком Биньван',
  '义乌市稠州北路, 宾王市场附近',
  'Yiwu',
  'Yiwu',
  'Yiwu',
  'Иу',
  '+86 139 2222 3333',
  'Largest halal grocery market in Yiwu with fresh produce',
  'Yiwudagi eng katta halol oziq-ovqat bozori, yangi mahsulotlar bilan',
  'Largest halal grocery market in Yiwu with fresh produce',
  'Крупнейший халяльный продуктовый рынок в Иу со свежими продуктами',
  true
);