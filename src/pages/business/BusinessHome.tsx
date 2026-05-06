import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Store, Calendar, Scale, MessageSquare, ShieldCheck, ChevronLeft, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { SupportChat } from "@/components/SupportChat";
import { QuestionCard } from "@/components/business/QuestionCard";
import { StatsRow } from "@/components/business/StatsRow";
import { OtherServicesList } from "@/components/business/OtherServicesList";
import { cn } from "@/lib/utils";

const POPULAR_CHIPS = [
  { slug: "vehicle_parts", emoji: "🚗", label: "Avto qismlar" },
  { slug: "consumer_electronics", emoji: "📱", label: "Elektronika" },
  { slug: "furniture", emoji: "🪑", label: "Mebel" },
  { slug: "apparel_accessories", emoji: "👔", label: "Kiyim" },
  { slug: "kids_toys", emoji: "🧸", label: "O'yinchoqlar" },
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
  useSwipeBack();

  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Counts>({ markets: 0, hubs: 0, exhibitions: 0, advisors: 0, translators: 0 });
  const [nextEx, setNextEx] = useState<NextExhibition | null>(null);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [m, h, e, a, t, ne] = await Promise.all([
        supabase.from("wholesale_markets").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("production_hubs").select("*", { count: "exact", head: true }),
        supabase.from("exhibitions").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("legal_advisors").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("translators").select("*", { count: "exact", head: true }),
        supabase.from("exhibitions").select("name,start_date,world_rank,china_rank").gte("start_date", today).eq("is_active", true).order("start_date", { ascending: true }).limit(5),
      ]);
      setCounts({
        markets: m.count ?? 0,
        hubs: h.count ?? 0,
        exhibitions: e.count ?? 0,
        advisors: a.count ?? 0,
        translators: t.count ?? 0,
      });
      if (ne.data) setNextEx(ne.data as NextExhibition);
    })();
  }, []);

  const goQuestion = (q: Question) => {
    navigate(`/business/category-picker?question=${q}`);
  };

  const pickChip = (slug: string) => {
    navigate(`/business/markets/${slug}`);
  };

  let card3Subtitle = "Yaqinlashayotgan ko'rgazmalar";
  if (nextEx) {
    const days = Math.max(0, Math.ceil((new Date(nextEx.start_date).getTime() - Date.now()) / 86400000));
    const shortName = nextEx.name.length > 18 ? nextEx.name.slice(0, 18) + "…" : nextEx.name;
    card3Subtitle = `${shortName} · ${days} kun qoldi`;
  }

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95" aria-label="Back">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow">
            <Store className="w-[18px] h-[18px] text-amber-950" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">Xitoyda mahsulot qidirish</span>
            <h1 className="text-[18px] italic font-medium text-foreground leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Tijorat Markazi
            </h1>
          </div>
        </div>
      </header>

      <section className="px-5 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot, brend yoki bozor..."
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
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2.5 font-medium">Qaysi savolingiz bor?</p>
        <div className="space-y-2.5">
          <QuestionCard
            icon={MapPin}
            title="Qaysi shaharda ishlab chiqariladi?"
            subtitle="Mahsulot → Xitoy shaharlari"
            onClick={() => goQuestion("cities")}
          />
          <QuestionCard
            icon={Store}
            title="Qaysi optom bozorda topiladi?"
            subtitle="Mahsulot → bozorlar"
            onClick={() => goQuestion("markets")}
          />
          <QuestionCard
            icon={Calendar}
            accent="amber"
            title="Qaysi ko'rgazmaga borish kerak?"
            subtitle={card3Subtitle}
            onClick={() => goQuestion("exhibitions")}
          />
        </div>
      </section>

      <section className="mb-5">
        <p className="px-5 text-[11px] uppercase tracking-wide text-muted-foreground mb-1 font-medium">Mashhur kategoriyalar</p>
        <p className="px-5 text-[10px] text-muted-foreground/70 mb-2">Bozorni tezda topish</p>
        <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide">
          {POPULAR_CHIPS.map((c) => (
            <button
              key={c.slug}
              onClick={() => pickChip(c.slug)}
              className="shrink-0 flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full py-1.5 px-2.5 text-[11px] text-foreground hover:bg-white/[0.07]"
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 mb-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">Mizwad statistikasi</p>
        <StatsRow
          stats={[
            { value: counts.markets, label: "Tasdiqlangan bozor" },
            { value: counts.hubs, label: "Ishlab chiqarish hubi" },
            { value: counts.exhibitions, label: "Ko'rgazma yiliga" },
          ]}
        />
      </section>

      <section className="px-5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">Boshqa xizmatlar</p>
        <OtherServicesList
          items={[
            {
              icon: Scale,
              label: "Mizwad tasdiqlagan advokatlar",
              meta: `${counts.advisors} ta`,
              onClick: () => navigate("/business/lawyers"),
            },
            {
              icon: MessageSquare,
              label: "Tarjimonlar",
              meta: `${counts.translators} ta`,
              onClick: () => navigate("/translators"),
            },
            {
              icon: ShieldCheck,
              label: "Zavod tekshiruvi (Deep Check)",
              meta: "↗",
              onClick: () => navigate("/deep-check"),
            },
          ]}
        />
      </section>

      <SupportChat />
    </div>
  );
};

export default BusinessHome;
