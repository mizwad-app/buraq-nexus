import { useTranslation } from "react-i18next";
import { Briefcase, Plane, Globe } from "lucide-react";
import { OnboardingState } from "../OnboardingFlow";
import { WhyHint } from "../WhyHint";
import { cn } from "@/lib/utils";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
}

export const PurposeStep = ({ state, setState }: Props) => {
  const { t } = useTranslation();
  const options = [
    { id: "business" as const, icon: Briefcase, labelKey: "onboarding.purpose.business", subKey: "onboarding.purpose.business_sub" },
    { id: "tourism" as const, icon: Plane, labelKey: "onboarding.purpose.tourism", subKey: "onboarding.purpose.tourism_sub" },
    { id: "both" as const, icon: Globe, labelKey: "onboarding.purpose.both", subKey: "onboarding.purpose.both_sub" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-foreground">
        {t("onboarding.purpose.question")}
      </h2>
      <WhyHint>{t("onboarding.why.purpose")}</WhyHint>
      <div className="space-y-2.5">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = state.travelPurpose === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setState((s) => ({ ...s, travelPurpose: opt.id }))}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 min-h-[72px]",
                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-border/80 bg-background"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                isSelected ? "bg-primary/15" : "bg-secondary"
              )}>
                <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{t(opt.labelKey)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(opt.subKey)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
