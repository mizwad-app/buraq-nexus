-- Add missing columns to wholesale_markets
ALTER TABLE wholesale_markets
  ADD COLUMN IF NOT EXISTS name_zh text,
  ADD COLUMN IF NOT EXISTS address_zh text,
  ADD COLUMN IF NOT EXISTS opening_hours text,
  ADD COLUMN IF NOT EXISTS is_mizwad_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS shop_count_estimate text,
  ADD COLUMN IF NOT EXISTS area_description text;

-- Add missing 'ceramics' category required by TZ
INSERT INTO product_categories (slug, name, emoji, is_active)
VALUES ('ceramics', 'Chinni va keramika', '🏺', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true, emoji = EXCLUDED.emoji;