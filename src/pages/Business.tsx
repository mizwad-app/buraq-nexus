import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  FileSearch,
  ChevronRight,
  ChevronDown,
  Search,
  MapPin,
  Building2,
  Calendar,
  Star,
  BadgeCheck,
  Factory,
  Store,
  Globe,
  X,
  Package,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

interface WholesaleMarket {
  id: string;
  city: string;
  country: string;
  category: string;
  name: string;
  description: string | null;
}

interface ProductionHub {
  id: string;
  city: string;
  country: string;
  industry: string;
  description: string | null;
  specializations: string[] | null;
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
}

const Business = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("markets");
  
  // City-based discovery
  const [selectedCity, setSelectedCity] = useState<string>("all");
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [marketsRes, hubsRes, exhibitionsRes, companiesRes] = await Promise.all([
        supabase.from("wholesale_markets").select("*"),
        supabase.from("production_hubs").select("*"),
        supabase.from("exhibitions").select("*").order("start_date", { ascending: true }),
        supabase.from("companies").select("*").order("rating", { ascending: false }),
      ]);

      if (marketsRes.data) setMarkets(marketsRes.data);
      if (hubsRes.data) setHubs(hubsRes.data);
      if (exhibitionsRes.data) setExhibitions(exhibitionsRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
    } catch (error) {
      console.error("Error fetching business data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique cities from all data
  const allCities = useMemo(() => {
    const citiesSet = new Set<string>();
    markets.forEach(m => citiesSet.add(m.city));
    hubs.forEach(h => citiesSet.add(h.city));
    exhibitions.forEach(e => citiesSet.add(e.city));
    companies.forEach(c => citiesSet.add(c.city));
    return Array.from(citiesSet).sort();
  }, [markets, hubs, exhibitions, companies]);

  // Get unique categories
  const allCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    markets.forEach(m => categoriesSet.add(m.category));
    hubs.forEach(h => categoriesSet.add(h.industry));
    return Array.from(categoriesSet).sort();
  }, [markets, hubs]);

  // Get unique exhibition categories
  const exhibitionCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    exhibitions.forEach(e => categoriesSet.add(e.category));
    return Array.from(categoriesSet).sort();
  }, [exhibitions]);

  // Filter markets by city and search
  const filteredMarkets = useMemo(() => {
    return markets.filter((m) => {
      const matchesCity = selectedCity === "all" || m.city === selectedCity;
      const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
      const matchesSearch = 
        m.category.toLowerCase().includes(marketSearch.toLowerCase()) ||
        m.city.toLowerCase().includes(marketSearch.toLowerCase()) ||
        m.name.toLowerCase().includes(marketSearch.toLowerCase());
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [markets, selectedCity, selectedCategory, marketSearch]);

  // Filter hubs by city and search
  const filteredHubs = useMemo(() => {
    return hubs.filter((h) => {
      const matchesCity = selectedCity === "all" || h.city === selectedCity;
      const matchesCategory = selectedCategory === "all" || h.industry === selectedCategory;
      const matchesSearch = 
        h.industry.toLowerCase().includes(hubSearch.toLowerCase()) ||
        h.city.toLowerCase().includes(hubSearch.toLowerCase());
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [hubs, selectedCity, selectedCategory, hubSearch]);

  // Get city hubs for a product category
  const getCityHubsForCategory = (category: string) => {
    const matchingHubs = hubs.filter(h => 
      h.industry.toLowerCase().includes(category.toLowerCase()) ||
      h.specializations?.some(s => s.toLowerCase().includes(category.toLowerCase()))
    );
    return matchingHubs;
  };

  // Get markets for a product category
  const getMarketsForCategory = (category: string) => {
    return markets.filter(m => 
      m.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesCity = selectedCity === "all" || c.city === selectedCity;
      const matchesSearch = 
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.industry.toLowerCase().includes(companySearch.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [companies, selectedCity, companySearch]);

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

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-glow">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
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
                <SelectItem key={city} value={city}>{city}</SelectItem>
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
                <SelectItem key={category} value={category}>{category}</SelectItem>
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
                <h3 className="font-display font-bold text-foreground">{selectedCity}</h3>
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
          <TabsList className="w-full grid grid-cols-4 h-12 bg-secondary/50">
            <TabsTrigger value="markets" className="text-xs">
              <Store className="w-4 h-4 mr-1" />
              {t("business.markets")}
            </TabsTrigger>
            <TabsTrigger value="hubs" className="text-xs">
              <Factory className="w-4 h-4 mr-1" />
              {t("business.hubs")}
            </TabsTrigger>
            <TabsTrigger value="companies" className="text-xs">
              <Building2 className="w-4 h-4 mr-1" />
              {t("business.companies")}
            </TabsTrigger>
            <TabsTrigger value="exhibitions" className="text-xs">
              <Calendar className="w-4 h-4 mr-1" />
              {t("business.fairs")}
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
                  {[...new Set(getMarketsForCategory(marketSearch).map(m => m.city))].map(city => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className="px-2 py-1 rounded-full bg-primary/20 text-xs font-medium text-primary hover:bg-primary/30 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMarkets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("business.noResults")}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMarkets.map((market) => (
                  <div
                    key={market.id}
                    className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{market.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{market.city}, {market.country}</span>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-xs font-medium text-accent-foreground">
                            {market.category}
                          </span>
                        </div>
                        {market.description && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {market.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                      {hub.city}
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
                        <h3 className="font-semibold text-foreground">{hub.city}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Globe className="w-3 h-3" />
                          <span>{hub.country}</span>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-xs font-medium text-primary">
                            {hub.industry}
                          </span>
                        </div>
                        {hub.description && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {hub.description}
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
                          <h3 className="font-semibold text-foreground">{company.name}</h3>
                          {company.verified && (
                            <BadgeCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{company.city}, {company.country}</span>
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
                            {company.industry}
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
                  {[...new Set(exhibitions.map(e => e.city))].sort().map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
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
                    <SelectItem key={category} value={category}>{category}</SelectItem>
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
                        <h3 className="font-semibold text-foreground">{exhibition.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{exhibition.city}, {exhibition.country}</span>
                        </div>
                        {exhibition.venue && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {exhibition.venue}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-xs font-medium">
                            {exhibition.category}
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
        </Tabs>
      </section>
    </div>
  );
};

export default Business;
