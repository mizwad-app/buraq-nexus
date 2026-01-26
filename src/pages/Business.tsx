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
} from "lucide-react";
import { BusinessEcosystemIcon } from "@/components/icons/BusinessEcosystemIcon";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { SupportChat } from "@/components/SupportChat";
import { CityInsightCard } from "@/components/CityInsightCard";
import { MarketDetailSheet } from "@/components/MarketDetailSheet";

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

// City logistics data (static for now, can be moved to DB later)
const cityLogistics: Record<string, { province: string; airport: string; airportCode: string; trainFromGZ: string }> = {
  "Guangzhou": { province: "Guangdong", airport: "Baiyun", airportCode: "CAN", trainFromGZ: "—" },
  "Shenzhen": { province: "Guangdong", airport: "Bao'an", airportCode: "SZX", trainFromGZ: "30 daqiqa" },
  "Foshan": { province: "Guangdong", airport: "Baiyun (GZ)", airportCode: "CAN", trainFromGZ: "25 daqiqa" },
  "Zhongshan": { province: "Guangdong", airport: "Zhuhai", airportCode: "ZUH", trainFromGZ: "1 soat" },
  "Yiwu": { province: "Zhejiang", airport: "Yiwu", airportCode: "YIW", trainFromGZ: "6 soat" },
  "Hangzhou": { province: "Zhejiang", airport: "Xiaoshan", airportCode: "HGH", trainFromGZ: "7 soat" },
  "Chaozhou": { province: "Guangdong", airport: "Jieyang", airportCode: "SWA", trainFromGZ: "3 soat" },
  "Dongguan": { province: "Guangdong", airport: "Baiyun (GZ)", airportCode: "CAN", trainFromGZ: "45 daqiqa" },
};

const Business = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { getField, currentLanguage } = useTranslatedField();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<WholesaleMarket | null>(null);
  const [marketDetailOpen, setMarketDetailOpen] = useState(false);
  
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
        supabase.from("product_categories").select("*"),
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

  // Get translated city name for display
  const getTranslatedCity = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
    return getField(item, 'city');
  };

  // Get unique categories for filter
  const allCategories = useMemo(() => {
    const categoriesMap = new Map<string, { base: string; translated: string }>();
    markets.forEach(m => {
      if (!categoriesMap.has(m.category)) {
        categoriesMap.set(m.category, { base: m.category, translated: getField(m, 'category') });
      }
    });
    hubs.forEach(h => {
      if (!categoriesMap.has(h.industry)) {
        categoriesMap.set(h.industry, { base: h.industry, translated: getField(h, 'industry') });
      }
    });
    // Also add categories from product_categories table
    categories.forEach(c => {
      if (!categoriesMap.has(c.slug)) {
        categoriesMap.set(c.slug, { base: c.slug, translated: getField(c, 'name') });
      }
    });
    return Array.from(categoriesMap.values()).sort((a, b) => a.translated.localeCompare(b.translated));
  }, [markets, hubs, categories, currentLanguage]);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return allCategories;
    const searchLower = searchQuery.toLowerCase();
    return allCategories.filter(c => 
      c.translated.toLowerCase().includes(searchLower) ||
      c.base.toLowerCase().includes(searchLower)
    );
  }, [allCategories, searchQuery]);

  // Get selected category translated name
  const selectedCategoryTranslated = useMemo(() => {
    if (selectedCategory === "all") return "";
    const cat = allCategories.find(c => c.base === selectedCategory);
    return cat?.translated || selectedCategory;
  }, [selectedCategory, allCategories]);

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  };

  // Build city insight data based on selected category
  const cityInsights = useMemo(() => {
    const cityDataMap = new Map<string, {
      cityName: string;
      cityNameTranslated: string;
      province: string;
      industries: string[];
      nearestAirport: string;
      airportCode: string;
      trainInfo: string;
      markets: { name: string; nameTranslated: string; address?: string }[];
      upcomingExhibition?: {
        name: string;
        nameTranslated: string;
        date: string;
        phase?: string;
      };
    }>();

    // Filter hubs by category if selected
    const relevantHubs = selectedCategory === "all" 
      ? hubs 
      : hubs.filter(h => {
          const searchLower = selectedCategory.toLowerCase();
          const translatedIndustry = getField(h, 'industry').toLowerCase();
          return translatedIndustry.includes(searchLower) ||
            h.industry.toLowerCase().includes(searchLower) ||
            h.specializations?.some(s => s.toLowerCase().includes(searchLower));
        });

    // Filter markets by category if selected
    const relevantMarkets = selectedCategory === "all"
      ? markets
      : markets.filter(m => {
          const searchLower = selectedCategory.toLowerCase();
          const translatedCategory = getField(m, 'category').toLowerCase();
          return translatedCategory.includes(searchLower) ||
            m.category.toLowerCase().includes(searchLower);
        });

    // Build city data from hubs
    relevantHubs.forEach(hub => {
      const cityKey = hub.city;
      const logistics = cityLogistics[cityKey] || { 
        province: "China", 
        airport: "—", 
        airportCode: "—", 
        trainFromGZ: "—" 
      };

      if (!cityDataMap.has(cityKey)) {
        cityDataMap.set(cityKey, {
          cityName: cityKey,
          cityNameTranslated: getTranslatedCity(hub),
          province: logistics.province,
          industries: [],
          nearestAirport: logistics.airport,
          airportCode: logistics.airportCode,
          trainInfo: logistics.trainFromGZ,
          markets: [],
        });
      }

      const cityData = cityDataMap.get(cityKey)!;
      const industryTranslated = getField(hub, 'industry');
      if (!cityData.industries.includes(industryTranslated)) {
        cityData.industries.push(industryTranslated);
      }
    });

    // Add markets to city data
    relevantMarkets.forEach(market => {
      const cityKey = market.city;
      const logistics = cityLogistics[cityKey] || { 
        province: "China", 
        airport: "—", 
        airportCode: "—", 
        trainFromGZ: "—" 
      };

      if (!cityDataMap.has(cityKey)) {
        cityDataMap.set(cityKey, {
          cityName: cityKey,
          cityNameTranslated: getTranslatedCity(market),
          province: logistics.province,
          industries: [getField(market, 'category')],
          nearestAirport: logistics.airport,
          airportCode: logistics.airportCode,
          trainInfo: logistics.trainFromGZ,
          markets: [],
        });
      }

      const cityData = cityDataMap.get(cityKey)!;
      const marketExists = cityData.markets.some(m => m.name === market.name);
      if (!marketExists) {
        cityData.markets.push({
          name: market.name,
          nameTranslated: getField(market, 'name'),
          address: market.address_chinese || market.address || undefined,
        });
      }
    });

    // Add upcoming exhibitions to cities
    const now = new Date();
    exhibitions.forEach(exhibition => {
      const exhibitionDate = new Date(exhibition.start_date);
      if (exhibitionDate >= now) {
        const cityKey = exhibition.city;
        if (cityDataMap.has(cityKey)) {
          const cityData = cityDataMap.get(cityKey)!;
          if (!cityData.upcomingExhibition) {
            // Check if exhibition category matches selected category
            if (selectedCategory === "all" || 
                exhibition.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                getField(exhibition, 'category').toLowerCase().includes(selectedCategory.toLowerCase())) {
              cityData.upcomingExhibition = {
                name: exhibition.name,
                nameTranslated: getField(exhibition, 'name'),
                date: formatDate(exhibition.start_date) + " - " + formatDate(exhibition.end_date),
              };
            }
          }
        }
      }
    });

    return Array.from(cityDataMap.values());
  }, [markets, hubs, exhibitions, selectedCategory, currentLanguage]);


  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
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
            {t("sourcing.subtitle")}
          </p>
        </div>
      </header>

      {/* How It Works Info */}
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

      {/* Product Category Selector */}
      <section className="px-5 mb-4">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("sourcing.searchProduct")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>

          {/* Category Dropdown */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full bg-card border-border/50">
              <Package className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t("sourcing.selectProduct")} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50 max-h-64">
              <SelectItem value="all">{t("sourcing.allProducts")}</SelectItem>
              {filteredCategories.map((category) => (
                <SelectItem key={category.base} value={category.base}>
                  {category.translated}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Selected Category Summary */}
      {selectedCategory !== "all" && (
        <section className="px-5 mb-4">
          <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{selectedCategoryTranslated}</span>{" "}
              {t("sourcing.foundInCities", { count: cityInsights.length })}
            </p>
          </div>
        </section>
      )}

      {/* City Insight Cards */}
      <section className="px-5 pb-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cityInsights.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <Info className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t("business.noResults")}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {t("sourcing.tryDifferentCategory")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cityInsights.map((city) => (
              <CityInsightCard
                key={city.cityName}
                city={city}
                selectedProduct={selectedCategory !== "all" ? selectedCategoryTranslated : undefined}
                onViewMarkets={() => {
                  // Find first market in this city and open detail
                  const market = markets.find(m => m.city === city.cityName);
                  if (market) {
                    setSelectedMarket(market);
                    setMarketDetailOpen(true);
                  }
                }}
                onViewExhibition={() => navigate("/business?tab=exhibitions")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
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
