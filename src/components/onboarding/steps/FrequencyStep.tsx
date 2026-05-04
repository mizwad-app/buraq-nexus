import { useTranslation } from "react-i18next";
import { OnboardingState } from "../OnboardingFlow";
import { WhyHint } from "../WhyHint";
import { cn } from "@/lib/utils";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

const OPTIONS = ["first_time", "1_per_year", "2_3_per_year", "4_6_per_year", "6_plus_per_year"];

export const FrequencyStep = ({ state, setState }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground">
        {t("onboarding.frequency.question")}
      </h2>
      <WhyHint>{t("onboarding.why.frequency")}</WhyHint>
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const isSelected = state.visitFrequency === opt;
          return (
            <button
              key={opt}
              onClick={() => setState((s) => ({ ...s, visitFrequency: opt }))}
              className={cn(
                "w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all min-h-[52px] font-medium",
                isSelected
                  ? "border-primary bg-primary/5 text-foreground"
                  : "border-border hover:border-border/80 bg-background text-muted-foreground"
              )}
            >
              {t(`onboarding.frequency.${opt}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
