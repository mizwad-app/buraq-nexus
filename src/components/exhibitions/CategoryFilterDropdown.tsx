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
  const { data: categories } = useExhibitionCategories();
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
        {categories.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            <span className="flex items-center gap-2">
              <span>{c.emoji ?? "📂"}</span>
              <span>{getName(c, lang)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
