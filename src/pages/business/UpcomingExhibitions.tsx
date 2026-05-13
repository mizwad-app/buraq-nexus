import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { useExhibitions, type ExhibitionWithCategory } from "@/hooks/useExhibitions";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { ExhibitionFilters, type FilterState } from "@/components/exhibitions/ExhibitionFilters";
import { cn } from "@/lib/utils";

const flagEmoji = (code?: string | null) => {
  if (!code) return "🌍";
  const flags: Record<string, string> = {
    CN: "🇨🇳", DE: "🇩🇪", IT: "🇮🇹", US: "🇺🇸", FR: "🇫🇷",
    ES: "🇪🇸", TW: "🇹🇼", HK: "🇭🇰", AE: "🇦🇪", JP: "🇯🇵",
    GB: "🇬🇧", KR: "🇰🇷", RU: "🇷🇺", TR: "🇹🇷", BR: "🇧🇷",
  };
  return flags[code] ?? "🌍";
};

const formatDateRange = (months: string[], start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]}`;
};

const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

const ExhibitionCard = ({ exhibition: ex }: { exhibition: ExhibitionWithCategory }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { getField } = useTranslatedField();
  const days = daysUntil(ex.start_date);
  const flag = flagEmoji(ex.country_code);
  const name = getField(ex as unknown as Record<string, unknown>, "name") || ex.name;
  const monthsShort = t("business.monthsShort", { returnObjects: true }) as string[];
  const lang = i18n.language;
  const catName = ex.category
    ? ((ex.category as unknown as Record<string, unknown>)[`name_${lang}`] as string | undefined) ??
      ex.category.name_en ??
      ex.category.name_uz
    : null;

  return (
    <button
      onClick={() => navigate(`/business/exhibitions/${ex.category?.slug || "all"}/${ex.id}`)}
      className="w-full flex items-start gap-3 bg-card hover:bg-amber-500/5 border border-border/40 hover:border-amber-500/30 rounded-xl p-3 text-left transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-lg shrink-0">
        {ex.category?.emoji ?? "📅"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-foreground">
          <span className="mr-1">{flag}</span>
          {name}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">📍 {ex.city}</div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 flex-wrap">
          <span>{formatDateRange(monthsShort, ex.start_date, ex.end_date)}</span>
          <span>·</span>
          <span className={cn(days <= 7 && days >= 0 && "text-amber-400 font-semibold")}>
            {days > 0
              ? t("business.upcomingExhibitions.daysLeft", { count: days })
              : days === 0
                ? t("business.upcomingExhibitions.today")
                : t("business.upcomingExhibitions.live")}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {ex.is_international === true && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              🌐 {t("exhibitions.badge.international")}
            </span>
          )}
          {ex.is_international === false && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              🇨🇳 {t("exhibitions.badge.domestic")}
            </span>
          )}
          {catName && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-foreground/80 border border-white/10">
              {ex.category?.emoji} {catName}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const EmptyState = ({ filters }: { filters: FilterState }) => {
  const { t } = useTranslation();
  if (filters.location === "domestic") {
    return (
      <div className="px-5 py-12 text-center">
        <div className="text-4xl mb-3">🇨🇳</div>
        <p className="text-[14px] font-semibold text-foreground mb-1">{t("exhibitions.empty.domesticTitle")}</p>
        <p className="text-[12px] text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
          {t("exhibitions.empty.domesticDesc")}
        </p>
      </div>
    );
  }
  return (
    <div className="px-5 py-12 text-center">
      <div className="text-4xl mb-2">📅</div>
      <p className="text-sm text-muted-foreground">{t("exhibitions.empty.generic")}</p>
    </div>
  );
};

const UpcomingExhibitions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useSwipeBack();

  const [filters, setFilters] = useState<FilterState>({ location: "all", categoryId: null });

  const allResult = useExhibitions({ locationFilter: "all" });
  const filtered = useExhibitions({
    locationFilter: filters.location,
    categoryId: filters.categoryId,
  });

  const counts = useMemo(
    () => ({
      all: allResult.data.length,
      international: allResult.data.filter((e) => e.is_international === true).length,
      domestic: allResult.data.filter((e) => e.is_international === false).length,
    }),
    [allResult.data],
  );

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3 flex items-center gap-2.5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95"
          aria-label={t("business.home.back")}
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-muted-foreground">{t("business.tradeDataTag")}</span>
          <h1
            className="text-[18px] italic font-medium text-foreground leading-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            {t("business.upcomingExhibitions.title")}
          </h1>
        </div>
      </header>

      <div className="px-5 mb-4">
        <ExhibitionFilters value={filters} onChange={setFilters} counts={counts} />
      </div>

      {filtered.loading ? (
        <div className="px-5 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[80px] rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : filtered.data.length === 0 ? (
        <EmptyState filters={filters} />
      ) : (
        <div className="px-5 space-y-2">
          {filtered.data.map((ex) => (
            <ExhibitionCard key={ex.id} exhibition={ex} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingExhibitions;
