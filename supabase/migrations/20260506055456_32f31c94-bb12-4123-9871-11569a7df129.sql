
ALTER TABLE public.product_categories
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS emoji text;

UPDATE public.product_categories SET is_active = true, emoji = '🪑' WHERE slug = 'furniture';
UPDATE public.product_categories SET is_active = true, emoji = '📱' WHERE slug = 'consumer_electronics';
UPDATE public.product_categories SET is_active = true, emoji = '👔' WHERE slug = 'apparel_accessories';
UPDATE public.product_categories SET is_active = true, emoji = '🚗' WHERE slug = 'vehicle_parts';
UPDATE public.product_categories SET is_active = true, emoji = '🧱' WHERE slug = 'construction_materials';
UPDATE public.product_categories SET is_active = true, emoji = '📲' WHERE slug = 'mobile_accessories';
UPDATE public.product_categories SET is_active = true, emoji = '🎁' WHERE slug = 'gifts_crafts';
UPDATE public.product_categories SET is_active = true, emoji = '👟' WHERE slug = 'shoes_accessories';
UPDATE public.product_categories SET is_active = true, emoji = '💍' WHERE slug = 'jewelry';
UPDATE public.product_categories SET is_active = true, emoji = '🧸' WHERE slug = 'kids_toys';
UPDATE public.product_categories SET is_active = true, emoji = '💡' WHERE slug = 'lights_lighting';
UPDATE public.product_categories SET is_active = true, emoji = '💻' WHERE slug = 'computer_accessories';
UPDATE public.product_categories SET is_active = true, emoji = '⚽' WHERE slug = 'sportswear';

CREATE TABLE IF NOT EXISTS public.mizwad_city_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL,
  city text NOT NULL,
  insight_uz text NOT NULL,
  insight_ru text,
  insight_en text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(category_slug, city)
);

ALTER TABLE public.mizwad_city_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read insights"
  ON public.mizwad_city_insights FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage insights"
  ON public.mizwad_city_insights FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.mizwad_city_insights (category_slug, city, insight_uz) VALUES
  ('furniture', 'Foshan', 'Xitoyning mebel poytaxti. Lecong va Shunde — eng katta optom markazlar.'),
  ('consumer_electronics', 'Shenzhen', 'Huaqiangbei — dunyodagi eng katta elektronika bozori.'),
  ('apparel_accessories', 'Guangzhou', 'Baima va Shahe bozorlari. Canton Fair Phase 3 mato uchun.'),
  ('vehicle_parts', 'Guangzhou', 'Yuexiu va Baiyun zonalari avto qismlar markazi.'),
  ('kids_toys', 'Yiwu', 'Yiwu International Trade City — dunyo o''yinchoq markazi.')
ON CONFLICT (category_slug, city) DO NOTHING;
