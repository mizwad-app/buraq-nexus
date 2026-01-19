import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileSearch,
  ChevronRight,
  Search,
  MapPin,
  Building2,
  Calendar,
  Star,
  BadgeCheck,
  Factory,
  Store,
  X,
  Package,
  Train,
  Globe,
  Scale,
  Phone,
  Mail,
  FileText,
  Download,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { BusinessEcosystemIcon } from "@/components/icons/BusinessEcosystemIcon";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useCity } from "@/contexts/CityContext";
import { GlobalCityFilter } from "@/components/GlobalCityFilter";
import { ProductSearch } from "@/components/ProductSearch";
import { SupportChat, AskAgentButton } from "@/components/SupportChat";
import { MarketDetailSheet } from "@/components/MarketDetailSheet";
import { MarketCard } from "@/components/MarketCard";
import { toast } from "sonner";

interface WholesaleMarket {
  id: string;
  city: string;
  country: string;
  category: string;
  name: string;
  description: string | null;
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
  category_uz?: string | null;
  category_ru?: string | null;
  category_en?: string | null;
  category_ar?: string | null;
  [key: string]: unknown;
}

interface ProductionHub {
  id: string;
  city: string;
  country: string;
  industry: string;
  description: string | null;
  specializations: string[] | null;
  industry_uz?: string | null;
  industry_ru?: string | null;
  industry_en?: string | null;
  industry_ar?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  [key: string]: unknown;
}

interface Exhibition {
  id: string;
  name: string;
  city: string;
  country: string;
  venue: string | null;
  start_date: string;
  end_date: string;
  category: string;
  description: string | null;
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
  venue_uz?: string | null;
  venue_ru?: string | null;
  venue_en?: string | null;
  venue_ar?: string | null;
  category_uz?: string | null;
  category_ru?: string | null;
  category_en?: string | null;
  category_ar?: string | null;
  [key: string]: unknown;
}

interface Company {
  id: string;
  name: string;
  city: string;
  country: string;
  industry: string;
  rating: number | null;
  verified: boolean;
  years_in_business: number | null;
  description: string | null;
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
  industry_uz?: string | null;
  industry_ru?: string | null;
  industry_en?: string | null;
  industry_ar?: string | null;
  [key: string]: unknown;
}

interface LawFirm {
  id: string;
  name: string;
  city: string;
  country: string;
  specialization: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  address_chinese: string | null;
  verified: boolean | null;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  specialization_uz?: string | null;
  specialization_ru?: string | null;
  specialization_en?: string | null;
  specialization_ar?: string | null;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  [key: string]: unknown;
}

interface LegalTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  file_url: string | null;
  languages: string[] | null;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  [key: string]: unknown;
}

const Business = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { getField, currentLanguage } = useTranslatedField();
  const { selectedCity, setSelectedCity } = useCity();
  const [activeTab, setActiveTab] = useState("markets");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<WholesaleMarket | null>(null);
  const [marketDetailOpen, setMarketDetailOpen] = useState(false);
  
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Search states
  const [marketSearch, setMarketSearch] = useState("");
  const [hubSearch, setHubSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [exhibitionCityFilter, setExhibitionCityFilter] = useState<string>("all");
  const [exhibitionCategoryFilter, setExhibitionCategoryFilter] = useState<string>("all");
  
  // Data states
  const [markets, setMarkets] = useState<WholesaleMarket[]>([]);
  const [hubs, setHubs] = useState<ProductionHub[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [lawFirms, setLawFirms] = useState<LawFirm[]>([]);
  const [legalTemplates, setLegalTemplates] = useState<LegalTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [marketsRes, hubsRes, exhibitionsRes, companiesRes, lawFirmsRes, templatesRes] = await Promise.all([
        supabase.from("wholesale_markets").select("*"),
        supabase.from("production_hubs").select("*"),
        supabase.from("exhibitions").select("*").order("start_date", { ascending: true }),
        supabase.from("companies").select("*").order("rating", { ascending: false }),
        supabase.from("law_firms").select("*"),
        supabase.from("legal_templates").select("*"),
      ]);

      if (marketsRes.data) setMarkets(marketsRes.data as WholesaleMarket[]);
      if (hubsRes.data) setHubs(hubsRes.data as ProductionHub[]);
      if (exhibitionsRes.data) setExhibitions(exhibitionsRes.data as Exhibition[]);
      if (companiesRes.data) setCompanies(companiesRes.data as Company[]);
      if (lawFirmsRes.data) setLawFirms(lawFirmsRes.data as LawFirm[]);
      if (templatesRes.data) setLegalTemplates(templatesRes.data as LegalTemplate[]);
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    toast.success(t("business.legalSection.addressCopied"));
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Get translated city name for display
  const getTranslatedCity = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
    return getField(item, 'city');
  };

  // Get unique cities from all data (using base city for filtering, translated for display)
  const allCities = useMemo(() => {
    const citiesMap = new Map<string, { base: string; translated: string }>();
    const addCity = (item: { city: string; city_uz?: string | null; city_ru?: string | null; city_en?: string | null; city_ar?: string | null }) => {
      if (!citiesMap.has(item.city)) {
        citiesMap.set(item.city, { base: item.city, translated: getTranslatedCity(item) });
      }
    };
    markets.forEach(addCity);
    hubs.forEach(addCity);
    exhibitions.forEach(addCity);
    companies.forEach(addCity);
    return Array.from(citiesMap.values()).sort((a, b) => a.translated.localeCompare(b.translated));
  }, [markets, hubs, exhibitions, companies, currentLanguage]);

  // Get unique categories
  const allCategories = useMemo(() => {
    const categoriesMap = new Map<string, { base: string; translated: string }>();
    markets.forEach(m => {
      if (!categoriesMap.has(m.category)) {
        categoriesMap.set(m.category, { base: m.category, translated: getField(m, 'category') });
      }
    });
    hubs.forEach(h => {
      if (!categoriesMap.has(h.industry)) {
        categoriesMap.set(h.industry, { base: h.industry, translated: getField(h, 'industry') });
      }
    });
    return Array.from(categoriesMap.values()).sort((a, b) => a.translated.localeCompare(b.translated));
  }, [markets, hubs, currentLanguage]);

  // Get unique exhibition categories
  const exhibitionCategories = useMemo(() => {
    const categoriesMap = new Map<string, { base: string; translated: string }>();
    exhibitions.forEach(e => {
      if (!categoriesMap.has(e.category)) {
        categoriesMap.set(e.category, { base: e.category, translated: getField(e, 'category') });
      }
    });
    return Array.from(categoriesMap.values()).sort((a, b) => a.translated.localeCompare(b.translated));
  }, [exhibitions, currentLanguage]);

  // Filter markets by city and search
  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => {
      const matchesCity = selectedCity === "all" || m.city === selectedCity;
      const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
      const translatedName = getField(m, 'name').toLowerCase();
      const translatedCategory = getField(m, 'category').toLowerCase();
      const translatedCity = getTranslatedCity(m).toLowerCase();
      const searchLower = marketSearch.toLowerCase();
      const matchesSearch = 
        translatedCategory.includes(searchLower) ||
        translatedCity.includes(searchLower) ||
        translatedName.includes(searchLower) ||
        m.category.toLowerCase().includes(searchLower) ||
        m.city.toLowerCase().includes(searchLower) ||
        m.name.toLowerCase().includes(searchLower);
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [markets, selectedCity, selectedCategory, marketSearch, currentLanguage]);

  // Filter hubs by city and search
  const filteredHubs = useMemo(() => {
    return hubs.filter((h) => {
      const matchesCity = selectedCity === "all" || h.city === selectedCity;
      const matchesCategory = selectedCategory === "all" || h.industry === selectedCategory;
      const translatedIndustry = getField(h, 'industry').toLowerCase();
      const translatedCity = getTranslatedCity(h).toLowerCase();
      const searchLower = hubSearch.toLowerCase();
      const matchesSearch = 
        translatedIndustry.includes(searchLower) ||
        translatedCity.includes(searchLower) ||
        h.industry.toLowerCase().includes(searchLower) ||
        h.city.toLowerCase().includes(searchLower);
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [hubs, selectedCity, selectedCategory, hubSearch, currentLanguage]);

  // Get city hubs for a product category
  const getCityHubsForCategory = (category: string) => {
    const searchLower = category.toLowerCase();
    const matchingHubs = hubs.filter(h => {
      const translatedIndustry = getField(h, 'industry').toLowerCase();
      return translatedIndustry.includes(searchLower) ||
        h.industry.toLowerCase().includes(searchLower) ||
        h.specializations?.some(s => s.toLowerCase().includes(searchLower));
    });
    return matchingHubs;
  };

  // Get markets for a product category
  const getMarketsForCategory = (category: string) => {
    const searchLower = category.toLowerCase();
    return markets.filter(m => {
      const translatedCategory = getField(m, 'category').toLowerCase();
      return translatedCategory.includes(searchLower) ||
        m.category.toLowerCase().includes(searchLower);
    });
  };

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesCity = selectedCity === "all" || c.city === selectedCity;
      const translatedName = getField(c, 'name').toLowerCase();
      const translatedIndustry = getField(c, 'industry').toLowerCase();
      const searchLower = companySearch.toLowerCase();
      const matchesSearch = 
        translatedName.includes(searchLower) ||
        translatedIndustry.includes(searchLower) ||
        c.name.toLowerCase().includes(searchLower) ||
        c.industry.toLowerCase().includes(searchLower);
      return matchesCity && matchesSearch;
    });
  }, [companies, selectedCity, companySearch, currentLanguage]);

  // Filter exhibitions by city and category
  const filteredExhibitions = useMemo(() => {
    return exhibitions.filter((e) => {
      const matchesCity = exhibitionCityFilter === "all" || e.city === exhibitionCityFilter;
      const matchesCategory = exhibitionCategoryFilter === "all" || e.category === exhibitionCategoryFilter;
      return matchesCity && matchesCategory;
    });
  }, [exhibitions, exhibitionCityFilter, exhibitionCategoryFilter]);

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ru' ? 'ru-RU' : i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSelectedCity("all");
    setSelectedCategory("all");
    setMarketSearch("");
    setHubSearch("");
  };

  const hasActiveFilters = selectedCity !== "all" || selectedCategory !== "all";

  // Get selected city's translated name for display
  const selectedCityTranslated = useMemo(() => {
    if (selectedCity === "all") return "";
    const cityData = allCities.find(c => c.base === selectedCity);
    return cityData?.translated || selectedCity;
  }, [selectedCity, allCities]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-glow">
              <BusinessEcosystemIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t("business.subtitle")}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("business.title")}
          </h1>
        </div>
      </header>

      {/* City & Category Filters */}
      <section className="px-5 mb-4">
        <div className="flex gap-2">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="flex-1 bg-card border-border/50">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t("business.selectCity")} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">{t("common.all")} {t("business.cities")}</SelectItem>
              {allCities.map((city) => (
                <SelectItem key={city.base} value={city.base}>{city.translated}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1 bg-card border-border/50">
              <Package className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t("business.selectCategory")} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">{t("common.all")} {t("business.categories")}</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category.base} value={category.base}>{category.translated}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
          >
            <X className="w-3 h-3" />
            {t("business.clearFilters")}
          </button>
        )}
      </section>

      {/* City Overview Card - Shows when a city is selected */}
      {selectedCity !== "all" && (
        <section className="px-5 mb-4">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">{selectedCityTranslated}</h3>
                <p className="text-xs text-muted-foreground">{t("business.cityOverview")}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-background/50 rounded-xl p-2">
                <p className="text-lg font-bold text-primary">
                  {markets.filter(m => m.city === selectedCity).length}
                </p>
                <p className="text-xs text-muted-foreground">{t("business.marketsCount")}</p>
              </div>
              <div className="bg-background/50 rounded-xl p-2">
                <p className="text-lg font-bold text-accent">
                  {hubs.filter(h => h.city === selectedCity).length}
                </p>
                <p className="text-xs text-muted-foreground">{t("business.hubsCount")}</p>
              </div>
              <div className="bg-background/50 rounded-xl p-2">
                <p className="text-lg font-bold text-amber-400">
                  {companies.filter(c => c.city === selectedCity).length}
                </p>
                <p className="text-xs text-muted-foreground">{t("business.companiesCount")}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Product Search - Search by Product First */}
      <section className="px-5 mb-4">
        <ProductSearch />
      </section>

      {/* Deep Check Banner */}
      <section className="px-5 mb-4">
        <button
          onClick={() => navigate("/deep-check")}
          className="w-full text-left"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-amber-500/10 p-4 border border-primary/20">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <FileSearch className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground">
                  {t("business.deepCheck")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("business.deepCheckDesc")}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </button>
      </section>

      {/* Tabs Navigation */}
      <section className="px-5 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-12 bg-secondary/50">
            <TabsTrigger value="markets" className="text-xs px-1">
              <Store className="w-3.5 h-3.5 mr-0.5" />
              {t("business.markets")}
            </TabsTrigger>
            <TabsTrigger value="hubs" className="text-xs px-1">
              <Factory className="w-3.5 h-3.5 mr-0.5" />
              {t("business.hubs")}
            </TabsTrigger>
            <TabsTrigger value="companies" className="text-xs px-1">
              <Building2 className="w-3.5 h-3.5 mr-0.5" />
              {t("business.companies")}
            </TabsTrigger>
            <TabsTrigger value="exhibitions" className="text-xs px-1">
              <Calendar className="w-3.5 h-3.5 mr-0.5" />
              {t("business.fairs")}
            </TabsTrigger>
            <TabsTrigger value="legal" className="text-xs px-1">
              <Scale className="w-3.5 h-3.5 mr-0.5" />
              {t("business.legal")}
            </TabsTrigger>
          </TabsList>

          {/* Market Finder */}
          <TabsContent value="markets" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("business.searchMarkets")}
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
                className="pl-10 bg-card border-border/50"
              />
            </div>

            {/* Product-based discovery hint */}
            {marketSearch && getMarketsForCategory(marketSearch).length > 0 && (
              <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("business.productHubsFor")} <span className="font-semibold text-foreground">"{marketSearch}"</span>:
                </p>
                <div className="flex flex-wrap gap-1">
                  {[...new Set(getMarketsForCategory(marketSearch).map(m => m.city))].map(city => {
                    const market = markets.find(m => m.city === city);
                    const translatedCity = market ? getTranslatedCity(market) : city;
                    return (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className="px-2 py-1 rounded-full bg-primary/20 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
                      >
                        {translatedCity}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMarkets.length === 0 ? (
              selectedCategory !== "all" ? (
                // Show "Coming Soon" for empty categories
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                    <Info className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">{t("business.marketCard.moreMarketsSoon")}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Guangzhou & Shenzhen</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("business.noResults")}
                </div>
              )
            ) : (
              <div className="space-y-4">
                {/* Group markets by city and render with headers */}
                {(() => {
                  const marketsByCity = filteredMarkets.reduce((acc, market) => {
                    const city = market.city;
                    if (!acc[city]) acc[city] = [];
                    acc[city].push(market);
                    return acc;
                  }, {} as Record<string, typeof filteredMarkets>);
                  
                  const cityOrder = ['Zhongshan', 'Guangzhou', 'Shenzhen', 'Foshan', 'Yiwu', 'Hangzhou'];
                  const sortedCities = Object.keys(marketsByCity).sort((a, b) => {
                    const aIndex = cityOrder.indexOf(a);
                    const bIndex = cityOrder.indexOf(b);
                    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                  });
                  
                  // Only show headers if multiple cities and no specific city filter
                  const showHeaders = sortedCities.length > 1 && selectedCity === "all";
                  
                  return sortedCities.map(city => (
                    <div key={city}>
                      {showHeaders && (
                        <div className="flex items-center gap-2 mb-3 mt-2">
                          <div className="h-px bg-border flex-1" />
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 bg-muted/50 rounded-full">
                            📍 {getTranslatedCity(marketsByCity[city][0])}
                          </span>
                          <div className="h-px bg-border flex-1" />
                        </div>
                      )}
                      <div className="space-y-3">
                        {marketsByCity[city].map((market) => (
                          <MarketCard
                            key={market.id}
                            market={market as any}
                            onClick={() => { setSelectedMarket(market); setMarketDetailOpen(true); }}
                          />
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </TabsContent>

          {/* Manufacturing Hubs */}
          <TabsContent value="hubs" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("business.searchIndustry")}
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
                className="pl-10 bg-card border-border/50"
              />
            </div>

            {/* Product-based discovery hint for hubs */}
            {hubSearch && getCityHubsForCategory(hubSearch).length > 0 && (
              <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("business.manufacturingCentersFor")} <span className="font-semibold text-foreground">"{hubSearch}"</span>:
                </p>
                <div className="flex flex-wrap gap-1">
                  {getCityHubsForCategory(hubSearch).map(hub => (
                    <button
                      key={hub.id}
                      onClick={() => setSelectedCity(hub.city)}
                      className="px-2 py-1 rounded-full bg-primary/20 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
                    >
                      {getTranslatedCity(hub)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredHubs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("business.noResults")}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="bg-card rounded-2xl p-4 border border-border/50 hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Factory className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{getTranslatedCity(hub)}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Globe className="w-3 h-3" />
                          <span>{hub.country}</span>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-xs font-medium text-primary">
                            {getField(hub, 'industry')}
                          </span>
                        </div>
                        {(getField(hub, 'description')) && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {getField(hub, 'description')}
                          </p>
                        )}
                        {hub.specializations && hub.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {hub.specializations.map((spec, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Company Search */}
          <TabsContent value="companies" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("business.searchCompany")}
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="pl-10 bg-card border-border/50"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("business.noResults")}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{getField(company, 'name')}</h3>
                          {company.verified && (
                            <BadgeCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{getField(company, 'city')}, {company.country}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {company.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="text-sm font-medium">{company.rating}</span>
                            </div>
                          )}
                          {company.years_in_business && (
                            <span className="text-xs text-muted-foreground">
                              {company.years_in_business} {t("business.yearsInBusiness")}
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                            {getField(company, 'industry')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exhibitions Calendar */}
          <TabsContent value="exhibitions" className="mt-4 space-y-4">
            {/* Exhibition Filters */}
            <div className="flex gap-2">
              <Select value={exhibitionCityFilter} onValueChange={setExhibitionCityFilter}>
                <SelectTrigger className="flex-1 bg-card border-border/50">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t("business.filterByCity")} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">{t("common.all")} {t("business.cities")}</SelectItem>
                  {[...new Set(exhibitions.map(e => e.city))].sort().map((city) => {
                    const exhibition = exhibitions.find(e => e.city === city);
                    const translatedCity = exhibition ? getField(exhibition, 'city') : city;
                    return (
                      <SelectItem key={city} value={city}>{translatedCity}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select value={exhibitionCategoryFilter} onValueChange={setExhibitionCategoryFilter}>
                <SelectTrigger className="flex-1 bg-card border-border/50">
                  <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t("business.filterByIndustry")} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">{t("common.all")} {t("business.industries")}</SelectItem>
                  {exhibitionCategories.map((category) => (
                    <SelectItem key={category.base} value={category.base}>{category.translated}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredExhibitions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("business.noResults")}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExhibitions.map((exhibition) => (
                  <div
                    key={exhibition.id}
                    className="bg-card rounded-2xl p-4 border border-border/50 hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                        <span className="text-lg font-bold text-primary">
                          {new Date(exhibition.start_date).getDate()}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase">
                          {new Date(exhibition.start_date).toLocaleDateString("en", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{getField(exhibition, 'name')}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{getField(exhibition, 'city')}, {exhibition.country}</span>
                        </div>
                        {(getField(exhibition, 'venue')) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {getField(exhibition, 'venue')}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-xs font-medium">
                            {getField(exhibition, 'category')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(exhibition.start_date)} - {formatDate(exhibition.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Legal Support */}
          <TabsContent value="legal" className="mt-4 space-y-6">
            {/* Contract Templates */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {t("business.legalSection.templates")}
              </h3>
              <div className="space-y-2">
                {legalTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-card rounded-xl p-4 border border-border/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{getField(template, 'name')}</h4>
                        <p className="text-xs text-muted-foreground">{getField(template, 'description')}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                      <Download className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Law Firms */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-500" />
                {t("business.legalSection.lawFirms")}
              </h3>
              <div className="space-y-3">
                {lawFirms.map((firm) => (
                  <div
                    key={firm.id}
                    className="bg-card rounded-2xl p-4 border border-border/50"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{getField(firm, 'name')}</h4>
                          {firm.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{getField(firm, 'specialization')}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{getField(firm, 'city')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {firm.phone && (
                        <a
                          href={`tel:${firm.phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 text-sm font-medium hover:bg-green-500/20 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {t("business.legalSection.call")}
                        </a>
                      )}
                      {firm.email && (
                        <a
                          href={`mailto:${firm.email}`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {t("business.legalSection.email")}
                        </a>
                      )}
                      {firm.address_chinese && (
                        <button
                          onClick={() => copyToClipboard(firm.address_chinese!, firm.id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                        >
                          {copiedAddress === firm.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Support Chat FAB */}
      <SupportChat />

      {/* Market Detail Sheet */}
      <MarketDetailSheet
        open={marketDetailOpen}
        onOpenChange={setMarketDetailOpen}
        market={selectedMarket}
      />
    </div>
  );
};

export default Business;
