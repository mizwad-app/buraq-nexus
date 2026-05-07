import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  [k: string]: unknown;
}

export const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getField } = useTranslatedField();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("product_categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setCategories((data ?? []) as unknown as Category[]);
      setLoading(false);
    })();
  }, []);

  const handlePick = (slug: string) => {
    navigate(`/business/category/${slug}?tab=cities`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-white/[0.04] border border-white/[0.06] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        Kategoriyalar yuklanmadi
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          emoji={cat.emoji ?? "📦"}
          label={getField(cat, "name") || cat.name}
          onClick={() => handlePick(cat.slug)}
        />
      ))}
    </div>
  );
};

interface CategoryCardProps {
  emoji: string;
  label: string;
  onClick: () => void;
}

const CategoryCard = ({ emoji, label, onClick }: CategoryCardProps) => (
  <button
    onClick={onClick}
    className={cn(
      "aspect-square min-h-[110px] flex flex-col items-center justify-center gap-2 p-3",
      "bg-white/[0.03] border border-white/[0.06] rounded-xl",
      "hover:bg-emerald-500/[0.06] hover:border-emerald-500/30",
      "active:scale-[0.97] transition-all duration-150",
    )}
  >
    <span className="text-3xl leading-none">{emoji}</span>
    <span className="text-[12px] font-medium text-foreground text-center leading-tight line-clamp-2">
      {label}
    </span>
  </button>
);
