import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Moon, 
  Clock, 
  MapPin, 
  Navigation,
  Check,
  Users,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";
import { GlobalCityFilter } from "@/components/GlobalCityFilter";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";
import { useSwipeBack } from "@/hooks/useSwipeBack";

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

const MOSQUE_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80";

const prayerTimes = [
  { name: "Fajr", nameKey: "fajr", time: "05:42", active: false },
  { name: "Dhuhr", nameKey: "dhuhr", time: "12:15", active: true },
  { name: "Asr", nameKey: "asr", time: "15:48", active: false },
  { name: "Maghrib", nameKey: "maghrib", time: "18:23", active: false },
  { name: "Isha", nameKey: "isha", time: "19:45", active: false },
];

const Mosques = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { selectedCity } = useCity();
  const { getField, currentLanguage } = useTranslatedField();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Enable swipe back gesture
  useSwipeBack();
  
  // Map navigation sheet state
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

  useEffect(() => {
    fetchMosques();
  }, []);

  const fetchMosques = async () => {
    try {
      const { data, error } = await supabase
        .from("mosques")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      if (data) setMosques(data as Mosque[]);
    } catch (error) {
      console.error("Error fetching mosques:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter mosques by selected city
  const filteredMosques = useMemo(() => {
    if (selectedCity === "all") return mosques;
    return mosques.filter(m => m.city === selectedCity);
  }, [mosques, selectedCity]);

  // Get translated city name for header
  const selectedCityTranslated = useMemo(() => {
    if (selectedCity === "all") return t("common.all");
    const mosque = mosques.find(m => m.city === selectedCity);
    return mosque ? getField(mosque, 'city') : selectedCity;
  }, [selectedCity, mosques, currentLanguage, t]);

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

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
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
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Moon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t("mosques.subtitle")}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">
              {t("mosques.title")}
            </h1>
          </div>
        </div>
      </header>

      {/* Global City Filter */}
      <section className="px-5 mb-4">
        <GlobalCityFilter />
      </section>

      {/* Prayer Times Card */}
      <section className="px-5 mb-6">
        <div className="bg-card rounded-3xl p-5 shadow-card animate-scale-in border border-border/50">
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
            <button className="text-primary text-sm font-medium">
              {t("mosques.change")}
            </button>
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
      </section>

      {/* Location Button */}
      <section className="px-5 mb-4">
        <button
          onClick={requestLocation}
          disabled={loadingLocation}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 text-primary font-medium transition-all hover:bg-primary/20 disabled:opacity-50"
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
          <p className="text-xs text-destructive text-center mt-2">{locationError}</p>
        )}
        {userLocation && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t("mosques.locationDetected")} ✓
          </p>
        )}
      </section>

      {/* Mosques List */}
      <section className="px-5 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            {t("mosques.nearbyMosques")}
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
                className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Mosque Image */}
                <div className="relative h-40 w-full">
                  <img
                    src={mosque.image_url || MOSQUE_FALLBACK_IMAGE}
                    alt={getField(mosque, 'name')}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = MOSQUE_FALLBACK_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-semibold text-white text-lg">{getField(mosque, 'name')}</h3>
                    <p className="text-sm text-white/80">
                      {getField(mosque, 'address') || `${getField(mosque, 'city')}, ${mosque.country}`}
                    </p>
                  </div>
                </div>
                
                <div className="p-4">
                  {getField(mosque, 'description') && (
                    <p className="text-xs text-muted-foreground mb-2">
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
                      onClick={() => handleOpenMapNavigation(mosque)}
                      disabled={!mosque.latitude || !mosque.longitude}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                    >
                      <Navigation className="w-4 h-4" />
                      {t("mosques.directions")}
                    </button>
                    <button
                      onClick={() => handleOpenMapNavigation(mosque)}
                      disabled={!mosque.latitude || !mosque.longitude}
                      className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Map Navigation Sheet */}
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

export default Mosques;
