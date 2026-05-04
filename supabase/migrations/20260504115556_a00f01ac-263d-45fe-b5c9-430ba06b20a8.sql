-- ============= SCHEMA =============
CREATE TABLE IF NOT EXISTS public.consulates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL REFERENCES public.countries_ref(code) ON DELETE CASCADE,
  city TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('embassy', 'consulate_general', 'consulate', 'honorary_consulate')),

  name_uz TEXT, name_ru TEXT, name_en TEXT, name_ar TEXT, name_zh TEXT,
  address_uz TEXT, address_ru TEXT, address_en TEXT, address_ar TEXT, address_zh TEXT,

  phone_main TEXT,
  phone_emergency TEXT,
  phone_consular TEXT,
  fax TEXT,
  email_main TEXT,
  email_consular TEXT,
  website TEXT,

  latitude NUMERIC,
  longitude NUMERIC,

  working_hours_uz TEXT, working_hours_ru TEXT, working_hours_en TEXT,
  working_hours_ar TEXT, working_hours_zh TEXT,

  services_uz TEXT[], services_ru TEXT[], services_en TEXT[],
  services_ar TEXT[], services_zh TEXT[],

  notes_uz TEXT, notes_ru TEXT, notes_en TEXT, notes_ar TEXT, notes_zh TEXT,

  verification_status TEXT DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'admin_verified', 'community_verified')),
  data_sources JSONB,
  last_verified_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consulates_country ON public.consulates(country_code);
CREATE INDEX IF NOT EXISTS idx_consulates_city ON public.consulates(city);
CREATE INDEX IF NOT EXISTS idx_consulates_country_city ON public.consulates(country_code, city);

ALTER TABLE public.consulates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active consulates" ON public.consulates;
CREATE POLICY "Public can read active consulates" ON public.consulates
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage consulates" ON public.consulates;
CREATE POLICY "Admins can manage consulates" ON public.consulates
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
DROP TRIGGER IF EXISTS update_consulates_updated_at ON public.consulates;
CREATE TRIGGER update_consulates_updated_at
  BEFORE UPDATE ON public.consulates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============= SEED =============
-- UZBEKISTAN
INSERT INTO public.consulates (
  country_code, city, type,
  name_uz, name_en, name_zh,
  address_uz, address_en, address_zh,
  phone_main, phone_emergency, phone_consular,
  email_main, website, latitude, longitude,
  working_hours_uz, working_hours_en,
  services_uz, services_en, verification_status, data_sources
) VALUES
('UZ', 'Beijing', 'embassy',
  'Oʻzbekiston Respublikasining Xitoy Xalq Respublikasidagi elchixonasi',
  'Embassy of Uzbekistan in China',
  '乌兹别克斯坦共和国驻华大使馆',
  'Beytszin, Sanlitun, Ritan-bey-lu, 2/4, 100600',
  '2/4 Ri Tan Bei Lu, Sanlitun, Beijing 100600',
  '北京市朝阳区日坛北路2/4号',
  '+86-10-6532-6305', '+86-10-6532-6304', '+86-10-6532-6305',
  'mfa@uzbekembassy.cn', 'https://uzbekembassy.cn', 39.9320, 116.4540,
  'Dushanba-Juma: 09:00-18:00 (tushlik 13:00-14:00)',
  'Mon-Fri: 09:00-18:00 (lunch 13:00-14:00)',
  ARRAY['Pasport xizmatlari','Viza beruvchi','Notarial xizmatlar','Fuqarolik holati','Favqulodda yordam'],
  ARRAY['Passport services','Visa issuance','Notarial services','Civil status','Emergency assistance'],
  'unverified',
  '[{"url":"https://uzbekembassy.cn","type":"official_website"}]'::jsonb),
('UZ', 'Shanghai', 'consulate_general',
  'Oʻzbekiston Bosh konsulligi (Shanxay)',
  'Consulate-General of Uzbekistan in Shanghai', NULL,
  'Shanxay, Pudong (aniqlanmoqda)',
  'Pudong, Shanghai (address being verified)', NULL,
  NULL, NULL, NULL,
  'shanghai@uzbekembassy.cn', 'https://uzbekembassy.cn', NULL, NULL,
  'Dushanba-Juma: 09:00-17:00', 'Mon-Fri: 09:00-17:00',
  ARRAY['Pasport xizmatlari','Viza beruvchi','Tijorat aloqalari'],
  ARRAY['Passport services','Visa issuance','Trade relations'],
  'unverified', NULL);

-- KAZAKHSTAN
INSERT INTO public.consulates (
  country_code, city, type, name_uz, name_ru, name_en,
  address_uz, address_ru, address_en,
  phone_main, phone_emergency, email_main, website,
  latitude, longitude, working_hours_ru, working_hours_en,
  services_ru, services_en, verification_status
) VALUES
('KZ', 'Beijing', 'embassy',
  'Qozogʻiston elchixonasi (Pekin)',
  'Посольство Казахстана в Китае',
  'Embassy of Kazakhstan in China',
  'Beytszin, Sanlitun, Dong-liu-jie, 9',
  'Пекин, Саньлитунь, Дунлюцзе, 9',
  '9 Dong Liu Jie, Sanlitun, Beijing',
  '+86-10-6532-6182', '+86-10-6532-6183',
  'kazembchina@gmail.com', 'https://www.gov.kz/memleket/entities/mfa-bjs',
  39.9335, 116.4549,
  'Понедельник-Пятница: 09:00-18:00', 'Mon-Fri: 09:00-18:00',
  ARRAY['Паспортные услуги','Визовые услуги','Нотариальные услуги'],
  ARRAY['Passport services','Visa services','Notarial services'],
  'unverified');

INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, verification_status) VALUES
('KZ', 'Shanghai', 'consulate_general', 'Consulate-General of Kazakhstan in Shanghai', 'Shanghai (address pending)', NULL, 'unverified'),
('KZ', 'Hong Kong', 'consulate_general', 'Consulate-General of Kazakhstan in Hong Kong', 'Hong Kong (address pending)', NULL, 'unverified'),
('KZ', 'Urumqi', 'consulate_general', 'Consulate-General of Kazakhstan in Urumqi', 'Urumqi, Xinjiang (address pending)', NULL, 'unverified');

-- KYRGYZSTAN
INSERT INTO public.consulates (
  country_code, city, type, name_uz, name_ru, name_en,
  address_uz, address_en, phone_main, phone_emergency,
  email_main, website, working_hours_en, services_en, verification_status
) VALUES
('KG', 'Beijing', 'embassy',
  'Qirgʻiziston elchixonasi (Pekin)',
  'Посольство Кыргызстана в Китае',
  'Embassy of Kyrgyzstan in China',
  'Beytszin, Tayuanlu, 2/2', '2/2 Tayuan Diplomatic Compound, Beijing',
  '+86-10-6532-6459', '+86-10-6532-6190',
  'kgembassy.cn@mfa.gov.kg', 'https://mfa.gov.kg', 'Mon-Fri: 09:00-18:00',
  ARRAY['Passport services','Visa services','Notarial services','Emergency assistance'],
  'unverified');

-- TAJIKISTAN
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, email_main, website, verification_status) VALUES
('TJ', 'Beijing', 'embassy', 'Embassy of Tajikistan in China', 'No.A5 Liangmaqiao, Beijing', '+86-10-6532-2598', 'tjembassy.cn@mfa.tj', 'https://www.mfa.tj', 'unverified');

-- TURKMENISTAN
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, verification_status) VALUES
('TM', 'Beijing', 'embassy', 'Embassy of Turkmenistan in China', 'Liangmaqiao Diplomatic Compound, Beijing', '+86-10-6532-6975', 'unverified');

-- AFGHANISTAN
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, verification_status) VALUES
('AF', 'Beijing', 'embassy', 'Embassy of Afghanistan in China', 'Diplomatic Compound, Beijing', '+86-10-6532-1582', 'unverified');

-- TÜRKİYE
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, phone_emergency, email_main, website, verification_status) VALUES
('TR', 'Beijing', 'embassy', 'Embassy of Türkiye in China', '9 Dong Wu Jie, Sanlitun, Beijing 100600', '+86-10-6532-2650', '+86-10-6532-1715', 'embassy.beijing@mfa.gov.tr', 'http://pekin.be.mfa.gov.tr', 'unverified'),
('TR', 'Shanghai', 'consulate_general', 'Consulate-General of Türkiye in Shanghai', 'Shanghai (address pending)', NULL, NULL, NULL, NULL, 'unverified'),
('TR', 'Guangzhou', 'consulate_general', 'Consulate-General of Türkiye in Guangzhou', 'Guangzhou (address pending)', NULL, NULL, NULL, NULL, 'unverified'),
('TR', 'Hong Kong', 'consulate_general', 'Consulate-General of Türkiye in Hong Kong', 'Hong Kong (address pending)', NULL, NULL, NULL, NULL, 'unverified');

-- AZERBAIJAN
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, verification_status) VALUES
('AZ', 'Beijing', 'embassy', 'Embassy of Azerbaijan in China', 'Diplomatic Compound, Beijing', '+86-10-6532-4614', 'unverified');

-- PAKISTAN
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, phone_emergency, email_main, website, verification_status) VALUES
('PK', 'Beijing', 'embassy', 'Embassy of Pakistan in China', '1 Dong Zhi Men Wai Da Jie, Beijing', '+86-10-6532-2504', '+86-10-6532-2695', 'parepbeijing@mofa.gov.pk', 'https://pakbj.org.pk', 'unverified'),
('PK', 'Shanghai', 'consulate_general', 'Consulate-General of Pakistan in Shanghai', 'Shanghai (address pending)', NULL, NULL, NULL, NULL, 'unverified'),
('PK', 'Guangzhou', 'consulate_general', 'Consulate-General of Pakistan in Guangzhou', 'Guangzhou (address pending)', NULL, NULL, NULL, NULL, 'unverified'),
('PK', 'Hong Kong', 'consulate_general', 'Consulate-General of Pakistan in Hong Kong', 'Hong Kong (address pending)', NULL, NULL, NULL, NULL, 'unverified');

-- SAUDI ARABIA
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, verification_status) VALUES
('SA', 'Beijing', 'embassy', 'Embassy of Saudi Arabia in China', 'Diplomatic Compound, Beijing', '+86-10-6532-4825', 'unverified'),
('SA', 'Shanghai', 'consulate_general', 'Consulate-General of Saudi Arabia in Shanghai', 'Shanghai (address pending)', NULL, 'unverified'),
('SA', 'Hong Kong', 'consulate_general', 'Consulate-General of Saudi Arabia in Hong Kong', 'Hong Kong (address pending)', NULL, 'unverified');

-- UAE
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, verification_status) VALUES
('AE', 'Beijing', 'embassy', 'Embassy of UAE in China', 'Diplomatic Compound, Beijing', '+86-10-6532-2112', 'unverified'),
('AE', 'Shanghai', 'consulate_general', 'Consulate-General of UAE in Shanghai', 'Shanghai (address pending)', NULL, 'unverified'),
('AE', 'Hong Kong', 'consulate_general', 'Consulate-General of UAE in Hong Kong', 'Hong Kong (address pending)', NULL, 'unverified');

-- IRAN
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, verification_status) VALUES
('IR', 'Beijing', 'embassy', 'Embassy of Iran in China', '13 Dong Liu Jie, Sanlitun, Beijing', '+86-10-6532-2040', 'unverified'),
('IR', 'Shanghai', 'consulate_general', 'Consulate-General of Iran in Shanghai', 'Shanghai (address pending)', NULL, 'unverified'),
('IR', 'Guangzhou', 'consulate_general', 'Consulate-General of Iran in Guangzhou', 'Guangzhou (address pending)', NULL, 'unverified'),
('IR', 'Hong Kong', 'consulate_general', 'Consulate-General of Iran in Hong Kong', 'Hong Kong (address pending)', NULL, 'unverified');

-- RUSSIA
INSERT INTO public.consulates (country_code, city, type, name_en, address_en, phone_main, phone_emergency, email_main, website, verification_status) VALUES
('RU', 'Beijing', 'embassy', 'Embassy of Russia in China', '4 Dong Zhi Men Wai Bei Zhong Jie, Beijing', '+86-10-6532-1267', '+86-10-6532-2051', 'embassy@russia.org.cn', 'https://china.mid.ru', 'unverified'),
('RU', 'Shanghai', 'consulate_general', 'Consulate-General of Russia in Shanghai', 'Shanghai', '+86-21-6324-2682', NULL, NULL, NULL, 'unverified'),
('RU', 'Guangzhou', 'consulate_general', 'Consulate-General of Russia in Guangzhou', 'Guangzhou (address pending)', NULL, NULL, NULL, NULL, 'unverified'),
('RU', 'Hong Kong', 'consulate_general', 'Consulate-General of Russia in Hong Kong', 'Hong Kong (address pending)', NULL, NULL, NULL, NULL, 'unverified');