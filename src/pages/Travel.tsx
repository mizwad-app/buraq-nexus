import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Building2,
  Phone,
  Copy,
  Video,
  Play,
  Smartphone,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Send,
  Train,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";
import { PlaceDetailSheet, type PlaceType, type PlaceData } from "@/components/travel/PlaceDetailSheet";
import { FavoriteButton } from "@/components/travel/FavoriteButton";
import { getPlaceholderGradient, getPlaceholderIcon } from "@/lib/placePlaceholders";
import { MVP_CITIES } from "@/lib/mvpCities";
import { sortByQuality } from "@/lib/placeSorting";
import { HeaderAvatar } from "@/components/HeaderAvatar";
import { LocationDetectButton } from "@/components/travel/LocationDetectButton";

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

type CategoryFilter = "mizwad_top" | "all" | "parks" | "malls" | "historical" | "markets";
type SelectedItem =
  | { type: "park"; data: Park }
  | { type: "mall"; data: ShoppingMall }
  | { type: "historical"; data: PlaceData }
  | { type: "market"; data: PlaceData };

const MIZWAD_CATEGORY_LABELS: Record<string, { emoji: string; label: string }> = {
  park: { emoji: "🌳", label: "Park va bog'lar" },
  mall: { emoji: "🏬", label: "Savdo joylari" },
  historical: { emoji: "🏛️", label: "Tarixiy joylar" },
  market: { emoji: "🛒", label: "Bozorlar" },
};

interface EmbassyInfo {
  id: string;
  type: "embassy" | "consulate";
  nameKey: string;
  phone: string;
  addressChinese: string;
  city: string;
}

const EMBASSIES: EmbassyInfo[] = [
  {
    id: "beijing",
    type: "embassy",
    nameKey: "guide.embassy.beijing",
    phone: "+861065326305",
    addressChinese: "北京市-朝阳区-亮马桥路41号",
    city: "Beijing",
  },
  {
    id: "guangzhou",
    type: "consulate",
    nameKey: "guide.embassy.guangzhou",
    phone: "+8602087595247",
    addressChinese: "广东省-广州市-天河区-临江大道57号中和广场16层1609单元",
    city: "Guangzhou",
  },
  {
    id: "shanghai",
    type: "consulate",
    nameKey: "guide.embassy.shanghai",
    phone: "+862163071896",
    addressChinese: "上海市-虹口区-吴淞路308号耀江国际广场801室",
    city: "Shanghai",
  },
];

const FAQ_ITEMS = [
  { question: "guide.faq.q1", answer: "guide.faq.a1" },
  { question: "guide.faq.q2", answer: "guide.faq.a2" },
  { question: "guide.faq.q3", answer: "guide.faq.a3" },
  { question: "guide.faq.q4", answer: "guide.faq.a4" },
];

interface GuideItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  tips: string[];
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: "simcards",
    titleKey: "guide.simcards.title",
    descriptionKey: "guide.simcards.description",
    icon: Smartphone,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tips: ["guide.simcards.tip1", "guide.simcards.tip2", "guide.simcards.tip3"],
  },
  {
    id: "payments",
    titleKey: "guide.payments.title",
    descriptionKey: "guide.payments.description",
    icon: CreditCard,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    tips: ["guide.payments.tip1", "guide.payments.tip2", "guide.payments.tip3"],
  },
  {
    id: "exchange",
    titleKey: "guide.exchange.title",
    descriptionKey: "guide.exchange.description",
    icon: Banknote,
    color: "text-gold",
    bgColor: "bg-gold/10",
    tips: ["guide.exchange.tip1", "guide.exchange.tip2", "guide.exchange.tip3"],
  },
  {
    id: "digital",
    titleKey: "guide.digital.title",
    descriptionKey: "guide.digital.description",
    icon: ShieldCheck,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    tips: ["guide.digital.tip1", "guide.digital.tip2", "guide.digital.tip3"],
  },
];

const Travel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getField, currentLanguage } = useTranslatedField();
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [parks, setParks] = useState<Park[]>([]);
  const [malls, setMalls] = useState<ShoppingMall[]>([]);
  const [historicalSites, setHistoricalSites] = useState<PlaceData[]>([]);
  const [markets, setMarkets] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [topPicks, setTopPicks] = useState<Array<PlaceData & { type: PlaceType }>>([]);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "places");

  // Place detail sheet
  const [placeDetailOpen, setPlaceDetailOpen] = useState(false);
  const [placeDetail, setPlaceDetail] = useState<{ type: PlaceType; data: PlaceData } | null>(null);

  // Service request modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState<string>("visa_help");
  const [serviceMessage, setServiceMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Enable swipe back gesture
  useSwipeBack();

  // Restore GPS-detected city from sessionStorage (within 30 min)
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("mizwad_detected_city");
      if (!cached) return;
      const parsed = JSON.parse(cached) as {
        name_en?: string | null;
        name_uz?: string;
        timestamp?: number;
      };
      if (!parsed.timestamp || Date.now() - parsed.timestamp > 30 * 60 * 1000) return;
      const key = parsed.name_en || parsed.name_uz;
      if (key) setSelectedCity(key);
    } catch {
      // ignore
    }
  }, []);

  // Map navigation sheet state
  const [mapSheetOpen, setMapSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const categoryChips = [
    { id: "mizwad_top" as const, label: "Mizwad TOP", icon: Sparkles, special: true },
    { id: "all" as const, label: t("travel.allCategories"), icon: Compass },
    { id: "parks" as const, label: t("place.type.park"), icon: TreePine },
    { id: "malls" as const, label: t("place.type.mall"), icon: ShoppingBag },
    { id: "historical" as const, label: t("place.type.historical"), icon: Building2 },
    { id: "markets" as const, label: t("place.type.market"), icon: ShoppingBag },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Mizwad Top 5 picks for selected city
  useEffect(() => {
    const fetchTopPicks = async () => {
      if (!selectedCity || selectedCity === "all") {
        setTopPicks([]);
        return;
      }
      const [hist, mall, mkt, mosque] = await Promise.all([
        supabase.from("historical_sites").select("*").eq("city", selectedCity).eq("is_active", true).not("mizwad_pick_rank", "is", null),
        supabase.from("shopping_malls").select("*").eq("city", selectedCity).eq("is_active", true).not("mizwad_pick_rank", "is", null),
        supabase.from("markets").select("*").eq("city", selectedCity).eq("is_active", true).not("mizwad_pick_rank", "is", null),
        supabase.from("mosques").select("*").eq("city", selectedCity).eq("is_active", true).not("mizwad_pick_rank", "is", null),
      ]);
      const all: Array<PlaceData & { type: PlaceType }> = [
        ...((hist.data || []) as unknown as PlaceData[]).map((p) => ({ ...p, type: "historical" as PlaceType })),
        ...((mall.data || []) as unknown as PlaceData[]).map((p) => ({ ...p, type: "mall" as PlaceType })),
        ...((mkt.data || []) as unknown as PlaceData[]).map((p) => ({ ...p, type: "market" as PlaceType })),
        ...((mosque.data || []) as unknown as PlaceData[]).map((p) => ({ ...p, type: "historical" as PlaceType })),
      ];
      all.sort((a, b) => ((a.mizwad_pick_rank ?? 99) - (b.mizwad_pick_rank ?? 99)));
      setTopPicks(all.slice(0, 5));
    };
    fetchTopPicks();
  }, [selectedCity]);

  // Sync activeTab to URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "places") {
      searchParams.delete("tab");
    } else {
      searchParams.set("tab", value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const fetchData = async () => {
    try {
      const [parksRes, mallsRes, histRes, marketsRes] = await Promise.all([
        supabase.from("parks").select("*").eq("is_active", true),
        supabase.from("shopping_malls").select("*").eq("is_active", true).order("rating", { ascending: false }),
        supabase.from("historical_sites").select("*").eq("is_active", true),
        supabase.from("markets").select("*").eq("is_active", true),
      ]);

      if (parksRes.data) setParks([...(parksRes.data as Park[])].sort(sortByQuality));
      if (mallsRes.data) setMalls([...(mallsRes.data as ShoppingMall[])].sort(sortByQuality));
      if (histRes.data) setHistoricalSites([...(histRes.data as unknown as PlaceData[])].sort(sortByQuality));
      if (marketsRes.data) setMarkets([...(marketsRes.data as unknown as PlaceData[])].sort(sortByQuality));
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
    // Build full MVP city list, enriched with translated names from any DB row when available
    const dbCityData = new Map<string, { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }>();
    const collect = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
      if (item?.city && !dbCityData.has(item.city)) dbCityData.set(item.city, item);
    };
    parks.forEach(collect);
    malls.forEach(collect);
    historicalSites.forEach((h) => collect(h as unknown as { city: string }));
    markets.forEach((m) => collect(m as unknown as { city: string }));

    return MVP_CITIES.map((mc) => {
      const dbRow = dbCityData.get(mc.name);
      const translated = dbRow
        ? getTranslatedCity(dbRow)
        : (currentLanguage === "uz" ? mc.name_uz : mc.name);
      return { base: mc.name, translated };
    }).sort((a, b) => a.translated.localeCompare(b.translated));
  }, [parks, malls, historicalSites, markets, currentLanguage]);

  const unifiedResults = useMemo(() => {
    const results: SelectedItem[] = [];
    const matchCity = (c: string) => selectedCity === "all" || c === selectedCity;

    if (categoryFilter === "mizwad_top") {
      parks.filter((p) => matchCity(p.city) && p.mizwad_rank != null).forEach((p) => results.push({ type: "park", data: p }));
      malls.filter((m) => matchCity(m.city) && (m as PlaceData).mizwad_rank != null).forEach((m) => results.push({ type: "mall", data: m }));
      historicalSites.filter((h) => matchCity(h.city) && h.mizwad_rank != null).forEach((h) => results.push({ type: "historical", data: h }));
      markets.filter((m) => matchCity(m.city) && m.mizwad_rank != null).forEach((m) => results.push({ type: "market", data: m }));
      return results;
    }

    if (categoryFilter === "all" || categoryFilter === "parks") {
      parks.filter((p) => matchCity(p.city)).forEach((park) => results.push({ type: "park", data: park }));
    }
    if (categoryFilter === "all" || categoryFilter === "malls") {
      malls.filter((m) => matchCity(m.city)).forEach((mall) => results.push({ type: "mall", data: mall }));
    }
    if (categoryFilter === "all" || categoryFilter === "historical") {
      historicalSites.filter((h) => matchCity(h.city)).forEach((h) => results.push({ type: "historical", data: h }));
    }
    if (categoryFilter === "all" || categoryFilter === "markets") {
      markets.filter((m) => matchCity(m.city)).forEach((m) => results.push({ type: "market", data: m }));
    }

    // Ranked first within filtered list (when not 'all')
    if (categoryFilter !== "all") {
      results.sort((a, b) => {
        const ar = (a.data as PlaceData).mizwad_rank;
        const br = (b.data as PlaceData).mizwad_rank;
        if (ar != null && br == null) return -1;
        if (ar == null && br != null) return 1;
        if (ar != null && br != null) return ar - br;
        return 0;
      });
    }

    return results;
  }, [parks, malls, historicalSites, markets, selectedCity, categoryFilter]);


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

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success(t("guide.embassy.addressCopied"));
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openServiceRequest = (type: string) => {
    setServiceType(type);
    setServiceMessage("");
    setServiceModalOpen(true);
  };

  const submitServiceRequest = async () => {
    if (!user) {
      toast.error(t("services.loginRequired") || "Iltimos, avval tizimga kiring");
      return;
    }
    if (!serviceMessage.trim()) {
      toast.error(t("services.messageRequired") || "Iltimos, batafsil ma'lumot kiriting");
      return;
    }
    setSubmittingRequest(true);
    try {
      const title =
        serviceType === "visa_help"
          ? (t("services.visaHelp.title") || "Vizа yordami so'rash")
          : (t("services.hotelBooking.title") || "Mehmonxona bron qilish");
      const { error } = await supabase.from("service_requests").insert({
        user_id: user.id,
        service_type: serviceType,
        title,
        description: serviceMessage,
        status: "pending",
      });
      if (error) throw error;
      toast.success(t("services.requestSubmitted") || "So'rovingiz yuborildi");
      setServiceModalOpen(false);
      setServiceMessage("");
    } catch (error) {
      console.error("Error submitting service request:", error);
      toast.error(t("services.requestError") || "Xatolik yuz berdi");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="min-h-screen eco-gradient-soft safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="p-2 eco-gradient rounded-xl shadow-eco">
                  <Plane className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground truncate">
                  {t("travel.subtitle")}
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mt-1">
                {t("travel.title")}
              </h1>
            </div>
          </div>
          <HeaderAvatar />
        </div>
      </header>

      {/* Places */}
      <section className="px-5">
        <div className="mt-4 space-y-4">
            {/* GPS location detect */}
            <LocationDetectButton
              onCityDetected={(cityKey) => setSelectedCity(cityKey)}
            />

            {/* City Filter */}
            <SearchableSelect
              value={selectedCity}
              onChange={setSelectedCity}
              options={[
                { value: "all", label: t("travel.allCities") },
                ...allCities.map((c) => ({ value: c.base, label: c.translated })),
              ]}
              placeholder={t("travel.selectCity")}
              searchPlaceholder={t("travel.selectCity")}
              emptyMessage="—"
              icon={<MapPin className="w-4 h-4" />}
            />

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categoryChips.map((chip) => {
                const Icon = chip.icon;
                const isActive = categoryFilter === chip.id;
                const special = (chip as { special?: boolean }).special;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setCategoryFilter(chip.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                      special && isActive && "bg-amber-500/15 text-amber-400 border-amber-500",
                      special && !isActive && "bg-amber-500/[0.06] text-amber-400/80 border-amber-500/40 hover:bg-amber-500/10",
                      !special && isActive && "bg-primary text-primary-foreground shadow-sm border-transparent",
                      !special && !isActive && "bg-secondary/60 text-muted-foreground hover:bg-secondary border-transparent"
                    )}
                  >
                    {special ? <span>✨</span> : <Icon className="w-3.5 h-3.5" />}
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Hotel CTA */}
            <button
              onClick={() => openServiceRequest("hotel_booking")}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {t("services.hotelBooking.title") || "Mehmonxona bron qilish"}
              </span>
              <Send className="w-4 h-4" />
            </button>

            {/* Mizwad Tavsiyasi — Top 5 picks */}
            {topPicks.length > 0 && (
              <section className="-mx-5">
                <div className="flex items-center justify-between mb-3 px-5">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Mizwad tavsiyasi
                  </h2>
                  <span className="text-xs text-muted-foreground">{selectedCityTranslated}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 px-5 scrollbar-hide snap-x snap-mandatory">
                  {topPicks.map((place) => {
                    const PIcon = getPlaceholderIcon(place.type);
                    const rank = place.mizwad_pick_rank || 0;
                    return (
                      <button
                        key={`pick-${place.type}-${place.id}`}
                        onClick={() => {
                          setPlaceDetail({ type: place.type, data: place });
                          setPlaceDetailOpen(true);
                        }}
                        className="flex-shrink-0 w-64 snap-start text-left bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-amber-500/40 transition-all"
                      >
                        <div className="relative h-32">
                          {place.image_url ? (
                            <img src={place.image_url} alt={getField(place, 'name')} className="w-full h-full object-cover" />
                          ) : (
                            <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", getPlaceholderGradient(place.type))}>
                              <PIcon className="w-10 h-10 text-emerald-500/50" />
                            </div>
                          )}
                          <div className={cn(
                            "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md",
                            rank === 1 && "bg-amber-500 text-white",
                            rank === 2 && "bg-slate-300 text-slate-900",
                            rank === 3 && "bg-orange-600 text-white",
                            rank >= 4 && "bg-emerald-500 text-white",
                          )}>
                            <Star className="w-3 h-3 fill-current" />
                            <span>#{rank}</span>
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-1 mb-1">{getField(place, 'name')}</h3>
                          {place.mizwad_pick_reason_uz && (
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                              "{place.mizwad_pick_reason_uz}"
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Results Count */}
            {categoryFilter !== "mizwad_top" && (
              <p className="text-sm text-muted-foreground">
                {unifiedResults.length} {t("travel.placesFound")} {selectedCity !== "all" && `• ${selectedCityTranslated}`}
              </p>
            )}

            {/* Mizwad TOP grouped view */}
            {categoryFilter === "mizwad_top" && !loading && (
              unifiedResults.length === 0 ? (
                <div className="px-2 py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-1">
                    Mizwad TOP joylar tez orada
                  </h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    Mizwad team eng yaxshi joylarni tanlab, har biri uchun nima uchun tavsiya qilinganligini tushuntirib boradi. Bu funksiya tez orada to'liq ishga tushadi.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {(() => {
                    const groups = new Map<string, SelectedItem[]>();
                    [...unifiedResults]
                      .sort((a, b) => ((a.data as PlaceData).mizwad_rank ?? 99) - ((b.data as PlaceData).mizwad_rank ?? 99))
                      .forEach((it) => {
                        if (!groups.has(it.type)) groups.set(it.type, []);
                        groups.get(it.type)!.push(it);
                      });
                    return Array.from(groups.entries()).map(([type, items]) => {
                      const meta = MIZWAD_CATEGORY_LABELS[type] ?? { emoji: "📍", label: type };
                      return (
                        <section key={type}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{meta.emoji}</span>
                            <h2 className="text-[12px] font-semibold text-amber-400 uppercase tracking-wide">
                              {meta.label}
                            </h2>
                            <span className="text-[10px] text-muted-foreground">({items.length})</span>
                          </div>
                          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4">
                            {items.map((it) => {
                              const p = it.data as PlaceData;
                              const rank = p.mizwad_rank!;
                              const badge = rank === 1
                                ? { e: "🥇", c: "bg-amber-500/90 text-amber-950" }
                                : rank === 2
                                ? { e: "🥈", c: "bg-gray-300/90 text-gray-900" }
                                : rank === 3
                                ? { e: "🥉", c: "bg-orange-600/90 text-orange-50" }
                                : { e: `#${rank}`, c: "bg-emerald-500/90 text-emerald-950" };
                              const rec = getField(p, 'mizwad_recommendation') || p.mizwad_recommendation_uz;
                              return (
                                <button
                                  key={`top-${it.type}-${p.id}`}
                                  onClick={() => { setPlaceDetail({ type: it.type as PlaceType, data: p }); setPlaceDetailOpen(true); }}
                                  className="snap-start shrink-0 w-[260px] flex flex-col bg-card hover:bg-amber-500/5 border border-border/40 hover:border-amber-500/30 rounded-xl overflow-hidden text-left transition-colors"
                                >
                                  <div className="relative w-full aspect-[4/3] bg-emerald-500/10 overflow-hidden">
                                    {p.image_url ? (
                                      <img src={p.image_url} alt={getField(p, 'name')} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
                                        {meta.emoji}
                                      </div>
                                    )}
                                    <div className={cn("absolute top-2 left-2 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold shadow-md", badge.c)}>
                                      <span>{badge.e}</span>
                                      {rank > 3 && <span className="sr-only">rank</span>}
                                    </div>
                                  </div>
                                  <div className="p-3 flex-1 flex flex-col">
                                    <h3 className="text-[14px] font-semibold text-foreground line-clamp-1">
                                      {getField(p, 'name') || p.name}
                                    </h3>
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                                      <span>📍 {getTranslatedCity(p as { city: string })}</span>
                                      {p.recommended_duration && (<><span>·</span><span>⏱️ {p.recommended_duration}</span></>)}
                                    </div>
                                    {rec && (
                                      <div className="mt-2 text-[12px] text-foreground/85 leading-relaxed italic border-l-2 border-amber-500/40 pl-2 line-clamp-3">
                                        <span className="text-amber-400 font-medium not-italic">✦ </span>
                                        {rec}
                                      </div>
                                    )}
                                    {p.best_for && p.best_for.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {p.best_for.slice(0, 2).map((tag) => (
                                          <span key={tag} className="text-[10px] bg-white/[0.05] text-muted-foreground rounded-full px-2 py-0.5">{tag}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {items.length > 1 && (
                            <div className="text-[10px] text-muted-foreground/60 mt-1 px-1">→ swipe</div>
                          )}
                        </section>
                      );
                    });
                  })()}
                </div>
              )
            )}

            {/* Results */}
            {categoryFilter !== "mizwad_top" && (loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : unifiedResults.length > 0 ? (
              <div className="space-y-3">
                {unifiedResults.map((item, index) => {
                  const data = item.data as PlaceData;
                  const meta = (() => {
                    switch (item.type) {
                      case "park": return { Icon: TreePine, badgeBg: "bg-eco-mint/20 text-eco-forest" };
                      case "mall": return { Icon: ShoppingBag, badgeBg: "bg-blue-500/10 text-blue-600" };
                      case "historical": return { Icon: Building2, badgeBg: "bg-amber-500/10 text-amber-600" };
                      case "market": return { Icon: ShoppingBag, badgeBg: "bg-orange-500/10 text-orange-600" };
                    }
                  })();
                  const Icon = meta.Icon;
                  const openDetail = () => {
                    setPlaceDetail({ type: item.type as PlaceType, data });
                    setPlaceDetailOpen(true);
                  };
                  return (
                    <button
                      key={`${item.type}-${data.id}`}
                      onClick={openDetail}
                      className="w-full text-left bg-card rounded-2xl overflow-hidden border border-border/50 animate-fade-in hover:border-primary/40 transition-all"
                      style={{ animationDelay: `${index * 40}ms` }}
                    >
                      <div className="relative h-36 overflow-hidden bg-muted">
                        {data.image_url ? (
                          <img
                            src={data.image_url}
                            alt={getField(data, 'name')}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (() => {
                            const PIcon = getPlaceholderIcon(item.type);
                            return (
                              <div className={cn(
                                "w-full h-full bg-gradient-to-br flex flex-col items-center justify-center",
                                getPlaceholderGradient(item.type)
                              )}>
                                <PIcon className="w-12 h-12 text-emerald-500/60" />
                                <span className="text-xs text-muted-foreground mt-2">Rasm tez orada</span>
                              </div>
                            );
                          })()
                        )}
                        {(data as PlaceData).mizwad_pick_rank && (() => {
                          const r = (data as PlaceData).mizwad_pick_rank as number;
                          return (
                            <div className={cn(
                              "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md z-10",
                              r === 1 && "bg-amber-500 text-white",
                              r === 2 && "bg-slate-300 text-slate-900",
                              r === 3 && "bg-orange-600 text-white",
                              r >= 4 && "bg-emerald-500 text-white",
                            )}>
                              <Star className="w-3 h-3 fill-current" />
                              <span>#{r}</span>
                            </div>
                          );
                        })()}
                        <div className="absolute top-3 right-3 z-10">
                          <FavoriteButton placeId={data.id} placeType={item.type} />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{getField(data, 'name')}</h3>
                              {data.mizwad_rank != null && (
                                <span className="text-[9px] bg-amber-500/15 text-amber-400 rounded-full px-1.5 py-0.5 font-semibold uppercase tracking-wide shrink-0">
                                  ✦ Mizwad #{data.mizwad_rank}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {getTranslatedCity(data as { city: string })}
                            </p>
                            {(data as PlaceData).metro_station && (
                              <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                                <Train className="w-3 h-3" />
                                <span>
                                  {(data as PlaceData).metro_line}
                                  {(data as PlaceData).metro_exit && ` · Exit ${(data as PlaceData).metro_exit}`}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            {data.rating != null && (
                              <div className="flex items-center gap-1 text-gold">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-medium">{data.rating}</span>
                              </div>
                            )}
                            <Badge variant="secondary" className={cn("border-0", meta.badgeBg)}>
                              <Icon className="w-3 h-3 mr-1" />
                              {t(`place.type.${item.type}`)}
                            </Badge>
                          </div>
                        </div>
                        {data.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {getField(data, 'description')}
                          </p>
                        )}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          {data.has_halal_food && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              <Check className="w-3 h-3" />
                              {t("place.amenity.halal_food")}
                            </span>
                          )}
                          {data.has_prayer_room && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              <Check className="w-3 h-3" />
                              {t("place.amenity.prayer_room")}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : selectedCity !== "all" ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-foreground">
                  {t("travel.cityComingSoon", "Bu shaharda hali ma'lumot qo'shilmagan")}
                </p>
                <p className="text-sm mt-1">
                  {t("travel.cityComingSoonHint", "Tez orada qo'shamiz. Boshqa shaharni tanlab ko'ring.")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSelectedCity("all")}
                >
                  {t("travel.showAllCities", "Barcha shaharlarni ko'rish")}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">{t("business.noResults")}</p>
                <p className="text-sm mt-1">{t("travel.tryDifferentFilters")}</p>
              </div>
            ))}
          </div>
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

      <PlaceDetailSheet
        open={placeDetailOpen}
        onOpenChange={setPlaceDetailOpen}
        place={placeDetail?.data ?? null}
        type={placeDetail?.type ?? "mall"}
      />

      {/* Service Request Modal */}
      <Sheet open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>
              {serviceType === "visa_help"
                ? (t("services.visaHelp.title") || "Vizа yordami so'rash")
                : (t("services.hotelBooking.title") || "Mehmonxona bron qilish")}
            </SheetTitle>
            <SheetDescription>
              {t("services.requestDescription") || "Quyidagi maydonga batafsil ma'lumot kiriting. Operatorlarimiz tez orada bog'lanadi."}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-3">
            <Textarea
              value={serviceMessage}
              onChange={(e) => setServiceMessage(e.target.value)}
              placeholder={t("services.requestPlaceholder") || "Sizga qanday yordam kerak?"}
              rows={5}
            />
            <Button
              onClick={submitServiceRequest}
              disabled={submittingRequest}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              {submittingRequest
                ? (t("common.sending") || "Yuborilmoqda...")
                : (t("services.submit") || "Yuborish")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Travel;
