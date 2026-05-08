import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { cn } from "@/lib/utils";

type FilterTab = "china" | "world";

interface Exhibition {
  id: string;
  name: string;
  city: string;
  country_code?: string | null;
  start_date: string;
  end_date: string;
  world_rank?: number | null;
  china_rank?: number | null;
  category?: string | null;
  [key: string]: unknown;
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

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS[s.getMonth()]}`;
  }
  return `${s.getDate()} ${MONTHS[s.getMonth()]} – ${e.getDate()} ${MONTHS[e.getMonth()]}`;
};

const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

const ExhibitionCard = ({ exhibition: ex }: { exhibition: Exhibition }) => {
  const navigate = useNavigate();
  const { getField } = useTranslatedField();
  const days = daysUntil(ex.start_date);
  const flag = flagEmoji(ex.country_code);
  const name = getField(ex, "name") || ex.name;

  return (
    <button
      onClick={() => navigate(`/business/exhibitions/${ex.category || "all"}/${ex.id}`)}
      className="w-full flex items-start gap-3 bg-card hover:bg-amber-500/5 border border-border/40 hover:border-amber-500/30 rounded-xl p-3 text-left transition-colors"
    >
      <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-lg shrink-0">
        📅
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-foreground">
          <span className="mr-1">{flag}</span>{name}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">📍 {ex.city}</div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 flex-wrap">
          <span>{formatDateRange(ex.start_date, ex.end_date)}</span>
          <span>·</span>
          <span className={cn(days <= 7 && days >= 0 && "text-amber-400 font-semibold")}>
            {days > 0 ? `${days} kun qoldi` : days === 0 ? "Bugun!" : "Hozir ketmoqda"}
          </span>
        </div>
        {(ex.world_rank || ex.china_rank) && (
          <div className="text-[10px] text-amber-400/80 mt-1">
            ⭐ {ex.world_rank ? `Dunyoda №${ex.world_rank}` : `Xitoyda №${ex.china_rank}`}
          </div>
        )}
      </div>
    </button>
  );
};

const UpcomingExhibitions = () => {
  const navigate = useNavigate();
  useSwipeBack();

  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("china");

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("exhibitions")
        .select("*")
        .gte("end_date", today)
        .eq("is_active", true)
        .order("start_date", { ascending: true });
      setExhibitions((data ?? []) as Exhibition[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "china") return exhibitions.filter((e) => e.country_code === "CN" || !e.country_code);
    return exhibitions.filter((e) => e.country_code && e.country_code !== "CN");
  }, [exhibitions, tab]);

  const counts = useMemo(() => ({
    china: exhibitions.filter((e) => e.country_code === "CN" || !e.country_code).length,
    world: exhibitions.filter((e) => e.country_code && e.country_code !== "CN").length,
  }), [exhibitions]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3 flex items-center gap-2.5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-muted-foreground">Tijorat ma'lumotlari</span>
          <h1 className="text-[18px] italic font-medium text-foreground leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            Yaqin ko'rgazmalar
          </h1>
        </div>
      </header>

      <div className="px-5 mb-4 flex gap-2">
        <button
          onClick={() => setTab("china")}
          className={cn(
            "shrink-0 flex items-center gap-1.5 rounded-full py-2 px-3 text-[12px] border transition-colors min-h-[36px]",
            tab === "china"
              ? "bg-emerald-500 text-emerald-950 border-emerald-500 font-medium"
              : "bg-white/[0.04] text-foreground border-white/10",
          )}
        >
          🇨🇳 <span>Xitoy</span> <span className="opacity-70">({counts.china})</span>
        </button>
        <button
          onClick={() => setTab("world")}
          className={cn(
            "shrink-0 flex items-center gap-1.5 rounded-full py-2 px-3 text-[12px] border transition-colors min-h-[36px]",
            tab === "world"
              ? "bg-emerald-500 text-emerald-950 border-emerald-500 font-medium"
              : "bg-white/[0.04] text-foreground border-white/10",
          )}
        >
          🌍 <span>Dunyo</span> <span className="opacity-70">({counts.world})</span>
        </button>
      </div>

      {loading ? (
        <div className="px-5 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[80px] rounded-xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-sm text-muted-foreground">
            {tab === "china" ? "Xitoy" : "Dunyo"} ko'rgazmalari yo'q
          </p>
        </div>
      ) : (
        <div className="px-5 space-y-2">
          {filtered.map((ex) => (
            <ExhibitionCard key={ex.id} exhibition={ex} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingExhibitions;
