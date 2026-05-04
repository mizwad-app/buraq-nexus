import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingState } from "../OnboardingFlow";
import { WhyHint } from "../WhyHint";
import { cn } from "@/lib/utils";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

interface IndustryRow {
  code: string;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  name_ar: string | null;
  name_zh: string | null;
  icon_emoji: string | null;
}

const MAX_SELECT = 5;

export const IndustriesStep = ({ state, setState }: Props) => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<IndustryRow[]>([]);

  useEffect(() => {
    supabase
      .from("business_industries_ref")
      .select("code,name_uz,name_ru,name_en,name_ar,name_zh,icon_emoji,display_order")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setItems((data as IndustryRow[]) || []));
  }, []);

  const lang = i18n.language;
  const getName = (it: IndustryRow) =>
    (it as any)[`name_${lang}`] || it.name_en || it.name_uz;

  const toggle = (code: string) => {
    setState((s) => {
      const exists = s.businessIndustries.includes(code);
      if (exists) return { ...s, businessIndustries: s.businessIndustries.filter((c) => c !== code) };
      if (s.businessIndustries.length >= MAX_SELECT) return s;
      return { ...s, businessIndustries: [...s.businessIndustries, code] };
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">
          {t("onboarding.industries.question")}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t("onboarding.industries.subtitle")} •{" "}
          {t("onboarding.industries.selected", { count: state.businessIndustries.length, max: MAX_SELECT })}
        </p>
      </div>
      <WhyHint example={t("onboarding.why.industries_example")}>
        {t("onboarding.why.industries")}
      </WhyHint>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => {
          const isSelected = state.businessIndustries.includes(it.code);
          const disabled = !isSelected && state.businessIndustries.length >= MAX_SELECT;
          return (
            <button
              key={it.code}
              onClick={() => toggle(it.code)}
              disabled={disabled}
              className={cn(
                "p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 min-h-[80px] text-center",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-border/80",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <span className="text-2xl">{it.icon_emoji}</span>
              <span className="text-xs font-medium text-foreground leading-tight">
                {getName(it)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
