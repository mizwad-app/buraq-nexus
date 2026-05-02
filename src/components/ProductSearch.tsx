import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
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
  ChevronDown,
  Store,
  Factory,
  MapPin,
  ArrowLeft,
  Package,
  Lightbulb,
  Gauge,
  Zap,
  Settings,
  HardHat,
  Briefcase,
  Wrench,
  Dumbbell,
  Gem,
  Home,
  Tv,
  Car,
  Cog,
  Truck,
  Sun,
  Plug,
  Sparkles,
  HeartPulse,
  Shield,
  PawPrint,
  Pencil,
  Wheat,
  Utensils,
  UtensilsCrossed,
  Gift,
  Search,
  Clock,
  X,
  Monitor,
  Armchair,
  LucideIcon,
  Train,
  Navigation,
  Copy,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

const iconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  building: Building,
  layers: Layers,
  shirt: Shirt,
  cpu: Cpu,
  sofa: Sofa,
  armchair: Armchair,
  gamepad: Gamepad2,
  footprints: Footprints,
  watch: Watch,
  lightbulb: Lightbulb,
  monitor: Monitor,
  gauge: Gauge,
  zap: Zap,
  settings: Settings,
  "hard-hat": HardHat,
  briefcase: Briefcase,
  wrench: Wrench,
  factory: Factory,
  dumbbell: Dumbbell,
  gem: Gem,
  home: Home,
  tv: Tv,
  car: Car,
  cog: Cog,
  truck: Truck,
  sun: Sun,
  plug: Plug,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  shield: Shield,
  "paw-print": PawPrint,
  pencil: Pencil,
  wheat: Wheat,
  utensils: Utensils,
  "utensils-crossed": UtensilsCrossed,
  package: Package,
  gift: Gift,
};

// Category groups for better organization
const categoryGroups: Record<string, { icon: LucideIcon; slugs: string[] }> = {
  "electronics": {
    icon: Cpu,
    slugs: ["consumer_electronics", "electronic_components", "lights_lighting", "computer_accessories", "mobile_accessories", "testing_instruments", "power_transmission"]
  },
  "industrial": {
    icon: Settings,
    slugs: ["industrial_machinery", "construction_building_machinery", "commercial_equipment", "tools_hardware", "fabrication_services", "hotel_restaurant_supplies"]
  },
  "fashion": {
    icon: Shirt,
    slugs: ["apparel_accessories", "sportswear_outdoor", "shoes_accessories", "jewelry", "eyewear_watches", "luggage_bags"]
  },
  "home": {
    icon: Home,
    slugs: ["furniture", "home_garden", "home_appliances", "construction_real_estate", "raw_materials"]
  },
  "automotive": {
    icon: Car,
    slugs: ["automotive_supplies", "vehicle_parts", "vehicles_transportation", "renewable_energy", "electrical_equipment"]
  },
  "health": {
    icon: HeartPulse,
    slugs: ["beauty_personal_care", "health_medical", "safety_security"]
  },
  "misc": {
    icon: Package,
    slugs: ["pet_supplies", "school_office_supplies", "parents_kids_toys", "agriculture", "food_beverage", "packaging_printing", "gifts_crafts"]
  }
};

// Parse travel tips to extract structured info
const parseTravelInfo = (tips: string | null | undefined) => {
  if (!tips) return { taxi: null, metro: null, distance: null };
  
  const taxiMatch = tips.match(/(\d{2,3}[-–]\d{2,3}\s*(?:RMB|¥|yuan))/i) || 
                    tips.match(/taxi[:\s]*(\d{2,3}[-–]\d{2,3})/i);
  const metroMatch = tips.match(/(?:Line\s*)?(\d+)[,\s]*(\w+(?:\s+\w+)*\s*(?:Station|站))/i) ||
                     tips.match(/Metro[:\s]*([^,;]+)/i);
  const distanceMatch = tips.match(/(\d+(?:\.\d+)?\s*(?:km|kilometers?))/i);
  
  return {
    taxi: taxiMatch ? taxiMatch[1] || taxiMatch[0] : null,
    metro: metroMatch ? (metroMatch[1] && metroMatch[2] ? `L${metroMatch[1]}, ${metroMatch[2]}` : metroMatch[1]) : null,
    distance: distanceMatch ? distanceMatch[1] : null
  };
};

// Rich market card for search results
interface SearchMarketCardProps {
  market: {
    id: string;
    name: string;
    city: string;
    category: string;
    description: string | null;
    address?: string | null;
    address_chinese?: string | null;
    travel_tips?: string | null;
    working_hours?: string | null;
    market_type?: string | null;
    [key: string]: unknown;
  };
  getField: (obj: Record<string, unknown>, field: string) => string;
  t: TFunction;
}

const SearchMarketCard = ({ market, getField, t }: SearchMarketCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const translatedName = getField(market, 'name');
  const translatedTips = getField(market, 'travel_tips');
  const translatedCategory = getField(market, 'category');
  
  const chineseAddress = market.address_chinese || market.address;
  const travelInfo = parseTravelInfo(translatedTips);
  
  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chineseAddress) {
      navigator.clipboard.writeText(chineseAddress);
      setCopied(true);
      toast.success(t("business.legalSection.addressCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all">
      {/* Header with name and type */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Chinese name for taxi */}
            <p className="text-xs text-muted-foreground font-mono truncate">{market.name}</p>
            {/* Translated name */}
            <h3 className="font-semibold text-foreground leading-tight">{translatedName}</h3>
            
            {/* Tags */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-[10px] font-medium text-accent-foreground">
                {translatedCategory}
              </span>
              {market.market_type && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                  market.market_type === 'wholesale' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-accent/20 text-accent-foreground'
                )}>
                  {market.market_type === 'wholesale' ? t("business.marketCard.wholesale") : t("business.marketCard.retail")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chinese Address with Copy */}
      {chineseAddress && (
        <div className="mx-4 mb-2 p-2.5 bg-muted/40 rounded-lg border border-border/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground mb-0.5">{t("business.marketCard.addressForTaxi")}</p>
              <p className="text-xs font-mono text-foreground truncate">{chineseAddress}</p>
            </div>
            <button 
              onClick={copyAddress}
              className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-primary" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Icon Grid - Travel Info */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-4 gap-1.5">
          {/* Taxi Fare */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            travelInfo.taxi ? "bg-accent/20" : "bg-muted/30"
          )}>
            <Car className={cn("w-4 h-4 mb-0.5", travelInfo.taxi ? "text-accent-foreground" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.taxiFare")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", travelInfo.taxi ? "text-accent-foreground" : "text-muted-foreground")}>
              {travelInfo.taxi || "—"}
            </span>
          </div>

          {/* Metro */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            travelInfo.metro ? "bg-primary/10" : "bg-muted/30"
          )}>
            <Train className={cn("w-4 h-4 mb-0.5", travelInfo.metro ? "text-primary" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.metro")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", travelInfo.metro ? "text-primary" : "text-muted-foreground")}>
              {travelInfo.metro || "—"}
            </span>
          </div>

          {/* Hours */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            market.working_hours ? "bg-secondary" : "bg-muted/30"
          )}>
            <Clock className={cn("w-4 h-4 mb-0.5", market.working_hours ? "text-secondary-foreground" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.hours")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", market.working_hours ? "text-secondary-foreground" : "text-muted-foreground")}>
              {market.working_hours || "—"}
            </span>
          </div>

          {/* Distance */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            travelInfo.distance ? "bg-muted" : "bg-muted/30"
          )}>
            <Navigation className={cn("w-4 h-4 mb-0.5", travelInfo.distance ? "text-foreground" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.distance")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", travelInfo.distance ? "text-foreground" : "text-muted-foreground")}>
              {travelInfo.distance || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProductSearchProps {
  onClose?: () => void;
}

export const ProductSearch = ({ onClose }: ProductSearchProps) => {
  const { t } = useTranslation();
  const { getField, currentLanguage } = useTranslatedField();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("product");
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedType, setSelectedType] = useState<SearchType | null>(null);
  const [markets, setMarkets] = useState<MarketWithCategory[]>([]);
  const [hubs, setHubs] = useState<HubWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => {
      const name = getField(cat, 'name').toLowerCase();
      const slug = cat.slug.toLowerCase().replace(/_/g, ' ');
      return name.includes(query) || slug.includes(query);
    });
  }, [categories, searchQuery, currentLanguage]);

  // Group categories by their group
  const groupedCategories = useMemo(() => {
    const groups: Record<string, ProductCategory[]> = {};
    
    Object.entries(categoryGroups).forEach(([groupKey, group]) => {
      groups[groupKey] = filteredCategories.filter(cat => 
        group.slugs.includes(cat.slug)
      );
    });
    
    // Add any categories that don't fit into predefined groups
    const allGroupedSlugs = Object.values(categoryGroups).flatMap(g => g.slugs);
    const ungrouped = filteredCategories.filter(cat => !allGroupedSlugs.includes(cat.slug));
    if (ungrouped.length > 0) {
      groups["other"] = ungrouped;
    }
    
    return groups;
  }, [filteredCategories]);

  const groupLabels: Record<string, string> = {
    electronics: t("productSearch.groups.electronics", "Electronics & Tech"),
    industrial: t("productSearch.groups.industrial", "Industrial & Machinery"),
    fashion: t("productSearch.groups.fashion", "Apparel & Fashion"),
    home: t("productSearch.groups.home", "Home & Construction"),
    automotive: t("productSearch.groups.automotive", "Automotive & Energy"),
    health: t("productSearch.groups.health", "Health & Beauty"),
    misc: t("productSearch.groups.misc", "Miscellaneous"),
    other: t("productSearch.groups.other", "Other")
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
    setSearchQuery("");
    setExpandedGroups(new Set());
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
    onClose?.();
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
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

  const getIconComponent = (iconName: string | null): LucideIcon => {
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
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

  // Coming Soon State
  const renderComingSoon = () => (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
        <Clock className="w-6 h-6 text-muted-foreground" />
      </div>
      <h4 className="font-semibold text-foreground mb-1 text-sm">
        {t("productSearch.comingSoon")}
      </h4>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
        {t("productSearch.comingSoonDesc")}
      </p>
    </div>
  );

  // Render category groups with collapsible sections
  const renderCategoryGroups = () => (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
      {Object.entries(groupedCategories).map(([groupKey, groupCategories]) => {
        if (groupCategories.length === 0) return null;
        
        const GroupIcon = categoryGroups[groupKey]?.icon || Package;
        const isExpanded = expandedGroups.has(groupKey);
        
        return (
          <Collapsible 
            key={groupKey} 
            open={isExpanded}
            onOpenChange={() => toggleGroup(groupKey)}
          >
            <CollapsibleTrigger className="w-full">
              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl bg-card border border-border/50",
                "hover:border-primary/30 transition-all"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GroupIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">
                      {groupLabels[groupKey]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {groupCategories.length} {t("productSearch.categories", "categories")}
                    </div>
                  </div>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-1.5 mt-2 pl-2">
                {groupCategories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-transparent",
                        "hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                      )}
                    >
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <IconComponent className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground line-clamp-2">
                        {getField(category, 'name')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Collapsed Trigger Card */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-xl",
          "bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20",
          "hover:border-primary/40 hover:from-primary/15 hover:to-accent/15 transition-all"
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
          <Search className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="text-left flex-1">
          <h3 className="font-semibold text-foreground text-sm">{t("productSearch.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("productSearch.subtitle")}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Bottom Sheet Modal */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-4 pb-2 border-b border-border/50">
              <div className="flex items-center gap-3">
                {step !== "product" && (
                  <button 
                    onClick={handleBack}
                    className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <SheetTitle className="text-base">{t("productSearch.title")}</SheetTitle>
                    <p className="text-xs text-muted-foreground">{t("productSearch.subtitle")}</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderBreadcrumb()}
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Step 1: Product Selection */}
              {step === "product" && (
                <div className="space-y-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t("productSearch.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/30 border-border/50 h-10"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {t("common.loading")}
                    </div>
                  ) : searchQuery ? (
                    // Show flat list when searching
                    <div className="grid grid-cols-2 gap-2">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => {
                          const IconComponent = getIconComponent(category.icon);
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategorySelect(category)}
                              className={cn(
                                "flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/50",
                                "hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                              )}
                            >
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-xs font-medium text-foreground line-clamp-2">
                                {getField(category, 'name')}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center py-8 text-muted-foreground text-sm">
                          {t("productSearch.noCategories")}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show grouped categories
                    renderCategoryGroups()
                  )}
                </div>
              )}

              {/* Step 2: Type Selection */}
              {step === "type" && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleTypeSelect("wholesale")}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50",
                      "hover:border-primary/50 hover:bg-primary/5 transition-all"
                    )}
                  >
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-foreground text-sm">{t("productSearch.wholesale")}</div>
                      <div className="text-xs text-muted-foreground">{t("productSearch.wholesaleDesc")}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => handleTypeSelect("factory")}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50",
                      "hover:border-primary/50 hover:bg-primary/5 transition-all"
                    )}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
                      <Factory className="w-5 h-5 text-gold" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-foreground text-sm">{t("productSearch.factory")}</div>
                      <div className="text-xs text-muted-foreground">{t("productSearch.factoryDesc")}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gold" />
                  </button>
                </div>
              )}

              {/* Step 3: City Results */}
              {step === "city" && (
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {t("common.loading")}
                    </div>
                  ) : selectedType === "wholesale" ? (
                    citiesWithMarkets.length > 0 ? (
                      citiesWithMarkets.map((cityData) => (
                        <div key={cityData.city} className="space-y-3">
                          {/* City Header */}
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl sticky top-0 backdrop-blur-sm z-10">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground text-sm">{cityData.cityTranslated}</div>
                              <div className="text-xs text-muted-foreground">
                                {cityData.items.length} {t("productSearch.marketsAvailable")}
                              </div>
                            </div>
                          </div>
                          {/* Market Cards - Rich display */}
                          <div className="space-y-3 pl-2">
                            {cityData.items.map((item) => (
                              <SearchMarketCard 
                                key={item.market_id} 
                                market={item.market} 
                                getField={getField}
                                t={t}
                              />
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      renderComingSoon()
                    )
                  ) : (
                    citiesWithHubs.length > 0 ? (
                      citiesWithHubs.map((cityData) => (
                        <div key={cityData.city} className="space-y-3">
                          {/* City Header */}
                          <div className="flex items-center gap-3 p-3 bg-gold/10 rounded-xl sticky top-0 backdrop-blur-sm z-10">
                            <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-gold" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-foreground text-sm">{cityData.cityTranslated}</div>
                              <div className="text-xs text-muted-foreground">
                                {cityData.items.length} {t("productSearch.hubsAvailable")}
                              </div>
                            </div>
                          </div>
                          {/* Hub Cards */}
                          <div className="space-y-3 pl-2">
                            {cityData.items.map((item) => (
                              <div key={item.hub_id} className="bg-card rounded-xl border border-border/50 p-3 hover:border-primary/30 transition-all">
                                <div className="font-medium text-sm text-foreground">
                                  {getField(item.hub, 'industry')} - {getField(item.hub, 'city')}
                                </div>
                                {item.hub.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {getField(item.hub, 'description')}
                                  </p>
                                )}
                                {item.hub.specializations && item.hub.specializations.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {item.hub.specializations.slice(0, 3).map((spec, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-gold/10 text-gold text-xs rounded-full">
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
                      renderComingSoon()
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
