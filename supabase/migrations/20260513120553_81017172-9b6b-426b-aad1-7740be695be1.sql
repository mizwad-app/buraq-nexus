ALTER TABLE exhibitions 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS is_international BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS data_confidence TEXT DEFAULT 'green' CHECK (data_confidence IN ('green', 'yellow', 'red')),
  ADD COLUMN IF NOT EXISTS country_type TEXT DEFAULT 'china' CHECK (country_type IN ('china', 'world'));

UPDATE exhibitions 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    COALESCE(name_en, name_uz, name), 
    '\s*[—\-:()]\s*', '-', 'g'
  ),
  '[^a-z0-9\-]+', '', 'g'
))
WHERE slug IS NULL;

UPDATE exhibitions SET slug = TRIM(BOTH '-' FROM slug) WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS exhibitions_slug_unique ON exhibitions(slug);

ALTER TABLE exhibitions ALTER COLUMN slug SET NOT NULL;

UPDATE exhibitions 
SET is_active = false, country_type = 'world'
WHERE name_uz ~* 'Berlin|Taipei|Paris|Munich|Dubai|Barcelona|Frankfurt|Las\s*Vegas|Milan|CES';