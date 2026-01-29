import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  MapPin,
  TreePine,
  ShoppingBag,
  Star,
  Check,
  Compass,
  Navigation,
  ChevronLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";

interface Park {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  description: string | null;
  park_type: string | null;
  image_url: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  address_uz?: string | null;
  address_ru?: string | null;
  address_en?: string | null;
  address_ar?: string | null;
  [key: string]: unknown;
}

interface ShoppingMall {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  description: string | null;
  image_url: string | null;
  has_halal_food: boolean | null;
  rating: number | null;
  latitude?: number | null;
  longitude?: number | null;
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
  address_uz?: string | null;
  address_ru?: string | null;
  address_en?: string | null;
  address_ar?: string | null;
  [key: string]: unknown;
}

type CategoryFilter = "all" | "parks" | "malls";
type SelectedItem = { type: "park"; data: Park } | { type: "mall"; data: ShoppingMall };

const Travel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getField, currentLanguage } = useTranslatedField();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [parks, setParks] = useState<Park[]>([]);
  const [malls, setMalls] = useState<ShoppingMall[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Enable swipe back gesture
  useSwipeBack();
  
  // Map navigation sheet state
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const categoryChips = [
    { id: "all" as const, label: t("travel.allCategories"), icon: Compass },
    { id: "parks" as const, label: t("travel.parks"), icon: TreePine },
    { id: "malls" as const, label: t("travel.shoppingMalls"), icon: ShoppingBag },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [parksRes, mallsRes] = await Promise.all([
        supabase.from("parks").select("*"),
        supabase.from("shopping_malls").select("*").order("rating", { ascending: false }),
      ]);

      if (parksRes.data) setParks(parksRes.data as Park[]);
      if (mallsRes.data) setMalls(mallsRes.data as ShoppingMall[]);
    } catch (error) {
      console.error("Error fetching travel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTranslatedCity = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
    return getField(item, 'city');
  };

  const allCities = useMemo(() => {
    const citiesMap = new Map<string, { base: string; translated: string }>();
    const addCity = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
      if (!citiesMap.has(item.city)) {
        citiesMap.set(item.city, { base: item.city, translated: getTranslatedCity(item) });
      }
    };
    parks.forEach(addCity);
    malls.forEach(addCity);
    return Array.from(citiesMap.values()).sort((a, b) => a.translated.localeCompare(b.translated));
  }, [parks, malls, currentLanguage]);

  // Unified filtered results
  const unifiedResults = useMemo(() => {
    type ResultItem = { type: "park"; data: Park } | { type: "mall"; data: ShoppingMall };
    const results: ResultItem[] = [];

    // Filter parks
    if (categoryFilter === "all" || categoryFilter === "parks") {
      parks
        .filter((p) => selectedCity === "all" || p.city === selectedCity)
        .forEach((park) => results.push({ type: "park", data: park }));
    }

    // Filter malls
    if (categoryFilter === "all" || categoryFilter === "malls") {
      malls
        .filter((m) => selectedCity === "all" || m.city === selectedCity)
        .forEach((mall) => results.push({ type: "mall", data: mall }));
    }

    return results;
  }, [parks, malls, selectedCity, categoryFilter]);

  const selectedCityTranslated = useMemo(() => {
    if (selectedCity === "all") return t("travel.allLocations");
    const cityData = allCities.find(c => c.base === selectedCity);
    return cityData?.translated || selectedCity;
  }, [selectedCity, allCities, t]);

  const handleOpenMapNavigation = (item: SelectedItem) => {
    const data = item.data;
    if (data.latitude && data.longitude) {
      setSelectedItem(item);
      setMapSheetOpen(true);
    }
  };

  return (
    <div className="min-h-screen eco-gradient-soft safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4 animate-fade-in">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 eco-gradient rounded-xl shadow-eco">
                <Plane className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t("travel.subtitle")}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">
              {t("travel.title")}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground">
          {t("travel.discoverPlaces")}
        </p>
      </header>

      {/* City Filter - Primary */}
      <section className="px-5 mb-3">
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full bg-card border-border/50">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t("travel.selectCity")} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            <SelectItem value="all">{t("travel.allCities")}</SelectItem>
            {allCities.map((city) => (
              <SelectItem key={city.base} value={city.base}>{city.translated}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Category Filter Chips */}
      <section className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categoryChips.map((chip) => {
            const Icon = chip.icon;
            const isActive = categoryFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setCategoryFilter(chip.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {chip.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Count */}
      <section className="px-5 mb-3">
        <p className="text-sm text-muted-foreground">
          {unifiedResults.length} {t("travel.placesFound")} {selectedCity !== "all" && `• ${selectedCityTranslated}`}
        </p>
      </section>

      {/* Unified Results Feed */}
      <section className="px-5 pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : unifiedResults.length > 0 ? (
          <div className="space-y-3">
            {unifiedResults.map((item, index) => {
              if (item.type === "park") {
                const park = item.data;
                const hasLocation = park.latitude && park.longitude;
                return (
                  <div
                    key={`park-${park.id}`}
                    className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="h-36 overflow-hidden bg-muted">
                      {park.image_url ? (
                        <img 
                          src={park.image_url} 
                          alt={getField(park, 'name')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TreePine className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {getField(park, 'name')}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            {getTranslatedCity(park)}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2 flex-shrink-0 bg-eco-mint/20 text-eco-forest border-0">
                          <TreePine className="w-3 h-3 mr-1" />
                          {park.park_type?.replace('_', ' ') || t("travel.park")}
                        </Badge>
                      </div>
                      {park.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {getField(park, 'description')}
                        </p>
                      )}
                      {hasLocation && (
                        <button
                          onClick={() => handleOpenMapNavigation(item)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                          {t("mosques.directions")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else {
                const mall = item.data;
                const hasLocation = mall.latitude && mall.longitude;
                return (
                  <div
                    key={`mall-${mall.id}`}
                    className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="h-36 overflow-hidden bg-muted">
                      {mall.image_url ? (
                        <img 
                          src={mall.image_url} 
                          alt={getField(mall, 'name')}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {getField(mall, 'name')}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            {getTranslatedCity(mall)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          {mall.rating && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{mall.rating}</span>
                            </div>
                          )}
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-0">
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            {t("travel.mall")}
                          </Badge>
                        </div>
                      </div>
                      {mall.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {getField(mall, 'description')}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {mall.has_halal_food && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                            <Check className="w-3 h-3" />
                            {t("travel.hasHalalFood")}
                          </span>
                        )}
                        {hasLocation && (
                          <button
                            onClick={() => handleOpenMapNavigation(item)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors ml-auto"
                          >
                            <Navigation className="w-4 h-4" />
                            {t("mosques.directions")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">{t("business.noResults")}</p>
            <p className="text-sm mt-1">{t("travel.tryDifferentFilters")}</p>
          </div>
        )}
      </section>

      {/* Map Navigation Sheet */}
      {selectedItem && selectedItem.data.latitude && selectedItem.data.longitude && (
        <MapNavigationSheet
          open={mapSheetOpen}
          onOpenChange={setMapSheetOpen}
          latitude={selectedItem.data.latitude}
          longitude={selectedItem.data.longitude}
          name={getField(selectedItem.data, 'name')}
          address={getField(selectedItem.data, 'address')}
          addressChinese={selectedItem.data.address}
        />
      )}
    </div>
  );
};

export default Travel;
