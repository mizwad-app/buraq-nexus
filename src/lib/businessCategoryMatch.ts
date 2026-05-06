// Fuzzy matching for product categories against market/hub/exhibition rows.
// Extracted from Business.tsx so all V2 screens use the same logic.

const FUZZY_MATCHES: Record<string, string[]> = {
  furniture: ["furniture", "mebel", "顺德", "乐从", "红星"],
  consumer_electronics: ["electronics", "电子", "elektronika"],
  computer_accessories: ["computer", "kompyuter", "电脑", "数码", "赛格"],
  mobile_accessories: ["phone", "telefon", "手机", "accessories", "南方大厦", "新亚洲", "南泰"],
  apparel_accessories: ["clothing", "garments", "kiyim", "服装", "textiles", "baima", "白马", "textile"],
  lights_lighting: ["lights", "lighting", "灯", "yoritish", "灯都"],
  luggage_bags: ["leather", "bags", "皮革", "sumka", "charm"],
  gifts_crafts: ["toys", "gifts", "o'yinchoq", "小商品", "yiwu"],
  kids_toys: ["toys", "o'yinchoq", "玩具", "yiwu"],
  shoes_accessories: ["shoes", "footwear", "poyabzal", "鞋"],
  sportswear: ["sport", "sports", "运动"],
  eyewear_watches: ["watches", "soat", "眼镜", "钟表"],
  hotel_restaurant_supplies: ["hotel", "restaurant", "酒店", "mehmonxona", "沙溪"],
  jewelry: ["珠宝", "zargarlik", "jewelry"],
  home_garden: ["general", "综合", "umumiy"],
  ceramics: ["ceramic", "陶瓷", "chinni", "porcelain", "chaozhou"],
  vehicle_parts: ["auto", "car", "avto", "avtomobil", "汽车", "vehicle"],
  auto_parts: ["auto", "car", "avto", "avtomobil", "汽车", "vehicle"],
  construction_materials: ["construction", "building", "qurilish", "材料"],
};

export function matchesCategory(itemCategory: string | null | undefined, slug: string, name?: string): boolean {
  if (!itemCategory) return false;
  const itemCat = itemCategory.toLowerCase();
  const s = slug.toLowerCase();
  const n = (name ?? "").toLowerCase();
  if (itemCat.includes(s) || (n && itemCat.includes(n))) return true;
  const matches = FUZZY_MATCHES[s] || [];
  return matches.some((m) => itemCat.includes(m.toLowerCase()));
}
