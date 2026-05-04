import { useTranslation } from "react-i18next";
import { Pencil } from "lucide-react";
import { OnboardingState } from "../OnboardingFlow";
import { WhyHint } from "../WhyHint";

interface Props {
  state: OnboardingState;
  onEdit: (step: "purpose" | "frequency" | "business" | "tourism" | "country") => void;
}

export const ConfirmStep = ({ state, onEdit }: Props) => {
  const { t } = useTranslation();

  const Row = ({
    label,
    value,
    step,
  }: {
    label: string;
    value: React.ReactNode;
    step: Props["onEdit"] extends (s: infer S) => any ? S : never;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/50">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 break-words">
          {value || "—"}
        </p>
      </div>
      <button
        onClick={() => onEdit(step)}
        className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
      >
        <Pencil className="w-3 h-3" />
        {t("onboarding.confirm.edit")}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">
          {t("onboarding.confirm.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("onboarding.confirm.subtitle")}
        </p>
      </div>

      <div className="space-y-2">
        <Row
          label={t("onboarding.purpose.question")}
          value={state.travelPurpose ? t(`onboarding.purpose.${state.travelPurpose}`) : null}
          step="purpose"
        />
        <Row
          label={t("onboarding.frequency.question")}
          value={state.visitFrequency ? t(`onboarding.frequency.${state.visitFrequency}`) : null}
          step="frequency"
        />
        {state.travelPurpose !== "tourism" && (
          <Row
            label={t("onboarding.industries.question")}
            value={state.businessIndustries.length > 0 ? state.businessIndustries.length : null}
            step="business"
          />
        )}
        {state.travelPurpose !== "business" && (
          <Row
            label={t("onboarding.interests.question")}
            value={state.tourismInterests.length > 0 ? state.tourismInterests.length : null}
            step="tourism"
          />
        )}
        <Row
          label={t("onboarding.country.question")}
          value={state.countryName}
          step="country"
        />
      </div>

      <WhyHint variant="highlight">{t("onboarding.why.confirm")}</WhyHint>
    </div>
  );
};
