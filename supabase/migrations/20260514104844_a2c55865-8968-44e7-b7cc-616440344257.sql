
-- Add country_emoji to exhibitions
ALTER TABLE public.exhibitions ADD COLUMN IF NOT EXISTS country_emoji TEXT;

-- Backfill exhibition start_date/end_date from earliest (preferring 2026) edition
UPDATE public.exhibitions e
SET start_date = sub.start_date,
    end_date = sub.end_date
FROM (
  SELECT DISTINCT ON (exhibition_id)
    exhibition_id, start_date, end_date
  FROM public.exhibition_editions
  WHERE start_date IS NOT NULL
  ORDER BY exhibition_id,
    CASE WHEN year = 2026 THEN 0 ELSE 1 END,
    start_date ASC
) sub
WHERE e.id = sub.exhibition_id
  AND (e.start_date IS NULL OR e.start_date < '2020-01-01');

-- Fix foreign city flags
UPDATE public.cities SET country='Germany', country_emoji='🇩🇪' WHERE LOWER(name_en)='nuremberg' OR slug='nuremberg';
UPDATE public.cities SET country='Germany', country_emoji='🇩🇪' WHERE LOWER(name_en)='frankfurt' OR slug='frankfurt';
UPDATE public.cities SET country='USA', country_emoji='🇺🇸' WHERE LOWER(name_en)='new york' OR slug='new-york';
UPDATE public.cities SET country='USA', country_emoji='🇺🇸' WHERE LOWER(name_en)='las vegas' OR slug='las-vegas';
UPDATE public.cities SET country='UK', country_emoji='🇬🇧' WHERE LOWER(name_en)='london' OR slug='london';
UPDATE public.cities SET country='Turkey', country_emoji='🇹🇷' WHERE LOWER(name_en)='istanbul' OR slug='istanbul';
UPDATE public.cities SET country='UAE', country_emoji='🇦🇪' WHERE LOWER(name_en)='dubai' OR slug='dubai';
UPDATE public.cities SET country='Russia', country_emoji='🇷🇺' WHERE LOWER(name_en) LIKE '%petersburg%' OR slug='saint-petersburg';
UPDATE public.cities SET country='France', country_emoji='🇫🇷' WHERE LOWER(name_en)='paris' OR slug='paris';
UPDATE public.cities SET country='India', country_emoji='🇮🇳' WHERE LOWER(name_en)='mumbai' OR slug='mumbai';
UPDATE public.cities SET country='Hong Kong SAR', country_emoji='🇭🇰' WHERE slug='hong-kong';

-- Backfill exhibitions.country_emoji
UPDATE public.exhibitions SET country_emoji =
  CASE country
    WHEN 'Germany' THEN '🇩🇪'
    WHEN 'USA' THEN '🇺🇸'
    WHEN 'UK' THEN '🇬🇧'
    WHEN 'Turkey' THEN '🇹🇷'
    WHEN 'UAE' THEN '🇦🇪'
    WHEN 'Russia' THEN '🇷🇺'
    WHEN 'France' THEN '🇫🇷'
    WHEN 'India' THEN '🇮🇳'
    WHEN 'Hong Kong SAR' THEN '🇭🇰'
    WHEN 'China' THEN '🇨🇳'
    ELSE '🇨🇳'
  END
WHERE country_emoji IS NULL;
