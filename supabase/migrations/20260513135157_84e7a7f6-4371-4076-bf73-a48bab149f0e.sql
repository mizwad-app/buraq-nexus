CREATE TABLE IF NOT EXISTS public.exhibition_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_ar TEXT,
  name_zh TEXT,
  insight_slug TEXT,
  sort_order INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exhibition_categories_slug ON public.exhibition_categories(slug);
CREATE INDEX IF NOT EXISTS idx_exhibition_categories_active_sort ON public.exhibition_categories(is_active, sort_order);

COMMENT ON TABLE public.exhibition_categories IS 'Categories for exhibitions. Separate from Insights V1 (markets module). Cross-link via insight_slug.';
COMMENT ON COLUMN public.exhibition_categories.insight_slug IS 'Optional reference to mizwad_insights.slug — for cross-module data sharing';

ALTER TABLE public.exhibition_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exhibition_categories_select_public"
  ON public.exhibition_categories FOR SELECT
  USING (true);

CREATE POLICY "exhibition_categories_admin_all"
  ON public.exhibition_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_exhibition_categories_updated_at
  BEFORE UPDATE ON public.exhibition_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.exhibitions
  ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES public.exhibition_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_exhibitions_category_id ON public.exhibitions(category_id);

COMMENT ON COLUMN public.exhibitions.category_id IS 'FK to exhibition_categories.id. Replaces deprecated text column "category". NULL = uncategorized.';