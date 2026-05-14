ALTER TABLE exhibition_categories 
  ADD COLUMN IF NOT EXISTS parent_id INTEGER 
  REFERENCES exhibition_categories(id);

CREATE INDEX IF NOT EXISTS idx_exhibition_categories_parent 
  ON exhibition_categories(parent_id);