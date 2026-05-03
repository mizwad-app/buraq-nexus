import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  MapPin,
  ChevronRight,
  Package,
  Compass,
  Info,
  Store,
  Calendar,
  Factory,
  ArrowLeft,
  Plane,
  Train,
  Copy,
  Check,
  ChevronDown,
  X,
  Filter,
  ChevronLeft,
} from "lucide-react";
import { BusinessEcosystemIcon } from "@/components/icons/BusinessEcosystemIcon";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { SupportChat } from "@/components/SupportChat";
import { MarketDetailSheet } from "@/components/MarketDetailSheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LegalAdvisorsList } from "@/components/business/LegalAdvisorsList";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


interface WholesaleMarket {
  id: string;
  city: string;
  country: string;
  category: string;
  name: string;
  description: string | null;
  address?: string | null;
  address_chinese?: string | null;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  category_uz?: string | null;
  category_ru?: string | null;
  category_en?: string | null;
  category_ar?: string | null;
  [key: string]: unknown;
}

interface ProductionHub {
  id: string;
  city: string;
  country: string;
  industry: string;
  description: string | null;
  specializations: string[] | null;
  industry_uz?: string | null;
  industry_ru?: string | null;
  industry_en?: string | null;
  industry_ar?: string | null;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  [key: string]: unknown;
}

interface Exhibition {
  id: string;
  name: string;
  city: string;
  country: string;
  venue: string | null;
  start_date: string;
  end_date: string;
  category: string;
  description: string | null;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  category_uz?: string | null;
  category_ru?: string | null;
  category_en?: string | null;
  category_ar?: string | null;
  venue_uz?: string | null;
  venue_ru?: string | null;
  venue_en?: string | null;
  venue_ar?: string | null;
  [key: string]: unknown;
}

interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  icon?: string | null;
  [key: string]: unknown;
}

type Step = "product" | "goal";
type GoalType = "factories" | "markets" | "exhibitions";

// Quick filter tags for product categories
const QUICK_FILTER_TAGS = [
  { key: "furniture", slug: "furniture", icon: "🪑" },
  { key: "ceramics", slug: "ceramics", icon: "🏺" },
  { key: "electronics", slug: "consumer_electronics", icon: "📱" },
  { key: "autoParts", slug: "auto_parts", icon: "🚗" },
  { key: "textiles", slug: "apparel_accessories", icon: "👔" },
  { key: "construction", slug: "construction_materials", icon: "🧱" },
];

// City logistics data
const cityLogistics: Record<string, { province: string; airport: string; airportCode: string; trainFromGZ: string }> = {
  "Guangzhou": { province: "Guangdong", airport: "Baiyun", airportCode: "CAN", trainFromGZ: "—" },
  "Shenzhen": { province: "Guangdong", airport: "Bao'an", airportCode: "SZX", trainFromGZ: "30 daqiqa" },
  "Foshan": { province: "Guangdong", airport: "Baiyun (GZ)", airportCode: "CAN", trainFromGZ: "25 daqiqa" },
  "Zhongshan": { province: "Guangdong", airport: "Zhuhai", airportCode: "ZUH", trainFromGZ: "1 soat" },
  "Yiwu": { province: "Zhejiang", airport: "Yiwu", airportCode: "YIW", trainFromGZ: "6 soat" },
  "Hangzhou": { province: "Zhejiang", airport: "Xiaoshan", airportCode: "HGH", trainFromGZ: "7 soat" },
  "Chaozhou": { province: "Guangdong", airport: "Jieyang", airportCode: "SWA", trainFromGZ: "3 soat" },
  "Dongguan": { province: "Guangdong", airport: "Baiyun (GZ)", airportCode: "CAN", trainFromGZ: "45 daqiqa" },
  "Beijing": { province: "Beijing", airport: "Daxing", airportCode: "PKX", trainFromGZ: "8 soat" },
  "Shanghai": { province: "Shanghai", airport: "Pudong", airportCode: "PVG", trainFromGZ: "6.5 soat" },
};

const Business = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { getField, currentLanguage } = useTranslatedField();
  
  // Enable swipe back gesture
  useSwipeBack();
  
  // Step state
  const [step, setStep] = useState<Step>("product");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<WholesaleMarket | null>(null);
  const [marketDetailOpen, setMarketDetailOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);
  
  // Exhibition filters
  const [exhibitionSearch, setExhibitionSearch] = useState("");
  const [exhibitionCategoryFilter, setExhibitionCategoryFilter] = useState<string | null>(null);
  
  // Data states
  const [markets, setMarkets] = useState<WholesaleMarket[]>([]);
  const [hubs, setHubs] = useState<ProductionHub[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [marketsRes, hubsRes, exhibitionsRes, categoriesRes] = await Promise.all([
        supabase.from("wholesale_markets").select("*"),
        supabase.from("production_hubs").select("*"),
        supabase.from("exhibitions").select("*").order("start_date", { ascending: true }),
        supabase.from("product_categories").select("*").order("name"),
      ]);

      if (marketsRes.data) setMarkets(marketsRes.data as WholesaleMarket[]);
      if (hubsRes.data) setHubs(hubsRes.data as ProductionHub[]);
      if (exhibitionsRes.data) setExhibitions(exhibitionsRes.data as Exhibition[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as ProductCategory[]);
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get translated city name
  const getTranslatedCity = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
    return getField(item, 'city');
  };

  // Helper function to check if market/hub matches selected category
  const matchesCategory = (itemCategory: string, selectedSlug: string, selectedName: string) => {
    const itemCat = itemCategory.toLowerCase();
    const slug = selectedSlug.toLowerCase();
    const name = selectedName.toLowerCase();
    
    // Direct match
    if (itemCat.includes(slug) || itemCat.includes(name)) return true;
    
    // Fuzzy matching for various category names
    const fuzzyMatches: Record<string, string[]> = {
      "furniture": ["furniture", "mebel", "顺德", "乐从", "红星"],
      "consumer_electronics": ["electronics", "电子", "elektronika"],
      "computer_accessories": ["computer", "kompyuter", "电脑", "数码", "赛格"],
      "mobile_accessories": ["phone", "telefon", "手机", "accessories", "南方大厦", "新亚洲", "南泰"],
      "apparel_accessories": ["clothing", "garments", "kiyim", "服装", "textiles", "baima", "白马", "textile"],
      "lights_lighting": ["lights", "lighting", "灯", "yoritish", "灯都"],
      "luggage_bags": ["leather", "bags", "皮革", "sumka", "charm"],
      "gifts_crafts": ["toys", "gifts", "o'yinchoq", "小商品", "yiwu"],
      "eyewear_watches": ["watches", "soat", "眼镜", "钟表"],
      "hotel_restaurant_supplies": ["hotel", "restaurant", "酒店", "mehmonxona", "沙溪"],
      "jewelry": ["珠宝", "zargarlik", "jewelry"],
      "home_garden": ["general", "综合", "umumiy"],
      "ceramics": ["ceramic", "陶瓷", "chinni", "porcelain", "chaozhou"],
      "auto_parts": ["auto", "car", "avto", "avtomobil", "汽车", "vehicle"],
      "construction_materials": ["construction", "building", "qurilish", "строительные", "материалы"],
    };
    
    const matches = fuzzyMatches[slug] || [];
    return matches.some(m => itemCat.includes(m.toLowerCase()));
  };

  // Filter categories by search query or active tag
  const filteredCategories = useMemo(() => {
    let filtered = categories;
    
    // Filter by quick filter tag first
    if (activeFilterTag) {
      const tagConfig = QUICK_FILTER_TAGS.find(t => t.key === activeFilterTag);
      if (tagConfig) {
        filtered = categories.filter(cat => 
          cat.slug.toLowerCase().includes(tagConfig.slug.toLowerCase()) ||
          tagConfig.slug.toLowerCase().includes(cat.slug.toLowerCase())
        );
      }
    }
    
    // Then apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cat => {
        const translatedName = getField(cat, 'name').toLowerCase();
        const baseName = cat.name.toLowerCase();
        const slug = cat.slug.toLowerCase().replace(/_/g, ' ');
        return translatedName.includes(query) || baseName.includes(query) || slug.includes(query);
      });
    }
    
    return filtered;
  }, [categories, searchQuery, activeFilterTag, currentLanguage]);

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get results based on selected goal
  const results = useMemo(() => {
    if (!selectedCategory || !selectedGoal) return { cities: [], items: [] };

    const categoryName = selectedCategory.name.toLowerCase();
    const categorySlug = selectedCategory.slug.toLowerCase();

    if (selectedGoal === "factories") {
      // Filter hubs by category
      const relevantHubs = hubs.filter(h => {
        const industry = h.industry.toLowerCase();
        const specs = h.specializations?.map(s => s.toLowerCase()) || [];
        return industry.includes(categoryName) || 
               industry.includes(categorySlug) ||
               specs.some(s => s.includes(categoryName) || s.includes(categorySlug));
      });

      // Group by city
      const cityMap = new Map<string, { city: string; cityTranslated: string; logistics: typeof cityLogistics[string]; hubs: ProductionHub[] }>();
      relevantHubs.forEach(hub => {
        if (!cityMap.has(hub.city)) {
          cityMap.set(hub.city, {
            city: hub.city,
            cityTranslated: getTranslatedCity(hub),
            logistics: cityLogistics[hub.city] || { province: "China", airport: "—", airportCode: "—", trainFromGZ: "—" },
            hubs: [],
          });
        }
        cityMap.get(hub.city)!.hubs.push(hub);
      });

      return { cities: Array.from(cityMap.values()), items: relevantHubs };
    }

    if (selectedGoal === "markets") {
      // Filter markets by category with improved matching
      const relevantMarkets = markets.filter(m => {
        return matchesCategory(m.category, categorySlug, categoryName);
      });

      // Group by city
      const cityMap = new Map<string, { city: string; cityTranslated: string; logistics: typeof cityLogistics[string]; markets: WholesaleMarket[] }>();
      relevantMarkets.forEach(market => {
        if (!cityMap.has(market.city)) {
          cityMap.set(market.city, {
            city: market.city,
            cityTranslated: getTranslatedCity(market),
            logistics: cityLogistics[market.city] || { province: "China", airport: "—", airportCode: "—", trainFromGZ: "—" },
            markets: [],
          });
        }
        cityMap.get(market.city)!.markets.push(market);
      });

      return { cities: Array.from(cityMap.values()), items: relevantMarkets };
    }

    if (selectedGoal === "exhibitions") {
      // Filter exhibitions by category with improved matching
      const now = new Date();
      let relevantExhibitions = exhibitions.filter(ex => {
        const exDate = new Date(ex.start_date);
        return exDate >= now && matchesCategory(ex.category, categorySlug, categoryName);
      });

      // Apply exhibition search filter
      if (exhibitionSearch.trim()) {
        const query = exhibitionSearch.toLowerCase();
        relevantExhibitions = relevantExhibitions.filter(ex => {
          const name = getField(ex, 'name').toLowerCase();
          const category = getField(ex, 'category').toLowerCase();
          const city = getTranslatedCity(ex).toLowerCase();
          return name.includes(query) || category.includes(query) || city.includes(query);
        });
      }

      return { cities: [], items: relevantExhibitions };
    }

    return { cities: [], items: [] };
  }, [selectedCategory, selectedGoal, hubs, markets, exhibitions, currentLanguage, exhibitionSearch]);

  // Get upcoming exhibitions (15-30 days)
  const upcomingExhibitions = useMemo(() => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return exhibitions.filter(ex => {
      const exDate = new Date(ex.start_date);
      return exDate >= now && exDate <= thirtyDaysLater;
    });
  }, [exhibitions]);

  const handleQuickFilterTag = (tagKey: string) => {
    if (activeFilterTag === tagKey) {
      setActiveFilterTag(null);
    } else {
      setActiveFilterTag(tagKey);
      // Find matching category and auto-select it
      const tagConfig = QUICK_FILTER_TAGS.find(t => t.key === tagKey);
      if (tagConfig) {
        const matchingCategory = categories.find(cat => 
          cat.slug.toLowerCase().includes(tagConfig.slug.toLowerCase()) ||
          tagConfig.slug.toLowerCase().includes(cat.slug.toLowerCase())
        );
        if (matchingCategory) {
          setSelectedCategory(matchingCategory);
          setStep("goal");
          setSelectedGoal(null);
        }
      }
    }
  };

  const handleCategorySelect = (category: ProductCategory) => {
    setSelectedCategory(category);
    setSearchQuery("");
    setStep("goal");
    setSelectedGoal(null);
  };

  const handleGoalSelect = (goal: GoalType) => {
    setSelectedGoal(goal);
    setExhibitionSearch("");
    setExhibitionCategoryFilter(null);
  };

  const handleBack = () => {
    if (step === "goal") {
      setStep("product");
      setSelectedCategory(null);
      setSelectedGoal(null);
      setSearchQuery("");
      setActiveFilterTag(null);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success(t("business.legalSection.addressCopied"));
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const renderProductStep = () => (
    <>
      {/* Quick Links - At Top */}
      <section className="px-5 mb-4">
        <h3 className="font-semibold text-foreground mb-3">{t("sourcing.quickLinks")}</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/deep-check")}
            className="bg-card rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <p className="font-medium text-foreground text-sm">{t("modules.deepCheck")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("sourcing.verifyFactories")}</p>
          </button>
          
          <button
            onClick={() => navigate("/translators")}
            className="bg-card rounded-xl p-4 border border-border/50 hover:border-accent/30 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <p className="font-medium text-foreground text-sm">{t("modules.translators")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("sourcing.hireExpert")}</p>
          </button>
        </div>
      </section>

      {/* Product Filter Tags */}
      <section className="px-5 mb-3">
        <h3 className="font-semibold text-foreground mb-3 text-sm">{t("sourcing.productFilters")}</h3>
        <div className="relative -mx-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 pb-1">
            {QUICK_FILTER_TAGS.map((tag) => (
              <button
                key={tag.key}
                onClick={() => handleQuickFilterTag(tag.key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap",
                  activeFilterTag === tag.key
                    ? "bg-primary/20 border-primary text-primary"
                    : "bg-card border-border/50 text-foreground hover:border-primary/30"
                )}
              >
                <span>{tag.icon}</span>
                <span>{t(`sourcing.filterTags.${tag.key}`)}</span>
              </button>
            ))}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-background to-transparent" />
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("sourcing.searchProduct")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50 h-12 rounded-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </section>

      {/* Category List */}
      <section className="px-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            {t("business.noResults")}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCategories.slice(0, 10).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                className="w-full px-4 py-3 text-left bg-card hover:bg-primary/10 border border-border/50 hover:border-primary/30 rounded-xl flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">{getField(cat, 'name')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
            {filteredCategories.length > 10 && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                +{filteredCategories.length - 10} {t("productSearch.categories")}
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );

  const renderGoalStep = () => (
    <section className="px-5 pb-4">
      {/* Selected Category Badge */}
      <div className="mb-4 bg-gradient-to-br from-primary/15 to-accent/10 rounded-xl p-3 border border-primary/20">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {selectedCategory ? getField(selectedCategory, 'name') : ''}
          </span>
        </div>
      </div>

      {/* Goal Selection - Horizontal 3 Buttons */}
      <h3 className="font-semibold text-foreground mb-3 text-sm">{t("sourcing.selectGoal")}</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => handleGoalSelect("factories")}
          className={cn(
            "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
            selectedGoal === "factories"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-card border-border/50 hover:border-primary/30 text-foreground"
          )}
        >
          <Factory className={cn("w-6 h-6", selectedGoal === "factories" ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[11px] font-medium text-center leading-tight">🏭 {t("sourcing.factories")}</span>
        </button>

        <button
          onClick={() => handleGoalSelect("markets")}
          className={cn(
            "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
            selectedGoal === "markets"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-card border-border/50 hover:border-gold/30 text-foreground"
          )}
        >
          <Store className={cn("w-6 h-6", selectedGoal === "markets" ? "text-primary" : "text-gold")} />
          <span className="text-[11px] font-medium text-center leading-tight">🛍️ {t("sourcing.markets")}</span>
        </button>

        <button
          onClick={() => handleGoalSelect("exhibitions")}
          className={cn(
            "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
            selectedGoal === "exhibitions"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-card border-border/50 hover:border-purple-500/30 text-foreground"
          )}
        >
          <Calendar className={cn("w-6 h-6", selectedGoal === "exhibitions" ? "text-primary" : "text-purple-500")} />
          <span className="text-[11px] font-medium text-center leading-tight">📅 {t("sourcing.exhibitions")}</span>
        </button>
      </div>

      {/* Results Section - Inline */}
      {selectedGoal && renderGoalResults()}
    </section>
  );

  const renderGoalResults = () => {
    if (!selectedGoal) return null;

    if (selectedGoal === "factories") {
      return (
        <div className="mt-2">
          <div className="mb-3 flex items-center gap-2">
            <Factory className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-foreground text-sm">{t("sourcing.factoriesDesc")}</h4>
          </div>

          {results.cities.length === 0 ? (
            <div className="text-center py-6 bg-card rounded-xl border border-border/50">
              <Info className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("sourcing.noFactoriesFound")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(results.cities as { city: string; cityTranslated: string; logistics: typeof cityLogistics[string]; hubs: ProductionHub[] }[]).map((cityData) => (
                <div key={cityData.city} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  {/* City Header */}
                  <div className="bg-gradient-to-br from-primary/15 to-accent/10 p-3 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{cityData.cityTranslated}</h4>
                        <p className="text-[10px] text-muted-foreground">{cityData.logistics.province}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logistics */}
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 bg-blue-500/10 rounded-lg p-2">
                        <Plane className="w-3 h-3 text-blue-500" />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{t("sourcing.nearestAirport")}</p>
                          <p className="text-[11px] font-medium">{cityData.logistics.airport} ({cityData.logistics.airportCode})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-2">
                        <Train className="w-3 h-3 text-primary" />
                        <div>
                          <p className="text-[9px] text-muted-foreground">{t("sourcing.trainFromGZ")}</p>
                          <p className="text-[11px] font-medium">{cityData.logistics.trainFromGZ}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hub List */}
                    <div className="space-y-1.5">
                      {cityData.hubs.map((hub) => (
                        <div key={hub.id} className="bg-muted/30 rounded-lg p-2">
                          <p className="text-xs font-medium text-foreground">{getField(hub, 'industry')}</p>
                          {hub.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{getField(hub, 'description')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedGoal === "markets") {
      return (
        <div className="mt-2">
          <div className="mb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-gold" />
            <h4 className="font-medium text-foreground text-sm">{t("sourcing.marketsDesc")}</h4>
          </div>

          {results.cities.length === 0 ? (
            <div className="text-center py-6 bg-card rounded-xl border border-border/50">
              <Info className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("sourcing.noMarketsFound")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(results.cities as { city: string; cityTranslated: string; logistics: typeof cityLogistics[string]; markets: WholesaleMarket[] }[]).map((cityData) => (
                <div key={cityData.city} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  {/* City Header */}
                  <div className="bg-gradient-to-br from-amber-500/15 to-yellow-500/10 p-3 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{cityData.cityTranslated}</h4>
                        <p className="text-[10px] text-muted-foreground">{cityData.logistics.province}</p>
                      </div>
                    </div>
                  </div>

                  {/* Markets List */}
                  <div className="p-3 space-y-2">
                    {cityData.markets.map((market) => {
                      const chineseAddress = market.address_chinese || market.address;
                      return (
                        <div key={market.id} className="bg-muted/30 rounded-lg p-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{market.name}</p>
                              <p className="text-xs font-medium text-foreground">{getField(market, 'name')}</p>
                            </div>
                            {chineseAddress && (
                              <button
                                onClick={() => copyAddress(chineseAddress)}
                                className="p-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors flex-shrink-0"
                              >
                                {copiedAddress === chineseAddress ? (
                                  <Check className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-gold" />
                                )}
                              </button>
                            )}
                          </div>
                          {chineseAddress && (
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{chineseAddress}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedGoal === "exhibitions") {
      const exhibitionItems = results.items as Exhibition[];
      return (
        <div className="mt-2">
          {/* Exhibition Search */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("sourcing.searchExhibition")}
                value={exhibitionSearch}
                onChange={(e) => setExhibitionSearch(e.target.value)}
                className="pl-10 bg-card border-border/50 h-10 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Upcoming Section Header */}
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <h4 className="font-medium text-foreground text-sm">{t("sourcing.upcomingExhibitions")}</h4>
          </div>

          {/* Upcoming Badge */}
          {upcomingExhibitions.length > 0 && exhibitionItems.some(ex => upcomingExhibitions.find(u => u.id === ex.id)) && (
            <div className="mb-3 bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{t("sourcing.upcomingIn30Days")}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {exhibitionItems.filter(ex => upcomingExhibitions.find(u => u.id === ex.id)).length} {t("sourcing.exhibitionsCount")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {exhibitionItems.length === 0 ? (
            <div className="text-center py-6 bg-card rounded-xl border border-border/50">
              <Info className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t("sourcing.noExhibitionsFound")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exhibitionItems.map((ex) => {
                const isUpcoming = upcomingExhibitions.find(u => u.id === ex.id);
                return (
                  <div key={ex.id} className={cn(
                    "bg-card rounded-xl border p-3",
                    isUpcoming ? "border-purple-500/30" : "border-border/50"
                  )}>
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isUpcoming ? "bg-purple-500/30" : "bg-purple-500/20"
                      )}>
                        <Calendar className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-foreground text-sm">{getField(ex, 'name')}</h4>
                          {isUpcoming && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[9px] font-medium text-purple-400 flex-shrink-0">
                              {t("sourcing.upcoming")}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {getTranslatedCity(ex)} • {ex.venue && getField(ex, 'venue')}
                        </p>
                        <div className="mt-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-[10px] font-medium text-purple-400">
                            {formatDate(ex.start_date)} - {formatDate(ex.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => step === "product" ? navigate(-1) : handleBack()}
              className="p-2 -ml-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-glow">
              <BusinessEcosystemIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-muted-foreground">
                {t("sourcing.strategicPlanner")}
              </span>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {t("business.title")}
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-10">
            {step === "product" && t("sourcing.step1")}
            {step === "goal" && (selectedGoal ? t("sourcing.step2") : t("sourcing.selectGoal"))}
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <div className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            "bg-primary"
          )} />
          <div className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            step === "goal" ? "bg-primary" : "bg-muted"
          )} />
        </div>
      </div>

      {/* How It Works Info (only on product step) */}
      {step === "product" && (
        <section className="px-5 mb-4">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Compass className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  {t("sourcing.howItWorks")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("sourcing.howItWorksDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step Content */}
      {step === "product" && renderProductStep()}
      {step === "goal" && renderGoalStep()}

      {/* Support Chat FAB */}
      <SupportChat />

      {/* Market Detail Sheet */}
      <MarketDetailSheet
        open={marketDetailOpen}
        onOpenChange={setMarketDetailOpen}
        market={selectedMarket}
      />
    </div>
  );
};

export default Business;
