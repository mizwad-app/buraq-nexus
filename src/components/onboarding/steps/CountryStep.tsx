import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingState } from "../OnboardingFlow";
import { WhyHint } from "../WhyHint";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

interface CountryRow {
  code: string;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  name_ar: string | null;
  name_zh: string | null;
  flag_emoji: string | null;
  phone_code: string | null;
  is_priority: boolean | null;
  display_order: number | null;
}

export const CountryStep = ({ state, setState }: Props) => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<CountryRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("countries_ref")
      .select("*")
      .order("is_priority", { ascending: false })
      .order("display_order")
      .then(({ data }) => setItems((data as CountryRow[]) || []));
  }, []);

  const getName = (c: CountryRow) =>
    (c as any)[`name_${i18n.language}`] || c.name_en || c.name_uz;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => getName(c).toLowerCase().includes(q));
  }, [items, query, i18n.language]);

  const priority = filtered.filter((c) => c.is_priority);
  const other = filtered.filter((c) => !c.is_priority);

  const select = (c: CountryRow) =>
    setState((s) => ({
      ...s,
      countryCode: c.code,
      countryName: getName(c),
      phoneCountryCode: c.phone_code,
    }));

  const renderItem = (c: CountryRow) => {
    const isSelected = state.countryCode === c.code;
    return (
      <button
        key={c.code}
        onClick={() => select(c)}
        className={cn(
          "w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center gap-3 min-h-[48px]",
          isSelected ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-secondary/40"
        )}
      >
        <span className="text-xl">{c.flag_emoji}</span>
        <span className="flex-1 text-sm font-medium text-foreground">{getName(c)}</span>
        {c.phone_code && <span className="text-xs text-muted-foreground">{c.phone_code}</span>}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground">
        {t("onboarding.country.question")}
      </h2>
      <WhyHint>{t("onboarding.why.country")}</WhyHint>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("onboarding.country.search_placeholder")}
          className="pl-9"
        />
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {priority.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
              {t("onboarding.country.priority_countries")}
            </p>
            <div className="space-y-1.5">{priority.map(renderItem)}</div>
          </div>
        )}
        {other.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
              {t("onboarding.country.all_countries")}
            </p>
            <div className="space-y-1.5">{other.map(renderItem)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
