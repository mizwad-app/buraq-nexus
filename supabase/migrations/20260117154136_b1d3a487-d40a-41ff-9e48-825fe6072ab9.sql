-- Add halal_status column to restaurants
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS halal_status text DEFAULT 'certified';

-- Add multilingual descriptions for halal status
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS halal_status_note text,
ADD COLUMN IF NOT EXISTS halal_status_note_uz text,
ADD COLUMN IF NOT EXISTS halal_status_note_ru text,
ADD COLUMN IF NOT EXISTS halal_status_note_en text,
ADD COLUMN IF NOT EXISTS halal_status_note_ar text,
ADD COLUMN IF NOT EXISTS serves_alcohol boolean DEFAULT false;

-- Update existing restaurants to have certified status
UPDATE public.restaurants SET halal_status = 'certified' WHERE is_halal_certified = true;

-- Insert test restaurants for the rating system
INSERT INTO public.restaurants (
  name, name_en, name_uz, name_ru, name_ar,
  city, city_en, city_uz, city_ru, city_ar,
  cuisine_type, cuisine_type_en, cuisine_type_uz, cuisine_type_ru, cuisine_type_ar,
  description, description_en, description_uz, description_ru, description_ar,
  halal_status, halal_status_note_en, halal_status_note_uz, halal_status_note_ru, halal_status_note_ar,
  is_halal_certified, serves_alcohol, rating, country
) VALUES 
(
  'Buraq Steakhouse', 'Buraq Steakhouse', 'Buraq Steakhouse', 'Buraq Steakhouse', 'مطعم البراق للستيك',
  'Guangzhou', 'Guangzhou', 'Guanchjou', 'Гуанчжоу', 'قوانغتشو',
  'Steakhouse', 'Steakhouse', 'Steyk uyi', 'Стейкхаус', 'مطعم ستيك',
  '100% Halal certified restaurant with premium beef. No alcohol served.',
  '100% Halal certified restaurant with premium beef. No alcohol served.',
  '100% Halol sertifikatlangan restoran. Alkogol yo''q.',
  '100% Халяль сертифицированный ресторан с премиальной говядиной. Без алкоголя.',
  'مطعم حلال 100% معتمد مع لحم بقري فاخر. لا يقدم الكحول.',
  'certified',
  '100% Halal certified. No alcohol on premises.',
  '100% Halol sertifikati. Alkogol yo''q.',
  '100% Халяль сертификат. Без алкоголя.',
  'شهادة حلال 100%. لا يوجد كحول.',
  true, false, 4.8, 'China'
),
(
  'Silk Road Bistro', 'Silk Road Bistro', 'Ipak Yo''li Bistro', 'Бистро Шёлковый Путь', 'بيسترو طريق الحرير',
  'Guangzhou', 'Guangzhou', 'Guanchjou', 'Гуанчжоу', 'قوانغتشو',
  'Central Asian', 'Central Asian', 'O''rta Osiyo', 'Центральноазиатская', 'آسيا الوسطى',
  'Halal meat available but venue serves alcohol. Mixed dining environment.',
  'Halal meat available but venue serves alcohol. Mixed dining environment.',
  'Halol go''sht mavjud, lekin alkogol ham sotiladi.',
  'Халяльное мясо есть, но в заведении подают алкоголь.',
  'اللحم الحلال متوفر لكن المكان يقدم الكحول.',
  'doubtful',
  'Halal meat served, but alcohol is available on premises.',
  'Halol go''sht bor, lekin alkogol ham mavjud.',
  'Халяльное мясо, но алкоголь продаётся.',
  'يقدم لحم حلال لكن الكحول متوفر.',
  false, true, 4.2, 'China'
),
(
  'Canton Fusion', 'Canton Fusion', 'Kanton Fusion', 'Кантон Фьюжн', 'كانتون فيوجن',
  'Guangzhou', 'Guangzhou', 'Guanchjou', 'Гуанчжоу', 'قوانغتشو',
  'Fine Dining', 'Fine Dining', 'Premium restoran', 'Изысканная кухня', 'مطعم فاخر',
  'High-end seafood and meat restaurant. Serves alcohol and uses non-halal ingredients.',
  'High-end seafood and meat restaurant. Serves alcohol and uses non-halal ingredients.',
  'Yuqori darajadagi dengiz mahsulotlari restorani. Alkogol va halol bo''lmagan ingredientlar ishlatiladi.',
  'Ресторан высокой кухни. Подают алкоголь и используют нехаляльные ингредиенты.',
  'مطعم راقي للمأكولات البحرية. يقدم الكحول ويستخدم مكونات غير حلال.',
  'not_halal',
  'Warning: Serves alcohol and uses non-halal ingredients.',
  'Ogohlantirish: Alkogol va halol bo''lmagan ingredientlar.',
  'Внимание: Алкоголь и нехаляльные ингредиенты.',
  'تحذير: يقدم الكحول ويستخدم مكونات غير حلال.',
  false, true, 4.5, 'China'
);