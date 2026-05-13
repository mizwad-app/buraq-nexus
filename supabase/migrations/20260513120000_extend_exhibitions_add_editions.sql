-- ============================================================
-- Phase 1: Extend existing public.exhibitions (additive ALTER)
--          + create public.exhibition_editions
--          + RLS using has_role()
--
-- Existing pages (UpcomingExhibitions, UpcomingExhibitionsPreview,
-- ExhibitionDetail) continue to query public.exhibitions directly
-- and depend on name/city/category/country_code/start_date/end_date —
-- those columns stay untouched. New columns are nullable (slug is
-- backfilled deterministically before NOT NULL is enforced).
-- ============================================================

-- ── 1. Add new columns to exhibitions ─────────────────────────
ALTER TABLE public.exhibitions
  ADD COLUMN IF NOT EXISTS slug                          TEXT,
  ADD COLUMN IF NOT EXISTS category_tag                  TEXT,
  ADD COLUMN IF NOT EXISTS emoji                         TEXT,
  ADD COLUMN IF NOT EXISTS venue_address                 TEXT,
  ADD COLUMN IF NOT EXISTS typical_exhibitors            TEXT,
  ADD COLUMN IF NOT EXISTS typical_visitors              TEXT,
  ADD COLUMN IF NOT EXISTS organizer                     TEXT,
  ADD COLUMN IF NOT EXISTS data_confidence               TEXT
    NOT NULL DEFAULT 'unverified'
    CHECK (data_confidence IN ('verified', 'partial', 'unverified')),
  ADD COLUMN IF NOT EXISTS travel_note_uz                TEXT,
  ADD COLUMN IF NOT EXISTS mizwad_verified               BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mizwad_recommendation_priority INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now();

-- ── 2. Backfill slug for existing rows ────────────────────────
-- Existing rows from the 2026-01-17 sample seed have no slug.
-- Derive from name; collapse non-alphanumerics to hyphens.
UPDATE public.exhibitions
SET slug = trim(BOTH '-' FROM
  lower(regexp_replace(coalesce(name, id::text), '[^a-zA-Z0-9]+', '-', 'g'))
)
WHERE slug IS NULL;

-- Disambiguate any colliding backfilled slugs by appending a short id suffix.
WITH ranked AS (
  SELECT id,
         slug,
         row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
  FROM public.exhibitions
)
UPDATE public.exhibitions e
SET slug = ranked.slug || '-' || substring(e.id::text, 1, 8)
FROM ranked
WHERE ranked.id = e.id
  AND ranked.rn > 1;

ALTER TABLE public.exhibitions
  ALTER COLUMN slug SET NOT NULL;

-- Add UNIQUE only if not already present (re-runnable).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'exhibitions_slug_key'
      AND conrelid = 'public.exhibitions'::regclass
  ) THEN
    ALTER TABLE public.exhibitions
      ADD CONSTRAINT exhibitions_slug_key UNIQUE (slug);
  END IF;
END $$;

-- ── 3. Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exhibitions_slug
  ON public.exhibitions(slug);
CREATE INDEX IF NOT EXISTS idx_exhibitions_mizwad_priority
  ON public.exhibitions(mizwad_recommendation_priority);
CREATE INDEX IF NOT EXISTS idx_exhibitions_data_confidence
  ON public.exhibitions(data_confidence);
CREATE INDEX IF NOT EXISTS idx_exhibitions_mizwad_verified
  ON public.exhibitions(mizwad_verified) WHERE mizwad_verified = true;

-- ── 4. updated_at trigger (reuse repo's existing function) ────
DROP TRIGGER IF EXISTS update_exhibitions_updated_at ON public.exhibitions;
CREATE TRIGGER update_exhibitions_updated_at
  BEFORE UPDATE ON public.exhibitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ── 5. Admin-write RLS for exhibitions ────────────────────────
-- Existing public-read policy ("Exhibitions are viewable by everyone")
-- stays untouched.
DROP POLICY IF EXISTS "exhibitions_admin_write" ON public.exhibitions;
CREATE POLICY "exhibitions_admin_write"
  ON public.exhibitions
  FOR ALL
  TO authenticated
  USING      (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 6. New table: exhibition_editions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exhibition_editions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id     UUID NOT NULL REFERENCES public.exhibitions(id) ON DELETE CASCADE,

  edition_number    TEXT,
  edition_label     TEXT,

  year              INTEGER NOT NULL,
  start_date        DATE,
  end_date          DATE,
  date_text_uz      TEXT,

  city_override     TEXT,
  venue_override    TEXT,

  is_confirmed      BOOLEAN NOT NULL DEFAULT true,
  confirmation_note TEXT,

  is_past           BOOLEAN GENERATED ALWAYS AS (end_date < CURRENT_DATE) STORED,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_editions_exhibition_id
  ON public.exhibition_editions(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_editions_year
  ON public.exhibition_editions(year);
CREATE INDEX IF NOT EXISTS idx_editions_start_date
  ON public.exhibition_editions(start_date);
CREATE INDEX IF NOT EXISTS idx_editions_upcoming
  ON public.exhibition_editions(start_date) WHERE start_date >= CURRENT_DATE;

DROP TRIGGER IF EXISTS update_exhibition_editions_updated_at ON public.exhibition_editions;
CREATE TRIGGER update_exhibition_editions_updated_at
  BEFORE UPDATE ON public.exhibition_editions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.exhibition_editions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exhibition_editions_public_read" ON public.exhibition_editions;
CREATE POLICY "exhibition_editions_public_read"
  ON public.exhibition_editions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "exhibition_editions_admin_write" ON public.exhibition_editions;
CREATE POLICY "exhibition_editions_admin_write"
  ON public.exhibition_editions
  FOR ALL
  TO authenticated
  USING      (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
