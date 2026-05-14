
CREATE TABLE IF NOT EXISTS public.exhibition_category_links (
  id SERIAL PRIMARY KEY,
  exhibition_id UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.exhibition_categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(exhibition_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_exh_cat_links_exh ON public.exhibition_category_links(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exh_cat_links_cat ON public.exhibition_category_links(category_id);

ALTER TABLE public.exhibition_category_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON public.exhibition_category_links;
CREATE POLICY "Public read access" ON public.exhibition_category_links
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write" ON public.exhibition_category_links;
CREATE POLICY "Admin write" ON public.exhibition_category_links
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Backfill primary
INSERT INTO public.exhibition_category_links (exhibition_id, category_id, is_primary)
SELECT id, category_id, TRUE
FROM public.exhibitions
WHERE category_id IS NOT NULL AND is_active = TRUE
ON CONFLICT (exhibition_id, category_id) DO UPDATE SET is_primary = TRUE;

-- Secondary links
INSERT INTO public.exhibition_category_links (exhibition_id, category_id, is_primary)
SELECT e.id, c.id, FALSE
FROM public.exhibitions e, public.exhibition_categories c
WHERE (e.slug, c.slug) IN (
  ('ambiente-frankfurt', 'ceramics-glass'),
  ('maison-objet-paris', 'ceramics-glass'),
  ('ny-now', 'ceramics-glass'),
  ('tendence-frankfurt', 'ceramics-glass'),
  ('canton-fair', 'ceramics-glass'),
  ('canton-fair', 'gifts'),
  ('home-instyle-hk', 'sanitaryware'),
  ('home-instyle-hk', 'kitchen')
)
ON CONFLICT (exhibition_id, category_id) DO NOTHING;
