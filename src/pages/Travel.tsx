import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plane,
  MapPin,
  Compass,
  Mountain,
  Palmtree,
  Camera,
  ChevronRight,
  TreePine,
  ShoppingBag,
  Star,
  Train,
  Check,
} from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Park {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  description: string | null;
  park_type: string | null;
  image_url: string | null;
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

const Travel = () => {
  const { t } = useTranslation();
  const { getField, currentLanguage } = useTranslatedField();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("parks");
  const [parks, setParks] = useState<Park[]>([]);
  const [malls, setMalls] = useState<ShoppingMall[]>([]);
  const [loading, setLoading] = useState(true);

  const destinations = [
    { 
      nameKey: "samarkand", 
      typeKey: "samarkandType", 
      image: "🏛️" 
    },
    { 
      nameKey: "chimgan", 
      typeKey: "chimganType", 
      image: "🏔️" 
    },
    { 
      nameKey: "khiva", 
      typeKey: "khivaType", 
      image: "🏰" 
    },
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

  // Get translated city name
  const getTranslatedCity = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
    return getField(item, 'city');
  };

  // Get unique cities from parks and malls
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

  // Filter parks by city
  const filteredParks = useMemo(() => {
    return parks.filter((p) => selectedCity === "all" || p.city === selectedCity);
  }, [parks, selectedCity]);

  // Filter malls by city
  const filteredMalls = useMemo(() => {
    return malls.filter((m) => selectedCity === "all" || m.city === selectedCity);
  }, [malls, selectedCity]);

  // Get selected city's translated name
  const selectedCityTranslated = useMemo(() => {
    if (selectedCity === "all") return "";
    const cityData = allCities.find(c => c.base === selectedCity);
    return cityData?.translated || selectedCity;
  }, [selectedCity, allCities]);

  return (
    <div className="min-h-screen eco-gradient-soft safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 eco-gradient rounded-xl shadow-eco">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t("travel.subtitle")}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("travel.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("travel.discoverPlaces")}
          </p>
        </div>
      </header>

      {/* City Filter */}
      <section className="px-5 mb-4">
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

      {/* Featured Destination */}
      <section className="px-5 mb-6">
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-eco-forest to-eco-emerald-dark p-6 min-h-[180px] animate-scale-in"
        >
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-primary-foreground/20 rounded-full text-xs font-medium text-primary-foreground mb-3">
              ✨ {t("travel.recommended")}
            </span>
            <h2 className="text-xl font-display font-bold text-primary-foreground mb-1">
              {selectedCity !== "all" ? selectedCityTranslated : t("travel.travelAcross")}
            </h2>
            <p className="text-sm text-primary-foreground/80 mb-4">
              {t("travel.ancientCities")}
            </p>
            <button className="flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary-foreground/20 px-4 py-2 rounded-xl">
              {t("travel.view")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-30">🌍</div>
        </div>
      </section>

      {/* Parks & Malls Tabs */}
      <section className="px-5 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="parks" className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              {t("travel.parks")}
            </TabsTrigger>
            <TabsTrigger value="malls" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {t("travel.shoppingMalls")}
            </TabsTrigger>
          </TabsList>

          {/* Parks Tab */}
          <TabsContent value="parks" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredParks.length > 0 ? (
              <div className="space-y-3">
                {filteredParks.map((park, index) => (
                  <div
                    key={park.id}
                    className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {park.image_url && (
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={park.image_url} 
                          alt={getField(park, 'name')}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {getField(park, 'name')}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {getTranslatedCity(park)}
                          </p>
                        </div>
                        {park.park_type && (
                          <span className="text-xs px-2 py-1 rounded-full bg-eco-mint/20 text-eco-forest">
                            {park.park_type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {park.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {getField(park, 'description')}
                        </p>
                      )}
                      {park.address && (
                        <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                          <Train className="w-3 h-3" />
                          {getField(park, 'address')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TreePine className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t("business.noResults")}</p>
              </div>
            )}
          </TabsContent>

          {/* Shopping Malls Tab */}
          <TabsContent value="malls" className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMalls.length > 0 ? (
              <div className="space-y-3">
                {filteredMalls.map((mall, index) => (
                  <div
                    key={mall.id}
                    className="bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {mall.image_url && (
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={mall.image_url} 
                          alt={getField(mall, 'name')}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {getField(mall, 'name')}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {getTranslatedCity(mall)}
                          </p>
                        </div>
                        {mall.rating && (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{mall.rating}</span>
                          </div>
                        )}
                      </div>
                      {mall.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {getField(mall, 'description')}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {mall.has_halal_food && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                            <Check className="w-3 h-3" />
                            {t("travel.hasHalalFood")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t("business.noResults")}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Popular Destinations */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t("travel.popularPlaces")}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {destinations.map((dest, index) => (
            <div
              key={dest.nameKey}
              className="flex-shrink-0 w-32 bg-card rounded-2xl p-4 shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-3">{dest.image}</div>
              <h3 className="font-semibold text-foreground text-sm">
                {t(`travel.destinations.${dest.nameKey}`)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(`travel.destinations.${dest.typeKey}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t("travel.categories")}
        </h2>
        <div className="space-y-3">
          <ModuleCard
            icon={Compass}
            title={t("travel.ecoTours")}
            description={t("travel.ecoToursDesc")}
            iconBgClass="bg-eco-mint"
            delay={0}
          />
          <ModuleCard
            icon={Mountain}
            title={t("travel.mountainTourism")}
            description={t("travel.mountainTourismDesc")}
            iconBgClass="bg-eco-sage"
            delay={100}
          />
          <ModuleCard
            icon={Palmtree}
            title={t("travel.familyVacation")}
            description={t("travel.familyVacationDesc")}
            iconBgClass="bg-secondary"
            delay={200}
          />
          <ModuleCard
            icon={Camera}
            title={t("travel.photoTours")}
            description={t("travel.photoToursDesc")}
            iconBgClass="bg-eco-emerald-light"
            delay={300}
          />
        </div>
      </section>
    </div>
  );
};

export default Travel;
