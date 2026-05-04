-- Extend profiles table with onboarding fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS travel_purpose TEXT 
    CHECK (travel_purpose IN ('business', 'tourism', 'both')),
  ADD COLUMN IF NOT EXISTS visit_frequency TEXT 
    CHECK (visit_frequency IN ('first_time', '1_per_year', '2_3_per_year', '4_6_per_year', '6_plus_per_year')),
  ADD COLUMN IF NOT EXISTS business_industries TEXT[],
  ADD COLUMN IF NOT EXISTS tourism_interests TEXT[],
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS country_name TEXT,
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_skipped BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_profiles_travel_purpose ON profiles(travel_purpose);
CREATE INDEX IF NOT EXISTS idx_profiles_industries ON profiles USING GIN(business_industries);

-- Business industries reference
CREATE TABLE IF NOT EXISTS public.business_industries_ref (
  code TEXT PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  name_zh TEXT,
  icon_emoji TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO public.business_industries_ref (code, name_uz, name_ru, name_en, name_ar, name_zh, icon_emoji, display_order) VALUES
  ('furniture', 'Mebel', 'Мебель', 'Furniture', 'الأثاث', '家具', '🪑', 1),
  ('ceramics', 'Keramika', 'Керамика', 'Ceramics', 'السيراميك', '陶瓷', '🏺', 2),
  ('manufacturing_equipment', 'Ishlab chiqarish uskunalari', 'Производственное оборудование', 'Manufacturing Equipment', 'معدات التصنيع', '生产设备', '⚙️', 3),
  ('textile', 'Tekstil va kiyim', 'Текстиль и одежда', 'Textile & Apparel', 'النسيج والملابس', '纺织和服装', '🧵', 4),
  ('electronics', 'Elektronika', 'Электроника', 'Electronics', 'الإلكترونيات', '电子产品', '📱', 5),
  ('livestock', 'Chorva mahsulotlari', 'Животноводческая продукция', 'Livestock Products', 'منتجات الثروة الحيوانية', '畜牧产品', '🐄', 6),
  ('food', 'Oziq-ovqat', 'Продукты питания', 'Food Products', 'المنتجات الغذائية', '食品', '🍱', 7),
  ('construction', 'Qurilish materiallari', 'Строительные материалы', 'Construction Materials', 'مواد البناء', '建筑材料', '🧱', 8),
  ('auto_parts', 'Avtomobil ehtiyot qismlari', 'Автозапчасти', 'Auto Parts', 'قطع غيار السيارات', '汽车配件', '🚗', 9),
  ('beauty', 'Goʻzallik va kosmetika', 'Красота и косметика', 'Beauty & Cosmetics', 'الجمال ومستحضرات التجميل', '美容和化妆品', '💄', 10),
  ('toys', 'Oʻyinchoqlar', 'Игрушки', 'Toys', 'الألعاب', '玩具', '🧸', 11),
  ('jewelry', 'Zargarlik', 'Ювелирные изделия', 'Jewelry', 'المجوهرات', '珠宝', '💍', 12),
  ('stationery', 'Qogʻoz mahsulotlari', 'Канцтовары', 'Stationery', 'القرطаsия', '文具', '📝', 13),
  ('home_appliances', 'Maishiy texnika', 'Бытовая техника', 'Home Appliances', 'الأجهزة المنزلية', '家用电器', '🏠', 14),
  ('packaging', 'Qadoqlash materiallari', 'Упаковочные материалы', 'Packaging', 'مواد التعبئة', '包装', '📦', 15),
  ('other', 'Boshqa', 'Другое', 'Other', 'أخرى', '其他', '💼', 99)
ON CONFLICT (code) DO UPDATE SET
  name_uz = EXCLUDED.name_uz, name_ru = EXCLUDED.name_ru, name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar, name_zh = EXCLUDED.name_zh,
  icon_emoji = EXCLUDED.icon_emoji, display_order = EXCLUDED.display_order;

ALTER TABLE public.business_industries_ref ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read industries" ON public.business_industries_ref;
CREATE POLICY "Public can read industries" ON public.business_industries_ref FOR SELECT USING (true);

-- Tourism interests reference
CREATE TABLE IF NOT EXISTS public.tourism_interests_ref (
  code TEXT PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT, name_en TEXT, name_ar TEXT, name_zh TEXT,
  icon_emoji TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO public.tourism_interests_ref (code, name_uz, name_ru, name_en, name_ar, name_zh, icon_emoji, display_order) VALUES
  ('historical', 'Tarixiy joylar', 'Исторические места', 'Historical Sites', 'المواقع التاريخية', '历史遗迹', '🏛️', 1),
  ('nature', 'Tabiat va peyzaj', 'Природа и пейзажи', 'Nature & Scenery', 'الطبيعة والمناظر', '自然风光', '🌄', 2),
  ('culture', 'Madaniyat va sanʼat', 'Культура и искусство', 'Culture & Art', 'الثقافة والفن', '文化艺术', '🎭', 3),
  ('religious', 'Ziyorat (masjidlar)', 'Религиозный туризм', 'Religious (Mosques)', 'السياحة الدينية', '宗教旅游', '🕌', 4),
  ('shopping', 'Xarid', 'Шоппинг', 'Shopping', 'التسوق', '购物', '🛍️', 5),
  ('food', 'Halol oshxona', 'Халяльная кухня', 'Halal Cuisine', 'المطبخ الحلال', '清真美食', '🍜', 6),
  ('family', 'Oilaviy sayohat', 'Семейный отдых', 'Family Travel', 'السفر العائلي', '家庭旅游', '👨‍👩‍👧', 7),
  ('adventure', 'Ekstrim sayohat', 'Экстремальный туризм', 'Adventure', 'السياحة المغامرة', '探险', '🏔️', 8)
ON CONFLICT (code) DO UPDATE SET
  name_uz = EXCLUDED.name_uz, name_ru = EXCLUDED.name_ru, name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar, name_zh = EXCLUDED.name_zh,
  icon_emoji = EXCLUDED.icon_emoji, display_order = EXCLUDED.display_order;

ALTER TABLE public.tourism_interests_ref ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read tourism interests" ON public.tourism_interests_ref;
CREATE POLICY "Public can read tourism interests" ON public.tourism_interests_ref FOR SELECT USING (true);

-- Countries reference
CREATE TABLE IF NOT EXISTS public.countries_ref (
  code TEXT PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT, name_en TEXT, name_ar TEXT, name_zh TEXT,
  flag_emoji TEXT,
  phone_code TEXT,
  is_priority BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 100
);

INSERT INTO public.countries_ref (code, name_uz, name_ru, name_en, name_ar, name_zh, flag_emoji, phone_code, is_priority, display_order) VALUES
  ('UZ', 'Oʻzbekiston', 'Узбекистан', 'Uzbekistan', 'أوزبكستان', '乌兹别克斯坦', '🇺🇿', '+998', true, 1),
  ('KZ', 'Qozogʻiston', 'Казахстан', 'Kazakhstan', 'كازاخستان', '哈萨克斯坦', '🇰🇿', '+7', true, 2),
  ('KG', 'Qirgʻiziston', 'Кыргызстан', 'Kyrgyzstan', 'قيرغيزستان', '吉尔吉斯斯坦', '🇰🇬', '+996', true, 3),
  ('TJ', 'Tojikiston', 'Таджикистан', 'Tajikistan', 'طاجيكستان', '塔吉克斯坦', '🇹🇯', '+992', true, 4),
  ('TM', 'Turkmaniston', 'Туркменистан', 'Turkmenistan', 'تركمانستان', '土库曼斯坦', '🇹🇲', '+993', true, 5),
  ('AF', 'Afgʻoniston', 'Афганистан', 'Afghanistan', 'أفغانستان', '阿富汗', '🇦🇫', '+93', true, 6),
  ('TR', 'Turkiya', 'Турция', 'Türkiye', 'تركيا', '土耳其', '🇹🇷', '+90', true, 7),
  ('AZ', 'Ozarbayjon', 'Азербайджан', 'Azerbaijan', 'أذربيجان', '阿塞拜疆', '🇦🇿', '+994', true, 8),
  ('PK', 'Pokiston', 'Пакистан', 'Pakistan', 'باكستان', '巴基斯坦', '🇵🇰', '+92', true, 9),
  ('SA', 'Saudiya Arabistoni', 'Саудовская Аравия', 'Saudi Arabia', 'السعودية', '沙特阿拉伯', '🇸🇦', '+966', true, 10),
  ('AE', 'BAA', 'ОАЭ', 'UAE', 'الإمارات', '阿联酋', '🇦🇪', '+971', true, 11),
  ('IR', 'Eron', 'Иран', 'Iran', 'إيران', '伊朗', '🇮🇷', '+98', true, 12),
  ('RU', 'Rossiya', 'Россия', 'Russia', 'روسيا', '俄罗斯', '🇷🇺', '+7', true, 13),
  ('CN', 'Xitoy', 'Китай', 'China', 'الصين', '中国', '🇨🇳', '+86', false, 14)
ON CONFLICT (code) DO UPDATE SET
  name_uz = EXCLUDED.name_uz, name_ru = EXCLUDED.name_ru,
  flag_emoji = EXCLUDED.flag_emoji,
  is_priority = EXCLUDED.is_priority, display_order = EXCLUDED.display_order;

INSERT INTO public.countries_ref (code, name_uz, name_en, flag_emoji, phone_code) VALUES
  ('US', 'AQSh', 'United States', '🇺🇸', '+1'),
  ('GB', 'Buyuk Britaniya', 'United Kingdom', '🇬🇧', '+44'),
  ('DE', 'Germaniya', 'Germany', '🇩🇪', '+49'),
  ('FR', 'Fransiya', 'France', '🇫🇷', '+33'),
  ('IT', 'Italiya', 'Italy', '🇮🇹', '+39'),
  ('IN', 'Hindiston', 'India', '🇮🇳', '+91'),
  ('ID', 'Indoneziya', 'Indonesia', '🇮🇩', '+62'),
  ('MY', 'Malayziya', 'Malaysia', '🇲🇾', '+60'),
  ('EG', 'Misr', 'Egypt', '🇪🇬', '+20'),
  ('JO', 'Iordaniya', 'Jordan', '🇯🇴', '+962'),
  ('IQ', 'Iroq', 'Iraq', '🇮🇶', '+964'),
  ('SY', 'Suriya', 'Syria', '🇸🇾', '+963'),
  ('LB', 'Livan', 'Lebanon', '🇱🇧', '+961'),
  ('PS', 'Falastin', 'Palestine', '🇵🇸', '+970'),
  ('YE', 'Yaman', 'Yemen', '🇾🇪', '+967'),
  ('OM', 'Ummon', 'Oman', '🇴🇲', '+968'),
  ('QA', 'Qatar', 'Qatar', '🇶🇦', '+974'),
  ('KW', 'Quvayt', 'Kuwait', '🇰🇼', '+965'),
  ('BH', 'Bahrayn', 'Bahrain', '🇧🇭', '+973'),
  ('MA', 'Marokash', 'Morocco', '🇲🇦', '+212'),
  ('DZ', 'Jazoir', 'Algeria', '🇩🇿', '+213'),
  ('TN', 'Tunis', 'Tunisia', '🇹🇳', '+216'),
  ('LY', 'Liviya', 'Libya', '🇱🇾', '+218'),
  ('SD', 'Sudan', 'Sudan', '🇸🇩', '+249')
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.countries_ref ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read countries" ON public.countries_ref;
CREATE POLICY "Public can read countries" ON public.countries_ref FOR SELECT USING (true);