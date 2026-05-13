import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ChevronLeft, ChevronRight, Info, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBadge } from "@/components/business/CategoryBadge";
import { MizwadInsightBox } from "@/components/business/MizwadInsightBox";
import { fetchMarketsForCategory, fetchExhibitionsForCategory } from "@/lib/businessFetchers";
import { matchesCategory } from "@/lib/businessCategoryMatch";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { exhibitionFlag } from "@/lib/exhibitionFlags";
import { cn } from "@/lib/utils";

type TabKey = "cities" | "markets" | "exhibitions";
type Row = Record<string, unknown>;

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  [k: string]: unknown;
}

interface Insight {
  category_slug: string;
  city: string;
  insight_uz: string;
}

const fmtRange = (months: string[], start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}-${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
};

const countdownInfo = (t: TFunction, start: string, end: string) => {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now > e) return { text: t("business.categoryHub.countdown.ended"), cls: "bg-white/[0.05] text-muted-foreground" };
  if (now >= s) return { text: t("business.categoryHub.countdown.live"), cls: "bg-red-500/15 text-red-400" };
  const days = Math.ceil((s - now) / 86400000);
  if (days <= 7) return { text: t("business.categoryHub.countdown.daysLeft", { count: days }), cls: "bg-amber-500/15 text-amber-400" };
  if (days <= 30) return { text: t("business.categoryHub.countdown.daysLeft", { count: days }), cls: "bg-emerald-500/15 text-emerald-400" };
  return { text: t("business.categoryHub.countdown.daysLeft", { count: days }), cls: "bg-white/[0.05] text-muted-foreground" };
};

const rankBadgeCls = (rank: number) => {
  if (rank === 1) return "bg-amber-500/15 text-amber-400";
  if (rank === 2) return "bg-gray-400/15 text-gray-300";
  if (rank === 3) return "bg-orange-700/20 text-orange-400";
  return "bg-emerald-500/15 text-emerald-400";
};

const CategoryHub = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { categorySlug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getField } = useTranslatedField();
  useSwipeBack();

  const rawTab = searchParams.get("tab");
  const initialTab: TabKey = rawTab === "markets" || rawTab === "exhibitions" ? rawTab : "cities";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Migrate legacy ?tab=all to ?tab=cities
  useEffect(() => {
    if (searchParams.get("tab") === "all") {
      setSearchParams({ tab: "cities" }, { replace: true });
      setActiveTab("cities");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [category, setCategory] = useState<Category | null>(null);
  const [markets, setMarkets] = useState<Row[]>([]);
  const [exhibitions, setExhibitions] = useState<Row[]>([]);
  const [hubs, setHubs] = useState<Row[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: cat } = await supabase
        .from("product_categories")
        .select("*")
        .eq("slug", categorySlug)
        .maybeSingle();
      const catTyped = cat as unknown as Category | null;
      if (catTyped) setCategory(catTyped);

      const [marketsData, exhibitionsData] = await Promise.all([
        fetchMarketsForCategory(categorySlug, catTyped?.name),
        fetchExhibitionsForCategory(categorySlug, catTyped?.name),
      ]);
      setMarkets(marketsData as Row[]);
      setExhibitions(exhibitionsData as Row[]);

      // Production hubs via junction; fallback to fuzzy match
      const { data: junctionHubs } = await supabase
        .from("category_hubs")
        .select("hub_id, production_hubs(*)")
        .eq("category_slug", categorySlug);
      let hubsList: Row[] = (junctionHubs ?? [])
        .map((r) => r.production_hubs as unknown as Row)
        .filter(Boolean);
      if (hubsList.length === 0) {
        const { data: allHubs } = await supabase.from("production_hubs").select("*");
        hubsList = ((allHubs ?? []) as Row[]).filter((h) =>
          matchesCategory(h.industry as string, categorySlug, catTyped?.name)
        );
      }
      setHubs(hubsList);

      const { data: ins } = await supabase
        .from("mizwad_city_insights")
        .select("*")
        .eq("category_slug", categorySlug)
        .maybeSingle();
      if (ins) setInsight(ins as Insight);

      setLoading(false);
    })();
  }, [categorySlug]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const counts = useMemo(
    () => ({ markets: markets.length, exhibitions: exhibitions.length }),
    [markets, exhibitions]
  );

  const topCities = useMemo(() => {
    const cityMap = new Map<string, { city: string; markets: number; hubs: number; exhibitions: number }>();
    const ensure = (city: string) => {
      if (!city) return null;
      if (!cityMap.has(city)) cityMap.set(city, { city, markets: 0, hubs: 0, exhibitions: 0 });
      return cityMap.get(city)!;
    };
    markets.forEach((m) => { const e = ensure(m.city as string); if (e) e.markets++; });
    hubs.forEach((h) => { const e = ensure(h.city as string); if (e) e.hubs++; });
    exhibitions
      .filter((ex) => !ex.country_code || ex.country_code === "CN")
      .forEach((ex) => { const e = ensure(ex.city as string); if (e) e.exhibitions++; });
    return Array.from(cityMap.values())
      .map((c) => ({ ...c, score: c.markets + c.hubs * 2 + c.exhibitions }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [markets, hubs, exhibitions]);

  const topMarkets = useMemo(() => {
    return [...markets]
      .sort((a, b) => Number(b.is_mizwad_verified ?? 0) - Number(a.is_mizwad_verified ?? 0))
      .slice(0, 3);
  }, [markets]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const topExhibitions = useMemo(() => {
    return exhibitions
      .filter((e) => (e.start_date as string) >= today)
      .sort((a, b) => (a.start_date as string).localeCompare(b.start_date as string))
      .slice(0, 3);
  }, [exhibitions, today]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95" aria-label={t("business.home.back")}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">{t("business.tradeDataTag")}</span>
            <h1 className="text-base italic font-medium text-foreground truncate" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {category ? `${getField(category, "name") || category.name}` : t("business.categoryHub.loading")}
            </h1>
          </div>
        </div>
      </header>

      {category && <CategoryBadge emoji={category.emoji} name={getField(category, "name") || category.name} />}

      {/* Tabs */}
      <section className="px-5 mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <TabButton active={activeTab === "cities"} onClick={() => handleTabChange("cities")} icon="🏙️" label={t("business.categoryHub.tabs.cities")} />
        <TabButton active={activeTab === "markets"} onClick={() => handleTabChange("markets")} icon="🏬" label={t("business.categoryHub.tabs.markets")} count={counts.markets} />
        <TabButton active={activeTab === "exhibitions"} onClick={() => handleTabChange("exhibitions")} icon="📅" label={t("business.categoryHub.tabs.exhibitions")} count={counts.exhibitions} />
      </section>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === "cities" && (
            <CitiesTab topCities={topCities} insight={insight} />
          )}
          {activeTab === "markets" && <MarketsTab markets={markets} categorySlug={categorySlug} />}
          {activeTab === "exhibitions" && <ExhibitionsTab exhibitions={exhibitions} categorySlug={categorySlug} />}
        </>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count?: number }) => (
  <button
    onClick={onClick}
    className={cn(
      "shrink-0 flex items-center gap-1.5 rounded-full py-1.5 px-3 text-[11px] border transition-colors",
      active ? "bg-emerald-500 text-emerald-950 border-emerald-500" : "bg-white/[0.04] text-foreground border-white/10"
    )}
  >
    <span>{icon}</span>
    <span>{label}</span>
    {count !== undefined && <span className="opacity-70">({count})</span>}
  </button>
);

/* ---------------- CitiesTab ---------------- */

interface CitiesTabProps {
  topCities: { city: string; markets: number; hubs: number; exhibitions: number; score: number }[];
  insight: Insight | null;
}

const CitiesTab = ({ topCities, insight }: CitiesTabProps) => {
  const { t } = useTranslation();
  if (topCities.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
          <span className="text-xl">🏙️</span>
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          {t("business.categoryHub.emptyCity.title")}
        </h3>
        <p className="text-[12px] text-muted-foreground max-w-xs mx-auto">
          {t("business.categoryHub.emptyCity.subtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 space-y-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1 font-medium">
        {t("business.categoryHub.topCitiesTitle")}
      </p>
      {topCities.map((c, i) => (
        <div key={c.city} className="bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-3.5">
          <div className="flex items-center gap-2.5">
            <div className={cn("w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold", rankBadgeCls(i + 1))}>
              {i + 1}
            </div>
            <span className="text-sm font-medium text-foreground flex-1">{c.city}</span>
            <span className="text-sm">🇨🇳</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[11px] text-muted-foreground flex-wrap">
            {c.markets > 0 && <span>{t("business.categoryHub.cityStats.markets", { count: c.markets })}</span>}
            {c.markets > 0 && (c.hubs > 0 || c.exhibitions > 0) && <span className="text-emerald-500">●</span>}
            {c.hubs > 0 && <span>{t("business.categoryHub.cityStats.hubs", { count: c.hubs })}</span>}
            {c.hubs > 0 && c.exhibitions > 0 && <span className="text-emerald-500">●</span>}
            {c.exhibitions > 0 && <span>{t("business.categoryHub.cityStats.exhibitions", { count: c.exhibitions })}</span>}
          </div>
          {i === 0 && insight && insight.city === c.city && <MizwadInsightBox text={insight.insight_uz} />}
        </div>
      ))}
    </div>
  );
};

const MarketsTab = ({ markets, categorySlug }: { markets: Row[]; categorySlug: string }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const [activeCity, setActiveCity] = useState<string>("all");

  const cities = useMemo(() => {
    const set = new Set<string>();
    markets.forEach((m) => set.add(m.city as string));
    return Array.from(set).sort();
  }, [markets]);

  const filtered = useMemo(
    () => (activeCity === "all" ? markets : markets.filter((m) => m.city === activeCity)),
    [markets, activeCity]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    filtered.forEach((m) => {
      const c = m.city as string;
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(m);
    });
    return Array.from(map.entries());
  }, [filtered]);

  if (markets.length === 0) {
    return (
      <div className="px-5 text-center py-10">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
          <Info className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{t("business.categoryHub.emptyMarkets.title")}</p>
        <p className="text-xs text-muted-foreground mb-4">{t("business.categoryHub.emptyMarkets.subtitle")}</p>
      </div>
    );
  }

  return (
    <div>
      {cities.length > 1 && (
        <section className="mb-3">
          <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide">
            {(["all", ...cities] as string[]).map((c) => (
              <button
                key={c}
                onClick={() => setActiveCity(c)}
                className={cn(
                  "shrink-0 rounded-full py-1.5 px-3 text-[11px] border transition-colors",
                  activeCity === c
                    ? "bg-emerald-500 text-emerald-950 border-emerald-500"
                    : "bg-white/[0.04] text-foreground border-white/10 hover:bg-white/[0.07]"
                )}
              >
                {c === "all" ? t("business.categoryHub.all") : c}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="px-5 space-y-4">
        {grouped.map(([city, items]) => (
          <div key={city}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{city} 🇨🇳</p>
              <span className="text-[10px] text-muted-foreground">{t("business.categoryHub.itemsCount", { count: items.length })}</span>
            </div>
            <div className="space-y-2">
              {items.map((m) => (
                <button
                  key={m.id as string}
                  onClick={() => navigate(`/business/markets/${categorySlug}/${m.id}`)}
                  className="w-full flex items-center gap-3 bg-card hover:bg-emerald-500/5 border border-border/50 hover:border-emerald-500/30 rounded-xl py-2.5 px-3 text-left transition-colors min-h-[56px]"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getField(m, "name") || (m.name as string)}
                    </p>
                    {(m.address || m.market_type) && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {(m.address as string) ?? (m.market_type as string)}
                      </p>
                    )}
                    {m.working_hours ? (
                      <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{m.working_hours as string}</p>
                    ) : null}
                    {m.nearest_metro ? (
                      <p className="text-[10px] text-emerald-400/80 mt-0.5 truncate">
                        🚇 {(m.nearest_metro as string).replace(/\s*\([^)]+\)/, "")}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

/* ---------------- ExhibitionsTab ---------------- */

type SubTab = "china" | "world" | "upcoming";

const ExhibitionsTab = ({ exhibitions, categorySlug }: { exhibitions: Row[]; categorySlug: string }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const [activeSub, setActiveSub] = useState<SubTab>("china");
  const months = t("business.months", { returnObjects: true }) as string[];

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const sixMonthsStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  }, []);

  const counts = useMemo(() => ({
    china: exhibitions.filter((e) => !e.country_code || e.country_code === "CN").length,
    world: exhibitions.filter((e) => e.country_code && e.country_code !== "CN").length,
    upcoming: exhibitions.filter((e) => (e.start_date as string) >= today && (e.start_date as string) <= sixMonthsStr).length,
  }), [exhibitions, today, sixMonthsStr]);

  const filtered = useMemo(() => {
    let list = exhibitions;
    if (activeSub === "china") list = list.filter((e) => !e.country_code || e.country_code === "CN");
    else if (activeSub === "world") list = list.filter((e) => e.country_code && e.country_code !== "CN");
    else list = list.filter((e) => (e.start_date as string) >= today && (e.start_date as string) <= sixMonthsStr);

    return [...list].sort((a, b) => {
      if (activeSub === "upcoming") return (a.start_date as string).localeCompare(b.start_date as string);
      const aRank = (a.world_rank as number) ?? (a.china_rank as number) ?? 999;
      const bRank = (b.world_rank as number) ?? (b.china_rank as number) ?? 999;
      if (aRank !== bRank) return aRank - bRank;
      return (a.start_date as string).localeCompare(b.start_date as string);
    });
  }, [exhibitions, activeSub, today, sixMonthsStr]);

  const emptyMsg =
    activeSub === "china"
      ? t("business.categoryHub.exhibitions.emptyChina")
      : activeSub === "world"
      ? t("business.categoryHub.exhibitions.emptyWorld")
      : t("business.categoryHub.exhibitions.emptyUpcoming");

  const SubBtn = ({ k, label }: { k: SubTab; label: string }) => (
    <button
      onClick={() => setActiveSub(k)}
      className={cn(
        "shrink-0 flex items-center gap-1.5 rounded-full py-1.5 px-3 text-[11px] border transition-colors",
        activeSub === k ? "bg-emerald-500 text-emerald-950 border-emerald-500" : "bg-white/[0.04] text-foreground border-white/10"
      )}
    >
      {label}
      <span className="opacity-70">({counts[k]})</span>
    </button>
  );

  return (
    <div>
      <section className="px-5 mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <SubBtn k="china" label={t("business.categoryHub.exhibitions.subTabs.china")} />
        <SubBtn k="world" label={t("business.categoryHub.exhibitions.subTabs.world")} />
        <SubBtn k="upcoming" label={t("business.categoryHub.exhibitions.subTabs.upcoming")} />
      </section>

      <section className="px-5">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Info className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{t("business.categoryHub.exhibitions.emptyTitle")}</p>
            <p className="text-xs text-muted-foreground mb-4 px-6">{emptyMsg}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((ex) => {
              const cd = countdownInfo(t, ex.start_date as string, ex.end_date as string);
              const flag = exhibitionFlag(ex.country_code as string | undefined);
              const showCountry = ex.country_code && ex.country_code !== "CN" && ex.country_name;
              return (
                <button
                  key={ex.id as string}
                  onClick={() => navigate(`/business/exhibitions/${categorySlug}/${ex.id}`)}
                  className="w-full bg-card hover:bg-emerald-500/5 border border-border/50 hover:border-emerald-500/30 rounded-xl p-3 text-left transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Calendar className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-foreground line-clamp-2 flex-1 min-w-0">
                            {getField(ex, "name") || (ex.name as string)}
                          </p>
                          {ex.phase_number ? (
                            <span className="text-[9px] bg-amber-500/15 text-amber-400 rounded-full px-1.5 py-0.5 font-semibold uppercase tracking-wide whitespace-nowrap">
                              {t("business.categoryHub.exhibitions.phase", { n: ex.phase_number as number })}
                            </span>
                          ) : null}
                        </div>
                        {(ex.world_rank || ex.china_rank || ex.regional_rank) && (
                          <div className="text-[11px] text-amber-400/90 mt-0.5 flex items-center gap-1 flex-wrap">
                            <span>⭐</span>
                            {ex.china_rank ? <span>{t("business.categoryHub.exhibitions.chinaRank", { n: ex.china_rank as number })}</span> : null}
                            {ex.china_rank && ex.world_rank ? <span className="text-muted-foreground">·</span> : null}
                            {ex.world_rank ? <span>{t("business.categoryHub.exhibitions.worldRank", { n: ex.world_rank as number })}</span> : null}
                            {!ex.china_rank && !ex.world_rank && ex.regional_rank ? <span>{ex.regional_rank as string}</span> : null}
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">📅 {fmtRange(months, ex.start_date as string, ex.end_date as string)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          📍 {ex.city as string} {flag}
                          {showCountry ? ` (${ex.country_name as string})` : ""}
                          {ex.venue ? ` · ${ex.venue as string}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap", cd.cls)}>
                      {cd.text}
                    </span>
                  </div>
                  <div className="flex justify-end mt-1">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryHub;
