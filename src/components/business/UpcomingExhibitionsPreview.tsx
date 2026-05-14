import { useNavigate } from "react-router-dom";
import { useExhibitions } from "@/hooks/useExhibitions";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cityNameToSlug, useCityExists } from "@/hooks/useCityLink";
import { cn } from "@/lib/utils";

interface Exhibition {
  id: string;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  city: string;
  country_code?: string | null;
  start_date: string;
  end_date: string;
  world_rank?: number | null;
  china_rank?: number | null;
  category?: string | null;
}

const flagEmoji = (code?: string | null) => {
  if (!code) return "🌍";
  const flags: Record<string, string> = {
    CN: "🇨🇳", DE: "🇩🇪", IT: "🇮🇹", US: "🇺🇸", FR: "🇫🇷",
    ES: "🇪🇸", TW: "🇹🇼", HK: "🇭🇰", AE: "🇦🇪", JP: "🇯🇵",
    GB: "🇬🇧", KR: "🇰🇷", RU: "🇷🇺", TR: "🇹🇷", BR: "🇧🇷",
  };
  return flags[code] ?? "🌍";
};

const MONTHS = ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"];

const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

const ExhibitionMiniCard = ({ exhibition }: { exhibition: Exhibition }) => {
  const navigate = useNavigate();
  const { getField } = useTranslatedField();
  const days = daysUntil(exhibition.start_date);
  const flag = flagEmoji(exhibition.country_code);
  const name = getField(exhibition as unknown as Record<string, unknown>, "name") || exhibition.name;
  const citySlug = cityNameToSlug(exhibition.city);
  const { data: cityExists } = useCityExists(exhibition.city);

  const handleCardClick = () => {
    navigate(`/business/exhibitions/${exhibition.category || "all"}/${exhibition.id}`);
  };

  const handleCityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (citySlug) {
      navigate(`/city/${citySlug}`);
    }
  };

  return (
    <button
      onClick={handleCardClick}
      className={cn(
        "w-full flex items-center gap-3 bg-card hover:bg-amber-500/5 border border-border/40 hover:border-amber-500/30",
        "rounded-xl py-2.5 px-3 text-left transition-colors min-h-[60px]",
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-base shrink-0">
        📅
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground truncate">
          <span className="mr-1">{flag}</span>{name}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
          {exhibition.city && cityExists && citySlug ? (
            <span
              onClick={handleCityClick}
              role="link"
              className="inline-flex items-center gap-0.5 text-emerald-400 hover:underline cursor-pointer"
            >
              📍 {exhibition.city}
            </span>
          ) : (
            <span>📍 {exhibition.city}</span>
          )}
          <span>·</span>
          <span>{formatShortDate(exhibition.start_date)}</span>
          <span>·</span>
          <span className={cn(days <= 7 && days >= 0 && "text-amber-400 font-semibold")}>
            {days > 0 ? `${days} kun qoldi` : days === 0 ? "Bugun!" : "Hozir ketmoqda"}
          </span>
          {exhibition.world_rank && (
            <>
              <span>·</span>
              <span>⭐ Dunyoda №{exhibition.world_rank}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
};

export const UpcomingExhibitionsPreview = () => {
  const navigate = useNavigate();
  const { data, loading } = useExhibitions({ locationFilter: "all", limit: 3 });
  const exhibitions = data as unknown as Exhibition[];

  if (loading) {
    return (
      <section className="px-5 mb-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
          📅 Yaqin kunlardagi ko'rgazmalar
        </p>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[60px] rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (exhibitions.length === 0) return null;

  return (
    <section className="px-5 mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
          📅 Yaqin kunlardagi ko'rgazmalar
        </p>
        <button
          onClick={() => navigate("/business/exhibitions/upcoming")}
          className="text-[11px] text-emerald-400 font-medium"
        >
          Hammasi →
        </button>
      </div>
      <div className="space-y-2">
        {exhibitions.map((ex) => (
          <ExhibitionMiniCard key={ex.id} exhibition={ex} />
        ))}
      </div>
    </section>
  );
};
