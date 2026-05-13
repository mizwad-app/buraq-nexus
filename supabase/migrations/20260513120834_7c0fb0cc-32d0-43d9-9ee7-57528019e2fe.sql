CREATE TABLE IF NOT EXISTS exhibition_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
  edition_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  year INTEGER NOT NULL,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_editions_exhibition ON exhibition_editions(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_editions_year ON exhibition_editions(year);
CREATE INDEX IF NOT EXISTS idx_editions_dates ON exhibition_editions(start_date, end_date);

ALTER TABLE exhibition_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read editions" ON exhibition_editions 
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage editions" ON exhibition_editions 
  FOR ALL USING (has_role(auth.uid(), 'admin'));