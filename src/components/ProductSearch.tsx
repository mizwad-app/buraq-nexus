import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Smartphone, 
  Building, 
  Layers, 
  Shirt, 
  Cpu, 
  Sofa, 
  Gamepad2, 
  Footprints, 
  Watch,
  ChevronRight,
  Store,
  Factory,
  MapPin,
  ArrowLeft,
  Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";

interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  icon: string | null;
  [key: string]: unknown;
}

interface MarketWithCategory {
  market_id: string;
  market: {
    id: string;
    name: string;
    city: string;
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
    description_uz?: string | null;
    description_ru?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
    [key: string]: unknown;
  };
}

interface HubWithCategory {
  hub_id: string;
  hub: {
    id: string;
    city: string;
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
  };
}

type SearchType = "wholesale" | "factory";
type Step = "product" | "type" | "city" | "results";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  building: Building,
  layers: Layers,
  shirt: Shirt,
  cpu: Cpu,
  sofa: Sofa,
  gamepad: Gamepad2,
  footprints: Footprints,
  watch: Watch,
};

interface ProductSearchProps {
  onClose?: () => void;
}

export const ProductSearch = ({ onClose }: ProductSearchProps) => {
  const { t } = useTranslation();
  const { getField, currentLanguage } = useTranslatedField();
  
  const [step, setStep] = useState<Step>("product");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedType, setSelectedType] = useState<SearchType | null>(null);
  const [markets, setMarkets] = useState<MarketWithCategory[]>([]);
  const [hubs, setHubs] = useState<HubWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketsForCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("market_product_categories")
        .select(`
          market_id,
          market:wholesale_markets(*)
        `)
        .eq("category_id", categoryId);
      
      if (error) throw error;
      setMarkets((data || []) as unknown as MarketWithCategory[]);
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHubsForCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("hub_product_categories")
        .select(`
          hub_id,
          hub:production_hubs(*)
        `)
        .eq("category_id", categoryId);
      
      if (error) throw error;
      setHubs((data || []) as unknown as HubWithCategory[]);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: ProductCategory) => {
    setSelectedCategory(category);
    setStep("type");
  };

  const handleTypeSelect = async (type: SearchType) => {
    setSelectedType(type);
    if (selectedCategory) {
      if (type === "wholesale") {
        await fetchMarketsForCategory(selectedCategory.id);
      } else {
        await fetchHubsForCategory(selectedCategory.id);
      }
    }
    setStep("city");
  };

  const handleBack = () => {
    if (step === "type") {
      setStep("product");
      setSelectedCategory(null);
    } else if (step === "city") {
      setStep("type");
      setSelectedType(null);
    } else if (step === "results") {
      setStep("city");
    }
  };

  const handleReset = () => {
    setStep("product");
    setSelectedCategory(null);
    setSelectedType(null);
    setMarkets([]);
    setHubs([]);
  };

  // Group markets/hubs by city
  const citiesWithMarkets = useMemo(() => {
    const cityMap = new Map<string, { 
      city: string; 
      cityTranslated: string; 
      items: MarketWithCategory[] 
    }>();
    
    markets.forEach(m => {
      if (!m.market) return;
      const city = m.market.city;
      if (!cityMap.has(city)) {
        cityMap.set(city, {
          city,
          cityTranslated: getField(m.market, 'city'),
          items: []
        });
      }
      cityMap.get(city)!.items.push(m);
    });
    
    return Array.from(cityMap.values());
  }, [markets, currentLanguage]);

  const citiesWithHubs = useMemo(() => {
    const cityMap = new Map<string, { 
      city: string; 
      cityTranslated: string; 
      items: HubWithCategory[] 
    }>();
    
    hubs.forEach(h => {
      if (!h.hub) return;
      const city = h.hub.city;
      if (!cityMap.has(city)) {
        cityMap.set(city, {
          city,
          cityTranslated: getField(h.hub, 'city'),
          items: []
        });
      }
      cityMap.get(city)!.items.push(h);
    });
    
    return Array.from(cityMap.values());
  }, [hubs, currentLanguage]);

  const getIconComponent = (iconName: string | null) => {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
  };

  // Breadcrumb
  const renderBreadcrumb = () => {
    const parts: string[] = [];
    
    if (selectedCategory) {
      parts.push(getField(selectedCategory, 'name'));
    }
    if (selectedType) {
      parts.push(selectedType === "wholesale" ? t("productSearch.wholesale") : t("productSearch.factory"));
    }
    
    if (parts.length === 0) return null;
    
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
        <button onClick={handleReset} className="hover:text-primary">
          {t("productSearch.title")}
        </button>
        {parts.map((part, index) => (
          <span key={index} className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3" />
            <span className={index === parts.length - 1 ? "text-foreground font-medium" : ""}>
              {part}
            </span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/20 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {step !== "product" && (
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t("productSearch.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("productSearch.subtitle")}</p>
          </div>
        </div>
      </div>

      {renderBreadcrumb()}

      {/* Step 1: Product Selection */}
      {step === "product" && (
        <div className="grid grid-cols-2 gap-2">
          {loading ? (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : (
            categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50",
                    "hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground line-clamp-2">
                    {getField(category, 'name')}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Step 2: Type Selection */}
      {step === "type" && (
        <div className="space-y-3">
          <button
            onClick={() => handleTypeSelect("wholesale")}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50",
              "hover:border-primary/50 hover:bg-primary/5 transition-all"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-foreground">{t("productSearch.wholesale")}</div>
              <div className="text-xs text-muted-foreground">{t("productSearch.wholesaleDesc")}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleTypeSelect("factory")}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50",
              "hover:border-primary/50 hover:bg-primary/5 transition-all"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Factory className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold text-foreground">{t("productSearch.factory")}</div>
              <div className="text-xs text-muted-foreground">{t("productSearch.factoryDesc")}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Step 3: City Results */}
      {step === "city" && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : selectedType === "wholesale" ? (
            citiesWithMarkets.length > 0 ? (
              citiesWithMarkets.map((cityData) => (
                <div key={cityData.city} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b border-border/30">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{cityData.cityTranslated}</div>
                      <div className="text-xs text-muted-foreground">
                        {cityData.items.length} {t("productSearch.marketsAvailable")}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-border/30">
                    {cityData.items.map((item) => (
                      <div key={item.market_id} className="p-3 hover:bg-muted/30 transition-colors">
                        <div className="font-medium text-sm text-foreground">
                          {getField(item.market, 'name')}
                        </div>
                        {item.market.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {getField(item.market, 'description')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("productSearch.noResults")}
              </div>
            )
          ) : (
            citiesWithHubs.length > 0 ? (
              citiesWithHubs.map((cityData) => (
                <div key={cityData.city} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b border-border/30">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{cityData.cityTranslated}</div>
                      <div className="text-xs text-muted-foreground">
                        {cityData.items.length} {t("productSearch.hubsAvailable")}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-border/30">
                    {cityData.items.map((item) => (
                      <div key={item.hub_id} className="p-3 hover:bg-muted/30 transition-colors">
                        <div className="font-medium text-sm text-foreground">
                          {getField(item.hub, 'industry')} - {getField(item.hub, 'city')}
                        </div>
                        {item.hub.specializations && item.hub.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.hub.specializations.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-muted text-xs rounded-full">
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("productSearch.noResults")}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
