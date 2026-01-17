-- Add image_url column to mosques table
ALTER TABLE public.mosques ADD COLUMN IF NOT EXISTS image_url text;

-- Add image_url column to restaurants table
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS image_url text;