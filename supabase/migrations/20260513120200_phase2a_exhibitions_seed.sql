-- Migration: Phase 2A.1 - Exhibitions seed (30 ta) + is_international column
-- Generated: 2026-05-13
-- Source: mizwad_top30_seed.xlsx (Claude chat AI generated, Komiljon approved)

-- ============================================
-- Part 1: Add is_international column (additive, safe)
-- ============================================

ALTER TABLE exhibitions 
  ADD COLUMN IF NOT EXISTS is_international BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN exhibitions.is_international IS 
  'TRUE = xalqaro (foreigner-friendly), FALSE = mahalliy (faqat xitoy)';

-- Set existing 5 canonical seeds to international (they are all international)
UPDATE exhibitions 
SET is_international = TRUE 
WHERE slug IN ('canton-fair', 'ciie', 'yiwu-fair', 'bauma-china', 'furniture-china');

-- ============================================
-- Part 2: Upsert 30 exhibitions
-- 5 existing (canton-fair, ciie, yiwu-fair, bauma-china, furniture-china) -> UPDATE
-- 25 new -> INSERT
-- ============================================

-- Insert/upsert 30 exhibitions (5 update + 25 new)
INSERT INTO exhibitions (slug, name_en, name_uz, name_ru, name_ar, name_zh, category, city, venue, frequency, official_url, data_confidence, description_uz, is_international)
VALUES
  ('canton-fair', 'Canton Fair (China Import and Export Fair) — Autumn 2026', 'Kanton yarmarkasi — Kuzgi 2026', 'Кантонская ярмарка — Осень 2026', 'معرض كانتون — خريف 2026', '广交会 — 2026年秋季', 'general', 'Guangzhou', 'China Import and Export Fair Complex (Pazhou)', 'biannual', 'https://www.cantonfair.org.cn/en-US', 'green', 'Xitoyning eng katta va eng eski ko''rgazmasi (1957''dan). 3 fazaga bo''lingan: Phase 1 — elektronika, Phase 2 — uy buyumlari, Phase 3 — kiyim va iste''mol mahsulotlari. 1.55 mln m² maydon.', TRUE),
  ('yiwu-fair', 'China Yiwu International Commodities Fair (Yiwu Fair)', 'Yiwu Xalqaro Mahsulotlar Yarmarkasi', 'Иу Международная Ярмарка Товаров', 'معرض إيوو الدولي للسلع', '中国义乌国际小商品博览会', 'general', 'Yiwu', 'Yiwu International Expo Center', 'annual', 'https://en.yiwufair.com/', 'green', '"Dunyoning supermarketi" — kichik mahsulotlar (uy buyumlari, o''yinchoq, kiyim, sovg''a) uchun №1. 110,000 m² maydon, 200+ davlatdan xaridorlar.', TRUE),
  ('east-china-fair-35th-edition', 'East China Fair (ECF) — 35th edition', 'Sharqiy Xitoy Yarmarkasi (ECF)', 'Восточно-Китайская Ярмарка', 'معرض شرق الصين', '华东进出口商品交易会', 'general', 'Shanghai', 'Shanghai New International Expo Centre (SNIEC)', 'annual', 'https://www.ecf.org.cn/', 'green', 'Sharqiy Xitoyning eng katta regional ko''rgazmasi (1991''dan). 9 viloyat (Shanghai, Jiangsu, Zhejiang va h.k.) hamkorlikda. Asosiy: yengil sanoat, kiyim, tekstil, uy buyumlari, sovg''a.', TRUE),
  ('ciie', 'China International Import Expo (CIIE) — 9th edition', 'Xitoy Xalqaro Import Expo (CIIE)', 'Китайская Международная Импортная Выставка', 'معرض الصين الدولي للاستيراد', '中国国际进口博览会', 'general', 'Shanghai', 'National Exhibition and Convention Center (NECC)', 'annual', 'https://www.ciie.org/zbh/en/', 'green', 'Xitoyga IMPORT qilish uchun davlat darajasidagi ko''rgazma (2018''dan). 6 sektor: avtomobil, tibbiyot, oziq-ovqat, smart sanoat, iste''mol mahsulotlari, xizmat ko''rsatish. 138 davlat ishtiroki.', TRUE),
  ('china-international-consumer-products-expo-hainan-expo', 'China International Consumer Products Expo (CICPE) — Hainan Expo', 'Xitoy Xalqaro Iste''mol Mahsulotlari Expo (Hainan Expo)', 'Хайнаньская Международная Выставка Потребительских Товаров', 'معرض الصين الدولي للمنتجات الاستهلاكية', '中国国际消费品博览会', 'general', 'Haikou', 'Hainan International Convention and Exhibition Center', 'annual', 'https://www.hainanexpo.org.cn/', 'yellow', 'Osiyo-Tinch okeani regionining eng katta iste''mol mahsulotlari ko''rgazmasi. Hainan Free Trade Port''da. Aksiya, sovg''a, parfumeriya, salomatlik, oziq-ovqat, lyuks.', TRUE),
  ('china-international-fair-for-trade-in-services', 'China International Fair for Trade in Services (CIFTIS)', 'Xitoy Xalqaro Xizmat Sohasi Yarmarkasi', 'Китайская Международная Ярмарка Торговли Услугами', 'معرض الصين الدولي لتجارة الخدمات', '中国国际服务贸易交易会', 'general', 'Beijing', 'Shougang Park Exhibition Center', 'annual', 'https://www.ciftis.org/en/', 'green', 'Davlat darajasidagi 4 ta asosiy yarmarkadan biri (Canton, CIIE, CICPE bilan). XIZMAT savdosi: moliya, telekom, IT, sayyohlik, salomatlik, ta''lim, transport.', TRUE),
  ('global-sources-hong-kong-show-phase-2', 'Global Sources Hong Kong Show — Phase 2 (Mobile Electronics & AI Products)', 'Global Sources Gonkong Show — Phase 2', 'Global Sources Гонконг — Фаза 2', 'معرض غلوبل سورسز هونغ كونغ — المرحلة 2', '环球资源香港展 — 第二期', 'general', 'Hong Kong', 'AsiaWorld-Expo', 'biannual', 'https://www.globalsources.com/trade-fair/hk-show/', 'green', 'Mobil qurilmalar, AI mahsulotlari, kiyiladigan elektronika, smart-uy, oshxona texnikasi, sovg''a, pet supplies. 25 kategoriya, 155,000+ mahsulot.', TRUE),
  ('global-sources-hong-kong-show-phase-1', 'Global Sources Hong Kong Show — Phase 1 (Consumer Electronics & Electronic Components)', 'Global Sources Gonkong Show — Phase 1 (Elektronika)', 'Global Sources Гонконг — Фаза 1 (Электроника)', 'معرض غلوبل سورسز هونغ كونغ — المرحلة 1', '环球资源香港展 — 第一期', 'electronics', 'Hong Kong', 'AsiaWorld-Expo', 'biannual', 'https://www.globalsources.com/trade-fair/hk-show/', 'green', 'Iste''molchi elektronikasi: audio-video, avto-elektronika, kompyuter, gaming, esports, batareya, quvvat. 4,000+ booth, 150,000+ mahsulot. 40% xaridor EU/USA.', TRUE),
  ('hktdc-hong-kong-electronics-fair', 'HKTDC Hong Kong Electronics Fair (Autumn Edition)', 'HKTDC Gonkong Elektronika Yarmarkasi (Kuzgi)', 'HKTDC Гонконг Электроника Ярмарка (Осень)', 'معرض هونغ كونغ للإلكترونيات (الخريف)', '香港电子展 (秋季)', 'electronics', 'Hong Kong', 'Hong Kong Convention and Exhibition Centre (HKCEC)', 'biannual', 'https://www.hktdc.com/event/hkelectronicsfairae/en', 'green', 'Dunyoning eng katta elektronika ko''rgazmasi (Kuzgi versiyasi). Kiyiladigan tech, smart-uy, avto-elektronika, raqamli kamera, lazer. Tech Hall, Hall of Fame, Startup Area.', TRUE),
  ('china-information-technology-expo', 'China Information Technology Expo (CITE)', 'Xitoy Axborot Texnologiyalari Expo (CITE)', 'Китайская Выставка Информационных Технологий', 'معرض الصين لتكنولوجيا المعلومات', '中国电子信息博览会', 'electronics', 'Shenzhen', 'Shenzhen Convention & Exhibition Center (Futian)', 'annual', 'https://www.citexpo.org/en', 'yellow', 'Yangi avlod IT, AI, ma''lumotlar markazi, semikonduktor, kiyiladigan, robotika, smart-uy, smart-mobile, past balandlik iqtisodi. 110,000 m².', TRUE),
  ('furniture-china', 'China International Furniture Fair (CIFF Guangzhou)', 'Xitoy Xalqaro Mebel Yarmarkasi (CIFF Guangzhou)', 'Китайская Международная Мебельная Ярмарка', 'معرض الصين الدولي للأثاث', '中国国际家具博览会', 'furniture', 'Guangzhou', 'Canton Fair Complex (Pazhou)', 'biannual', 'https://www.ciff-gz.com/en/', 'green', 'Dunyoning eng katta mebel ko''rgazmasi. 850,000 m² maydon, 90 zal. 200+ davlatdan xaridorlar. Phase 1: uy mebeli, dekor, tekstil, tashqi mebel. Phase 2: ofis, tijorat, mehmonxona mebeli, mebel mashinalari.', TRUE),
  ('intertextile-shanghai-apparel-fabrics-autumn-edition', 'Intertextile Shanghai Apparel Fabrics — Autumn Edition', 'Intertextile Shanghai Tekstil Yarmarkasi (Kuzgi)', 'Intertextile Шанхай Текстиль (Осень)', 'معرض إنترتكستيل شنغهاي للأقمشة', '中国国际纺织面料及辅料(秋冬)博览会', 'apparel', 'Shanghai', 'National Exhibition and Convention Center (NECC)', 'biannual', 'https://intertextile-shanghai-apparel-fabrics-autumn.hk.messefrankfurt.com/', 'green', 'Osiyo''ning eng katta tekstil/kiyim materiallari ko''rgazmasi. 9 zal, 240,000 m². Mahsulotlar: kiyim materiallari, kostyum, sport, bolalar kiyimi, jeans, ich kiyim, parda materiallari. 26 davlatdan ko''rgazmachi.', TRUE),
  ('automechanika-shanghai', 'Automechanika Shanghai', 'Automechanika Shanghai', 'Automechanika Шанхай', 'معرض أوتوميكانيكا شنغهاي', '上海法兰克福汽配展', 'auto-parts', 'Shanghai', 'National Exhibition and Convention Center (NECC)', 'annual', 'https://automechanika-shanghai.hk.messefrankfurt.com/', 'green', 'Osiyo''ning eng katta avto qismlar ko''rgazmasi. 350,000 m² maydon. 44 davlatdan ko''rgazmachi. Mahsulotlar: qismlar, elektronika, aksessuar, tunings, diagnostika, neft-mahsulotlar, raqamli yechimlar, shinalar, kuzov-bo''yoq, yangi energiya avtomobillari (EV).', TRUE),
  ('ceramics-china', 'Ceramics China (40th China International Ceramic Industry Expo)', 'Xitoy Chinni Sanoati Expo (Ceramics China)', 'Керамика Китай (40-я выставка керамики)', 'معرض الصين الدولي للسيراميك', '中国国际陶瓷工业展览会', 'ceramics', 'Guangzhou', 'Canton Fair Complex, Area A', 'annual', 'http://en.ceramicschina.com.cn/', 'green', 'Dunyo''ning eng katta chinni-keramika sanoati ko''rgazmasi (1987''dan). 80,000 m². 90+ davlatdan xaridor. Mahsulotlar: xom material, qoliplar, chiqarish jihozlari, peshana, dekoratsiya, qaynaqlash, idish-tovoq, sanitariya, hojatxona.', TRUE),
  ('cbd-ibctf-shanghai', 'CBD-IBCTF Shanghai (International Building and Construction Trade Fair)', 'Xitoy Xalqaro Qurilish va Uy Yarmarkasi (CBD Fair Shanghai)', 'Международная Строительная Ярмарка CBD Шанхай', 'معرض الصين الدولي للبناء والإنشاءات', '中国国际建筑装饰博览会(上海)', 'construction', 'Shanghai', 'National Exhibition and Convention Center (NECC, Hongqiao)', 'annual', 'https://www.cbdfair-sh.com/en', 'green', 'Yuqori darajadagi uy qurilishi va ichki bezatish. Mahsulotlar: qurilish materiallari, butun uy avtomatlashtirilgan ishlab chiqarishi, smart-uy texnologiyalari, oshxona tizimlari, eshik-deraza, hojatxona mahsulotlari, yoritish, ichki sayohat.', TRUE),
  ('mobile-world-congress-shanghai', 'Mobile World Congress (MWC) Shanghai', 'Mobile World Congress Shanghai (Mobil Dunyo Kongressi)', 'Mobile World Congress Шанхай', 'مؤتمر الجوال العالمي شنغهاي', '世界移动通信大会上海', 'mobil', 'Shanghai', 'Shanghai New International Expo Centre (SNIEC)', 'annual', 'https://www.mwcshanghai.com/', 'green', 'GSMA tashkil etadi (Barcelona MWC dan keyin 2-katta). Mahsulotlar: smartfon, qoplama, zaryadlovchi, ekran himoyasi, mobil aksessuari, smart-soat, IoT, 5G, AI, bulut, telekom uskunalari.', TRUE),
  ('hktdc-hong-kong-gifts-premium-fair', 'HKTDC Hong Kong Gifts & Premium Fair', 'HKTDC Gonkong Sovg''a va Premium Yarmarkasi', 'HKTDC Гонконг Подарки и Премиум', 'معرض هونغ كونغ للهدايا والمنتجات الفاخرة', '香港礼品及赠品展', 'gifts', 'Hong Kong', 'Hong Kong Convention and Exhibition Centre (HKCEC)', 'annual', 'https://www.hktdc.com/event/hkgiftspremiumfair/en', 'green', 'Osiyo''ning eng katta sovg''a/promo mahsulotlari ko''rgazmasi (1985''dan). Mahsulotlar: korporativ sovg''a, reklama mahsulotlari, uy buyumlari, o''yinchoq, qog''oz mahsulotlari, elektronika sovg''alari, Rojdestvo bezagi, dizayn brendlar.', TRUE),
  ('shoes-leather-guangzhou', 'Shoes & Leather Guangzhou (IFLE-Guangzhou)', 'Guangzhou Poyabzal va Charm Yarmarkasi', 'Гуанчжоу Обувь и Кожа', 'معرض غوانغجو للأحذية والجلود', '广州国际鞋类、皮革及工业展览会', 'shoes', 'Guangzhou', 'Canton Fair Complex (Area D, Hall 17.1-20.1)', 'annual', 'https://www.toprepute.com.hk/shoes-and-leather-guangzhou/', 'green', 'Osiyo''ning yetakchi poyabzal va charm ko''rgazmasi. Mahsulotlar: tayyor poyabzal, poyabzal ishlab chiqarish mashinalari, charm, sintetik charm, materiallar, tikuv texnikasi, 3D bosma, kimyo, garment, tagliklar.', TRUE),
  ('hktdc-hong-kong-international-jewellery-show-jewellery-gem-w', 'HKTDC Hong Kong International Jewellery Show + Jewellery & Gem WORLD (JGW)', 'HKTDC Gonkong Xalqaro Zargarlik Show', 'HKTDC Гонконг Международная Выставка Ювелирных Изделий', 'معرض هونغ كونغ الدولي للمجوهرات', '香港国际珠宝展', 'jewellery', 'Hong Kong', 'HKCEC + AsiaWorld-Expo (2 ta joy)', 'biannual', 'https://www.hktdc.com/event/hkjewellery/en', 'green', 'Dunyoning eng katta zargarlik bozori. Mahsulotlar: oltin, kumush, almaz, marvarid, qimmatbaho toshlar, dizayner zargarlik, soatlar, antik zargarlik, jade (yashma). Sentabr — 2 zona: HKCEC + AsiaWorld-Expo bir vaqt.', TRUE),
  ('china-international-lighting-fair', 'China (Guzhen) International Lighting Fair (GILF)', 'Xitoy (Guzhen) Xalqaro Yoritish Yarmarkasi', 'Гучжэнь Международная Выставка Освещения', 'معرض غوتشن الدولي للإضاءة', '中国(古镇)国际灯饰博览会', 'lighting', 'Guzhen Town', 'Guzhen Convention and Exhibition Center', 'biannual', 'https://en.jiagle.com/lighting-fair/', 'green', '"Xitoy yoritish poytaxti" Guzhen — yiliga 100+ mlrd CNY ishlab chiqaradi. 1.5 mln m² maydon. "1+8+N" struktura: bosh markaz + 8 sub-markaz + 11 shahar bozorlari. Mahsulotlar: LED, smart-yoritish, dekorativ, tijorat, ko''cha, mashinalar, aksessuar.', TRUE),
  ('china-toy-expo-china-kids-expo-china-licensing-expo', 'China Toy Expo (CTE) + China Kids Expo + China Licensing Expo (4-in-1)', 'Xitoy O''yinchoq Expo (CTE)', 'Китайская Выставка Игрушек (CTE)', 'معرض الصين للألعاب', '中国玩具展', 'toys', 'Shanghai', 'Shanghai New International Expo Centre (SNIEC)', 'annual', 'https://www.china-toy-expo.com/en', 'green', 'Osiyo''ning eng katta o''yinchoq B2B ko''rgazmasi. 230,000 m² maydon. 40 davlatdan ko''rgazmachi. 17 kategoriya. 95% original ishlab chiqaruvchi. Brendlar: Lego, Mattel, Hasbro, Bandai, POP MART (Labubu).', TRUE),
  ('ispo-shanghai', 'ISPO Shanghai (Sports, Outdoor, Fashion, Health)', 'ISPO Shanghai (Sport)', 'ISPO Шанхай (Спорт)', 'إيسبو شنغهاي للرياضة', 'ISPO上海体育用品博览会', 'sport', 'Shanghai', 'Shanghai New International Expo Centre (SNIEC)', 'biannual', 'https://www.ispo.com.cn/en/shanghai/', 'green', 'Messe München (Germaniya) Shanghai. Mahsulotlar: tog''-yurish, camping, suv sporti, velosped, yugurish-trening, shahar sporti, ayollar sporti, bolalar tashqi, hayvonlar tashqi, sport tekstil-texnologiya.', TRUE),
  ('bauma-china', 'bauma CHINA (Construction Machinery)', 'bauma CHINA (Qurilish Mashinalari)', 'bauma CHINA (Строительная Техника)', 'باوما الصين لمعدات البناء', 'bauma CHINA 上海宝马展', 'construction', 'Shanghai', 'Shanghai New International Expo Centre (SNIEC)', 'annual', 'https://bauma-china.com/en/', 'green', 'Xitoyning eng katta qurilish mashinalari ko''rgazmasi (bauma Germaniya''dan). Mahsulotlar: ekskavator, kran, beton mashinalari, yo''l qurish texnikasi, tog''-kon mashinalari, EV ishchi mashinalari. Avtomatlash va yangi energiya.', TRUE),
  ('sial-shanghai', 'SIAL Shanghai (Asia''s #1 Food & Beverage)', 'SIAL Shanghai (Oziq-ovqat va Ichimliklar)', 'SIAL Шанхай (Продукты Питания)', 'سيال شنغهاي للأغذية', 'SIAL中食展上海', 'food', 'Shanghai', 'SNIEC Shanghai | Guangzhou Poly World Trade Center', 'biannual', 'https://www.sialchina.com/', 'green', 'Osiyo''ning №1 oziq-ovqat ko''rgazmasi. Comexposium (Frantsiya) tashkil etadi. 200,000 m². 18 vertikal sektor: go''sht, dengiz mahsulotlari, sut, pishiriq, ichimliklar, organik, qadoqlash, oshxona.', TRUE),
  ('cosmoprof-asia-cosmopack-asia', 'Cosmoprof Asia + Cosmopack Asia (Beauty)', 'Cosmoprof Asia (Go''zallik va Kosmetika)', 'Cosmoprof Азия (Косметика)', 'كوسموبروف آسيا للتجميل', '亚太美容展', 'beauty', 'Hong Kong', 'HKCEC + AsiaWorld-Expo (2 joy)', 'annual', 'https://www.cosmoprof-asia.com/', 'green', 'Osiyo''ning eng katta go''zallik B2B ko''rgazmasi. 29-edition. Sektorlar: parfumeriya-kosmetika, salon-spa, tirnoq-aksessuar, soch saloni, tabiiy-organik, kontrakt ishlab chiqarish, qadoqlash.', TRUE),
  ('cmef-china-international-medical-equipment-fair', 'CMEF — China International Medical Equipment Fair', 'CMEF — Xitoy Xalqaro Tibbiy Jihozlar Yarmarkasi', 'CMEF — Китайская Выставка Медицинского Оборудования', 'معرض الصين الدولي للمعدات الطبية', '中国国际医疗器械博览会', 'medical', 'Shanghai', 'NECC Shanghai | Shenzhen World', 'biannual', 'https://www.cmef.com.cn/en/', 'green', 'Dunyo''ning yetakchi tibbiy jihozlar ko''rgazmasi (1979''dan). 150+ davlatdan tashrif. Mahsulotlar: tibbiy ko''rsatma, in-vitro diagnostika, elektronika, optika, birinchi yordam, reabilitatsiya, tibbiy IT, hospital qurilish, kosmetologiya.', TRUE),
  ('hotelex-shanghai', 'HOTELEX Shanghai (Hospitality & Foodservice)', 'Hotelex Shanghai (Mehmonxona va Restoran)', 'Hotelex Шанхай (Гостиничный Бизнес)', 'هوتيليكس شنغهاي للضيافة', '上海酒店及餐饮业博览会', 'it', 'Shanghai', 'NECC Shanghai (Hongqiao)', 'unknown', 'https://en.hotelex.cn', 'green', 'Osiyo''ning eng katta HoReCa ko''rgazmasi. 400,000 m². Sektorlar: oshxona uskunalari, kofe-choy, ozuqa ingredientlari, ichimliklar, idish-tovoq, qadoqlash, pishiriq, choy.', TRUE),
  ('kitchen-bath-china-part-of-cbd-fair', 'Kitchen & Bath China (KBC) — part of CBD Fair', 'Kitchen & Bath China (Oshxona va Hammom)', 'Кухня и Ванная Китай (KBC)', 'معرض الصين للمطابخ والحمامات', '中国国际厨房卫浴展', 'it', 'Shanghai', 'NECC Shanghai (Hongqiao)', 'annual', 'https://www.cbdfair-sh.com/en', 'yellow', 'Osiyo''da yetakchi oshxona-hammom mebellari va sanitariya ko''rgazmasi. CBD-IBCTF (TOP 11-20 №15 Qurilish) bilan birga o''tadi. Mahsulotlar: o''rnatma oshxona, oshxona mebellari, sanitariya, jihozlar, bug'' xona, hammom.', TRUE),
  ('ciame-china-international-agricultural-machinery-exhibition', 'CIAME — China International Agricultural Machinery Exhibition', 'CIAME — Xitoy Qishloq Xo''jalik Mashinalari Yarmarkasi', 'CIAME — Сельхоз Техника Китай', 'معرض الصين للآلات الزراعية', '中国国际农业机械展览会', 'machinery', 'Tianjin', 'Tianjin Exhibition Center', 'annual', 'https://en.camf.com.cn/', 'green', 'Osiyo''ning №1 qishloq xo''jalik mashinalari ko''rgazmasi (1950''dan). 220,000-250,000 m². Mahsulotlar: traktor, kombayn, ekuv mashinalari, irrigatsiya, drone, robot, smart-fermer texnologiyalari, sun''iy intellekt.', TRUE),
  ('hktdc-home-instyle', 'HKTDC Home InStyle (formerly HK Houseware Fair)', 'HKTDC Home InStyle (Uy Buyumlari)', 'HKTDC Home InStyle (Бытовые Товары)', 'هونغ كونغ هوم إن ستايل', '香港家居用品展', 'home', 'Hong Kong', 'Hong Kong Convention and Exhibition Centre (HKCEC)', 'annual', 'https://www.hktdc.com/event/homeinstyle/en', 'green', 'Osiyo''ning yetakchi uy buyumlari ko''rgazmasi (1986''dan, 2023''dan Home InStyle nomida). Mahsulotlar: mebel, uy tekstili, yoritish, dekorativ, oshxona-hammom, smart-uy, kollektsiya quti, sezuvchi kasallar uchun (Gerontech).', TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name_en = COALESCE(EXCLUDED.name_en, exhibitions.name_en),
  name_uz = COALESCE(EXCLUDED.name_uz, exhibitions.name_uz),
  name_ru = COALESCE(EXCLUDED.name_ru, exhibitions.name_ru),
  name_ar = COALESCE(EXCLUDED.name_ar, exhibitions.name_ar),
  name_zh = COALESCE(EXCLUDED.name_zh, exhibitions.name_zh),
  category = COALESCE(EXCLUDED.category, exhibitions.category),
  city = COALESCE(EXCLUDED.city, exhibitions.city),
  venue = COALESCE(EXCLUDED.venue, exhibitions.venue),
  frequency = COALESCE(EXCLUDED.frequency, exhibitions.frequency),
  official_url = COALESCE(EXCLUDED.official_url, exhibitions.official_url),
  data_confidence = COALESCE(EXCLUDED.data_confidence, exhibitions.data_confidence),
  description_uz = COALESCE(EXCLUDED.description_uz, exhibitions.description_uz),
  is_international = COALESCE(EXCLUDED.is_international, exhibitions.is_international);


-- ============================================
-- Part 3: Insert 35 editions
-- Each edition links to parent exhibition via slug -> id lookup
-- ============================================

-- Insert editions (35 ta)
-- Note: editions matched to exhibition by slug -> exhibition_id lookup
INSERT INTO exhibition_editions (exhibition_id, start_date, end_date, year)
SELECT e.id, v.start_date::date, v.end_date::date, v.year FROM (VALUES
  ('canton-fair', '2026-10-15', '2026-10-19', 2026),
  ('yiwu-fair', '2026-10-21', '2026-10-24', 2026),
  ('east-china-fair-35th-edition', '2027-03-01', '2027-03-04', 2027),
  ('ciie', '2026-11-05', '2026-11-10', 2026),
  ('china-international-fair-for-trade-in-services', '2026-09-09', '2026-09-13', 2026),
  ('global-sources-hong-kong-show-phase-2', '2026-10-18', '2026-10-21', 2026),
  ('global-sources-hong-kong-show-phase-2', '2027-04-18', '2027-04-21', 2027),
  ('global-sources-hong-kong-show-phase-1', '2026-10-11', '2026-10-14', 2026),
  ('global-sources-hong-kong-show-phase-1', '2027-04-11', '2027-04-14', 2027),
  ('hktdc-hong-kong-electronics-fair', '2026-10-13', '2026-10-16', 2026),
  ('furniture-china', '2027-03-18', '2027-03-21', 2027),
  ('furniture-china', '2027-03-28', '2027-03-31', 2027),
  ('intertextile-shanghai-apparel-fabrics-autumn-edition', '2026-08-25', '2026-08-27', 2026),
  ('automechanika-shanghai', '2026-12-02', '2026-12-05', 2026),
  ('ceramics-china', '2026-06-24', '2026-06-27', 2026),
  ('cbd-ibctf-shanghai', '2026-09-05', '2026-09-08', 2026),
  ('mobile-world-congress-shanghai', '2026-06-24', '2026-06-26', 2026),
  ('hktdc-hong-kong-gifts-premium-fair', '2027-04-27', '2027-04-30', 2027),
  ('shoes-leather-guangzhou', '2026-05-20', '2026-05-22', 2026),
  ('hktdc-hong-kong-international-jewellery-show-jewellery-gem-w', '2026-09-14', '2026-09-20', 2026),
  ('hktdc-hong-kong-international-jewellery-show-jewellery-gem-w', '2027-03-04', '2027-03-08', 2027),
  ('china-international-lighting-fair', '2026-10-22', '2026-10-25', 2026),
  ('china-toy-expo-china-kids-expo-china-licensing-expo', '2026-10-21', '2026-10-23', 2026),
  ('ispo-shanghai', '2026-07-03', '2026-07-05', 2026),
  ('bauma-china', '2026-11-24', '2026-11-27', 2026),
  ('sial-shanghai', '2026-05-18', '2026-05-20', 2026),
  ('sial-shanghai', '2026-09-03', '2026-09-05', 2026),
  ('cosmoprof-asia-cosmopack-asia', '2026-11-10', '2026-11-12', 2026),
  ('cosmoprof-asia-cosmopack-asia', '2026-11-11', '2026-11-13', 2026),
  ('cmef-china-international-medical-equipment-fair', '2026-04-09', '2026-04-12', 2026),
  ('hotelex-shanghai', '2026-05-10', '2026-05-12', 2026),
  ('hotelex-shanghai', '2026-07-02', '2026-07-04', 2026),
  ('kitchen-bath-china-part-of-cbd-fair', '2026-09-05', '2026-09-08', 2026),
  ('ciame-china-international-agricultural-machinery-exhibition', '2026-10-26', '2026-10-28', 2026),
  ('hktdc-home-instyle', '2027-04-27', '2027-04-30', 2027)
) AS v(slug, start_date, end_date, year)
JOIN exhibitions e ON e.slug = v.slug
ON CONFLICT DO NOTHING;


-- ============================================
-- Part 4: Verification queries (for manual check)
-- ============================================

-- Count check:
-- SELECT COUNT(*) FROM exhibitions; -- Expected: 30 (or 30 + any legacy unmatched)
-- SELECT COUNT(*) FROM exhibition_editions; -- Expected: 35+ (depends on existing)
-- SELECT is_international, COUNT(*) FROM exhibitions GROUP BY is_international;
-- Expected: TRUE = 30 (all TOP 30 are international)
