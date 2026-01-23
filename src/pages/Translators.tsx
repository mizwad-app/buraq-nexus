import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  MapPin, 
  Star, 
  BadgeCheck, 
  MessageCircle,
  CalendarCheck,
  ChevronLeft,
  Filter,
  Globe,
  Clock,
  Languages,
  Car,
  IdCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import type { MarketplaceTranslator } from "@/pages/TranslatorMarketplace";
import { BookingSheet } from "@/components/marketplace/BookingSheet";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Translator {
  id: string;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  city: string;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  hsk_level: number | null;
  specializations: string[] | null;
  bio?: string | null;
  bio_uz?: string | null;
  bio_ru?: string | null;
  bio_en?: string | null;
  bio_ar?: string | null;
  price_per_day: number | null;
  is_verified: boolean;
  is_available: boolean;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  age?: number | null;
  years_experience?: number | null;
  phone?: string | null;
  completed_bookings?: number | null;
  language_pairs?: string[] | null;
  intro_video_url?: string | null;
  has_personal_car?: boolean | null;
  has_chinese_driving_license?: boolean | null;
  [key: string]: unknown;
}

const LANGUAGE_PAIRS = [
  { id: "all", label: "Barcha tillar" },
  { id: "uz-zh", label: "Xitoy-O'zbek" },
  { id: "ru-zh", label: "Rus-Xitoy" },
  { id: "en-zh", label: "Ingliz-Xitoy" },
  { id: "es-zh", label: "Ispan-Xitoy" },
];

const PRICE_RANGES = [
  { id: "all", label: "Barchasi", min: 0, max: Infinity },
  { id: "0-300", label: "¥0 - ¥300", min: 0, max: 300 },
  { id: "300-500", label: "¥300 - ¥500", min: 300, max: 500 },
  { id: "500+", label: "¥500+", min: 500, max: Infinity },
];

const TRANSPORT_OPTIONS = [
  { id: "all", label: "Barchasi" },
  { id: "has_car", label: "Avtomobil bor" },
  { id: "has_license", label: "Haydovchilik guvohnomasi" },
];

const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";


const Translators = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getField } = useTranslatedField();
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedTransport, setSelectedTransport] = useState("all");
  const [selectedTranslator, setSelectedTranslator] = useState<Translator | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const bookableTranslator: MarketplaceTranslator | null = useMemo(() => {
    if (!selectedTranslator) return null;
    // Map public translator view to the marketplace translator shape used by BookingSheet
    return {
      id: selectedTranslator.id,
      name: selectedTranslator.name,
      name_uz: selectedTranslator.name_uz ?? null,
      name_ru: selectedTranslator.name_ru ?? null,
      name_en: selectedTranslator.name_en ?? null,
      name_ar: selectedTranslator.name_ar ?? null,
      city: selectedTranslator.city,
      city_uz: selectedTranslator.city_uz ?? null,
      city_ru: selectedTranslator.city_ru ?? null,
      city_en: selectedTranslator.city_en ?? null,
      city_ar: selectedTranslator.city_ar ?? null,
      hsk_level: selectedTranslator.hsk_level,
      specializations: selectedTranslator.specializations ?? null,
      bio: selectedTranslator.bio ?? null,
      bio_uz: selectedTranslator.bio_uz ?? null,
      bio_ru: selectedTranslator.bio_ru ?? null,
      bio_en: selectedTranslator.bio_en ?? null,
      bio_ar: selectedTranslator.bio_ar ?? null,
      price_per_day: selectedTranslator.price_per_day ?? null,
      hourly_rate: null,
      daily_rate: null,
      is_verified: selectedTranslator.is_verified,
      is_available: selectedTranslator.is_available,
      avatar_url: selectedTranslator.avatar_url,
      intro_video_url: selectedTranslator.intro_video_url ?? null,
      rating: selectedTranslator.rating,
      total_reviews: selectedTranslator.total_reviews,
      user_id: (selectedTranslator.user_id as string | null) ?? null,
      // Optional computed fields
      self_declared_hsk: null,
      buraq_verified_hsk: null,
      buraq_verified_at: null,
    } as MarketplaceTranslator;
  }, [selectedTranslator]);

  useEffect(() => {
    fetchTranslators();
  }, []);

  const fetchTranslators = async () => {
    try {
      // Use the public view that excludes sensitive contact info (email/phone)
      // Authenticated users will see phone for WhatsApp contact
      const { data, error } = await supabase
        .from("translators_public")
        .select("*")
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false });

      if (error) throw error;
      setTranslators(data || []);
    } catch (error) {
      console.error("Error fetching translators:", error);
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(translators.map(t => t.city))];
    return uniqueCities;
  }, [translators]);

  const filteredTranslators = useMemo(() => {
    let result = translators;
    
    if (selectedCity !== "all") {
      result = result.filter(t => t.city === selectedCity);
    }
    
    if (selectedLanguage !== "all") {
      result = result.filter(t => 
        t.language_pairs && t.language_pairs.includes(selectedLanguage)
      );
    }
    
    // Price range filter
    if (selectedPriceRange !== "all") {
      const priceRange = PRICE_RANGES.find(p => p.id === selectedPriceRange);
      if (priceRange) {
        result = result.filter(t => {
          const price = t.price_per_day || 0;
          return price >= priceRange.min && price < priceRange.max;
        });
      }
    }
    
    // Transport filter
    if (selectedTransport === "has_car") {
      result = result.filter(t => t.has_personal_car === true);
    } else if (selectedTransport === "has_license") {
      result = result.filter(t => t.has_chinese_driving_license === true);
    }
    
    return result;
  }, [translators, selectedCity, selectedLanguage, selectedPriceRange, selectedTransport]);

  // Open chat for selected translator - navigate to marketplace with translator selected
  const openChat = (translator: Translator) => {
    navigate('/translator-marketplace', { state: { selectedTranslatorId: translator.id } });
  };

  const renderHSKBadge = (level: number | null) => {
    if (!level) return null;
    
    const colors: Record<number, string> = {
      1: "bg-gray-500",
      2: "bg-blue-400",
      3: "bg-blue-500",
      4: "bg-green-500",
      5: "bg-amber-500",
      6: "bg-red-500",
    };

    return (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold text-white",
        colors[level] || "bg-gray-500"
      )}>
        HSK {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
              <span className="text-sm font-medium text-muted-foreground">
                  Professional tarjima xizmatlari
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mt-1">
                Tarjimonlar
              </h1>
            </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Language Pair Filter */}
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Til juftligi" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_PAIRS.map(lang => (
                <SelectItem key={lang.id} value={lang.id}>{lang.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City, Price and Transport Filters Row */}
          <div className="grid grid-cols-3 gap-2">
            {/* City Filter */}
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Shahar" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha shaharlar</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Narx" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {PRICE_RANGES.map(range => (
                  <SelectItem key={range.id} value={range.id}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Transport Filter */}
            <Select value={selectedTransport} onValueChange={setSelectedTransport}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Transport" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_OPTIONS.map(option => (
                  <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Translators List */}
      <section className="px-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTranslators.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("translators.noResults")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTranslators.map((translator) => (
              <div
                key={translator.id}
                onClick={() => { setSelectedTranslator(translator); setDetailOpen(true); }}
                className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={translator.avatar_url || AVATAR_PLACEHOLDER}
                      alt={getField(translator, 'name')}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    {translator.is_verified && (
                      <div className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-full">
                        <BadgeCheck className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{getField(translator, 'name')}</h3>
                      {renderHSKBadge(translator.hsk_level)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{getField(translator, 'city')}</span>
                      {translator.age && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{translator.age} yosh</span>
                        </>
                      )}
                    </div>

                    {/* Specializations & Transport Badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {translator.specializations && translator.specializations.slice(0, 3).map((spec, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-muted rounded-full text-[10px] text-muted-foreground">
                          {spec}
                        </span>
                      ))}
                      {/* Transport Badges */}
                      {translator.has_personal_car && (
                        <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          Avtomobil
                        </span>
                      )}
                      {translator.has_chinese_driving_license && (
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-600 flex items-center gap-1">
                          <IdCard className="w-3 h-3" />
                          Guvohnoma
                        </span>
                      )}
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        {translator.rating > 0 && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-medium">{translator.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-muted-foreground">({translator.total_reviews})</span>
                          </div>
                        )}
                        <span className={cn(
                          "flex items-center gap-1 text-xs",
                          translator.is_available ? "text-emerald-500" : "text-muted-foreground"
                        )}>
                          <Clock className="w-3 h-3" />
                          {translator.is_available ? t("translators.available") : t("translators.busy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {translator.price_per_day && (
                          <span className="text-sm font-semibold text-primary">
                            ¥{translator.price_per_day}/day
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTranslator(translator);
                            setBookingOpen(true);
                          }}
                          className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          Band qilish
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Translator Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          {selectedTranslator && (
            <div className="h-full overflow-y-auto">
              <SheetHeader className="text-left pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={selectedTranslator.avatar_url || AVATAR_PLACEHOLDER}
                      alt={getField(selectedTranslator, 'name')}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    {selectedTranslator.is_verified && (
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full">
                        <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SheetTitle className="text-xl">{getField(selectedTranslator, 'name')}</SheetTitle>
                      {renderHSKBadge(selectedTranslator.hsk_level)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{getField(selectedTranslator, 'city')}</span>
                      {selectedTranslator.age && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{selectedTranslator.age} yosh</span>
                        </>
                      )}
                    </div>
                    {selectedTranslator.is_verified && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                        <BadgeCheck className="w-3 h-3" />
                        {t("translators.verifiedByBuraq")}
                      </div>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Detailed Rating Matrix (replaces single rating stat) */}
              <div className="mb-4">
              <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border/30">
                  {([
                    { label: "Ishonchlilik", value: selectedTranslator.rating },
                    { label: "Muzokara san'ati", value: selectedTranslator.rating },
                    { label: "Vaqtga rioya qilish (Punktualnost)", value: selectedTranslator.rating },
                    { label: "Bilim darajasi", value: selectedTranslator.rating },
                  ] as const).map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80">{row.label}</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-4 h-4 transition-colors",
                              star <= Math.round(Number(row.value) || 0)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground mb-1">{selectedTranslator.total_reviews}</div>
                  <p className="text-[10px] text-muted-foreground">{t("translators.reviews")}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-primary mb-1">
                    {selectedTranslator.price_per_day ? `¥${selectedTranslator.price_per_day}` : "—"}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t("translators.perDay")}</p>
                </div>
              </div>

              {/* Bio */}
              {getField(selectedTranslator, 'bio') && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">{t("translators.about")}</h4>
                  <p className="text-sm text-muted-foreground">{getField(selectedTranslator, 'bio')}</p>
                </div>
              )}

              {/* Specializations */}
              {selectedTranslator.specializations && selectedTranslator.specializations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">{t("translators.specializations")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTranslator.specializations.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Chat Button */}
              <div className="pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openChat(selectedTranslator)}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-primary hover:bg-primary/90 transition-all"
                  >
                    <MessageCircle className="w-6 h-6 text-primary-foreground" />
                    <span className="font-semibold text-primary-foreground">Xabar yozish</span>
                  </button>

                  <button
                    onClick={() => {
                      setDetailOpen(false);
                      setBookingOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <CalendarCheck className="w-6 h-6" />
                    <span className="font-semibold">Band qilish</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Booking Sheet */}
      <BookingSheet
        translator={bookableTranslator}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </div>
  );
};

export default Translators;
