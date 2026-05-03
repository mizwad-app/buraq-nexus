CREATE TABLE public.legal_advisors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  firm_name text NOT NULL,
  city text NOT NULL,
  specializations text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  phone text,
  wechat_id text,
  email text,
  office_address text,
  bio text,
  bio_uz text,
  bio_ru text,
  bio_en text,
  bio_ar text,
  bio_fr text,
  bio_zh text,
  avatar_url text,
  firm_logo_url text,
  years_experience integer NOT NULL DEFAULT 0,
  buraq_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_advisors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active advisors"
ON public.legal_advisors FOR SELECT
TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert advisors"
ON public.legal_advisors FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update advisors"
ON public.legal_advisors FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete advisors"
ON public.legal_advisors FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_legal_advisors_updated_at
BEFORE UPDATE ON public.legal_advisors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.legal_advisors (name, firm_name, city, specializations, languages, phone, wechat_id, email, office_address, bio, bio_uz, bio_en, years_experience, buraq_verified, display_order) VALUES
('Wang Wei', 'Wang Wei Law Firm', 'Guangzhou', ARRAY['contracts','intellectual_property'], ARRAY['zh','en'], '+86 138 0000 0001', 'wangwei_law', 'wang@example.com', '[PLACEHOLDER] 88 Tianhe Road, Guangzhou', '[PLACEHOLDER] Specialist in supply contracts and IP for export.', '[PLACEHOLDER] Eksport kontraktlari va IP bo''yicha mutaxassis.', '[PLACEHOLDER] Specialist in supply contracts and IP for export.', 12, true, 1),
('Li Zhang', 'Li & Zhang Legal', 'Shanghai', ARRAY['corporate','tax'], ARRAY['zh','en','ru'], '+86 138 0000 0002', 'lizhang_legal', 'lizhang@example.com', '[PLACEHOLDER] 200 Nanjing West Rd, Shanghai', '[PLACEHOLDER] Corporate structuring and cross-border tax.', '[PLACEHOLDER] Korporativ tuzilma va xalqaro soliq.', '[PLACEHOLDER] Corporate structuring and cross-border tax.', 15, true, 2),
('Ahmed Chen', 'Beijing International Law', 'Beijing', ARRAY['disputes','immigration'], ARRAY['zh','en','ar'], '+86 138 0000 0003', 'beijing_intl_law', 'ahmed@example.com', '[PLACEHOLDER] 1 Chaoyang Park, Beijing', '[PLACEHOLDER] Commercial disputes and visa support.', '[PLACEHOLDER] Tijoriy tortishuvlar va viza yordami.', '[PLACEHOLDER] Commercial disputes and visa support.', 8, false, 3),
('Sun Mei', 'Yiwu Trade Law Office', 'Yiwu', ARRAY['contracts','disputes'], ARRAY['zh','en'], '+86 138 0000 0004', 'yiwu_tradelaw', 'sun@example.com', '[PLACEHOLDER] Futian Market District, Yiwu', '[PLACEHOLDER] Trade contracts for Yiwu market buyers.', '[PLACEHOLDER] Yiwu bozori xaridorlari uchun savdo kontraktlari.', '[PLACEHOLDER] Trade contracts for Yiwu market buyers.', 10, true, 4),
('Zhao Lin', 'Shenzhen IP Specialists', 'Shenzhen', ARRAY['intellectual_property','corporate'], ARRAY['zh','en'], '+86 138 0000 0005', 'shenzhen_ip', 'zhao@example.com', '[PLACEHOLDER] Nanshan District, Shenzhen', '[PLACEHOLDER] Trademark and electronics IP protection.', '[PLACEHOLDER] Tovar belgisi va elektronika IP himoyasi.', '[PLACEHOLDER] Trademark and electronics IP protection.', 14, true, 5);