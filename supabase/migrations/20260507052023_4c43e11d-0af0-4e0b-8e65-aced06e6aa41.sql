ALTER TABLE exhibitions
  ADD COLUMN IF NOT EXISTS phase_info_uz text,
  ADD COLUMN IF NOT EXISTS phase_info_ru text,
  ADD COLUMN IF NOT EXISTS phase_info_en text,
  ADD COLUMN IF NOT EXISTS phase_number integer;