-- Create law_firms table for legal support
CREATE TABLE public.law_firms (
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
  specialization TEXT NOT NULL,
  specialization_uz TEXT,
  specialization_ru TEXT,
  specialization_en TEXT,
  specialization_ar TEXT,
  description TEXT,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  description_ar TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  address_uz TEXT,
  address_ru TEXT,
  address_en TEXT,
  address_ar TEXT,
  address_chinese TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create embassies table for diplomatic contacts
CREATE TABLE public.embassies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  type TEXT NOT NULL DEFAULT 'embassy', -- embassy, consulate
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
  address_chinese TEXT,
  phone TEXT,
  emergency_phone TEXT,
  email TEXT,
  website TEXT,
  working_hours TEXT,
  working_hours_uz TEXT,
  working_hours_ru TEXT,
  working_hours_en TEXT,
  working_hours_ar TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  map_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create legal_templates table for contract templates
CREATE TABLE public.legal_templates (
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
  template_type TEXT NOT NULL, -- sales_purchase, quality_inspection, nda, etc.
  file_url TEXT,
  languages TEXT[] DEFAULT ARRAY['en', 'zh'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embassies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_templates ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Law firms are viewable by everyone" 
ON public.law_firms 
FOR SELECT 
USING (true);

CREATE POLICY "Embassies are viewable by everyone" 
ON public.embassies 
FOR SELECT 
USING (true);

CREATE POLICY "Legal templates are viewable by everyone" 
ON public.legal_templates 
FOR SELECT 
USING (true);

-- Insert Uzbekistan Embassy and Consulate data
INSERT INTO public.embassies (name, name_uz, name_ru, name_en, name_ar, type, city, city_uz, city_ru, city_en, city_ar, address, address_uz, address_ru, address_en, address_ar, address_chinese, phone, emergency_phone, email, website, working_hours, working_hours_uz, working_hours_ru, working_hours_en, working_hours_ar, map_url)
VALUES 
(
  'Embassy of Uzbekistan in Beijing',
  'O''zbekiston Respublikasi Elchixonasi Pekinda',
  'Посольство Республики Узбекистан в Пекине',
  'Embassy of the Republic of Uzbekistan in Beijing',
  'سفارة جمهورية أوزبكستان في بكين',
  'embassy',
  'Beijing',
  'Pekin',
  'Пекин',
  'Beijing',
  'بكين',
  'No. 11 Bei Xiao Jie, San Li Tun, Chaoyang District, Beijing',
  'No. 11 Bei Xiao Jie, San Li Tun, Chaoyang tumani, Pekin',
  'No. 11 Bei Xiao Jie, San Li Tun, район Чаоян, Пекин',
  'No. 11 Bei Xiao Jie, San Li Tun, Chaoyang District, Beijing',
  'رقم 11 باي شياو جي، سان لي تون، منطقة تشاويانغ، بكين',
  '北京市朝阳区三里屯北小街11号',
  '+86-10-65326305',
  '+86-10-65326305',
  'uzbekistan@mfa.uz',
  'https://beijing.mfa.uz',
  'Monday-Friday: 09:00-12:00, 14:00-17:00',
  'Dushanba-Juma: 09:00-12:00, 14:00-17:00',
  'Понедельник-Пятница: 09:00-12:00, 14:00-17:00',
  'Monday-Friday: 09:00-12:00, 14:00-17:00',
  'الإثنين-الجمعة: 09:00-12:00، 14:00-17:00',
  'https://maps.google.com/?q=39.9406,116.4548'
),
(
  'Consulate General of Uzbekistan in Guangzhou',
  'O''zbekiston Respublikasi Bosh konsulligi Guanchjouda',
  'Генеральное консульство Республики Узбекистан в Гуанчжоу',
  'Consulate General of the Republic of Uzbekistan in Guangzhou',
  'القنصلية العامة لجمهورية أوزبكستان في قوانغتشو',
  'consulate',
  'Guangzhou',
  'Guanchzhou',
  'Гуанчжоу',
  'Guangzhou',
  'قوانغتشو',
  'Room 2508, Teem Tower, No. 208 Tianhe Road, Tianhe District, Guangzhou',
  'Xona 2508, Teem Tower, 208 Tianhe Road, Tianhe tumani, Guanchzhou',
  'Комната 2508, Teem Tower, 208 Tianhe Road, район Тяньхэ, Гуанчжоу',
  'Room 2508, Teem Tower, No. 208 Tianhe Road, Tianhe District, Guangzhou',
  'غرفة 2508، برج تيم، رقم 208 طريق تيانخه، منطقة تيانخه، قوانغتشو',
  '广州市天河区天河路208号天河城大厦2508室',
  '+86-20-38781338',
  '+86-13926466888',
  'guangzhou@mfa.uz',
  'https://guangzhou.mfa.uz',
  'Monday-Friday: 09:00-12:00, 14:00-17:00',
  'Dushanba-Juma: 09:00-12:00, 14:00-17:00',
  'Понедельник-Пятница: 09:00-12:00, 14:00-17:00',
  'Monday-Friday: 09:00-12:00, 14:00-17:00',
  'الإثنين-الجمعة: 09:00-12:00، 14:00-17:00',
  'https://maps.google.com/?q=23.1291,113.3260'
);

-- Insert Law Firms data
INSERT INTO public.law_firms (name, name_uz, name_ru, name_en, name_ar, city, city_uz, city_ru, city_en, city_ar, specialization, specialization_uz, specialization_ru, specialization_en, specialization_ar, description, description_uz, description_ru, description_en, description_ar, phone, email, address, address_chinese, verified)
VALUES 
(
  'Guangdong Legal Associates',
  'Guangdong Legal Associates',
  'Guangdong Legal Associates',
  'Guangdong Legal Associates',
  'Guangdong Legal Associates',
  'Guangzhou',
  'Guanchzhou',
  'Гуанчжоу',
  'Guangzhou',
  'قوانغتشو',
  'Trade Law, Dispute Resolution',
  'Savdo qonunchiligi, Nizolarni hal qilish',
  'Торговое право, Разрешение споров',
  'Trade Law, Dispute Resolution',
  'قانون التجارة، حل النزاعات',
  'Specialized in international trade disputes and contract law for Uzbek businesses',
  'O''zbek biznes uchun xalqaro savdo nizolari va shartnoma huquqi bo''yicha mutaxassis',
  'Специализация на международных торговых спорах и контрактном праве для узбекского бизнеса',
  'Specialized in international trade disputes and contract law for Uzbek businesses',
  'متخصص في نزاعات التجارة الدولية وقانون العقود للشركات الأوزبكية',
  '+86-20-87654321',
  'info@gdlegal.cn',
  'Tianhe District, Guangzhou',
  '广州市天河区',
  true
),
(
  'Yiwu International Trade Law Firm',
  'Yiwu Xalqaro Savdo Yuridik Firmasi',
  'Юридическая фирма международной торговли Иу',
  'Yiwu International Trade Law Firm',
  'شركة يوو للقانون التجاري الدولي',
  'Yiwu',
  'Ivu',
  'Иу',
  'Yiwu',
  'يوو',
  'Export Contracts, Quality Disputes',
  'Eksport shartnomalari, Sifat nizolari',
  'Экспортные контракты, Споры о качестве',
  'Export Contracts, Quality Disputes',
  'عقود التصدير، نزاعات الجودة',
  'Expert in commodity export regulations and quality inspection disputes',
  'Tovar eksporti qoidalari va sifat tekshiruvi nizolari bo''yicha mutaxassis',
  'Эксперт по правилам экспорта товаров и спорам о проверке качества',
  'Expert in commodity export regulations and quality inspection disputes',
  'خبير في لوائح تصدير السلع ونزاعات فحص الجودة',
  '+86-579-85678900',
  'trade@yiwulaw.cn',
  'Futian District, Yiwu',
  '义乌市福田区',
  true
),
(
  'Beijing Global Commerce Law',
  'Pekin Global Commerce Law',
  'Beijing Global Commerce Law',
  'Beijing Global Commerce Law',
  'Beijing Global Commerce Law',
  'Beijing',
  'Pekin',
  'Пекин',
  'Beijing',
  'بكين',
  'Corporate Law, Import/Export',
  'Korporativ huquq, Import/Eksport',
  'Корпоративное право, Импорт/Экспорт',
  'Corporate Law, Import/Export',
  'قانون الشركات، الاستيراد/التصدير',
  'Full-service law firm for Central Asian businesses in China',
  'Xitoydagi Markaziy Osiyo bizneslari uchun to''liq xizmat ko''rsatuvchi yuridik firma',
  'Полный спектр юридических услуг для бизнеса Центральной Азии в Китае',
  'Full-service law firm for Central Asian businesses in China',
  'شركة محاماة متكاملة الخدمات للشركات الآسيوية الوسطى في الصين',
  '+86-10-88776655',
  'contact@bgclaw.cn',
  'Chaoyang District, Beijing',
  '北京市朝阳区',
  true
);

-- Insert Legal Templates
INSERT INTO public.legal_templates (name, name_uz, name_ru, name_en, name_ar, description, description_uz, description_ru, description_en, description_ar, template_type, languages)
VALUES 
(
  'Sales & Purchase Agreement',
  'Oldi-sotdi shartnomasi',
  'Договор купли-продажи',
  'Sales & Purchase Agreement',
  'اتفاقية البيع والشراء',
  'Standard international sales contract template',
  'Standart xalqaro savdo shartnomasi shabloni',
  'Стандартный шаблон международного договора купли-продажи',
  'Standard international sales contract template',
  'نموذج عقد بيع دولي قياسي',
  'sales_purchase',
  ARRAY['en', 'zh', 'uz']
),
(
  'Quality Inspection Agreement',
  'Sifat tekshiruvi shartnomasi',
  'Соглашение о проверке качества',
  'Quality Inspection Agreement',
  'اتفاقية فحص الجودة',
  'Agreement for pre-shipment quality inspection',
  'Yuklashdan oldingi sifat tekshiruvi shartnomasi',
  'Соглашение о предотгрузочной проверке качества',
  'Agreement for pre-shipment quality inspection',
  'اتفاقية فحص الجودة قبل الشحن',
  'quality_inspection',
  ARRAY['en', 'zh', 'uz']
),
(
  'Non-Disclosure Agreement',
  'Maxfiylik shartnomasi',
  'Соглашение о неразглашении',
  'Non-Disclosure Agreement',
  'اتفاقية عدم الإفشاء',
  'Confidentiality agreement for business negotiations',
  'Biznes muzokaralar uchun maxfiylik shartnomasi',
  'Соглашение о конфиденциальности для деловых переговоров',
  'Confidentiality agreement for business negotiations',
  'اتفاقية السرية للمفاوضات التجارية',
  'nda',
  ARRAY['en', 'zh']
);