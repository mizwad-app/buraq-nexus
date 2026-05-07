import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  is_active: boolean;
  [k: string]: unknown;
}

const QUESTION_LABEL: Record<string, string> = {
  cities: "Qaysi shaharda ishlab chiqariladi?",
  markets: "Qaysi optom bozorda topiladi?",
  exhibitions: "Qaysi ko'rgazmaga borish kerak?",
};

const CategoryPicker = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const question = (params.get("question") ?? "cities") as "cities" | "markets" | "exhibitions";
  const preselect = params.get("preselect");
  const { getField } = useTranslatedField();
  useSwipeBack();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("product_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (data) setCategories(data as unknown as Category[]);
    })();
  }, []);

  // Auto-navigate if preselect is provided and category found
  const tabMap: Record<string, string> = { cities: "cities", markets: "markets", exhibitions: "exhibitions" };
  useEffect(() => {
    if (!preselect || categories.length === 0) return;
    const cat = categories.find((c) => c.slug === preselect);
    if (cat) {
      navigate(`/business/category/${cat.slug}?tab=${tabMap[question] || "all"}`, { replace: true });
    }
  }, [preselect, categories, question, navigate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => {
      const tname = (getField(c, "name") || c.name).toLowerCase();
      return tname.includes(q) || c.name.toLowerCase().includes(q) || c.slug.includes(q);
    });
  }, [categories, search, getField]);

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">{QUESTION_LABEL[question]}</span>
            <h1 className="text-base italic font-medium text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Mahsulot kategoriyasi
            </h1>
          </div>
        </div>
      </header>

      <section className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kategoriya qidirish..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-card border border-border/50 focus:outline-none focus:border-emerald-500/40"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </section>

      <section className="px-5 space-y-2">
        {filtered.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/business/category/${cat.slug}?tab=${tabMap[question] || "cities"}`)}
            className="w-full flex items-center gap-3 bg-card hover:bg-emerald-500/5 border border-border/50 hover:border-emerald-500/30 rounded-xl py-2.5 px-3 text-left transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-[20px] flex-shrink-0">
              {cat.emoji ?? "📦"}
            </div>
            <span className="flex-1 text-sm font-medium text-foreground">{getField(cat, "name") || cat.name}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Topilmadi</p>
        )}
      </section>

      <p className="px-5 mt-4 text-[11px] text-muted-foreground italic">
        Bu yerda ko'rmagan kategoriyangizni qidirish uchun yuqoridagi qidiruv panelidan foydalaning.
      </p>
    </div>
  );
};

export default CategoryPicker;
