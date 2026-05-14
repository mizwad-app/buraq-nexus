
-- ========================================
-- CITY 1: HANGZHOU
-- Sources: Wikipedia, Wikipedia Airport, Trip.com, ChinaDiscovery
-- ========================================
UPDATE cities SET
  name_ru = 'Ханчжоу',
  province = 'Zhejiang',
  population = 12200000,
  timezone = 'Asia/Shanghai',
  phone_code = '+86 571',
  nearest_airport_code = 'HGH',
  nearest_airport_name_en = 'Hangzhou Xiaoshan International',
  nearest_airport_name_uz = 'Hangzhou Xiaoshan xalqaro aeroporti',
  airport_distance_km = 27,
  airport_taxi_cost_yuan = 120,
  airport_taxi_duration_min = 50,
  main_products_uz = 'Ipak (China National Silk Museum), choy (Longjing), elektronik tijorat (Alibaba shtab-kvartirasi), tekstil, tibbiyot uskunalari.',
  main_products_en = 'Silk (China National Silk Museum), tea (Longjing), e-commerce (Alibaba headquarters), textiles, medical equipment.',
  main_products_ru = 'Шёлк (China National Silk Museum), чай (Longjing), электронная коммерция (штаб-квартира Alibaba), текстиль, медоборудование.',
  fun_fact_uz = 'Hangzhou — Alibaba kompaniyasining shtab-kvartirasi va dunyodagi eng mashhur shaharlardan biri (West Lake — UNESCO yodgorligi). Marko Polo Hangzhouni "dunyodagi eng yaxshi va olijanob shahar" deb atagan.',
  fun_fact_en = 'Hangzhou is home to Alibaba''s headquarters and one of the world''s most celebrated cities (West Lake — UNESCO Heritage). Marco Polo called Hangzhou "the most beautiful and magnificent city in the world".',
  fun_fact_ru = 'Ханчжоу — штаб-квартира Alibaba и один из самых известных городов мира (озеро Сиху — наследие ЮНЕСКО). Марко Поло назвал Ханчжоу "самым красивым и величественным городом в мире".',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'hangzhou';

-- ========================================
-- CITY 2: DONGGUAN
-- Sources: Wikipedia, TravelChinaGuide, China-Briefing
-- ========================================
UPDATE cities SET
  name_ru = 'Дунгуань',
  province = 'Guangdong',
  population = 10470000,
  timezone = 'Asia/Shanghai',
  phone_code = '+86 769',
  nearest_airport_code = 'SZX',
  nearest_airport_name_en = 'Shenzhen Bao''an International',
  nearest_airport_name_uz = 'Shenzhen Bao''an xalqaro aeroporti',
  airport_distance_km = 90,
  airport_taxi_cost_yuan = 300,
  airport_taxi_duration_min = 90,
  main_products_uz = 'Elektronika (Huawei, Vivo, Oppo zavodlari), mebel (Houjie va Dalingshan), poyabzal, tekstil, paper. Dongguan — "dunyoning ustaxonasi", 170 mingdan ortiq zavod.',
  main_products_en = 'Electronics (Huawei, Vivo, Oppo factories), furniture (Houjie & Dalingshan), footwear, textiles, paper. Dongguan is the "Workshop of the World" with 170,000+ industrial enterprises.',
  main_products_ru = 'Электроника (заводы Huawei, Vivo, Oppo), мебель (Houjie и Dalingshan), обувь, текстиль, бумага. Дунгуань — "мастерская мира" с более 170 000 промышленных предприятий.',
  fun_fact_uz = 'Dongguan — dunyodagi smartfonlarning 1/4 qismi shu yerda ishlab chiqariladi. Huawei, Vivo, Oppo zavodlari shu joyda. Shaharning bironta markazi yo''q — "markazsiz shahar" deb ataladi.',
  fun_fact_en = 'Dongguan produces about 1/4 of the world''s smartphones. Huawei, Vivo, Oppo factories are located here. It''s known as "the city with no center" — manufacturing is spread across many towns.',
  fun_fact_ru = 'В Дунгуане производится около 1/4 смартфонов мира. Здесь расположены заводы Huawei, Vivo, Oppo. Город известен как "город без центра" — производство распределено по многим городкам.',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'dongguan';

-- ========================================
-- CITY 3: HONG KONG
-- Sources: Wikipedia, Wikipedia Airport, Trip.com
-- ========================================
UPDATE cities SET
  name_ru = 'Гонконг',
  province = NULL,
  country = 'Hong Kong SAR',
  country_emoji = '🇭🇰',
  population = 7500000,
  timezone = 'Asia/Hong_Kong',
  phone_code = '+852',
  nearest_airport_code = 'HKG',
  nearest_airport_name_en = 'Hong Kong International (Chek Lap Kok)',
  nearest_airport_name_uz = 'Hong Kong xalqaro aeroporti (Chek Lap Kok)',
  airport_distance_km = 34,
  airport_taxi_cost_yuan = NULL,
  airport_taxi_duration_min = 45,
  main_products_uz = 'Moliya markazi, logistika, vositachilik, qimmatbaho metallar, soatlar. HKTDC ko''rgazmalari (Electronics Fair, Gifts Fair, Jewellery Show) shu yerda. Xitoy biznesiga "darvoza".',
  main_products_en = 'Financial hub, logistics, trade brokerage, precious metals, watches. Major HKTDC trade fairs (Electronics, Gifts, Jewellery). Gateway to mainland China business.',
  main_products_ru = 'Финансовый центр, логистика, торговое посредничество, драгметаллы, часы. Крупные ярмарки HKTDC (электроника, подарки, ювелирные изделия). Шлюз к бизнесу в материковом Китае.',
  fun_fact_uz = 'Hong Kong taksi rangi bo''yicha hududga ajratilgan: qizil (markaz va Kowloon), yashil (New Territories), ko''k (Lantau oroli). Aeroport taksisi qizil rangda bo''ladi va shaharga ~HKD 280-350 (~250 yuan).',
  fun_fact_en = 'Hong Kong taxis are color-coded by region: red (urban areas + Kowloon), green (New Territories), blue (Lantau Island). Airport taxis are red and cost ~HKD 280-350 (~250 yuan) to downtown.',
  fun_fact_ru = 'Такси Гонконга разделены по цветам: красные (центр и Коулун), зелёные (Новые территории), синие (остров Лантау). Такси из аэропорта — красные, стоят ~HKD 280-350 (~250 юаней) до центра.',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'hong-kong';

-- ========================================
-- CITY 4: QUANZHOU
-- Sources: Wikipedia, Wikipedia Airport, TravelChinaGuide
-- ========================================
UPDATE cities SET
  name_ru = 'Цюаньчжоу',
  province = 'Fujian',
  population = 8780000,
  timezone = 'Asia/Shanghai',
  phone_code = '+86 595',
  nearest_airport_code = 'JJN',
  nearest_airport_name_en = 'Quanzhou Jinjiang International',
  nearest_airport_name_uz = 'Quanzhou Jinjiang xalqaro aeroporti',
  airport_distance_km = 12,
  airport_taxi_cost_yuan = 50,
  airport_taxi_duration_min = 25,
  main_products_uz = 'Sport kiyimlari va poyabzal — Anta, 361°, Xtep, Erke brendlari shu yerda (Jinjiang shahri). Jinjiang Xitoyning eng katta poyabzal va sport kiyim ishlab chiqaruvchi shahri.',
  main_products_en = 'Sportswear and footwear — Anta, 361°, Xtep, Erke brands are based here (Jinjiang city). Jinjiang is China''s largest manufacturing hub for sports shoes and athletic apparel.',
  main_products_ru = 'Спортивная одежда и обувь — здесь базируются бренды Anta, 361°, Xtep, Erke (город Цзиньцзян). Цзиньцзян — крупнейший центр производства спортивной обуви и одежды в Китае.',
  fun_fact_uz = 'Quanzhou — Buyuk Dengiz Ipak Yo''lining boshlanish nuqtasi edi. Marko Polo va Ibn Battuta bu shaharni "dunyodagi eng obod va yorqin shaharlardan biri" deb maqtagan. 11-14 asrlarda dunyoning eng band porti.',
  fun_fact_en = 'Quanzhou was the starting point of the Maritime Silk Road. Both Marco Polo and Ibn Battuta praised it as "one of the most prosperous and glorious cities in the world". It was the busiest port in the world from the 11th–14th centuries.',
  fun_fact_ru = 'Цюаньчжоу — отправная точка Морского шёлкового пути. Марко Поло и Ибн Баттута называли его "одним из самых процветающих и величественных городов мира". В XI–XIV веках — самый загруженный порт мира.',
  data_confidence = 'green',
  is_active = TRUE,
  updated_at = NOW()
WHERE slug = 'quanzhou';

-- ========================================
-- Link cities to product_categories
-- ========================================

-- Hangzhou → Apparel (silk)
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'apparel', FALSE, 2 FROM cities WHERE slug = 'hangzhou'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 2;

-- Dongguan → Electronics, Furniture, Shoes
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'electronics', FALSE, 2 FROM cities WHERE slug = 'dongguan'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 2;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'furniture', FALSE, 2 FROM cities WHERE slug = 'dongguan'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 2;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'shoes', FALSE, 2 FROM cities WHERE slug = 'dongguan'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 2;

-- Hong Kong → General (HKTDC trade fairs), Electronics, Jewellery
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'general', FALSE, 2 FROM cities WHERE slug = 'hong-kong'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 2;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'electronics', FALSE, 3 FROM cities WHERE slug = 'hong-kong'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 3;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'jewellery', FALSE, 2 FROM cities WHERE slug = 'hong-kong'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 2;

-- Quanzhou → Sport (sportswear & shoes), Shoes
INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'sport', TRUE, 1 FROM cities WHERE slug = 'quanzhou'
ON CONFLICT (city_id, category_slug) DO UPDATE SET is_top = TRUE, rank = 1;

INSERT INTO city_product_categories (city_id, category_slug, is_top, rank)
SELECT id, 'shoes', FALSE, 2 FROM cities WHERE slug = 'quanzhou'
ON CONFLICT (city_id, category_slug) DO UPDATE SET rank = 2;
