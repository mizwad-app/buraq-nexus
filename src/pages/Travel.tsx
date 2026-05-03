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
} from "lucide-react";
import { FlightTicketSheet, TrainTicketSheet, HowItWorksSheet } from "@/components/tickets/TicketSheets";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type CategoryFilter = "all" | "parks" | "malls" | "historical" | "markets";
type SelectedItem =
  | { type: "park"; data: Park }
  | { type: "mall"; data: ShoppingMall }
  | { type: "historical"; data: PlaceData }
  | { type: "market"; data: PlaceData };

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "places");

  // Service request modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceType, setServiceType] = useState<string>("visa_help");
  const [serviceMessage, setServiceMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Tickets state
  const [flightSheetOpen, setFlightSheetOpen] = useState(false);
  const [trainSheetOpen, setTrainSheetOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const openTicketsChat = () => {
    const message = encodeURIComponent(t("tickets.heroTitle"));
    window.open(`https://wa.me/8613800138000?text=${message}`, "_blank");
  };

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

  const unifiedResults = useMemo(() => {
    type ResultItem = { type: "park"; data: Park } | { type: "mall"; data: ShoppingMall };
    const results: ResultItem[] = [];

    if (categoryFilter === "all" || categoryFilter === "parks") {
      parks
        .filter((p) => selectedCity === "all" || p.city === selectedCity)
        .forEach((park) => results.push({ type: "park", data: park }));
    }

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
      </header>

      {/* Tabs */}
      <section className="px-5">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="places" className="text-[10px] px-1">
              {t("travel.tabs.places")}
            </TabsTrigger>
            <TabsTrigger value="guide" className="text-[10px] px-1">
              {t("travel.tabs.guide")}
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-[10px] px-1">
              {t("travel.tabs.videos")}
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-[10px] px-1">
              {t("travel.tabs.documents")}
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-[10px] px-1">
              {t("travel.tabs.tickets")}
            </TabsTrigger>
          </TabsList>

          {/* PLACES TAB */}
          <TabsContent value="places" className="mt-4 space-y-4">
            {/* City Filter */}
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

            {/* Category Filter Chips */}
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

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              {unifiedResults.length} {t("travel.placesFound")} {selectedCity !== "all" && `• ${selectedCityTranslated}`}
            </p>

            {/* Results */}
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
                            <img src={park.image_url} alt={getField(park, 'name')} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <TreePine className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{getField(park, 'name')}</h3>
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
                            <img src={mall.image_url} alt={getField(mall, 'name')} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{getField(mall, 'name')}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                {getTranslatedCity(mall)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {mall.rating && (
                                <div className="flex items-center gap-1 text-gold">
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
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
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
          </TabsContent>

          {/* GUIDE TAB - Embassies + Visa CTA */}
          <TabsContent value="guide" className="mt-4 space-y-4">
            {/* Visa Help CTA */}
            <Button
              onClick={() => openServiceRequest("visa_help")}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <FileText className="w-4 h-4" />
              {t("services.visaHelp.title") || "Vizа yordami so'rash"}
            </Button>

            <Card className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t("guide.embassy.title")}</CardTitle>
                    <CardDescription>{t("guide.embassy.subtitle")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {EMBASSIES.map((embassy) => (
                  <div key={embassy.id} className="p-4 rounded-xl bg-card border border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "mb-2",
                            embassy.type === "embassy" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                          )}
                        >
                          {embassy.type === "embassy" ? t("guide.embassy.embassy") : t("guide.embassy.consulate")}
                        </Badge>
                        <h4 className="font-semibold text-foreground">{t(embassy.nameKey)}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <button
                        onClick={() => handleCall(embassy.phone)}
                        className="text-primary hover:underline font-mono text-sm"
                      >
                        {embassy.phone}
                      </button>
                    </div>
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground font-chinese">
                        {embassy.addressChinese}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleCall(embassy.phone)} className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        {t("guide.embassy.call")}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleCopyAddress(embassy.addressChinese)} className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        {t("guide.embassy.copyAddress")}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t("guide.faq.title")}</CardTitle>
                    <CardDescription>{t("guide.faq.subtitle")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {FAQ_ITEMS.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left text-sm">{t(faq.question)}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm">{t(faq.answer)}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VIDEOS TAB */}
          <TabsContent value="videos" className="mt-4 space-y-4">
            {GUIDE_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.bgColor)}>
                        <Icon className={cn("w-6 h-6", item.color)} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{t(item.titleKey)}</CardTitle>
                        <CardDescription className="mt-1">{t(item.descriptionKey)}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="relative aspect-video rounded-xl bg-muted/50 border border-border/50 overflow-hidden group cursor-pointer hover:border-primary/30 transition-all">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <Play className="w-6 h-6 text-primary ml-1" />
                        </div>
                        <span className="text-sm text-muted-foreground">{t("guide.videoPlaceholder")}</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="text-xs">
                          <Video className="w-3 h-3 mr-1" />
                          {t("guide.videoLabel")}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {t("guide.tipsTitle")}
                      </h4>
                      <ul className="space-y-2">
                        {item.tips.map((tipKey, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {t(tipKey)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {item.id === "exchange" && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-gold/10 border border-gold/20">
                        <AlertTriangle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gold dark:text-gold">{t("guide.exchange.warning")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* DOCUMENTS TAB */}
          <TabsContent value="documents" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t("travel.tabs.documents")}</CardTitle>
                    <CardDescription>{t("travel.documentsDescription") || "Sayohat uchun kerakli hujjatlar"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("travel.documentsComingSoon") || "Tez orada qo'shiladi."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TICKETS TAB */}
          <TabsContent value="tickets" className="mt-4 space-y-4">
            {/* Hero */}
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-display font-bold text-foreground">
                {t("tickets.heroTitle")}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {t("tickets.heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <span className="px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium">🇺🇿 {t("tickets.trustUzbek")}</span>
                <span className="px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium">✓ {t("tickets.trustReliable")}</span>
                <span className="px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium">💰 {t("tickets.trustBestPrice")}</span>
              </div>
            </div>

            {/* Ticket type cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFlightSheetOpen(true)}
                className="rounded-xl bg-card border border-border/50 p-4 text-left hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Plane className="w-8 h-8 text-primary mb-2" />
                <p className="font-semibold text-foreground">{t("tickets.flight")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("tickets.flightSubtitle")}</p>
              </button>
              <button
                onClick={() => setTrainSheetOpen(true)}
                className="rounded-xl bg-card border border-border/50 p-4 text-left hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Train className="w-8 h-8 text-primary mb-2" />
                <p className="font-semibold text-foreground">{t("tickets.train")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("tickets.trainSubtitle")}</p>
              </button>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              <Button
                onClick={openTicketsChat}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t("tickets.quickChat")}
              </Button>
              <Button
                onClick={() => setHowItWorksOpen(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {t("tickets.howItWorks")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Ticket sheets */}
      <FlightTicketSheet open={flightSheetOpen} onOpenChange={setFlightSheetOpen} />
      <TrainTicketSheet open={trainSheetOpen} onOpenChange={setTrainSheetOpen} />
      <HowItWorksSheet open={howItWorksOpen} onOpenChange={setHowItWorksOpen} />

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
