CREATE TABLE IF NOT EXISTS public.china_cities (
  slug text PRIMARY KEY,
  name_uz text NOT NULL,
  name_en text,
  name_zh text,
  latitude numeric(10, 6) NOT NULL,
  longitude numeric(10, 6) NOT NULL,
  province text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.china_cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "China cities are publicly readable" ON public.china_cities;
CREATE POLICY "China cities are publicly readable" ON public.china_cities
  FOR SELECT USING (true);

INSERT INTO public.china_cities (slug, name_uz, name_en, name_zh, latitude, longitude, province) VALUES
  ('guangzhou', 'Guangzhou', 'Guangzhou', '广州', 23.1291, 113.2644, 'Guangdong'),
  ('shenzhen', 'Shenzhen', 'Shenzhen', '深圳', 22.5431, 114.0579, 'Guangdong'),
  ('foshan', 'Foshan', 'Foshan', '佛山', 23.0218, 113.1219, 'Guangdong'),
  ('zhongshan', 'Zhongshan', 'Zhongshan', '中山', 22.5176, 113.3928, 'Guangdong'),
  ('quanzhou', 'Quanzhou', 'Quanzhou', '泉州', 24.8741, 118.6757, 'Fujian'),
  ('yiwu', 'Yiwu', 'Yiwu', '义乌', 29.3055, 120.0760, 'Zhejiang'),
  ('hangzhou', 'Hangchjou', 'Hangzhou', '杭州', 30.2741, 120.1551, 'Zhejiang'),
  ('shanghai', 'Shanxay', 'Shanghai', '上海', 31.2304, 121.4737, 'Shanghai'),
  ('beijing', 'Pekin', 'Beijing', '北京', 39.9042, 116.4074, 'Beijing'),
  ('chengdu', 'Chengdu', 'Chengdu', '成都', 30.5728, 104.0668, 'Sichuan'),
  ('chongqing', 'Chongqing', 'Chongqing', '重庆', 29.4316, 106.9123, 'Chongqing'),
  ('jinan', 'Jinan', 'Jinan', '济南', 36.6512, 117.1201, 'Shandong'),
  ('kunming', 'Kunming', 'Kunming', '昆明', 25.0389, 102.7183, 'Yunnan'),
  ('lanzhou', 'Lanchjou', 'Lanzhou', '兰州', 36.0611, 103.8343, 'Gansu'),
  ('nanjing', 'Nanjing', 'Nanjing', '南京', 32.0603, 118.7969, 'Jiangsu'),
  ('shenyang', 'Shenyang', 'Shenyang', '沈阳', 41.8057, 123.4315, 'Liaoning'),
  ('tianjin', 'Tyantszin', 'Tianjin', '天津', 39.0842, 117.2010, 'Tianjin'),
  ('urumqi', 'Urumchi', 'Urumqi', '乌鲁木齐', 43.8256, 87.6168, 'Xinjiang'),
  ('wuhan', 'Wuhan', 'Wuhan', '武汉', 30.5928, 114.3055, 'Hubei')
ON CONFLICT (slug) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;