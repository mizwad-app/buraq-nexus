import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { LocationFilter } from "@/hooks/useExhibitions";

interface Props {
  value: LocationFilter;
  onChange: (val: LocationFilter) => void;
  counts?: { all: number; international: number; domestic: number };
}

const CHIPS: { key: LocationFilter; emoji: string; labelKey: string }[] = [
  { key: "all", emoji: "🌍", labelKey: "exhibitions.filter.all" },
  { key: "international", emoji: "🌐", labelKey: "exhibitions.filter.international" },
  { key: "domestic", emoji: "🇨🇳", labelKey: "exhibitions.filter.domestic" },
];

export function LocationFilterChips({ value, onChange, counts }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
      {CHIPS.map((chip) => {
        const isActive = value === chip.key;
        const count = counts?.[chip.key];
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onChange(chip.key)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 px-4 rounded-full text-[13px] min-h-[44px] border touch-manipulation select-none transition-all duration-150 active:scale-95",
              isActive
                ? "bg-emerald-500 text-emerald-950 border-emerald-500 font-semibold shadow-sm"
                : "bg-card text-foreground border-border hover:border-amber-500 active:bg-muted",
            )}
          >
            <span>{chip.emoji}</span>
            <span className="italic" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {t(chip.labelKey)}
            </span>
            {count !== undefined && <span className="opacity-70">({count})</span>}
          </button>
        );
      })}
    </div>
  );
}
