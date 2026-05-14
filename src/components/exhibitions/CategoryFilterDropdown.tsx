import { useTranslation } from "react-i18next";
import { useExhibitionCategories, type ExhibitionCategory } from "@/hooks/useExhibitions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  value: number | null;
  onChange: (val: number | null) => void;
}

const getName = (c: ExhibitionCategory, lang: string): string => {
  const key = `name_${lang}` as keyof ExhibitionCategory;
  return (c[key] as string | null) ?? c.name_en ?? c.name_uz ?? c.slug;
};

export function CategoryFilterDropdown({ value, onChange }: Props) {
  const { t, i18n } = useTranslation();
  const { data: categories, tree } = useExhibitionCategories();
  const lang = i18n.language;
  const stringValue = value === null ? "all" : String(value);
  const selected = value !== null ? categories.find((c) => c.id === value) : null;

  return (
    <Select value={stringValue} onValueChange={(v) => onChange(v === "all" ? null : Number(v))}>
      <SelectTrigger className="w-full min-h-[44px] bg-card border-border">
        <SelectValue placeholder={t("exhibitions.filter.allCategories")}>
          <span className="flex items-center gap-2">
            <span>{selected?.emoji ?? "📂"}</span>
            <span>{selected ? getName(selected, lang) : t("exhibitions.filter.allCategories")}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[60vh]">
        <SelectItem value="all">
          <span className="flex items-center gap-2">
            <span>🌐</span>
            <span>{t("exhibitions.filter.allCategories")}</span>
          </span>
        </SelectItem>
        {tree.map((parent) => {
          const isGroup = (parent.children?.length ?? 0) > 0;
          return (
            <div key={parent.id}>
              {isGroup ? (
                <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <span>{parent.emoji ?? "📂"}</span>
                  <span>{getName(parent, lang)}</span>
                  <span className="opacity-60">({parent.children?.length})</span>
                </div>
              ) : (
                <SelectItem value={String(parent.id)}>
                  <span className="flex items-center gap-2">
                    <span>{parent.emoji ?? "📂"}</span>
                    <span>{getName(parent, lang)}</span>
                  </span>
                </SelectItem>
              )}
              {isGroup &&
                parent.children?.map((sub) => (
                  <SelectItem key={sub.id} value={String(sub.id)} className="pl-7">
                    <span className="flex items-center gap-2">
                      <span>{sub.emoji ?? "📂"}</span>
                      <span>{getName(sub, lang)}</span>
                    </span>
                  </SelectItem>
                ))}
            </div>
          );
        })}
      </SelectContent>
    </Select>
  );
}
