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
  Check,
  Navigation,
  Moon,
  Clock,
  Users,
  Store,
  ScrollText,
} from "lucide-react";
import { AIScannerModal } from "@/components/AIScannerModal";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";
import { GlobalCityFilter } from "@/components/GlobalCityFilter";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { HalalStatusBadge } from "@/components/icons/HalalStatusIcons";
import { cn } from "@/lib/utils";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";
import { RestaurantDetailSheet } from "@/components/RestaurantDetailSheet";
import { MosqueDetailSheet } from "@/components/MosqueDetailSheet";

// Import mosque images for list view
import huaisheng1 from "@/assets/mosques/huaisheng-1.jpg";
import abiVaqqos1 from "@/assets/mosques/abi-vaqqos-1.jpg";
import xiaodongying1 from "@/assets/mosques/xiaodongying-1.jpg";

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
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown;
}

interface Mosque {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  description: string | null;
  has_friday_prayer: boolean;
  has_womens_section: boolean;
  latitude: number | null;
  longitude: number | null;
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
  address_uz?: string | null;
  address_ru?: string | null;
  address_en?: string | null;
  address_ar?: string | null;
  [key: string]: unknown;
}

const RESTAURANT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80";
const MOSQUE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80";

// Map mosque names to their actual images
const getMosqueImage = (mosqueName: string): string => {
  const lowerName = mosqueName.toLowerCase();
  if (lowerName.includes("huaisheng") || lowerName.includes("怀圣")) return huaisheng1;
  if (lowerName.includes("vaqqos") || lowerName.includes("先贤") || lowerName.includes("xianxian")) return abiVaqqos1;
  if (lowerName.includes("xiaodongying") || lowerName.includes("小东营")) return xiaodongying1;
  return MOSQUE_FALLBACK_IMAGE;
};

// Ingredients to avoid
const harmfulIngredients = [
  { name: "Gelatin (pork)", nameKey: "gelatin", category: "haram", severity: "high" },
  { name: "E120 (Carmine)", nameKey: "e120", category: "suspicious", severity: "medium" },
  { name: "E441 (Gelatin)", nameKey: "e441", category: "suspicious", severity: "medium" },
  { name: "Alcohol", nameKey: "alcohol", category: "haram", severity: "high" },
  { name: "E422 (Glycerin)", nameKey: "e422", category: "suspicious", severity: "low" },
  { name: "E471 (Mono and diglycerides)", nameKey: "e471", category: "suspicious", severity: "medium" },
];

const prayerTimes = [
  { name: "Fajr", nameKey: "fajr", time: "05:42", active: false },
  { name: "Dhuhr", nameKey: "dhuhr", time: "12:15", active: true },
  { name: "Asr", nameKey: "asr", time: "15:48", active: false },
  { name: "Maghrib", nameKey: "maghrib", time: "18:23", active: false },
  { name: "Isha", nameKey: "isha", time: "19:45", active: false },
];

type HalalFilter = 'all' | 'certified' | 'doubtful' | 'not_halal';
type ActiveSection = 'restaurants' | 'mosques' | 'shops';

const Ibadah = () => {
  const { t } = useTranslation();
  const { selectedCity } = useCity();
  const { getField, currentLanguage } = useTranslatedField();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('restaurants');
  const [halalFilter, setHalalFilter] = useState<HalalFilter>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantDetailOpen, setRestaurantDetailOpen] = useState(false);
  
  // Mosque navigation state
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [mosqueDetailOpen, setMosqueDetailOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

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
      const [restaurantsRes, mosquesRes] = await Promise.all([
        supabase.from("restaurants").select("*").order("rating", { ascending: false }),
        supabase.from("mosques").select("*").order("name", { ascending: true }),
      ]);

      if (restaurantsRes.data) setRestaurants(restaurantsRes.data as Restaurant[]);
      if (mosquesRes.data) setMosques(mosquesRes.data as Mosque[]);
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
    
    if (selectedCity !== "all") {
      filtered = filtered.filter(r => r.city === selectedCity);
    }
    
    if (halalFilter !== 'all') {
      filtered = filtered.filter(r => {
        const status = r.halal_status || (r.is_halal_certified ? 'certified' : 'not_halal');
        return status === halalFilter;
      });
    }
    
    return filtered;
  }, [restaurants, selectedCity, halalFilter]);

  const filteredMosques = useMemo(() => {
    if (selectedCity === "all") return mosques;
    return mosques.filter(m => m.city === selectedCity);
  }, [mosques, selectedCity]);

  const requestLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError(t("mosques.locationError"));
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (error) => {
        setLocationError(t("mosques.locationError"));
        setLoadingLocation(false);
        console.error("Geolocation error:", error);
      }
    );
  };

  const handleOpenMapNavigation = (mosque: Mosque) => {
    if (mosque.latitude && mosque.longitude) {
      setSelectedMosque(mosque);
      setMapSheetOpen(true);
    }
  };

  const handleOpenMosqueDetail = (mosque: Mosque) => {
    setSelectedMosque(mosque);
    setMosqueDetailOpen(true);
  };

  // Get translated city name for header
  const selectedCityTranslated = useMemo(() => {
    if (selectedCity === "all") return t("common.all");
    const mosque = mosques.find(m => m.city === selectedCity);
    return mosque ? getField(mosque, 'city') : selectedCity;
  }, [selectedCity, mosques, currentLanguage, t]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Moon className="w-5 h-5 text-white" />
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

      {/* Section Toggle - 3 Tabs */}
      <section className="px-5 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('restaurants')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'restaurants'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Utensils className="w-4 h-4 inline-block mr-1" />
            {t("halal.restaurantsTab")}
          </button>
          <button
            onClick={() => setActiveSection('mosques')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'mosques'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Moon className="w-4 h-4 inline-block mr-1" />
            {t("halal.mosquesTab")}
          </button>
          <button
            onClick={() => setActiveSection('shops')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'shops'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Store className="w-4 h-4 inline-block mr-1" />
            {t("halal.shopsTab")}
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
                    onClick={() => {
                      setSelectedRestaurant(restaurant);
                      setRestaurantDetailOpen(true);
                    }}
                    className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-40 w-full">
                      <img
                        src={restaurant.image_url || RESTAURANT_FALLBACK_IMAGE}
                        alt={getField(restaurant, 'name')}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = RESTAURANT_FALLBACK_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <div className="absolute top-3 right-3 z-10">
                        <div className={cn(
                          "rounded-xl p-1 shadow-lg backdrop-blur-sm",
                          status === 'certified' && "bg-emerald-500/90",
                          status === 'doubtful' && "bg-amber-500/90",
                          status === 'not_halal' && "bg-red-500/90"
                        )}>
                          <HalalStatusBadge 
                            status={status}
                            size={28}
                            tooltipText={getStatusTooltip(restaurant)}
                            showTooltip={false}
                          />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-12 left-3 z-10">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg",
                          status === 'certified' && "bg-emerald-500 text-white",
                          status === 'doubtful' && "bg-amber-500 text-white",
                          status === 'not_halal' && "bg-red-500 text-white"
                        )}>
                          {t(`halal.status.${status}`)}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="font-semibold text-white text-lg drop-shadow-lg">{getField(restaurant, 'name')}</h3>
                        <p className="text-sm text-white/90">{getField(restaurant, 'cuisine_type')}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground">
                        {getField(restaurant, 'address') || `${getField(restaurant, 'city')}, ${restaurant.country}`}
                      </p>
                      
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

      {/* Mosques Section */}
      {activeSection === 'mosques' && (
        <section className="px-5 mb-6">
          {/* Prayer Times Card */}
          <div className="bg-card rounded-3xl p-5 shadow-card animate-scale-in border border-border/50 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-foreground">
                    {t("mosques.prayerTimes")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedCityTranslated}, China
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {prayerTimes.map((prayer, index) => (
                <div
                  key={prayer.name}
                  className={cn(
                    "text-center p-3 rounded-xl transition-all animate-fade-in",
                    prayer.active
                      ? "bg-gradient-to-br from-primary to-accent shadow-lg"
                      : "bg-muted"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <p
                    className={cn(
                      "text-[10px] font-medium",
                      prayer.active
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {prayer.name}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold mt-1",
                      prayer.active ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {prayer.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Location Button */}
          <button
            onClick={requestLocation}
            disabled={loadingLocation}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 text-primary font-medium transition-all hover:bg-primary/20 disabled:opacity-50 mb-4"
          >
            <Navigation className={cn("w-5 h-5", loadingLocation && "animate-pulse")} />
            {loadingLocation 
              ? t("common.loading")
              : userLocation 
                ? t("mosques.locationDetected")
                : t("mosques.detectLocation")
            }
          </button>
          {locationError && (
            <p className="text-xs text-destructive text-center mb-2">{locationError}</p>
          )}
          {userLocation && (
            <p className="text-xs text-muted-foreground text-center mb-4">
              {t("mosques.locationDetected")} ✓
            </p>
          )}

          {/* Mosques List */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {t("mosques.nearbyMosques")}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredMosques.length})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMosques.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("business.noResults")}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMosques.map((mosque, index) => (
                <div
                  key={mosque.id}
                  onClick={() => handleOpenMosqueDetail(mosque)}
                  className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-40 w-full">
                    <img
                      src={getMosqueImage(mosque.name)}
                      alt={getField(mosque, 'name')}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = MOSQUE_FALLBACK_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Historical badge for special mosques */}
                    {(mosque.name.toLowerCase().includes("huaisheng") || mosque.name.includes("怀圣")) && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-xs font-medium">
                          <ScrollText className="w-3 h-3" />
                          {t("mosque.history")}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-semibold text-white text-lg">{getField(mosque, 'name')}</h3>
                      <p className="text-sm text-white/80">
                        {getField(mosque, 'address') || `${getField(mosque, 'city')}, ${mosque.country}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {getField(mosque, 'description') && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {getField(mosque, 'description')}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      {mosque.has_friday_prayer && (
                        <div className="flex items-center gap-1 text-emerald-500">
                          <Check className="w-3 h-3" />
                          <span className="text-xs font-medium">{t("mosques.fridayPrayer")}</span>
                        </div>
                      )}
                      {mosque.has_womens_section && (
                        <div className="flex items-center gap-1 text-primary">
                          <Users className="w-3 h-3" />
                          <span className="text-xs font-medium">{t("mosques.womensSection")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMapNavigation(mosque);
                        }}
                        disabled={!mosque.latitude || !mosque.longitude}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                      >
                        <Navigation className="w-4 h-4" />
                        {t("mosques.directions")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMosqueDetail(mosque);
                        }}
                        className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <ScrollText className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Halal Shops Section - Coming Soon */}
      {activeSection === 'shops' && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">
              {t("halal.halalShops")}
            </h2>
          </div>

          <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              {t("productSearch.comingSoon")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("halal.shopsComingSoon")}
            </p>
          </div>
        </section>
      )}

      {/* Ingredients to Avoid */}
      <section className="px-5 mb-6">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          {t("halal.ingredientsToAvoid")}
        </h2>

        <div className="space-y-2">
          {harmfulIngredients.map((ingredient, index) => (
            <div
              key={ingredient.nameKey}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  ingredient.category === "haram"
                    ? "bg-red-500/20"
                    : "bg-amber-500/20"
                )}
              >
                {ingredient.category === "haram" ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {ingredient.name}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    ingredient.category === "haram"
                      ? "text-red-500"
                      : "text-amber-500"
                  )}
                >
                  {t(`halal.${ingredient.category}`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Scanner Modal */}
      <AIScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
      />

      {/* Restaurant Detail Sheet */}
      {selectedRestaurant && (
        <RestaurantDetailSheet
          open={restaurantDetailOpen}
          onOpenChange={setRestaurantDetailOpen}
          restaurant={selectedRestaurant}
        />
      )}

      {/* Mosque Detail Sheet */}
      {selectedMosque && (
        <MosqueDetailSheet
          open={mosqueDetailOpen}
          onOpenChange={setMosqueDetailOpen}
          mosque={selectedMosque}
        />
      )}

      {/* Map Navigation Sheet for Mosques */}
      {selectedMosque && selectedMosque.latitude && selectedMosque.longitude && (
        <MapNavigationSheet
          open={mapSheetOpen}
          onOpenChange={setMapSheetOpen}
          latitude={selectedMosque.latitude}
          longitude={selectedMosque.longitude}
          name={getField(selectedMosque, 'name')}
          address={getField(selectedMosque, 'address')}
          addressChinese={selectedMosque.address}
        />
      )}
    </div>
  );
};

export default Ibadah;