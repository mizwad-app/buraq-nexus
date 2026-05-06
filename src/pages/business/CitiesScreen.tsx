import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { matchesCategory } from "@/lib/businessCategoryMatch";
import { CityRankCard } from "@/components/business/CityRankCard";

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

const CitiesScreen = () => {
  const navigate = useNavigate();
  const { categorySlug = "" } = useParams();
  const { getField } = useTranslatedField();
  useSwipeBack();

  const [category, setCategory] = useState<Category | null>(null);
  const [markets, setMarkets] = useState<{ city: string; category: string }[]>([]);
  const [hubs, setHubs] = useState<{ city: string; industry: string }[]>([]);
  const [exhibitions, setExhibitions] = useState<{ city: string; category: string; start_date: string }[]>([]);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [cat, m, h, e, ins] = await Promise.all([
        supabase.from("product_categories").select("*").eq("slug", categorySlug).maybeSingle(),
        supabase.from("wholesale_markets").select("city,category").eq("is_active", true),
        supabase.from("production_hubs").select("city,industry"),
        supabase.from("exhibitions").select("city,category,start_date").eq("is_active", true),
        supabase.from("mizwad_city_insights").select("*").eq("category_slug", categorySlug).maybeSingle(),
      ]);
      if (cat.data) setCategory(cat.data as unknown as Category);
      setMarkets((m.data ?? []) as { city: string; category: string }[]);
      setHubs((h.data ?? []) as { city: string; industry: string }[]);
      setExhibitions((e.data ?? []) as { city: string; category: string; start_date: string }[]);
      if (ins.data) setInsight(ins.data as Insight);
      setLoading(false);
    })();
  }, [categorySlug]);

  const ranking = useMemo(() => {
    if (!category) return [] as { city: string; markets: number; hubs: number; exhibitions: number; score: number }[];
    const slug = category.slug;
    const name = category.name;
    const cityMap = new Map<string, { city: string; markets: number; hubs: number; exhibitions: number }>();
    const ensure = (city: string) => {
      if (!cityMap.has(city)) cityMap.set(city, { city, markets: 0, hubs: 0, exhibitions: 0 });
      return cityMap.get(city)!;
    };
    markets.forEach((r) => {
      if (matchesCategory(r.category, slug, name)) ensure(r.city).markets++;
    });
    hubs.forEach((r) => {
      if (matchesCategory(r.industry, slug, name)) ensure(r.city).hubs++;
    });
    exhibitions.forEach((r) => {
      if (matchesCategory(r.category, slug, name)) ensure(r.city).exhibitions++;
    });
    return Array.from(cityMap.values())
      .map((c) => ({ ...c, score: c.markets + c.hubs * 2 + c.exhibitions }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [category, markets, hubs, exhibitions]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">Qaysi shaharda ishlab chiqariladi?</span>
            <h1 className="text-base italic font-medium text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Shaharlar ro'yxati
            </h1>
          </div>
        </div>
      </header>

      {/* Selected category badge */}
      {category && (
        <section className="px-5 mb-4">
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-[10px] py-2 px-3">
            <span className="text-base">{category.emoji ?? "📦"}</span>
            <span className="flex-1 text-sm font-medium text-foreground">{getField(category, "name") || category.name}</span>
            <button
              onClick={() => navigate(-1)}
              className="text-[11px] text-muted-foreground underline"
            >
              o'zgartirish
            </button>
          </div>
        </section>
      )}

      <section className="px-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2.5 font-medium">Eng yaxshi 3 ta shahar</p>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Info className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Ma'lumot yo'q</p>
            <p className="text-xs text-muted-foreground mb-4">Bu kategoriya uchun shaharlar ma'lumoti tez orada qo'shiladi.</p>
            <button
              onClick={() => navigate("/business")}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[12px] text-emerald-300"
            >
              Mizwadga so'rov yuborish
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {ranking.map((c, i) => (
              <CityRankCard
                key={c.city}
                rank={i + 1}
                city={c.city}
                markets={c.markets}
                hubs={c.hubs}
                exhibitions={c.exhibitions}
                insight={insight && insight.city === c.city ? insight.insight_uz : null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CitiesScreen;
