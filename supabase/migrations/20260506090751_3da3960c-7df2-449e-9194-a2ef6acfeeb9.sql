
CREATE TABLE IF NOT EXISTS public.category_markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL REFERENCES public.product_categories(slug) ON DELETE CASCADE,
  market_id uuid NOT NULL REFERENCES public.wholesale_markets(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_slug, market_id)
);

CREATE TABLE IF NOT EXISTS public.category_hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL REFERENCES public.product_categories(slug) ON DELETE CASCADE,
  hub_id uuid NOT NULL REFERENCES public.production_hubs(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_slug, hub_id)
);

CREATE TABLE IF NOT EXISTS public.category_exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug text NOT NULL REFERENCES public.product_categories(slug) ON DELETE CASCADE,
  exhibition_id uuid NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_slug, exhibition_id)
);

ALTER TABLE public.category_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_exhibitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_category_markets" ON public.category_markets FOR SELECT USING (true);
CREATE POLICY "admin_write_category_markets" ON public.category_markets FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "public_read_category_hubs" ON public.category_hubs FOR SELECT USING (true);
CREATE POLICY "admin_write_category_hubs" ON public.category_hubs FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "public_read_category_exhibitions" ON public.category_exhibitions FOR SELECT USING (true);
CREATE POLICY "admin_write_category_exhibitions" ON public.category_exhibitions FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_category_markets_slug ON public.category_markets(category_slug);
CREATE INDEX IF NOT EXISTS idx_category_hubs_slug ON public.category_hubs(category_slug);
CREATE INDEX IF NOT EXISTS idx_category_exhibitions_slug ON public.category_exhibitions(category_slug);

-- Seed via SQL fuzzy match (mirrors src/lib/businessCategoryMatch.ts FUZZY_MATCHES)
DO $$
DECLARE
  patterns jsonb := jsonb_build_object(
    'furniture', ARRAY['furniture','mebel','顺德','乐从','红星'],
    'consumer_electronics', ARRAY['electronics','电子','elektronika'],
    'computer_accessories', ARRAY['computer','kompyuter','电脑','数码','赛格'],
    'mobile_accessories', ARRAY['phone','telefon','手机','accessories','南方大厦','新亚洲','南泰'],
    'apparel_accessories', ARRAY['clothing','garments','kiyim','服装','textiles','baima','白马','textile'],
    'lights_lighting', ARRAY['lights','lighting','灯','yoritish','灯都'],
    'gifts_crafts', ARRAY['toys','gifts','o''yinchoq','小商品','yiwu'],
    'kids_toys', ARRAY['toys','o''yinchoq','玩具','yiwu'],
    'shoes_accessories', ARRAY['shoes','footwear','poyabzal','鞋'],
    'sportswear', ARRAY['sport','sports','运动'],
    'jewelry', ARRAY['珠宝','zargarlik','jewelry'],
    'vehicle_parts', ARRAY['auto','car','avto','avtomobil','汽车','vehicle'],
    'construction_materials', ARRAY['construction','building','qurilish','材料']
  );
  cat record;
  pat text;
  pats text[];
BEGIN
  FOR cat IN SELECT slug, name FROM public.product_categories WHERE is_active = true LOOP
    pats := COALESCE((SELECT array_agg(value) FROM jsonb_array_elements_text(patterns->cat.slug)), ARRAY[]::text[]);
    pats := pats || cat.slug || cat.name;

    -- markets
    INSERT INTO public.category_markets (category_slug, market_id)
    SELECT cat.slug, m.id FROM public.wholesale_markets m
    WHERE m.is_active = true AND EXISTS (
      SELECT 1 FROM unnest(pats) p WHERE m.category ILIKE '%' || p || '%' OR m.name ILIKE '%' || p || '%'
    )
    ON CONFLICT DO NOTHING;

    -- hubs
    INSERT INTO public.category_hubs (category_slug, hub_id)
    SELECT cat.slug, h.id FROM public.production_hubs h
    WHERE h.is_active = true AND EXISTS (
      SELECT 1 FROM unnest(pats) p WHERE h.industry ILIKE '%' || p || '%'
    )
    ON CONFLICT DO NOTHING;

    -- exhibitions
    INSERT INTO public.category_exhibitions (category_slug, exhibition_id)
    SELECT cat.slug, e.id FROM public.exhibitions e
    WHERE e.is_active = true AND EXISTS (
      SELECT 1 FROM unnest(pats) p WHERE e.category ILIKE '%' || p || '%' OR e.name ILIKE '%' || p || '%'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
