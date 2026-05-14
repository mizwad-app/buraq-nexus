
CREATE TABLE IF NOT EXISTS public.cities (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ru TEXT,
  name_ar TEXT,
  name_zh TEXT,
  name_fr TEXT,
  province TEXT,
  country TEXT NOT NULL DEFAULT 'China',
  country_emoji TEXT DEFAULT '🇨🇳',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  population BIGINT,
  timezone TEXT DEFAULT 'Asia/Shanghai',
  phone_code TEXT,
  nearest_airport_code TEXT,
  nearest_airport_name_en TEXT,
  nearest_airport_name_uz TEXT,
  airport_distance_km INTEGER,
  airport_taxi_cost_yuan INTEGER,
  airport_taxi_duration_min INTEGER,
  factory_count_estimated INTEGER,
  main_products_uz TEXT,
  main_products_en TEXT,
  main_products_ru TEXT,
  main_products_ar TEXT,
  main_products_zh TEXT,
  main_products_fr TEXT,
  halal_food_note_uz TEXT,
  halal_food_note_en TEXT,
  halal_food_note_ru TEXT,
  halal_food_note_ar TEXT,
  halal_food_note_zh TEXT,
  halal_food_note_fr TEXT,
  fun_fact_uz TEXT,
  fun_fact_en TEXT,
  fun_fact_ru TEXT,
  fun_fact_ar TEXT,
  fun_fact_zh TEXT,
  fun_fact_fr TEXT,
  data_confidence TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_active ON public.cities(is_active);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cities_select_public" ON public.cities;
CREATE POLICY "cities_select_public" ON public.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "cities_admin_all" ON public.cities;
CREATE POLICY "cities_admin_all" ON public.cities FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_cities_updated_at ON public.cities;
CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.city_product_categories (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  is_top BOOLEAN DEFAULT FALSE,
  factory_count_estimated INTEGER,
  rank INTEGER,
  UNIQUE(city_id, category_slug)
);

CREATE INDEX IF NOT EXISTS idx_city_categories_slug ON public.city_product_categories(category_slug);

ALTER TABLE public.city_product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "city_categories_select" ON public.city_product_categories;
CREATE POLICY "city_categories_select" ON public.city_product_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "city_categories_admin_all" ON public.city_product_categories;
CREATE POLICY "city_categories_admin_all" ON public.city_product_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed Foshan
INSERT INTO public.cities (
  slug, name_uz, name_en, name_ru, name_zh, province, country, country_emoji,
  population, timezone, phone_code,
  nearest_airport_code, nearest_airport_name_en, nearest_airport_name_uz,
  airport_distance_km, airport_taxi_cost_yuan, airport_taxi_duration_min,
  factory_count_estimated,
  main_products_uz, main_products_en, main_products_ru,
  halal_food_note_uz, halal_food_note_en, halal_food_note_ru,
  fun_fact_uz, fun_fact_en, fun_fact_ru,
  data_confidence, is_active
)
VALUES (
  'foshan', 'Foshan', 'Foshan', 'Фошань', '佛山', 'Guangdong', 'China', '🇨🇳',
  9600000, 'Asia/Shanghai', '+86 757',
  'CAN', 'Guangzhou Baiyun International', 'Guangzhou Baiyun xalqaro aeroporti',
  60, 200, 90,
  5000,
  'Mebel (zamonaviy, klassik), chinni, qurilish materiallari',
  'Furniture (modern, classic), ceramics, construction materials',
  'Мебель (современная, классическая), керамика, стройматериалы',
  'Lecong va Louvre bozori atrofida arab/turk restoranlar bor. Shahar bo''ylab Dungan Lanzhou noodle taomxonalari ko''p.',
  'Arab/Turkish restaurants near Lecong and Louvre markets. Dungan Lanzhou noodle shops throughout the city.',
  'Арабские/турецкие рестораны возле рынков Lecong и Louvre. Дунганские Lanzhou-лапшичные по всему городу.',
  'Foshan — kungfu ustasi Ip Man''ning (Bruce Lee''ning ustozi) ona shahri',
  'Foshan is the birthplace of kung fu master Ip Man (Bruce Lee''s teacher)',
  'Фошань — родина мастера кунг-фу Ип Мана (учителя Брюса Ли)',
  'green', TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  factory_count_estimated = EXCLUDED.factory_count_estimated,
  data_confidence = EXCLUDED.data_confidence,
  is_active = EXCLUDED.is_active;

INSERT INTO public.city_product_categories (city_id, category_slug, is_top, factory_count_estimated, rank)
SELECT id, 'furniture', TRUE, 5000, 1 FROM public.cities WHERE slug = 'foshan'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, factory_count_estimated = 5000, rank = 1;

INSERT INTO public.cities (slug, name_uz, name_en, name_zh, country, country_emoji, data_confidence, is_active)
VALUES
  ('guangzhou',  'Guangzhou',  'Guangzhou',  '广州', 'China', '🇨🇳', 'pending', FALSE),
  ('shenzhen',   'Shenzhen',   'Shenzhen',   '深圳', 'China', '🇨🇳', 'pending', FALSE),
  ('yiwu',       'Yiwu',       'Yiwu',       '义乌', 'China', '🇨🇳', 'pending', FALSE),
  ('shanghai',   'Shanghai',   'Shanghai',   '上海', 'China', '🇨🇳', 'pending', FALSE),
  ('hangzhou',   'Hangzhou',   'Hangzhou',   '杭州', 'China', '🇨🇳', 'pending', FALSE),
  ('dongguan',   'Dongguan',   'Dongguan',   '东莞', 'China', '🇨🇳', 'pending', FALSE),
  ('zhongshan',  'Zhongshan',  'Zhongshan',  '中山', 'China', '🇨🇳', 'pending', FALSE),
  ('quanzhou',   'Quanzhou',   'Quanzhou',   '泉州', 'China', '🇨🇳', 'pending', FALSE),
  ('hong-kong',  'Gonkong',    'Hong Kong',  '香港', 'China', '🇭🇰', 'pending', FALSE)
ON CONFLICT (slug) DO NOTHING;
