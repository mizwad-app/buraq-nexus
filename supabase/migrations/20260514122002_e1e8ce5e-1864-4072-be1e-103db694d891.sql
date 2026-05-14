
-- STEP 1: Add parent_id (UUID, since product_categories.id is UUID)
ALTER TABLE product_categories 
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES product_categories(id);

ALTER TABLE product_categories
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100;

CREATE INDEX IF NOT EXISTS idx_product_categories_parent 
  ON product_categories(parent_id);

-- STEP 2: Insert 4 GROUPS
INSERT INTO product_categories (slug, emoji, name, name_uz, name_en, name_ru, name_ar, name_zh, parent_id, is_active, sort_order)
VALUES
  ('construction-group', '🏗️', 'Construction & Building', 'Qurilish va bino', 'Construction & Building', 'Строительство и здания', 'البناء والإنشاءات', '建筑与施工', NULL, TRUE, 1),
  ('electronics-group', '📱', 'Electronics', 'Elektronika', 'Electronics', 'Электроника', 'الإلكترونيات', '电子产品', NULL, TRUE, 2),
  ('general-group', '🌐', 'General & Consumer', 'Umumiy iste''mol', 'General & Consumer', 'Общее потребление', 'الاستهلاك العام', '一般消费', NULL, TRUE, 3),
  ('apparel-group', '👔', 'Apparel & Fashion', 'Kiyim va moda', 'Apparel & Fashion', 'Одежда и мода', 'الملابس والأزياء', '服装与时尚', NULL, TRUE, 4)
ON CONFLICT (slug) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name_uz = EXCLUDED.name_uz, name_en = EXCLUDED.name_en, name_ru = EXCLUDED.name_ru,
  name_ar = EXCLUDED.name_ar, name_zh = EXCLUDED.name_zh,
  sort_order = EXCLUDED.sort_order, is_active = TRUE, parent_id = NULL;

-- STEP 3: Insert 6 NEW sub-categories
INSERT INTO product_categories (slug, emoji, name, name_uz, name_en, name_ru, name_ar, name_zh, parent_id, is_active, sort_order)
VALUES
  ('underwear', '🩲', 'Underwear', 'Ichki kiyim', 'Underwear', 'Нижнее бельё', 'الملابس الداخلية', '内衣',
    (SELECT id FROM product_categories WHERE slug = 'apparel-group'), TRUE, 13),
  ('pajamas', '🛌', 'Pajamas & Loungewear', 'Pijama, uy kiyimi', 'Pajamas & Loungewear', 'Пижамы и домашняя одежда', 'البيجامات', '睡衣',
    (SELECT id FROM product_categories WHERE slug = 'apparel-group'), TRUE, 14),
  ('kitchen', '🍳', 'Kitchen', 'Oshxona jihoz', 'Kitchen', 'Кухонное оборудование', 'مطبخ', '厨房用品', NULL, TRUE, 20),
  ('sanitaryware', '🛁', 'Sanitaryware', 'Sanitariya', 'Sanitaryware', 'Сантехника', 'الأدوات الصحية', '卫浴',
    (SELECT id FROM product_categories WHERE slug = 'construction-group'), TRUE, 15),
  ('ceramics-glass', '🍷', 'Ceramics & Glass', 'Chinni va shisha', 'Ceramics & Glass', 'Фарфор и стекло', 'الخزف والزجاج', '陶瓷与玻璃', NULL, TRUE, 21),
  ('ceramics-tiles', '🟫', 'Ceramic Tiles', 'Kafel', 'Ceramic Tiles', 'Керамическая плитка', 'البلاط', '瓷砖',
    (SELECT id FROM product_categories WHERE slug = 'construction-group'), TRUE, 16)
ON CONFLICT (slug) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  name_uz = EXCLUDED.name_uz, name_en = EXCLUDED.name_en, name_ru = EXCLUDED.name_ru,
  name_ar = EXCLUDED.name_ar, name_zh = EXCLUDED.name_zh,
  parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order, is_active = TRUE;

-- STEP 4: Link existing categories to groups (using ACTUAL slugs in this DB)
UPDATE product_categories SET parent_id = (SELECT id FROM product_categories WHERE slug = 'construction-group')
WHERE slug IN ('construction_materials', 'lights_lighting', 'industrial_machinery', 'construction_machinery');

UPDATE product_categories SET parent_id = (SELECT id FROM product_categories WHERE slug = 'electronics-group')
WHERE slug IN ('consumer_electronics', 'mobile_accessories', 'computer_accessories', 'electronic_components', 'electrical_equipment');

UPDATE product_categories SET parent_id = (SELECT id FROM product_categories WHERE slug = 'general-group')
WHERE slug IN ('general', 'gifts_crafts', 'home_garden', 'home_appliances');

UPDATE product_categories SET parent_id = (SELECT id FROM product_categories WHERE slug = 'apparel-group')
WHERE slug IN ('apparel_accessories', 'shoes_accessories', 'sportswear');

-- Re-purpose old 'ceramics' to construction sub
UPDATE product_categories SET 
  parent_id = (SELECT id FROM product_categories WHERE slug = 'construction-group'),
  emoji = '🏺',
  name = 'Ceramics (construction)',
  name_uz = 'Sopol (qurilish)',
  name_en = 'Ceramics (construction)',
  name_ru = 'Керамика (строительная)'
WHERE slug = 'ceramics';

-- Deprecate kitchen-bath
UPDATE product_categories SET is_active = FALSE WHERE slug = 'kitchen-bath';
