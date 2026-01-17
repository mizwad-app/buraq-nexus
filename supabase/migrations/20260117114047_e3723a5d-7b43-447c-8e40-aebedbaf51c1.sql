-- Add image_url column to shopping_malls table
ALTER TABLE public.shopping_malls ADD COLUMN IF NOT EXISTS image_url TEXT;