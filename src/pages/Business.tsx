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
} from "lucide-react";
import { BusinessEcosystemIcon } from "@/components/icons/BusinessEcosystemIcon";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { SupportChat } from "@/components/SupportChat";
import { MarketDetailSheet } from "@/components/MarketDetailSheet";
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

type Step = "product" | "goal" | "results";
type GoalType = "factories" | "markets" | "exhibitions";

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
  
  // Step state
  const [step, setStep] = useState<Step>("product");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<WholesaleMarket | null>(null);
  const [marketDetailOpen, setMarketDetailOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
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

  // Filter categories by search query (live search)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => {
      const translatedName = getField(cat, 'name').toLowerCase();
      const baseName = cat.name.toLowerCase();
      const slug = cat.slug.toLowerCase().replace(/_/g, ' ');
      return translatedName.includes(query) || baseName.includes(query) || slug.includes(query);
    });
  }, [categories, searchQuery, currentLanguage]);

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'ar' ? 'ar-SA' : 'en-US';
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
      // Filter markets by category
      const relevantMarkets = markets.filter(m => {
        const cat = m.category.toLowerCase();
        return cat.includes(categoryName) || cat.includes(categorySlug);
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
      // Filter exhibitions by category
      const now = new Date();
      const relevantExhibitions = exhibitions.filter(ex => {
        const cat = ex.category.toLowerCase();
        const exDate = new Date(ex.start_date);
        return exDate >= now && (cat.includes(categoryName) || cat.includes(categorySlug));
      });

      return { cities: [], items: relevantExhibitions };
    }

    return { cities: [], items: [] };
  }, [selectedCategory, selectedGoal, hubs, markets, exhibitions, currentLanguage]);

  const handleCategorySelect = (category: ProductCategory) => {
    setSelectedCategory(category);
    setStep("goal");
  };

  const handleGoalSelect = (goal: GoalType) => {
    setSelectedGoal(goal);
    setStep("results");
  };

  const handleBack = () => {
    if (step === "results") {
      setStep("goal");
      setSelectedGoal(null);
    } else if (step === "goal") {
      setStep("product");
      setSelectedCategory(null);
      setSearchQuery("");
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Manzil nusxalandi!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const renderProductStep = () => (
    <>
      {/* Search with Live Results */}
      <section className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>

        {/* Live Search Results */}
        {searchQuery.trim() && (
          <div className="mt-2 bg-card rounded-xl border border-border/50 overflow-hidden max-h-64 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Natija topilmadi
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 border-b border-border/30 last:border-b-0 transition-colors"
                >
                  <Package className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{getField(cat, 'name')}</span>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {/* Category Grid (when not searching) */}
      {!searchQuery.trim() && (
        <section className="px-5 pb-4">
          <h3 className="font-semibold text-foreground mb-3">Mahsulot kategoriyalari</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories.slice(0, 12).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="bg-card rounded-xl p-3 border border-border/50 hover:border-primary/30 transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground line-clamp-2">
                      {getField(cat, 'name')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {categories.length > 12 && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Qidiruvdan foydalanib ko'proq kategoriyalarni toping
            </p>
          )}
        </section>
      )}
    </>
  );

  const renderGoalStep = () => (
    <section className="px-5 pb-4">
      {/* Selected Category Badge */}
      <div className="mb-4 bg-accent/10 rounded-xl p-3 border border-accent/20">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">
            {selectedCategory ? getField(selectedCategory, 'name') : ''}
          </span>
        </div>
      </div>

      {/* Goal Selection */}
      <h3 className="font-semibold text-foreground mb-3">Maqsadingizni tanlang</h3>
      <div className="space-y-3">
        <button
          onClick={() => handleGoalSelect("factories")}
          className="w-full bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all text-left flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Factory className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">🏭 Zavodlar markazi</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ishlab chiqarish markazlari va fabrikalar
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => handleGoalSelect("markets")}
          className="w-full bg-card rounded-2xl p-4 border border-border/50 hover:border-amber-500/30 transition-all text-left flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
            <Store className="w-7 h-7 text-amber-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">🛍️ Optom bozorlar</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ulgurji savdo bozorlari va do'konlar
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => handleGoalSelect("exhibitions")}
          className="w-full bg-card rounded-2xl p-4 border border-border/50 hover:border-purple-500/30 transition-all text-left flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
            <Calendar className="w-7 h-7 text-purple-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">📅 Ko'rgazmalar</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Yarmarkalar va savdo ko'rgazmalari
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </section>
  );

  const renderResults = () => {
    if (!selectedGoal) return null;

    if (selectedGoal === "factories") {
      return (
        <section className="px-5 pb-4">
          <div className="mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Zavodlar markazi</h3>
          </div>

          {results.cities.length === 0 ? (
            <div className="text-center py-8">
              <Info className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Bu kategoriyada zavod topilmadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(results.cities as { city: string; cityTranslated: string; logistics: typeof cityLogistics[string]; hubs: ProductionHub[] }[]).map((cityData) => (
                <div key={cityData.city} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  {/* City Header */}
                  <div className="bg-gradient-to-br from-primary/15 to-accent/10 p-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{cityData.cityTranslated}</h4>
                        <p className="text-xs text-muted-foreground">{cityData.logistics.province}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logistics */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 bg-blue-500/10 rounded-lg p-2">
                        <Plane className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Yaqin aeroport</p>
                          <p className="text-xs font-medium">{cityData.logistics.airport} ({cityData.logistics.airportCode})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/10 rounded-lg p-2">
                        <Train className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Guangzhou'dan</p>
                          <p className="text-xs font-medium">{cityData.logistics.trainFromGZ}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hub List */}
                    <div className="space-y-2">
                      {cityData.hubs.map((hub) => (
                        <div key={hub.id} className="bg-muted/30 rounded-lg p-3">
                          <p className="text-sm font-medium text-foreground">{getField(hub, 'industry')}</p>
                          {hub.description && (
                            <p className="text-xs text-muted-foreground mt-1">{getField(hub, 'description')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    if (selectedGoal === "markets") {
      return (
        <section className="px-5 pb-4">
          <div className="mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-foreground">Optom bozorlar</h3>
          </div>

          {results.cities.length === 0 ? (
            <div className="text-center py-8">
              <Info className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Bu kategoriyada bozor topilmadi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(results.cities as { city: string; cityTranslated: string; logistics: typeof cityLogistics[string]; markets: WholesaleMarket[] }[]).map((cityData) => (
                <div key={cityData.city} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  {/* City Header */}
                  <div className="bg-gradient-to-br from-amber-500/15 to-yellow-500/10 p-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{cityData.cityTranslated}</h4>
                        <p className="text-xs text-muted-foreground">{cityData.logistics.province}</p>
                      </div>
                    </div>
                  </div>

                  {/* Markets List */}
                  <div className="p-4 space-y-3">
                    {cityData.markets.map((market) => {
                      const chineseAddress = market.address_chinese || market.address;
                      return (
                        <div key={market.id} className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground font-mono">{market.name}</p>
                              <p className="text-sm font-medium text-foreground">{getField(market, 'name')}</p>
                            </div>
                            {chineseAddress && (
                              <button
                                onClick={() => copyAddress(chineseAddress)}
                                className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex-shrink-0"
                              >
                                {copiedAddress === chineseAddress ? (
                                  <Check className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-amber-500" />
                                )}
                              </button>
                            )}
                          </div>
                          {chineseAddress && (
                            <p className="text-xs text-muted-foreground mt-1 font-mono">{chineseAddress}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    if (selectedGoal === "exhibitions") {
      const exhibitionItems = results.items as Exhibition[];
      return (
        <section className="px-5 pb-4">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-foreground">Ko'rgazmalar</h3>
          </div>

          {exhibitionItems.length === 0 ? (
            <div className="text-center py-8">
              <Info className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Bu kategoriyada ko'rgazma topilmadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exhibitionItems.map((ex) => (
                <div key={ex.id} className="bg-card rounded-2xl border border-border/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{getField(ex, 'name')}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getTranslatedCity(ex)} • {ex.venue && getField(ex, 'venue')}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-xs font-medium text-purple-400">
                          {formatDate(ex.start_date)} - {formatDate(ex.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            {step !== "product" && (
              <button
                onClick={handleBack}
                className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-glow">
              <BusinessEcosystemIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t("sourcing.strategicPlanner")}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("business.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "product" && "1-qadam: Mahsulot tanlang"}
            {step === "goal" && "2-qadam: Maqsadingizni tanlang"}
            {step === "results" && "3-qadam: Natijalar"}
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <div className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            step === "product" ? "bg-primary" : "bg-primary"
          )} />
          <div className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            step === "goal" || step === "results" ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            step === "results" ? "bg-primary" : "bg-muted"
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
                  Mahsulot tanlang → Maqsad tanlang → Shahar va manzillarni ko'ring
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step Content */}
      {step === "product" && renderProductStep()}
      {step === "goal" && renderGoalStep()}
      {step === "results" && renderResults()}

      {/* Quick Links (only on product step) */}
      {step === "product" && (
        <section className="px-5 pb-4">
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
      )}

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
