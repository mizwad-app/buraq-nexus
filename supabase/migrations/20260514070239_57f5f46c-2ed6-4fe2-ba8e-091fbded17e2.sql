
-- ========================================
-- CITY 1: GUANGZHOU
-- Sources: Wikipedia, Wikipedia Airport, Trip.com
-- ========================================
UPDATE cities SET
  name_ru = 'Гуанчжоу',
  population = 18810000,
  timezone = 'Asia/Shanghai',
  phone_code = '+86 20',
  nearest_airport_code = 'CAN',
  nearest_airport_name_en = 'Guangzhou Baiyun International',
  nearest_airport_name_uz = 'Guangzhou Baiyun xalqaro aeroporti',
  airport_distance_km = 28,
  airport_taxi_cost_yuan = 150,
  airport_taxi_duration_min = 40,
  main_products_uz = 'Kiyim-kechak (Baima bozori), zargarlik, avto qismlar, tekstil. Canton Fair eng katta savdo ko''rgazmasi.',
  main_products_en = 'Apparel (Baima market), jewellery, auto parts, textiles. Canton Fair is the largest trade exhibition.',
  main_products_ru = 'Одежда (рынок Baima), ювелирные изделия, автозапчасти, текстиль. Canton Fair — крупнейшая торговая выставка.',
  fun_fact_uz = 'Guangzhou — qadimda "Canton" deb atalgan. Bu shahar 2200 yildan beri savdo markazi va Dengiz Ipak Yo''li boshlanish nuqtasi edi.',
  fun_fact_en = 'Guangzhou was historically known as "Canton". It has been a major trading hub for over 2,200 years and a key terminus of the Maritime Silk Road.',
  fun_fact_ru = 'Гуанчжоу исторически известен как "Кантон". Это торговый центр уже более 2200 лет и был ключевым пунктом Морского шёлкового пути.',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'guangzhou';

-- ========================================
-- CITY 2: YIWU
-- Sources: Wikipedia (Yiwu), Wikipedia (Airport), The Economist
-- ========================================
UPDATE cities SET
  name_ru = 'Иу',
  province = 'Zhejiang',
  population = 1850000,
  timezone = 'Asia/Shanghai',
  phone_code = '+86 579',
  nearest_airport_code = 'YIW',
  nearest_airport_name_en = 'Yiwu Airport',
  nearest_airport_name_uz = 'Yiwu aeroporti',
  airport_distance_km = 6,
  airport_taxi_cost_yuan = 40,
  airport_taxi_duration_min = 18,
  main_products_uz = 'Sovg''alar, kichik tovarlar, o''yinchoqlar, zargarlik, tekstil. Yiwu International Trade City — dunyodagi eng katta ulgurji bozor.',
  main_products_en = 'Gifts, small commodities, toys, jewellery, textiles. Yiwu International Trade City is the world''s largest wholesale market.',
  main_products_ru = 'Подарки, мелкие товары, игрушки, ювелирные изделия, текстиль. Yiwu International Trade City — крупнейший оптовый рынок в мире.',
  halal_food_note_uz = 'Yiwu''da 2001 yildan beri minglab arab va afrikalik biznesmenlar yashaydi. Arab va musulmon restoranlari, savdo markazlari ko''p.',
  halal_food_note_en = 'Since 2001, thousands of Arab and African businesspeople have settled in Yiwu. Many Arab and Muslim restaurants, shops, and cultural centers.',
  halal_food_note_ru = 'С 2001 года в Иу проживают тысячи арабских и африканских бизнесменов. Много арабских и мусульманских ресторанов, магазинов.',
  fun_fact_uz = 'Yiwu — dunyodagi eng katta kichik tovarlar ulgurji bozori. The Economist ma''lumotiga ko''ra, 2013 yilda dunyodagi Rojdestvo bezaklarining 60% Yiwu''dan keladi.',
  fun_fact_en = 'Yiwu hosts the world''s largest wholesale market for small commodities. According to The Economist, 60% of Christmas decorations sold globally in 2013 came from Yiwu.',
  fun_fact_ru = 'В Иу находится крупнейший в мире оптовый рынок мелких товаров. По данным The Economist, в 2013 году 60% продаваемых в мире рождественских украшений производились в Иу.',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'yiwu';

-- ========================================
-- CITY 3: SHENZHEN
-- Sources: Wikipedia, Wikipedia Airport, Trip.com
-- ========================================
UPDATE cities SET
  name_ru = 'Шэньчжэнь',
  population = 17560000,
  timezone = 'Asia/Shanghai',
  phone_code = '+86 755',
  nearest_airport_code = 'SZX',
  nearest_airport_name_en = 'Shenzhen Bao''an International',
  nearest_airport_name_uz = 'Shenzhen Bao''an xalqaro aeroporti',
  airport_distance_km = 32,
  airport_taxi_cost_yuan = 130,
  airport_taxi_duration_min = 40,
  main_products_uz = 'Elektronika, smartfonlar, komponentlar, dronlar. Huaqiangbei — dunyodagi eng katta elektronika ulgurji bozori. Huawei, Tencent, DJI, BYD shu yerda.',
  main_products_en = 'Electronics, smartphones, components, drones. Huaqiangbei is the world''s largest electronics wholesale market. Home to Huawei, Tencent, DJI, BYD.',
  main_products_ru = 'Электроника, смартфоны, компоненты, дроны. Huaqiangbei — крупнейший в мире оптовый рынок электроники. Здесь Huawei, Tencent, DJI, BYD.',
  fun_fact_uz = 'Shenzhen — 1979 yilda 30 ming aholili baliqchi qishloq edi. Hozir 17 mln aholiga ega, Xitoyning birinchi maxsus iqtisodiy zonasi, "Xitoyning Silikon vodiysi".',
  fun_fact_en = 'In 1979, Shenzhen was a fishing village of 30,000. Today it has 17 million people, is China''s first Special Economic Zone, and is called "China''s Silicon Valley".',
  fun_fact_ru = 'В 1979 году Шэньчжэнь был рыбацкой деревней с 30 тыс. жителей. Сегодня здесь 17 млн человек, это первая Особая экономическая зона Китая, "Силиконовая долина Китая".',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'shenzhen';

-- ========================================
-- CITY 4: SHANGHAI
-- Sources: Wikipedia, Wikipedia Airport, Trip.com
-- ========================================
UPDATE cities SET
  name_ru = 'Шанхай',
  province = 'Shanghai (municipality)',
  population = 24870000,
  timezone = 'Asia/Shanghai',
  phone_code = '+86 21',
  nearest_airport_code = 'PVG',
  nearest_airport_name_en = 'Shanghai Pudong International',
  nearest_airport_name_uz = 'Shanghai Pudong xalqaro aeroporti',
  airport_distance_km = 30,
  airport_taxi_cost_yuan = 170,
  airport_taxi_duration_min = 50,
  main_products_uz = 'Moliya markazi, sanoat texnikasi, kemasozlik, kimyo, avtomobil. CIIE — Xitoyning eng yirik xalqaro import ko''rgazmasi shu yerda.',
  main_products_en = 'Financial hub, industrial machinery, shipbuilding, chemicals, automotive. CIIE — China''s largest international import expo is held here.',
  main_products_ru = 'Финансовый центр, промышленное оборудование, судостроение, химия, автопром. CIIE — крупнейшая международная импортная выставка Китая.',
  fun_fact_uz = 'Shanghai — Xitoyning eng katta shahri (24.87 mln aholi) va dunyoning eng band konteyner porti. Shanghai Maglev — dunyodagi birinchi tijoriy magnit poyezdi, soatiga 430 km tezlikda.',
  fun_fact_en = 'Shanghai is China''s most populous city (24.87M) and the world''s busiest container port. Shanghai Maglev is the world''s first commercial magnetic levitation train at 430 km/h.',
  fun_fact_ru = 'Шанхай — самый населённый город Китая (24.87 млн) и крупнейший контейнерный порт мира. Шанхайский Маглев — первый в мире коммерческий поезд на магнитной подушке, 430 км/ч.',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'shanghai';

-- ========================================
-- Link cities to product_categories (bridge table)
-- ========================================

-- Guangzhou → Apparel, Jewellery, Auto-parts
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'apparel', TRUE, 1 FROM cities WHERE slug = 'guangzhou'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'jewellery', TRUE, 1 FROM cities WHERE slug = 'guangzhou'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'auto-parts', TRUE, 1 FROM cities WHERE slug = 'guangzhou'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

-- Yiwu → Gifts, Toys
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'gifts', TRUE, 1 FROM cities WHERE slug = 'yiwu'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'toys', TRUE, 1 FROM cities WHERE slug = 'yiwu'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

-- Shenzhen → Electronics, Mobile-tech
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'electronics', TRUE, 1 FROM cities WHERE slug = 'shenzhen'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'mobile-tech', TRUE, 1 FROM cities WHERE slug = 'shenzhen'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

-- Shanghai → General
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'general', TRUE, 1 FROM cities WHERE slug = 'shanghai'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;
