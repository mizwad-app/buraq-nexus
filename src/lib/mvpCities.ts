// MVP city scope — 20 strategic Chinese cities (Tier 1 + Tier 2).
// All `name` values match the canonical English spelling stored in the
// `city` column across all place-type tables. Variations such as
// "Xian" (no apostrophe) and "Hongkong" (one word) are handled via
// the lowercase whitelist below.

export interface MvpCity {
  name: string;
  name_uz: string;
  name_zh: string;
  tier: 1 | 2;
}

export const MVP_CITIES: MvpCity[] = [
  // Tier 1
  { name: "Beijing", name_uz: "Pekin", name_zh: "北京", tier: 1 },
  { name: "Shanghai", name_uz: "Shanxay", name_zh: "上海", tier: 1 },
  { name: "Guangzhou", name_uz: "Guangchjou", name_zh: "广州", tier: 1 },
  { name: "Shenzhen", name_uz: "Shenzhen", name_zh: "深圳", tier: 1 },
  { name: "Yiwu", name_uz: "Yiwu", name_zh: "义乌", tier: 1 },
  { name: "Hangzhou", name_uz: "Hangzhou", name_zh: "杭州", tier: 1 },
  { name: "Urumqi", name_uz: "Urumchi", name_zh: "乌鲁木齐", tier: 1 },
  { name: "Tianjin", name_uz: "Tyantszin", name_zh: "天津", tier: 1 },
  // Tier 2
  { name: "Xi'an", name_uz: "Xian", name_zh: "西安", tier: 2 },
  { name: "Lanzhou", name_uz: "Lanzhou", name_zh: "兰州", tier: 2 },
  { name: "Yinchuan", name_uz: "Yinchuan", name_zh: "银川", tier: 2 },
  { name: "Xining", name_uz: "Xining", name_zh: "西宁", tier: 2 },
  { name: "Kunming", name_uz: "Kunming", name_zh: "昆明", tier: 2 },
  { name: "Chongqing", name_uz: "Chongqing", name_zh: "重庆", tier: 2 },
  { name: "Chengdu", name_uz: "Chengdu", name_zh: "成都", tier: 2 },
  { name: "Wuhan", name_uz: "Wuhan", name_zh: "武汉", tier: 2 },
  { name: "Zhengzhou", name_uz: "Zhengzhou", name_zh: "郑州", tier: 2 },
  { name: "Jinan", name_uz: "Jinan", name_zh: "济南", tier: 2 },
  { name: "Nanjing", name_uz: "Nankin", name_zh: "南京", tier: 2 },
  { name: "Hong Kong", name_uz: "Gonkong", name_zh: "香港", tier: 2 },
];

// Lowercase whitelist used to normalize `city` values from the DB
// (handles case + variations like "Xian"/"Xi'an", "Hong Kong"/"Hongkong").
export const MVP_CITY_WHITELIST_LC = new Set<string>([
  "beijing", "shanghai", "guangzhou", "shenzhen", "yiwu", "hangzhou",
  "urumqi", "tianjin", "xi'an", "xian", "lanzhou", "yinchuan", "xining",
  "kunming", "chongqing", "chengdu", "wuhan", "zhengzhou", "jinan",
  "nanjing", "hong kong", "hongkong",
]);

export const isMvpCity = (city: string | null | undefined): boolean => {
  if (!city) return false;
  return MVP_CITY_WHITELIST_LC.has(city.trim().toLowerCase());
};
