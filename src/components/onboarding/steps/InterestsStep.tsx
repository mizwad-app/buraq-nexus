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

interface InterestRow {
  code: string;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  name_ar: string | null;
  name_zh: string | null;
  icon_emoji: string | null;
}

export const InterestsStep = ({ state, setState }: Props) => {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<InterestRow[]>([]);

  useEffect(() => {
    supabase
      .from("tourism_interests_ref")
      .select("code,name_uz,name_ru,name_en,name_ar,name_zh,icon_emoji,display_order")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setItems((data as InterestRow[]) || []));
  }, []);

  const getName = (it: InterestRow) =>
    (it as any)[`name_${i18n.language}`] || it.name_en || it.name_uz;

  const toggle = (code: string) => {
    setState((s) => ({
      ...s,
      tourismInterests: s.tourismInterests.includes(code)
        ? s.tourismInterests.filter((c) => c !== code)
        : [...s.tourismInterests, code],
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">
          {t("onboarding.interests.question")}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t("onboarding.interests.subtitle")}
        </p>
      </div>
      <WhyHint>{t("onboarding.why.interests")}</WhyHint>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => {
          const isSelected = state.tourismInterests.includes(it.code);
          return (
            <button
              key={it.code}
              onClick={() => toggle(it.code)}
              className={cn(
                "p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 min-h-[80px] text-center",
                isSelected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-border/80"
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
