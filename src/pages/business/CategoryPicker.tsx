import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  is_active: boolean;
  parent_id: string | null;
  sort_order?: number | null;
  [k: string]: unknown;
}

interface CategoryNode extends Category {
  children: Category[];
}

const CategoryPicker = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const question = (params.get("question") ?? "cities") as "cities" | "markets" | "exhibitions";
  const preselect = params.get("preselect");
  const { getField } = useTranslatedField();
  useSwipeBack();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const questionLabel: Record<string, string> = {
    cities: t("business.categoryPicker.questions.cities"),
    markets: t("business.categoryPicker.questions.markets"),
    exhibitions: t("business.categoryPicker.questions.exhibitions"),
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("product_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (data) setCategories(data as unknown as Category[]);
    })();
  }, []);

  const tabMap: Record<string, string> = { cities: "cities", markets: "markets", exhibitions: "exhibitions" };
  const goCategory = (slug: string) =>
    navigate(`/business/category/${slug}?tab=${tabMap[question] || "cities"}`);

  useEffect(() => {
    if (!preselect || categories.length === 0) return;
    const cat = categories.find((c) => c.slug === preselect);
    if (cat) navigate(`/business/category/${cat.slug}?tab=${tabMap[question] || "cities"}`, { replace: true });
  }, [preselect, categories, question, navigate]);

  const tree = useMemo<CategoryNode[]>(() => {
    const parents = categories.filter((c) => c.parent_id == null);
    return parents.map((p) => ({
      ...p,
      children: categories.filter((c) => c.parent_id === p.id),
    }));
  }, [categories]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    const matches = (c: Category) => {
      const tname = (getField(c, "name") || c.name || "").toLowerCase();
      return tname.includes(q) || (c.name || "").toLowerCase().includes(q) || c.slug.includes(q);
    };
    return tree
      .map((p) => {
        const children = p.children.filter(matches);
        if (matches(p) || children.length > 0) return { ...p, children };
        return null;
      })
      .filter(Boolean) as CategoryNode[];
  }, [tree, search, getField]);

  // Auto-expand groups when searching
  useEffect(() => {
    if (search.trim()) {
      const next: Record<string, boolean> = {};
      filteredTree.forEach((g) => {
        if (g.children.length > 0) next[g.id] = true;
      });
      setExpanded((prev) => ({ ...prev, ...next }));
    }
  }, [search, filteredTree]);

  const toggleGroup = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">{questionLabel[question]}</span>
            <h1 className="text-base italic font-medium text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {t("business.categoryPicker.title")}
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
            placeholder={t("business.categoryPicker.searchPlaceholder")}
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
        {filteredTree.map((cat) => {
          const isGroup = cat.children.length > 0;
          const isOpen = !!expanded[cat.id];
          if (!isGroup) {
            return (
              <button
                key={cat.id}
                onClick={() => goCategory(cat.slug)}
                className="w-full min-h-[44px] flex items-center gap-3 bg-card hover:bg-emerald-500/5 border border-border/50 hover:border-emerald-500/30 rounded-xl py-2.5 px-3 text-left transition-colors touch-manipulation active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-[20px] flex-shrink-0">
                  {cat.emoji ?? "📦"}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {getField(cat, "name") || cat.name}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          }
          return (
            <div key={cat.id} className="space-y-1.5">
              <button
                onClick={() => toggleGroup(cat.id)}
                className="w-full min-h-[44px] flex items-center gap-3 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.10] border border-emerald-500/20 rounded-xl py-2.5 px-3 text-left transition-colors touch-manipulation"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[20px] flex-shrink-0">
                  {cat.emoji ?? "📂"}
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground">
                  {getField(cat, "name") || cat.name}
                </span>
                <span className="text-[11px] text-muted-foreground">({cat.children.length})</span>
                <ChevronDown
                  className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                />
              </button>
              {isOpen && (
                <div className="pl-4 space-y-1.5">
                  {cat.children.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => goCategory(sub.slug)}
                      className="w-full min-h-[44px] flex items-center gap-3 bg-card hover:bg-emerald-500/5 border border-border/40 hover:border-emerald-500/30 rounded-xl py-2 px-3 text-left transition-colors touch-manipulation active:scale-[0.99]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[17px] flex-shrink-0">
                        {sub.emoji ?? "📦"}
                      </div>
                      <span className="flex-1 text-[13px] font-medium text-foreground">
                        {getField(sub, "name") || sub.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filteredTree.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">{t("business.categoryPicker.notFound")}</p>
        )}
      </section>

      <p className="px-5 mt-4 text-[11px] text-muted-foreground italic">
        {t("business.categoryPicker.searchHint")}
      </p>
    </div>
  );
};

export default CategoryPicker;
