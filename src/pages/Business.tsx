import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
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
  Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("markets");
  const [marketSearch, setMarketSearch] = useState("");
  const [hubSearch, setHubSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  
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

  const filteredMarkets = markets.filter(
    (m) =>
      m.category.toLowerCase().includes(marketSearch.toLowerCase()) ||
      m.city.toLowerCase().includes(marketSearch.toLowerCase()) ||
      m.name.toLowerCase().includes(marketSearch.toLowerCase())
  );

  const filteredHubs = hubs.filter(
    (h) =>
      h.industry.toLowerCase().includes(hubSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.industry.toLowerCase().includes(companySearch.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
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

      {/* Deep Check Banner */}
      <section className="px-5 mb-6">
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
              {t("business.marketFinder").split(" ")[0]}
            </TabsTrigger>
            <TabsTrigger value="hubs" className="text-xs">
              <Factory className="w-4 h-4 mr-1" />
              {t("business.manufacturingMap").split(" ")[0]}
            </TabsTrigger>
            <TabsTrigger value="companies" className="text-xs">
              <Building2 className="w-4 h-4 mr-1" />
              {t("business.companySearch").split(" ")[0]}
            </TabsTrigger>
            <TabsTrigger value="exhibitions" className="text-xs">
              <Calendar className="w-4 h-4 mr-1" />
              {t("business.exhibitions").split(" ")[0]}
            </TabsTrigger>
          </TabsList>

          {/* Market Finder */}
          <TabsContent value="markets" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("business.searchCategory")}
                value={marketSearch}
                onChange={(e) => setMarketSearch(e.target.value)}
                className="pl-10 bg-card border-border/50"
              />
            </div>

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
                    className="bg-card rounded-2xl p-4 border border-border/50"
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
                placeholder={t("business.searchCity")}
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
                className="pl-10 bg-card border-border/50"
              />
            </div>

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
                    className="bg-card rounded-2xl p-4 border border-border/50"
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
                    className="bg-card rounded-2xl p-4 border border-border/50"
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
          <TabsContent value="exhibitions" className="mt-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : exhibitions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("business.noResults")}
              </div>
            ) : (
              exhibitions.map((exhibition) => (
                <div
                  key={exhibition.id}
                  className="bg-card rounded-2xl p-4 border border-border/50"
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
              ))
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Business;
