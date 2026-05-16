import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Store, Calendar, Scale, MessageSquare, ShieldCheck, ChevronLeft, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { SupportChat } from "@/components/SupportChat";
import { QuestionCard } from "@/components/business/QuestionCard";
import { StatsRow } from "@/components/business/StatsRow";
import { OtherServicesList } from "@/components/business/OtherServicesList";
import { UpcomingExhibitionsPreview } from "@/components/business/UpcomingExhibitionsPreview";
import { LocationButton } from "@/components/business/LocationButton";
import { cn } from "@/lib/utils";

const POPULAR_CHIPS = [
  { slug: "vehicle_parts", emoji: "🚗", labelKey: "business.home.chips.vehicleParts" },
  { slug: "consumer_electronics", emoji: "📱", labelKey: "business.home.chips.electronics" },
  { slug: "furniture", emoji: "🪑", labelKey: "business.home.chips.furniture" },
  { slug: "apparel_accessories", emoji: "👔", labelKey: "business.home.chips.apparel" },
  { slug: "kids_toys", emoji: "🧸", labelKey: "business.home.chips.toys" },
];

type Question = "cities" | "markets" | "exhibitions";

interface Counts {
  markets: number;
  hubs: number;
  exhibitions: number;
  advisors: number;
  translators: number;
}

interface NextExhibition {
  name: string;
  start_date: string;
}

const BusinessHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useSwipeBack();

  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Counts>({ markets: 0, hubs: 0, exhibitions: 0, advisors: 0, translators: 0 });
  const [nextEx, setNextEx] = useState<NextExhibition | null>(null);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [m, h, e, a, t, ne] = await Promise.all([
        supabase.from("wholesale_markets").select("*", { count: "exact", head: true }).eq("is_mizwad_verified", true),
        supabase.from("production_hubs").select("*", { count: "exact", head: true }),
        supabase.from("exhibitions").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("legal_advisors").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("translators").select("id", { count: "exact", head: true }),
        supabase.from("exhibitions").select("name,start_date,world_rank,china_rank").gte("start_date", today).eq("is_active", true).order("start_date", { ascending: true }).limit(5),
      ]);
      setCounts({
        markets: m.count ?? 0,
        hubs: h.count ?? 0,
        exhibitions: e.count ?? 0,
        advisors: a.count ?? 0,
        translators: t.count ?? 0,
      });
      const list = (ne.data ?? []) as Array<{ name: string; start_date: string; world_rank: number | null; china_rank: number | null }>;
      const within60 = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) <= 60;
      const ranked = list.filter((x) => within60(x.start_date) && (x.world_rank || x.china_rank === 1));
      const pick = ranked[0] || list[0] || null;
      if (pick) setNextEx({ name: pick.name, start_date: pick.start_date });
    })();
  }, []);

  const goQuestion = (q: Question) => {
    navigate(`/business/category-picker?question=${q}`);
  };

  const pickChip = (slug: string) => {
    navigate(`/business/category/${slug}?tab=cities`);
  };

  const filteredChips = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return POPULAR_CHIPS;
    return POPULAR_CHIPS.filter(
      (c) => t(c.labelKey).toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [search, t]);

  let card3Subtitle = t("business.home.upcomingExhibitions");
  if (nextEx) {
    const days = Math.max(0, Math.ceil((new Date(nextEx.start_date).getTime() - Date.now()) / 86400000));
    const exName = nextEx.name ?? "";
    const shortName = exName.length > 18 ? exName.slice(0, 18) + "…" : exName;
    card3Subtitle = t("business.home.daysLeft", { name: shortName, count: days });
  }

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95" aria-label={t("business.home.back")}>
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow">
            <Store className="w-[18px] h-[18px] text-amber-950" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">{t("business.home.headerSubtitle")}</span>
            <h1 className="text-[18px] italic font-medium text-foreground leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {t("business.title")}
            </h1>
          </div>
        </div>
        <div className="mt-2 pl-11">
          <LocationButton />
        </div>
      </header>

      <section className="px-5 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("business.home.searchPlaceholder")}
            className={cn(
              "w-full pl-10 pr-9 py-2.5 rounded-xl text-sm",
              "bg-emerald-500/[0.08] border border-emerald-500/25 text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:border-emerald-500/50",
            )}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </section>

      <section className="px-5 mb-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2.5 font-medium">{t("business.home.productSearchLabel")}</p>
        <button
          onClick={() => navigate('/business/category-picker')}
          className="w-full bg-gradient-to-br from-emerald-500/15 via-emerald-500/[0.08] to-transparent border-2 border-emerald-500/40 hover:border-emerald-500/60 hover:from-emerald-500/20 active:scale-[0.99] rounded-2xl p-4 text-left transition-all flex items-start gap-3"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl shrink-0">
            📦
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-foreground mb-1">
              {t("business.home.productQuestion")}
            </div>
            <div className="text-[12px] text-muted-foreground leading-relaxed">
              {t("business.home.productQuestionDesc")}
            </div>
          </div>
          <div className="text-emerald-400 text-lg shrink-0 mt-2">
            →
          </div>
        </button>
      </section>

      <UpcomingExhibitionsPreview />

      <section className="mb-5">
        <p className="px-5 text-[11px] uppercase tracking-wide text-muted-foreground mb-1 font-medium">
          {search.trim() ? t("business.home.searchResults") : t("business.home.popularCategories")}
        </p>
        <p className="px-5 text-[10px] text-muted-foreground/70 mb-2">
          {search.trim() ? t("business.home.searchFor", { query: search.trim() }) : t("business.home.findMarketFast")}
        </p>
        {filteredChips.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide">
            {filteredChips.map((c) => (
              <button
                key={c.slug}
                onClick={() => pickChip(c.slug)}
                className="shrink-0 flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full py-1.5 px-2.5 text-[11px] text-foreground hover:bg-white/[0.07]"
              >
                <span>{c.emoji}</span>
                <span>{t(c.labelKey)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="px-5 py-3 text-[12px] text-muted-foreground text-center">
            {t("business.home.noCategoriesFound", { query: search.trim() })}
          </div>
        )}
      </section>

      <section className="px-5 mb-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">{t("business.home.statsLabel")}</p>
        <StatsRow
          stats={[
            { value: counts.markets, label: t("business.home.stats.verifiedMarkets") },
            { value: counts.hubs, label: t("business.home.stats.productionHubs") },
            { value: counts.exhibitions, label: t("business.home.stats.exhibitions") },
          ]}
        />
      </section>

      <section className="px-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">{t("business.home.otherServicesLabel")}</p>
        <OtherServicesList
          items={[
            {
              icon: ShieldCheck,
              label: t("business.home.services.deepCheck"),
              meta: "↗",
              onClick: () => navigate("/deep-check"),
            },
            {
              icon: MessageSquare,
              label: t("business.home.services.translators"),
              meta: t("business.home.services.count", { count: counts.translators }),
              onClick: () => navigate("/translators"),
            },
            {
              icon: Scale,
              label: t("business.home.services.verifiedLawyers"),
              meta: t("business.home.services.count", { count: counts.advisors }),
              onClick: () => navigate("/business/lawyers"),
            },
          ]}
        />
      </section>

      <SupportChat />
    </div>
  );
};

export default BusinessHome;
