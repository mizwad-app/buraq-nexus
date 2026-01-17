-- Create wholesale_markets table
CREATE TABLE public.wholesale_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'China',
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wholesale_markets ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Wholesale markets are viewable by everyone" 
ON public.wholesale_markets 
FOR SELECT 
USING (true);

-- Create production_hubs table
CREATE TABLE public.production_hubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'China',
  industry TEXT NOT NULL,
  description TEXT,
  specializations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_hubs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Production hubs are viewable by everyone" 
ON public.production_hubs 
FOR SELECT 
USING (true);

-- Create exhibitions table
CREATE TABLE public.exhibitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'China',
  venue TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exhibitions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Exhibitions are viewable by everyone" 
ON public.exhibitions 
FOR SELECT 
USING (true);

-- Create companies table for reliability search
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'China',
  industry TEXT NOT NULL,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  verified BOOLEAN DEFAULT false,
  years_in_business INTEGER,
  description TEXT,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Companies are viewable by everyone" 
ON public.companies 
FOR SELECT 
USING (true);

-- Insert sample data for wholesale markets
INSERT INTO public.wholesale_markets (city, country, category, name, description) VALUES
('Shenzhen', 'China', 'Electronics', 'Huaqiangbei Electronics Market', 'World''s largest electronics market'),
('Yiwu', 'China', 'General Goods', 'Yiwu International Trade City', 'Largest small commodities market'),
('Guangzhou', 'China', 'Textiles', 'Zhongda Fabric Market', 'Asia''s largest fabric wholesale market'),
('Foshan', 'China', 'Furniture', 'Lecong Furniture City', 'Largest furniture wholesale center'),
('Hangzhou', 'China', 'Silk', 'China Silk City', 'Premier silk and textile market');

-- Insert sample data for production hubs
INSERT INTO public.production_hubs (city, country, industry, description, specializations) VALUES
('Shenzhen', 'China', 'Electronics', 'Global electronics manufacturing hub', ARRAY['Smartphones', 'PCB', 'LED', 'Consumer Electronics']),
('Foshan', 'China', 'Furniture', 'China''s furniture capital', ARRAY['Home Furniture', 'Office Furniture', 'Outdoor Furniture']),
('Dongguan', 'China', 'Toys', 'World toy manufacturing center', ARRAY['Plastic Toys', 'Electronic Toys', 'Educational Toys']),
('Wenzhou', 'China', 'Shoes', 'Major footwear production hub', ARRAY['Leather Shoes', 'Sports Shoes', 'Sandals']),
('Jinhua', 'China', 'Hardware', 'Hardware and tools manufacturing', ARRAY['Hand Tools', 'Power Tools', 'Locks']);

-- Insert sample data for exhibitions
INSERT INTO public.exhibitions (name, city, country, venue, start_date, end_date, category, description) VALUES
('Canton Fair Phase 1', 'Guangzhou', 'China', 'Canton Fair Complex', '2026-04-15', '2026-04-19', 'General', 'China''s largest trade fair - Electronics & Machinery'),
('Canton Fair Phase 2', 'Guangzhou', 'China', 'Canton Fair Complex', '2026-04-23', '2026-04-27', 'General', 'Consumer goods, gifts, home decorations'),
('CIFF Furniture Fair', 'Guangzhou', 'China', 'PWTC Expo', '2026-03-18', '2026-03-21', 'Furniture', 'China International Furniture Fair'),
('Hong Kong Electronics Fair', 'Hong Kong', 'China', 'HKCEC', '2026-10-13', '2026-10-16', 'Electronics', 'Asia''s largest electronics fair');

-- Insert sample companies
INSERT INTO public.companies (name, city, country, industry, rating, verified, years_in_business, description) VALUES
('Shenzhen Tech Co.', 'Shenzhen', 'China', 'Electronics', 4.5, true, 12, 'Leading electronics manufacturer'),
('Foshan Furniture Ltd.', 'Foshan', 'China', 'Furniture', 4.2, true, 8, 'Premium furniture exporter'),
('Yiwu Trading Inc.', 'Yiwu', 'China', 'General Goods', 3.8, false, 5, 'Small commodities wholesaler');