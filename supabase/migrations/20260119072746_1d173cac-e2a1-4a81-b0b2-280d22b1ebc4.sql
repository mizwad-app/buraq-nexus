-- Create product_categories table with multilingual support
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_uz TEXT,
  name_ru TEXT,
  name_en TEXT,
  name_ar TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Product categories are viewable by everyone" 
ON public.product_categories 
FOR SELECT 
USING (true);

-- Create junction table for markets and product categories
CREATE TABLE public.market_product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID NOT NULL REFERENCES public.wholesale_markets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(market_id, category_id)
);

-- Enable RLS
ALTER TABLE public.market_product_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Market product categories are viewable by everyone" 
ON public.market_product_categories 
FOR SELECT 
USING (true);

-- Create junction table for production hubs and product categories
CREATE TABLE public.hub_product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hub_id UUID NOT NULL REFERENCES public.production_hubs(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hub_id, category_id)
);

-- Enable RLS
ALTER TABLE public.hub_product_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Hub product categories are viewable by everyone" 
ON public.hub_product_categories 
FOR SELECT 
USING (true);

-- Insert product categories with translations
INSERT INTO public.product_categories (slug, name, name_uz, name_ru, name_en, name_ar, icon) VALUES
('phone_accessories', 'Telefon aksessuarlari', 'Telefon aksessuarlari', 'Аксессуары для телефонов', 'Phone Accessories', 'إكسسوارات الهاتف', 'smartphone'),
('building_materials', 'Qurilish materiallari', 'Qurilish materiallari', 'Строительные материалы', 'Building Materials', 'مواد البناء', 'building'),
('laminate_flooring', 'Laminat/Parket', 'Laminat/Parket', 'Ламинат/Паркет', 'Laminate/Flooring', 'الأرضيات الخشبية', 'layers'),
('textiles', 'Tekstil', 'Tekstil', 'Текстиль', 'Textiles', 'المنسوجات', 'shirt'),
('electronics', 'Elektronika', 'Elektronika', 'Электроника', 'Electronics', 'الإلكترونيات', 'cpu'),
('furniture', 'Mebel', 'Mebel', 'Мебель', 'Furniture', 'الأثاث', 'sofa'),
('toys', 'O''yinchoqlar', 'O''yinchoqlar', 'Игрушки', 'Toys', 'ألعاب', 'gamepad'),
('shoes', 'Poyabzal', 'Poyabzal', 'Обувь', 'Shoes', 'أحذية', 'footprints'),
('garments', 'Kiyimlar', 'Kiyimlar', 'Одежда', 'Garments', 'ملابس', 'shirt'),
('watches', 'Soatlar', 'Soatlar', 'Часы', 'Watches', 'ساعات', 'watch');