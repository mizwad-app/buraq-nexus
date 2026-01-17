import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCity, CityOption } from "@/contexts/CityContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";

interface CityData {
  city: string;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  [key: string]: unknown;
}

export const GlobalCityFilter = () => {
  const { t } = useTranslation();
  const { selectedCity, setSelectedCity, availableCities, setAvailableCities } = useCity();
  const { getField, currentLanguage } = useTranslatedField();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const [marketsRes, hubsRes, restaurantsRes, mallsRes, mosquesRes] = await Promise.all([
          supabase.from("wholesale_markets").select("city, city_uz, city_ru, city_en, city_ar"),
          supabase.from("production_hubs").select("city, city_uz, city_ru, city_en, city_ar"),
          supabase.from("restaurants").select("city, city_uz, city_ru, city_en, city_ar"),
          supabase.from("shopping_malls").select("city, city_uz, city_ru, city_en, city_ar"),
          supabase.from("mosques").select("city, city_uz, city_ru, city_en, city_ar"),
        ]);

        const citiesMap = new Map<string, CityData>();
        
        const addCities = (data: CityData[] | null) => {
          if (data) {
            data.forEach(item => {
              if (!citiesMap.has(item.city)) {
                citiesMap.set(item.city, item);
              }
            });
          }
        };

        addCities(marketsRes.data as CityData[]);
        addCities(hubsRes.data as CityData[]);
        addCities(restaurantsRes.data as CityData[]);
        addCities(mallsRes.data as CityData[]);
        addCities(mosquesRes.data as CityData[]);

        const cities: CityOption[] = Array.from(citiesMap.entries())
          .map(([base, data]) => ({
            base,
            translated: getField(data, 'city') || base,
          }))
          .sort((a, b) => a.translated.localeCompare(b.translated));

        setAvailableCities(cities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, [currentLanguage, setAvailableCities]);

  // Update translated names when language changes
  const translatedCities = useMemo(() => {
    return availableCities.map(city => ({
      ...city,
      translated: city.translated || city.base,
    }));
  }, [availableCities, currentLanguage]);

  const selectedCityTranslated = translatedCities.find(c => c.base === selectedCity)?.translated || selectedCity;

  return (
    <Select value={selectedCity} onValueChange={setSelectedCity}>
      <SelectTrigger className="w-full bg-card border-border/50">
        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder={t("business.selectCity")}>
          {selectedCity === "all" ? `${t("common.all")} ${t("business.cities")}` : selectedCityTranslated}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-border z-50">
        <SelectItem value="all">{t("common.all")} {t("business.cities")}</SelectItem>
        {translatedCities.map((city) => (
          <SelectItem key={city.base} value={city.base}>{city.translated}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
