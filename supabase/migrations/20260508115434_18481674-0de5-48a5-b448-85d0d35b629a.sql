ALTER TABLE public.china_cities ADD COLUMN IF NOT EXISTS name_zh text;
ALTER TABLE public.china_cities ADD COLUMN IF NOT EXISTS province text;

INSERT INTO public.china_cities (slug, name_uz, name_en, name_zh, latitude, longitude, province, is_active) VALUES
  ('guangzhou', 'Guangzhou', 'Guangzhou', '广州', 23.1291, 113.2644, 'Guangdong', true),
  ('shenzhen', 'Shenzhen', 'Shenzhen', '深圳', 22.5431, 114.0579, 'Guangdong', true),
  ('foshan', 'Foshan', 'Foshan', '佛山', 23.0218, 113.1219, 'Guangdong', true),
  ('zhongshan', 'Zhongshan', 'Zhongshan', '中山', 22.5176, 113.3928, 'Guangdong', true),
  ('quanzhou', 'Quanzhou', 'Quanzhou', '泉州', 24.8741, 118.6757, 'Fujian', true),
  ('yiwu', 'Yiwu', 'Yiwu', '义乌', 29.3055, 120.0760, 'Zhejiang', true),
  ('hangzhou', 'Hangchjou', 'Hangzhou', '杭州', 30.2741, 120.1551, 'Zhejiang', true),
  ('shanghai', 'Shanxay', 'Shanghai', '上海', 31.2304, 121.4737, 'Shanghai', true),
  ('beijing', 'Pekin', 'Beijing', '北京', 39.9042, 116.4074, 'Beijing', true),
  ('chengdu', 'Chengdu', 'Chengdu', '成都', 30.5728, 104.0668, 'Sichuan', true),
  ('chongqing', 'Chongqing', 'Chongqing', '重庆', 29.4316, 106.9123, 'Chongqing', true),
  ('jinan', 'Jinan', 'Jinan', '济南', 36.6512, 117.1201, 'Shandong', true),
  ('kunming', 'Kunming', 'Kunming', '昆明', 25.0389, 102.7183, 'Yunnan', true),
  ('lanzhou', 'Lanchjou', 'Lanzhou', '兰州', 36.0611, 103.8343, 'Gansu', true),
  ('nanjing', 'Nanjing', 'Nanjing', '南京', 32.0603, 118.7969, 'Jiangsu', true),
  ('shenyang', 'Shenyang', 'Shenyang', '沈阳', 41.8057, 123.4315, 'Liaoning', true),
  ('tianjin', 'Tyantszin', 'Tianjin', '天津', 39.0842, 117.2010, 'Tianjin', true),
  ('urumqi', 'Urumchi', 'Urumqi', '乌鲁木齐', 43.8256, 87.6168, 'Xinjiang', true),
  ('wuhan', 'Wuhan', 'Wuhan', '武汉', 30.5928, 114.3055, 'Hubei', true)
ON CONFLICT (slug) DO UPDATE SET
  name_zh = EXCLUDED.name_zh,
  province = EXCLUDED.province,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  is_active = true;