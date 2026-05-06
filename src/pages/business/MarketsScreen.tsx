import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Info, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { fetchMarketsForCategory } from "@/lib/businessFetchers";
import { CategoryBadge } from "@/components/business/CategoryBadge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  [k: string]: unknown;
}

interface Market {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  working_hours?: string | null;
  market_type?: string | null;
  nearest_metro?: string | null;
  [k: string]: unknown;
}

const MarketsScreen = () => {
  const navigate = useNavigate();
  const { categorySlug = "" } = useParams();
  const { getField } = useTranslatedField();
  useSwipeBack();

  const [category, setCategory] = useState<Category | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [activeCity, setActiveCity] = useState<string>("all");
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
      const list = await fetchMarketsForCategory(categorySlug, (cat as { name?: string } | null)?.name);
      setMarkets(list as unknown as Market[]);
      setLoading(false);
    })();
  }, [categorySlug]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    markets.forEach((m) => set.add(m.city));
    return Array.from(set).sort();
  }, [markets]);

  const filtered = useMemo(
    () => (activeCity === "all" ? markets : markets.filter((m) => m.city === activeCity)),
    [markets, activeCity]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Market[]>();
    filtered.forEach((m) => {
      if (!map.has(m.city)) map.set(m.city, []);
      map.get(m.city)!.push(m);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">Qaysi optom bozorda topiladi?</span>
            <h1 className="text-base italic font-medium text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Bozorlar ro'yxati
            </h1>
          </div>
        </div>
      </header>

      {category && <CategoryBadge emoji={category.emoji} name={getField(category, "name") || category.name} />}

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
                {c === "all" ? "Hammasi" : c}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="px-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Info className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Ma'lumot yo'q</p>
            <p className="text-xs text-muted-foreground mb-4">Bu kategoriya uchun bozorlar tez orada qo'shiladi.</p>
            <button
              onClick={() => navigate("/business")}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[12px] text-emerald-300"
            >
              Mizwadga so'rov yuborish
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([city, items]) => (
              <div key={city}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{city} 🇨🇳</p>
                  <span className="text-[10px] text-muted-foreground">{items.length} ta</span>
                </div>
                <div className="space-y-2">
                  {items.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => navigate(`/business/markets/${categorySlug}/${m.id}`)}
                      className="w-full flex items-center gap-3 bg-card hover:bg-emerald-500/5 border border-border/50 hover:border-emerald-500/30 rounded-xl py-2.5 px-3 text-left transition-colors min-h-[56px]"
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getField(m as unknown as Record<string, unknown>, "name") || m.name}
                        </p>
                        {(m.address || m.market_type) && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {m.address ?? m.market_type}
                          </p>
                        )}
                        {m.working_hours && (
                          <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{m.working_hours}</p>
                        )}
                        {m.nearest_metro && (
                          <p className="text-[10px] text-emerald-400/80 mt-0.5 truncate">
                            🚇 {m.nearest_metro.replace(/\s*\([^)]+\)/, "")}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MarketsScreen;
