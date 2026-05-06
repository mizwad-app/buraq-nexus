import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Info, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { fetchExhibitionsForCategory } from "@/lib/businessFetchers";
import { CategoryBadge } from "@/components/business/CategoryBadge";
import { exhibitionFlag } from "@/lib/exhibitionFlags";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  [k: string]: unknown;
}

interface Exhibition {
  id: string;
  name: string;
  city: string;
  venue?: string | null;
  start_date: string;
  end_date: string;
  description?: string | null;
  country_code?: string | null;
  country_name?: string | null;
  world_rank?: number | null;
  china_rank?: number | null;
  regional_rank?: string | null;
  [k: string]: unknown;
}

const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const fmtRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}-${e.getDate()} ${MONTHS_UZ[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${MONTHS_UZ[s.getMonth()]} – ${e.getDate()} ${MONTHS_UZ[e.getMonth()]} ${e.getFullYear()}`;
};

const countdownInfo = (start: string, end: string) => {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now > e) return { text: "Tugagan", cls: "bg-white/[0.05] text-muted-foreground" };
  if (now >= s) return { text: "🔴 Hozir ketmoqda", cls: "bg-red-500/15 text-red-400" };
  const days = Math.ceil((s - now) / 86400000);
  if (days <= 7) return { text: `${days} kun qoldi`, cls: "bg-amber-500/15 text-amber-400" };
  if (days <= 30) return { text: `${days} kun qoldi`, cls: "bg-emerald-500/15 text-emerald-400" };
  return { text: `${days} kun qoldi`, cls: "bg-white/[0.05] text-muted-foreground" };
};

type TabKey = "china" | "world" | "upcoming";

const ExhibitionsScreen = () => {
  const navigate = useNavigate();
  const { categorySlug = "" } = useParams();
  const { getField } = useTranslatedField();
  useSwipeBack();

  const [category, setCategory] = useState<Category | null>(null);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("china");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: cat } = await supabase
        .from("product_categories")
        .select("*")
        .eq("slug", categorySlug)
        .maybeSingle();
      if (cat) setCategory(cat as unknown as Category);
      const list = await fetchExhibitionsForCategory(categorySlug, (cat as { name?: string } | null)?.name);
      setExhibitions(list as unknown as Exhibition[]);
      setLoading(false);
    })();
  }, [categorySlug]);

  const sixMonthsStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  }, []);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const counts = useMemo(() => ({
    china: exhibitions.filter((e) => !e.country_code || e.country_code === "CN").length,
    world: exhibitions.filter((e) => e.country_code && e.country_code !== "CN").length,
    upcoming: exhibitions.filter((e) => e.start_date >= today && e.start_date <= sixMonthsStr).length,
  }), [exhibitions, today, sixMonthsStr]);

  const filtered = useMemo(() => {
    let list = exhibitions;
    if (activeTab === "china") list = list.filter((e) => !e.country_code || e.country_code === "CN");
    else if (activeTab === "world") list = list.filter((e) => e.country_code && e.country_code !== "CN");
    else list = list.filter((e) => e.start_date >= today && e.start_date <= sixMonthsStr);

    return [...list].sort((a, b) => {
      if (activeTab === "upcoming") return a.start_date.localeCompare(b.start_date);
      const aRank = a.world_rank ?? a.china_rank ?? 999;
      const bRank = b.world_rank ?? b.china_rank ?? 999;
      if (aRank !== bRank) return aRank - bRank;
      return a.start_date.localeCompare(b.start_date);
    });
  }, [exhibitions, activeTab, today, sixMonthsStr]);

  const emptyMsg =
    activeTab === "china"
      ? "Bu kategoriya uchun Xitoyda ko'rgazma yo'q. Dunyo tabini ko'rib chiqing."
      : activeTab === "world"
      ? "Bu kategoriya uchun dunyoda ko'rgazma ma'lumotlari tez orada qo'shiladi."
      : "Yaqin 6 oyda ko'rgazma yo'q. Xitoy yoki Dunyo tabidan to'liq ro'yxatni ko'ring.";

  const TabBtn = ({ k, label }: { k: TabKey; label: string }) => (
    <button
      onClick={() => setActiveTab(k)}
      className={cn(
        "shrink-0 flex items-center gap-1.5 rounded-full py-1.5 px-3 text-[11px] border transition-colors",
        activeTab === k
          ? "bg-emerald-500 text-emerald-950 border-emerald-500"
          : "bg-white/[0.04] text-foreground border-white/10",
      )}
    >
      {label}
      <span className="opacity-70">({counts[k]})</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">Qaysi ko'rgazmaga borish kerak?</span>
            <h1 className="text-base italic font-medium text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Ko'rgazmalar
            </h1>
          </div>
        </div>
      </header>

      {category && <CategoryBadge emoji={category.emoji} name={getField(category, "name") || category.name} />}

      <section className="px-5 mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <TabBtn k="china" label="🇨🇳 Xitoy" />
        <TabBtn k="world" label="🌍 Dunyo" />
        <TabBtn k="upcoming" label="📅 Yaqin 6 oy" />
      </section>

      <section className="px-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Info className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Ma'lumot yo'q</p>
            <p className="text-xs text-muted-foreground mb-4 px-6">{emptyMsg}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((ex) => {
              const cd = countdownInfo(ex.start_date, ex.end_date);
              const flag = exhibitionFlag(ex.country_code);
              const showCountry = ex.country_code && ex.country_code !== "CN" && ex.country_name;
              return (
                <button
                  key={ex.id}
                  onClick={() => navigate(`/business/exhibitions/${categorySlug}/${ex.id}`)}
                  className="w-full bg-card hover:bg-emerald-500/5 border border-border/50 hover:border-emerald-500/30 rounded-xl p-3 text-left transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Calendar className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {getField(ex as unknown as Record<string, unknown>, "name") || ex.name}
                        </p>
                        {(ex.world_rank || ex.china_rank || ex.regional_rank) && (
                          <div className="text-[11px] text-amber-400/90 mt-0.5 flex items-center gap-1 flex-wrap">
                            <span>⭐</span>
                            {ex.china_rank && <span>Xitoyda №{ex.china_rank}</span>}
                            {ex.china_rank && ex.world_rank && <span className="text-muted-foreground">·</span>}
                            {ex.world_rank && <span>Dunyoda №{ex.world_rank}</span>}
                            {!ex.china_rank && !ex.world_rank && ex.regional_rank && <span>{ex.regional_rank}</span>}
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">📅 {fmtRange(ex.start_date, ex.end_date)}</p>
                        <p className="text-[11px] text-muted-foreground">
                          📍 {ex.city} {flag}
                          {showCountry ? ` (${ex.country_name})` : ""}
                          {ex.venue ? ` · ${ex.venue}` : ""}
                        </p>
                        {ex.description && <p className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-1">{ex.description}</p>}
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

export default ExhibitionsScreen;
