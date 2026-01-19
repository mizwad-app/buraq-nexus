import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Utensils,
  MapPin,
  ScanLine,
  AlertTriangle,
  ChevronRight,
  Star,
  XCircle,
  ShoppingBag,
  Check,
  Navigation,
} from "lucide-react";
import { AIScannerModal } from "@/components/AIScannerModal";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";
import { GlobalCityFilter } from "@/components/GlobalCityFilter";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { HalalStatusBadge } from "@/components/icons/HalalStatusIcons";
import { cn } from "@/lib/utils";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";

interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  cuisine_type: string;
  address: string | null;
  description: string | null;
  rating: number | null;
  is_halal_certified: boolean;
  halal_status: 'certified' | 'doubtful' | 'not_halal' | null;
  serves_alcohol: boolean | null;
  halal_status_note: string | null;
  halal_status_note_uz: string | null;
  halal_status_note_ru: string | null;
  halal_status_note_en: string | null;
  halal_status_note_ar: string | null;
  image_url?: string | null;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  cuisine_type_uz?: string | null;
  cuisine_type_ru?: string | null;
  cuisine_type_en?: string | null;
  cuisine_type_ar?: string | null;
  [key: string]: unknown;
}

const RESTAURANT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80";

interface ShoppingMall {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  description: string | null;
  has_halal_food: boolean;
  rating: number | null;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  [key: string]: unknown;
}

// Ingredients to avoid
const harmfulIngredients = [
  { name: "Gelatin (pork)", nameKey: "gelatin", category: "haram", severity: "high" },
  { name: "E120 (Carmine)", nameKey: "e120", category: "suspicious", severity: "medium" },
  { name: "E441 (Gelatin)", nameKey: "e441", category: "suspicious", severity: "medium" },
  { name: "Alcohol", nameKey: "alcohol", category: "haram", severity: "high" },
  { name: "E422 (Glycerin)", nameKey: "e422", category: "suspicious", severity: "low" },
  { name: "E471 (Mono and diglycerides)", nameKey: "e471", category: "suspicious", severity: "medium" },
];

type HalalFilter = 'all' | 'certified' | 'doubtful' | 'not_halal';

const Ibadah = () => {
  const { t } = useTranslation();
  const { selectedCity } = useCity();
  const { getField, currentLanguage } = useTranslatedField();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [malls, setMalls] = useState<ShoppingMall[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'restaurants' | 'shopping'>('restaurants');
  const [halalFilter, setHalalFilter] = useState<HalalFilter>('all');

  const filterChips: { id: HalalFilter; labelKey: string; color: string }[] = [
    { id: 'all', labelKey: 'halal.filterAll', color: 'bg-secondary text-secondary-foreground' },
    { id: 'certified', labelKey: 'halal.filterHalalOnly', color: 'bg-emerald-500 text-white' },
    { id: 'doubtful', labelKey: 'halal.filterDoubtful', color: 'bg-amber-500 text-white' },
    { id: 'not_halal', labelKey: 'halal.filterNotHalal', color: 'bg-red-500 text-white' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [restaurantsRes, mallsRes] = await Promise.all([
        supabase.from("restaurants").select("*").order("rating", { ascending: false }),
        supabase.from("shopping_malls").select("*").order("rating", { ascending: false }),
      ]);

      if (restaurantsRes.data) setRestaurants(restaurantsRes.data as Restaurant[]);
      if (mallsRes.data) setMalls(mallsRes.data as ShoppingMall[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get tooltip text based on status and language
  const getStatusTooltip = (restaurant: Restaurant): string => {
    const noteField = getField(restaurant, 'halal_status_note');
    if (noteField) return noteField;
    
    const status = restaurant.halal_status || 'certified';
    return t(`halal.status.${status}Desc`);
  };

  // Filter by selected city and halal status
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;
    
    // City filter
    if (selectedCity !== "all") {
      filtered = filtered.filter(r => r.city === selectedCity);
    }
    
    // Halal status filter
    if (halalFilter !== 'all') {
      filtered = filtered.filter(r => {
        const status = r.halal_status || (r.is_halal_certified ? 'certified' : 'not_halal');
        return status === halalFilter;
      });
    }
    
    return filtered;
  }, [restaurants, selectedCity, halalFilter]);

  const filteredMalls = useMemo(() => {
    if (selectedCity === "all") return malls;
    return malls.filter(m => m.city === selectedCity);
  }, [malls, selectedCity]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t("halal.subtitle")}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("halal.title")}
          </h1>
        </div>
      </header>

      {/* Global City Filter */}
      <section className="px-5 mb-4">
        <GlobalCityFilter />
      </section>

      {/* AI Scanner Card */}
      <section className="px-5 mb-6">
        <button
          onClick={() => setScannerOpen(true)}
          className="w-full text-left"
        >
          <div className="relative rounded-2xl overflow-hidden animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-emerald-600/30" />
            <div className="relative p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <ScanLine className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-semibold text-foreground text-lg">
                    {t("halal.aiScanner")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("halal.scanProduct")}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Section Toggle */}
      <section className="px-5 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('restaurants')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'restaurants'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Utensils className="w-4 h-4 inline-block mr-2" />
            {t("halal.restaurants")}
          </button>
          <button
            onClick={() => setActiveSection('shopping')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'shopping'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline-block mr-2" />
            {t("halal.shopping")}
          </button>
        </div>
      </section>

      {/* Halal Filter Chips - Only show for restaurants */}
      {activeSection === 'restaurants' && (
        <section className="px-5 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => setHalalFilter(chip.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  halalFilter === chip.id
                    ? chip.color
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                )}
              >
                {t(chip.labelKey)}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Restaurants Section */}
      {activeSection === 'restaurants' && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {t("halal.restaurants")}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredRestaurants.length})
              </span>
            </h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {t("halal.viewOnMap")}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("business.noResults")}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRestaurants.map((restaurant, index) => {
                const status = (restaurant.halal_status || (restaurant.is_halal_certified ? 'certified' : 'not_halal')) as 'certified' | 'doubtful' | 'not_halal';
                
                return (
                  <div
                    key={restaurant.id}
                    className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Restaurant Image */}
                    <div className="relative h-36 w-full">
                      <img
                        src={restaurant.image_url || RESTAURANT_FALLBACK_IMAGE}
                        alt={getField(restaurant, 'name')}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = RESTAURANT_FALLBACK_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Halal Status Badge - Top Right */}
                      <div className="absolute top-3 right-3">
                        <HalalStatusBadge 
                          status={status}
                          size={32}
                          tooltipText={getStatusTooltip(restaurant)}
                        />
                      </div>
                      
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-semibold text-white text-lg">{getField(restaurant, 'name')}</h3>
                        <p className="text-sm text-white/80">{getField(restaurant, 'cuisine_type')}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground">
                        {getField(restaurant, 'address') || `${getField(restaurant, 'city')}, ${restaurant.country}`}
                      </p>
                      
                      {/* Status Label */}
                      <div className={cn(
                        "inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md text-xs font-medium",
                        status === 'certified' && "bg-emerald-500/10 text-emerald-600",
                        status === 'doubtful' && "bg-amber-500/10 text-amber-600",
                        status === 'not_halal' && "bg-red-500/10 text-red-600"
                      )}>
                        {t(`halal.status.${status}`)}
                      </div>
                      
                      {getField(restaurant, 'description') && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {getField(restaurant, 'description')}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          {restaurant.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs font-medium">{restaurant.rating}</span>
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Shopping Malls Section */}
      {activeSection === 'shopping' && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {t("halal.shopping")}
            </h2>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {t("halal.viewOnMap")}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("business.noResults")}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMalls.map((mall, index) => (
                <div
                  key={mall.id}
                  className="bg-card rounded-2xl p-4 border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{getField(mall, 'name')}</h3>
                        {mall.has_halal_food && (
                          <Check className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getField(mall, 'address') || `${getField(mall, 'city')}, ${mall.country}`}
                      </p>
                      {getField(mall, 'description') && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {getField(mall, 'description')}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {mall.rating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-medium">{mall.rating}</span>
                          </div>
                        )}
                        {mall.has_halal_food && (
                          <span className="text-xs text-emerald-500 font-medium">
                            {t("halal.hasHalalFood")}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Ingredients to Avoid */}
      <section className="px-5 pb-32">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-display font-semibold text-foreground">
            {t("halal.ingredientsToAvoid")}
          </h2>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          {harmfulIngredients.map((ingredient, index) => (
            <div
              key={ingredient.name}
              className="flex items-center justify-between p-4 border-b border-border/50 last:border-b-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  ingredient.severity === "high" 
                    ? "bg-red-500/10" 
                    : ingredient.severity === "medium"
                      ? "bg-amber-500/10"
                      : "bg-yellow-500/10"
                }`}>
                  <XCircle className={`w-4 h-4 ${
                    ingredient.severity === "high" 
                      ? "text-red-500" 
                      : ingredient.severity === "medium"
                        ? "text-amber-500"
                        : "text-yellow-500"
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{ingredient.name}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                ingredient.category === "haram"
                  ? "bg-red-500/10 text-red-500"
                  : "bg-amber-500/10 text-amber-500"
              }`}>
                {ingredient.category === "haram" ? t("halal.haram") : t("halal.suspicious")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Scanner Modal */}
      <AIScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
    </div>
  );
};

export default Ibadah;
