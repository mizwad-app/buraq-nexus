import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Utensils,
  MapPin,
  ScanLine,
  ChevronRight,
  Star,
  Check,
  Navigation,
  Moon,
  Clock,
  Users,
  Store,
  ScrollText,
  Phone,
  BadgeCheck,
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

interface HalalShop {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  address_chinese: string | null;
  phone: string | null;
  description: string | null;
  image_url: string | null;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
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
  address_uz?: string | null;
  address_ru?: string | null;
  address_en?: string | null;
  address_ar?: string | null;
  [key: string]: unknown;
}

const RESTAURANT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80";
const MOSQUE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80";

// Per-cuisine fallback images so different restaurants don't all show the same chicken photo
const CUISINE_FALLBACK_IMAGES: Record<string, string> = {
  steakhouse: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  "middle eastern": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80",
  arabic: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80",
  "yemeni/arabic": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  yemeni: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  turkish: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800&q=80",
  "turkish/middle eastern": "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800&q=80",
  "mediterranean/turkish": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  "fine dining": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "chinese muslim": "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  uyghur: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  xinjiang: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
  pakistani: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=800&q=80",
  "central asian": "https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=800&q=80",
};

const getRestaurantFallback = (cuisine: string | null | undefined): string => {
  if (!cuisine) return RESTAURANT_FALLBACK_IMAGE;
  return CUISINE_FALLBACK_IMAGES[cuisine.trim().toLowerCase()] || RESTAURANT_FALLBACK_IMAGE;
};

// Map mosque names to their actual images
const getMosqueImage = (mosqueName: string): string => {
  const lowerName = mosqueName.toLowerCase();
  if (lowerName.includes("huaisheng") || lowerName.includes("怀圣")) return huaisheng1;
  if (lowerName.includes("vaqqos") || lowerName.includes("先贤") || lowerName.includes("xianxian")) return abiVaqqos1;
  if (lowerName.includes("xiaodongying") || lowerName.includes("小东营")) return xiaodongying1;
  return MOSQUE_FALLBACK_IMAGE;
};

// Ingredients to avoid (now used in AIScannerModal)

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
  const [halalShops, setHalalShops] = useState<HalalShop[]>([]);
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
      const [restaurantsRes, mosquesRes, shopsRes] = await Promise.all([
        supabase.from("restaurants").select("*").order("rating", { ascending: false }),
        supabase.from("mosques").select("*").order("name", { ascending: true }),
        supabase.from("halal_shops" as any).select("*").order("name", { ascending: true }),
      ]);

      if (restaurantsRes.data) setRestaurants(restaurantsRes.data as Restaurant[]);
      if (mosquesRes.data) setMosques(mosquesRes.data as Mosque[]);
      if (shopsRes.data) setHalalShops(shopsRes.data as unknown as HalalShop[]);
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

  const filteredShops = useMemo(() => {
    if (selectedCity === "all") return halalShops;
    return halalShops.filter(s => s.city === selectedCity);
  }, [halalShops, selectedCity]);

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

      {/* AI Scanner FAB — floating bottom-left to avoid overlap with SupportChat FAB */}
      <button
        onClick={() => setScannerOpen(true)}
        aria-label={t("halal.aiScanner")}
        className="fixed left-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95"
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
      >
        <ScanLine className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
      </button>

      {/* Section Toggle - 3 Tabs */}
      <section className="px-5 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('restaurants')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
              activeSection === 'restaurants'
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary/60'
            }`}
          >
            <Utensils className="w-4 h-4 inline-block mr-1" />
            {t("halal.restaurantsTab")}
          </button>
          <button
            onClick={() => setActiveSection('mosques')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
              activeSection === 'mosques'
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary/60'
            }`}
          >
            <Moon className="w-4 h-4 inline-block mr-1" />
            {t("halal.mosquesTab")}
          </button>
          <button
            onClick={() => setActiveSection('shops')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
              activeSection === 'shops'
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary/60'
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
                        src={restaurant.image_url || getRestaurantFallback(restaurant.cuisine_type)}
                        alt={getField(restaurant, 'name')}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getRestaurantFallback(restaurant.cuisine_type);
                        }}
                      />
                      {/* Stronger gradient bottom for guaranteed text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Halal status icon — top-right */}
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

                      {/* Status text badge — top-left, solid background so it doesn't blend */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg",
                          status === 'certified' && "bg-emerald-600 text-white",
                          status === 'doubtful' && "bg-amber-600 text-white",
                          status === 'not_halal' && "bg-red-600 text-white"
                        )}>
                          {t(`halal.status.${status}`)}
                        </span>
                      </div>

                      {/* Title — bottom, with strong text-shadow and clear gap from badge */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3
                          className="font-semibold text-white text-lg leading-tight"
                          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.95)' }}
                        >
                          {getField(restaurant, 'name')}
                        </h3>
                        <p
                          className="text-sm text-white/90"
                          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
                        >
                          {getField(restaurant, 'cuisine_type')}
                        </p>
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

      {/* Halol Do'konlar Section */}
      {activeSection === 'shops' && (
        <section className="px-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">
                {t("halal.shopsTitle")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("halal.shopsSubtitle")}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 border border-border/50 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">
                {t("halal.noShops")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("halal.shopsSoon")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredShops.map((shop, index) => (
                <div
                  key={shop.id}
                  className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Shop Image / Branded header */}
                  <div className="relative h-40 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600">
                    {shop.image_url ? (
                      <>
                        <img
                          src={shop.image_url}
                          alt={getField(shop, 'name')}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Store className="w-6 h-6 text-white" strokeWidth={2.5} />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      </>
                    )}
                    
                    {/* Verified Badge */}
                    {shop.is_verified && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-medium">
                          <BadgeCheck className="w-3 h-3" />
                          {t("halal.verified")}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-semibold text-white text-lg">{getField(shop, 'name')}</h3>
                      <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{getField(shop, 'city')}, {shop.country}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shop Info */}
                  <div className="p-4">
                    {/* Address */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{t("halal.address")}</p>
                        <p className="text-sm font-medium text-foreground">{getField(shop, 'address')}</p>
                        {shop.address_chinese && (
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{shop.address_chinese}</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {getField(shop, 'description') && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {getField(shop, 'description')}
                      </p>
                    )}

                    {/* Click-to-Call Button */}
                    {shop.phone && (
                      <a
                        href={`tel:${shop.phone}`}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{shop.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Ingredients to Avoid — moved to AIScannerModal as a reference section */}

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