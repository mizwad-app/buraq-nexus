-- ============================================================
-- Seed: 5 verified exhibitions + 8 editions
--
-- Source: ~/Downloads/mizwad_exhibitions_v1.xlsx, sheets
-- "1️⃣ Exhibitions" rows 2-6 and "2️⃣ Editions" rows 2-9.
-- These are the only rows the PM (Komiljon) has filled in.
-- The remaining 25 exhibitions remain in the empty template and
-- will land in a follow-up TZ once filled.
--
-- data_confidence reflects the Excel "Tasdiqlangan" column:
--   "ha"   → 'verified'
--   "yo'q" → 'partial'
-- mizwad_verified mirrors data_confidence='verified'.
--
-- Strings use dollar-quoting ($txt$...$txt$) to keep the inline
-- Uzbek copy readable without escaping every apostrophe.
-- ============================================================

-- ── Exhibitions (ON CONFLICT keeps re-runs harmless) ──────────
INSERT INTO public.exhibitions (
  slug,
  name, name_en, name_uz, name_zh,
  country, country_code,
  city, venue, venue_address,
  category, category_tag, emoji,
  description_uz,
  website_url, official_website,
  frequency,
  travel_note_uz,
  data_confidence, mizwad_verified, mizwad_recommendation_priority,
  start_date, end_date
) VALUES
  ( 'canton-fair',
    'China Import and Export Fair',
    'China Import and Export Fair',
    'Kanton Yarmarkasi',
    $txt$中国进出口商品交易会$txt$,
    'China', 'CN',
    'Guangzhou',
    'Canton Fair Complex',
    '382 Yuejiang Middle Road, Haizhu District',
    'Clothing', 'Clothing', $txt$👔$txt$,
    $txt$Eng katta umumiy savdo yarmarkasi. Yiliga 2 marta. Barcha kategoriya.$txt$,
    'https://www.cantonfair.org.cn',
    'https://www.cantonfair.org.cn',
    $txt$Yiliga 2 marta$txt$,
    $txt$3 fazaga bo'lingan. Har faza 5 kun.$txt$,
    'verified', true, 1,
    '2026-04-15', '2026-10-19'
  ),
  ( 'ciie',
    'China International Import Expo',
    'China International Import Expo',
    'Xitoy Xalqaro Import Yarmarkasi',
    $txt$中国国际进口博览会$txt$,
    'China', 'CN',
    'Shanghai',
    'National Exhibition and Convention Center',
    '333 Songze Avenue, Qingpu District',
    'General', NULL, NULL,
    $txt$Import yo'naltirilgan eng katta xalqaro yarmarka.$txt$,
    'https://www.ciie.org',
    'https://www.ciie.org',
    $txt$Yiliga 1 marta$txt$,
    $txt$Kategoriya: barcha, alohida fazalarda$txt$,
    'verified', true, 2,
    '2026-11-05', '2026-11-10'
  ),
  ( 'yiwu-fair',
    'Yiwu International Commodities Fair',
    'Yiwu International Commodities Fair',
    'Yiwu Xalqaro Tovarlar Yarmarkasi',
    $txt$义乌国际小商品博览会$txt$,
    'China', 'CN',
    'Yiwu',
    'Yiwu International Expo Center',
    'Zongze East Road, Yiwu',
    'Gifts', 'Gifts', $txt$🎁$txt$,
    $txt$Yiwu shahridagi sovg'a va kichik tovarlar yarmarkasi.$txt$,
    'https://www.yiwufair.com',
    'https://www.yiwufair.com',
    $txt$Yiliga 1 marta$txt$,
    $txt$Oktyabrda bo'ladi$txt$,
    'verified', true, 3,
    '2026-10-21', '2026-10-25'
  ),
  ( 'bauma-china',
    'Bauma China',
    'Bauma China',
    'Bauma China',
    $txt$宝马展$txt$,
    'China', 'CN',
    'Shanghai',
    'Shanghai New International Expo Center',
    '2345 Longyang Road, Pudong',
    'General', NULL, NULL,
    $txt$Qurilish mashinalari va texnika ko'rgazmasi. Eng katta Osiyoda.$txt$,
    'https://www.bauma-china.com',
    'https://www.bauma-china.com',
    $txt$Yiliga 1 marta$txt$,
    $txt$Kategoriya yangi — qurilish texnikasi qo'shish kerak$txt$,
    'partial', false, 4,
    '2026-11-24', '2026-11-27'
  ),
  ( 'furniture-china',
    'Furniture China',
    'Furniture China',
    'Furniture China',
    $txt$中国国际家具展览会$txt$,
    'China', 'CN',
    'Shanghai',
    'National Exhibition and Convention Center',
    '333 Songze Avenue, Qingpu District',
    'Furniture', 'Furniture', $txt$🪑$txt$,
    $txt$Eng katta mebel ko'rgazmasi Xitoyda.$txt$,
    'https://www.furniture-china.cn',
    'https://www.furniture-china.cn',
    $txt$Yiliga 1 marta$txt$,
    $txt$Sentyabrda bo'ladi$txt$,
    'verified', true, 5,
    '2026-09-08', '2026-09-11'
  )
ON CONFLICT (slug) DO NOTHING;

-- ── Editions: 8 rows, idempotent via WHERE NOT EXISTS ─────────
-- Keyed on (exhibition_id, start_date) — within a single exhibition
-- two editions cannot share a start date in the source data.

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, $txt$Spring Phase 1 (Elektronika)$txt$, 2026,
       '2026-04-15'::date, '2026-04-19'::date,
       'Phase 1 halls', true, NULL
FROM   public.exhibitions e
WHERE  e.slug = 'canton-fair'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-04-15'::date
  );

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, $txt$Spring Phase 2 (Iste'mol mollar)$txt$, 2026,
       '2026-04-23'::date, '2026-04-27'::date,
       'Phase 2 halls', true, NULL
FROM   public.exhibitions e
WHERE  e.slug = 'canton-fair'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-04-23'::date
  );

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, $txt$Spring Phase 3 (Kiyim va to'qimachilik)$txt$, 2026,
       '2026-05-01'::date, '2026-05-05'::date,
       'Phase 3 halls', true, NULL
FROM   public.exhibitions e
WHERE  e.slug = 'canton-fair'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-05-01'::date
  );

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, 'Autumn Phase 1', 2026,
       '2026-10-15'::date, '2026-10-19'::date,
       'Phase 1 halls', true, NULL
FROM   public.exhibitions e
WHERE  e.slug = 'canton-fair'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-10-15'::date
  );

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, '2026 Yearly', 2026,
       '2026-11-05'::date, '2026-11-10'::date,
       NULL, true, NULL
FROM   public.exhibitions e
WHERE  e.slug = 'ciie'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-11-05'::date
  );

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, '2026 Autumn', 2026,
       '2026-10-21'::date, '2026-10-25'::date,
       NULL, true, NULL
FROM   public.exhibitions e
WHERE  e.slug = 'yiwu-fair'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-10-21'::date
  );

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, '2026', 2026,
       '2026-11-24'::date, '2026-11-27'::date,
       NULL,
       false,
       $txt$Sana tasdiqlanmagan — tekshirish kerak$txt$
FROM   public.exhibitions e
WHERE  e.slug = 'bauma-china'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-11-24'::date
  );

INSERT INTO public.exhibition_editions (
  exhibition_id, edition_label, year, start_date, end_date,
  venue_override, is_confirmed, confirmation_note
)
SELECT e.id, '2026', 2026,
       '2026-09-08'::date, '2026-09-11'::date,
       NULL, true, NULL
FROM   public.exhibitions e
WHERE  e.slug = 'furniture-china'
  AND  NOT EXISTS (
    SELECT 1 FROM public.exhibition_editions x
    WHERE x.exhibition_id = e.id AND x.start_date = '2026-09-08'::date
  );
