import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  MapPin, 
  Star, 
  BadgeCheck, 
  ChevronLeft,
  Clock,
  Languages,
  Car,
  CircleDollarSign,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Info
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { cn } from "@/lib/utils";
import type { MarketplaceTranslator } from "@/types/marketplace";
import { BookingSheet } from "@/components/marketplace/BookingSheet";
import { TranslatorProfileCard } from "@/components/marketplace/TranslatorProfileCard";
import { TranslatorDetailSheet } from "@/components/marketplace/TranslatorDetailSheet";
import { ChatSheet } from "@/components/marketplace/ChatSheet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  self_declared_hsk?: number | null;
  buraq_verified_hsk?: number | null;
  buraq_verified_at?: string | null;
  specializations: string[] | null;
  languages?: unknown;
  bio?: string | null;
  bio_uz?: string | null;
  bio_ru?: string | null;
  bio_en?: string | null;
  bio_ar?: string | null;
  price_per_day: number | null;
  hourly_rate?: number | null;
  daily_rate?: number | null;
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
  available_today?: boolean | null;
  response_time_avg?: number | null;
  has_personal_car?: boolean | null;
  has_chinese_driving_license?: boolean | null;
  rating_reliability?: number | null;
  rating_negotiation?: number | null;
  rating_punctuality?: number | null;
  rating_knowledge?: number | null;
  [key: string]: unknown;
}

const LANGUAGE_PAIRS = [
  { id: "all", label: "Barcha tillar" },
  { id: "uz-zh", label: "Xitoy-O'zbek" },
  { id: "ru-zh", label: "Xitoy-Rus" },
  { id: "en-zh", label: "Xitoy-Ingliz" },
  { id: "ar-zh", label: "Xitoy-Arabcha" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 1000;
const PRICE_STEP = 50;

const TRANSPORT_OPTIONS = [
  { id: "all", label: "Hammasi", description: null as string | null },
  { id: "has_car", label: "Avtomobili bor tarjimonlar", description: "(o'z mashinasi bor)" },
  { id: "has_license", label: "Guvohnomasi bor tarjimonlar", description: "(Xitoy haydovchilik guvohnomasi — kerak bo'lsa ijaraga avto olish uchun)" },
];

const HSK_LEVELS = [
  { id: "3", label: "HSK 3" },
  { id: "4", label: "HSK 4" },
  { id: "5", label: "HSK 5" },
  { id: "6", label: "HSK 6" },
];

const SPECIALIZATIONS = [
  { id: "biznes", label: "Biznes" },
  { id: "Canton Fair", label: "Canton Fair" },
  { id: "zavodlar", label: "Zavodlar" },
  { id: "ishlab chiqarish", label: "Ishlab chiqarish" },
  { id: "elektronika", label: "Elektronika" },
  { id: "optom", label: "Optom" },
  { id: "bozorlar", label: "Bozorlar" },
  { id: "huquq", label: "Huquq" },
  { id: "moliya", label: "Moliya" },
  { id: "IT", label: "IT" },
  { id: "diplomatiya", label: "Diplomatiya" },
  { id: "turizm", label: "Turizm" },
];

const LANGUAGE_OPTIONS = LANGUAGE_PAIRS.filter(l => l.id !== "all");

const AVAILABILITY_OPTIONS = [
  { id: "all", label: "Hammasi" },
  { id: "today", label: "Bugun mavjud" },
];

const GENDER_OPTIONS = [
  { id: "all", label: "Hammasi" },
  { id: "male", label: "Erkak" },
  { id: "female", label: "Ayol" },
];

const RATING_OPTIONS = [
  { id: "all", label: "Hammasi", min: 0 },
  { id: "4.5", label: "4.5+ ⭐", min: 4.5 },
  { id: "4.8", label: "4.8+ ⭐", min: 4.8 },
];

const Translators = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getField } = useTranslatedField();
  const { user } = useAuth();
  const { toast } = useToast();
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Enable swipe back gesture
  useSwipeBack();
  
  // Filter states
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [selectedTransport, setSelectedTransport] = useState("all");
  const [selectedHskLevels, setSelectedHskLevels] = useState<string[]>([]);
  const [hskMizwadVerified, setHskMizwadVerified] = useState(false);
  const [showHskInfo, setShowHskInfo] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  const [selectedTranslator, setSelectedTranslator] = useState<Translator | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const priceActive = priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX;

  const toggleInArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter(prev => (prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]));
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCity !== "all") count++;
    if (selectedLanguages.length > 0) count++;
    if (priceActive) count++;
    if (selectedTransport !== "all") count++;
    if (selectedHskLevels.length > 0 || hskMizwadVerified) count++;
    if (selectedSpecializations.length > 0) count++;
    if (selectedAvailability !== "all") count++;
    if (selectedGender !== "all") count++;
    if (selectedRating !== "all") count++;
    return count;
  }, [selectedCity, selectedLanguages, priceActive, selectedTransport, selectedHskLevels, hskMizwadVerified, selectedSpecializations, selectedAvailability, selectedGender, selectedRating]);

  const resetFilters = () => {
    setSelectedCity("all");
    setSelectedLanguages([]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedTransport("all");
    setSelectedHskLevels([]);
    setHskMizwadVerified(false);
    setSelectedSpecializations([]);
    setSelectedAvailability("all");
    setSelectedGender("all");
    setSelectedRating("all");
  };

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
      hourly_rate: selectedTranslator.hourly_rate ?? null,
      daily_rate: selectedTranslator.daily_rate ?? null,
      is_verified: selectedTranslator.is_verified,
      is_available: selectedTranslator.is_available,
      avatar_url: selectedTranslator.avatar_url,
      intro_video_url: selectedTranslator.intro_video_url ?? null,
      rating: selectedTranslator.rating,
      total_reviews: selectedTranslator.total_reviews,
      total_bookings: (selectedTranslator.total_bookings as number | undefined) ?? undefined,
      completed_bookings: selectedTranslator.completed_bookings ?? undefined,
      years_experience: selectedTranslator.years_experience ?? undefined,
      age: selectedTranslator.age ?? null,
      gender: selectedTranslator.gender ?? null,
      has_personal_car: selectedTranslator.has_personal_car ?? null,
      has_chinese_driving_license: selectedTranslator.has_chinese_driving_license ?? null,
      user_id: (selectedTranslator.user_id as string | null) ?? null,
      self_declared_hsk: selectedTranslator.self_declared_hsk ?? null,
      buraq_verified_hsk: selectedTranslator.buraq_verified_hsk ?? null,
      buraq_verified_at: selectedTranslator.buraq_verified_at ?? null,
      languages: selectedTranslator.languages,
      available_today: selectedTranslator.available_today ?? null,
      response_time_avg: selectedTranslator.response_time_avg ?? null,
      rating_reliability: selectedTranslator.rating_reliability ?? null,
      rating_negotiation: selectedTranslator.rating_negotiation ?? null,
      rating_punctuality: selectedTranslator.rating_punctuality ?? null,
      rating_knowledge: selectedTranslator.rating_knowledge ?? null,
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
    
    if (selectedLanguages.length > 0) {
      result = result.filter(t =>
        Array.isArray(t.language_pairs) &&
        selectedLanguages.some(l => t.language_pairs!.includes(l))
      );
    }

    // Price range slider filter
    if (priceActive) {
      result = result.filter(t => {
        const price = t.price_per_day ?? 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Transport filter
    if (selectedTransport === "has_car") {
      result = result.filter(t => t.has_personal_car === true);
    } else if (selectedTransport === "has_license") {
      result = result.filter(t => t.has_chinese_driving_license === true);
    }

    // HSK Level filter (multi + Mizwad-verified)
    if (selectedHskLevels.length > 0 || hskMizwadVerified) {
      result = result.filter(t => {
        const levelMatch = selectedHskLevels.length === 0
          ? false
          : selectedHskLevels.map(Number).includes(t.hsk_level as number);
        const verifiedMatch = hskMizwadVerified && (t as any).buraq_verified_hsk != null;
        return levelMatch || verifiedMatch;
      });
    }

    // Specialization filter (multi: any overlap)
    if (selectedSpecializations.length > 0) {
      result = result.filter(t =>
        Array.isArray(t.specializations) &&
        selectedSpecializations.some(sel =>
          t.specializations!.some(s => String(s).toLowerCase().includes(sel.toLowerCase()))
        )
      );
    }

    // Availability filter
    if (selectedAvailability === "today") {
      result = result.filter(t => (t as any).available_today === true);
    }

    // Gender filter
    if (selectedGender !== "all") {
      result = result.filter(t => (t as any).gender === selectedGender);
    }

    // Min rating filter
    if (selectedRating !== "all") {
      const min = parseFloat(selectedRating);
      result = result.filter(t => (t.rating ?? 0) >= min);
    }

    return result;
  }, [translators, selectedCity, selectedLanguages, priceRange, priceActive, selectedTransport, selectedHskLevels, hskMizwadVerified, selectedSpecializations, selectedAvailability, selectedGender, selectedRating]);

  // Open chat for selected translator - inline chat sheet
  const openChat = async (translator: Translator) => {
    if (!user) {
      toast({ title: "Iltimos, avval tizimga kiring", variant: "destructive" });
      return;
    }
    try {
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('client_id', user.id)
        .eq('translator_id', translator.id)
        .limit(1)
        .single();

      if (existing) {
        setConversationId(existing.id);
      } else {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({ client_id: user.id, translator_id: translator.id })
          .select()
          .single();
        if (error) throw error;
        setConversationId(newConv.id);
      }
      setSelectedTranslator(translator);
      setDetailOpen(false);
      setChatOpen(true);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({ title: "Chat ochishda xatolik", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
            aria-label="Go back"
          >
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

        {/* Clean Filter Button */}
        <Button 
          variant={activeFilterCount > 0 ? "default" : "outline"}
          className="w-full gap-2"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtrlash</span>
          {activeFilterCount > 0 && (
            <span className="ml-auto bg-primary-foreground text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedLanguages.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                <Languages className="w-3 h-3" />
                {selectedLanguages.length} til
              </span>
            )}
            {selectedCity !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                <MapPin className="w-3 h-3" />
                {selectedCity}
              </span>
            )}
            {priceActive && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                <CircleDollarSign className="w-3 h-3" />
                ¥{priceRange[0]}–¥{priceRange[1]}
              </span>
            )}
            {selectedTransport !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                <Car className="w-3 h-3" />
                {TRANSPORT_OPTIONS.find(t => t.id === selectedTransport)?.label}
              </span>
            )}
            {(selectedHskLevels.length > 0 || hskMizwadVerified) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary">
                HSK {selectedHskLevels.join(",") || ""}{hskMizwadVerified ? " ✓" : ""}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Filter Modal */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/50 flex-shrink-0">
            <SheetTitle className="text-xl font-bold text-left">Filtrlash</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-6" style={{ WebkitOverflowScrolling: 'touch' as any }}>
            {/* Availability */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Mavjudlik
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABILITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAvailability(opt.id)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                      selectedAvailability === opt.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-foreground border-border/50 hover:border-primary/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Specialization (Sector) — multi-select */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-primary" />
                Mutaxassislik
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSpecializations([])}
                  className={cn(
                    "px-3 py-2 rounded-full text-xs font-medium transition-all border min-h-[36px]",
                    selectedSpecializations.length === 0
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/[0.04] text-foreground border-white/10"
                  )}
                >
                  Barchasi
                </button>
                {SPECIALIZATIONS.map(spec => {
                  const isActive = selectedSpecializations.includes(spec.id);
                  return (
                    <button
                      key={spec.id}
                      onClick={() => toggleInArray(setSelectedSpecializations, spec.id)}
                      className={cn(
                        "px-3 py-2 rounded-full text-xs font-medium transition-all border min-h-[36px]",
                        isActive
                          ? "bg-emerald-500 text-emerald-950 border-emerald-500"
                          : "bg-white/[0.04] text-foreground border-white/10"
                      )}
                    >
                      {spec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Filter — multi-select */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                Til
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedLanguages([])}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                    selectedLanguages.length === 0
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/[0.04] text-foreground border-white/10"
                  )}
                >
                  Barcha tillar
                </button>
                {LANGUAGE_OPTIONS.map(lang => {
                  const isActive = selectedLanguages.includes(lang.id);
                  return (
                    <button
                      key={lang.id}
                      onClick={() => toggleInArray(setSelectedLanguages, lang.id)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                        isActive
                          ? "bg-emerald-500 text-emerald-950 border-emerald-500"
                          : "bg-white/[0.04] text-foreground border-white/10"
                      )}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Shahar
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Barcha shaharlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha shaharlar</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* HSK Level Filter — multi-select + Mizwad-verified */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  HSK darajasi
                </label>
                <button
                  type="button"
                  onClick={() => setShowHskInfo(v => !v)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="HSK ma'lumoti"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              {showHskInfo && (
                <div className="text-xs text-muted-foreground bg-white/[0.04] border border-white/10 rounded-lg p-3 leading-relaxed">
                  HSK — xitoy tilini bilish darajasi (1–6). "Mizwad tasdiqlagan" — Mizwad jamoasi tarjimonning HSK darajasini tekshirgan va tasdiqlagan.
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setSelectedHskLevels([]); setHskMizwadVerified(false); }}
                  className={cn(
                    "px-3 py-3 rounded-xl text-sm font-medium transition-all border",
                    selectedHskLevels.length === 0 && !hskMizwadVerified
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/[0.04] text-foreground border-white/10"
                  )}
                >
                  Barchasi
                </button>
                {HSK_LEVELS.map(level => {
                  const isActive = selectedHskLevels.includes(level.id);
                  return (
                    <button
                      key={level.id}
                      onClick={() => toggleInArray(setSelectedHskLevels, level.id)}
                      className={cn(
                        "px-3 py-3 rounded-xl text-sm font-medium transition-all border",
                        isActive
                          ? "bg-emerald-500 text-emerald-950 border-emerald-500"
                          : "bg-white/[0.04] text-foreground border-white/10"
                      )}
                    >
                      {level.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => setHskMizwadVerified(v => !v)}
                  className={cn(
                    "col-span-3 px-3 py-3 rounded-xl text-sm font-medium transition-all border",
                    hskMizwadVerified
                      ? "bg-emerald-500 text-emerald-950 border-emerald-500"
                      : "bg-white/[0.04] text-foreground border-white/10"
                  )}
                >
                  ✓ Mizwad tasdiqlagan
                </button>
              </div>
            </div>

            {/* Min Rating */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Minimal reyting
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RATING_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedRating(opt.id)}
                    className={cn(
                      "px-3 py-3 rounded-xl text-sm font-medium transition-all border",
                      selectedRating === opt.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-foreground border-border/50 hover:border-primary/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CircleDollarSign className="w-4 h-4 text-primary" />
                  Narx (kuniga, ¥)
                </label>
                <span className="text-sm text-emerald-400 font-medium">
                  ¥{priceRange[0]} — ¥{priceRange[1]}{priceRange[1] === PRICE_MAX ? "+" : ""}
                </span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                className="my-3"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>¥{PRICE_MIN}</span>
                <span>¥{PRICE_MAX}+</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tarjimon o'z narxini belgilaydi. Sizga mos diapazonni tanlang.
              </p>
            </div>


            {/* Transport Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                Transport va guvohnoma
              </label>
              <div className="space-y-2">
                {TRANSPORT_OPTIONS.map(option => {
                  const isActive = selectedTransport === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedTransport(option.id)}
                      className={cn(
                        "w-full rounded-xl border py-3 px-4 text-left flex items-center justify-between gap-3 transition-all",
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                          : "bg-white/[0.04] text-foreground border-white/10"
                      )}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-[11px] text-muted-foreground mt-0.5">{option.description}</span>
                        )}
                      </div>
                      {isActive && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Buttons (iOS-safe via flex column) */}
          <div className="flex-shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background border-t border-border/50 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={resetFilters}
              disabled={activeFilterCount === 0}
            >
              <RotateCcw className="w-4 h-4" />
              Tozalash
            </Button>
            <Button
              className="flex-[2] gap-2"
              onClick={() => setFilterOpen(false)}
            >
              <Check className="w-4 h-4" />
              {filteredTranslators.length === 0
                ? "Tasdiqlash · Mos tarjimon yo'q"
                : `Tasdiqlash · ${filteredTranslators.length} ta tarjimon`}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Translators List */}
      <section className="px-5 pt-4">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredTranslators.length} tarjimon topildi
          </p>
          {activeFilterCount > 0 && (
            <button 
              onClick={resetFilters}
              className="text-xs text-primary hover:underline"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTranslators.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">{t("translators.noResults")}</p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Filtrlarni tozalash
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTranslators.map((translator) => (
              <TranslatorProfileCard
                key={translator.id}
                translator={translator as MarketplaceTranslator}
                onClick={() => { setSelectedTranslator(translator); setDetailOpen(true); }}
                onChat={() => openChat(translator)}
                onBook={() => { setSelectedTranslator(translator); setBookingOpen(true); }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Translator Detail Sheet - With Video Player */}
      <TranslatorDetailSheet
        translator={bookableTranslator}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onBook={() => {
          setDetailOpen(false);
          setTimeout(() => setBookingOpen(true), 250);
        }}
        onChat={() => {
          if (selectedTranslator) {
            openChat(selectedTranslator);
          }
        }}
      />

      {/* Booking Sheet */}
      <BookingSheet
        translator={bookableTranslator}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />

      {/* Chat Sheet */}
      <ChatSheet
        conversationId={conversationId}
        recipientName={selectedTranslator ? getField(selectedTranslator, 'name') : ''}
        recipientAvatar={selectedTranslator?.avatar_url}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  );
};

export default Translators;
