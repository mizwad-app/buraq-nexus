import { useTranslation } from "react-i18next";
import { Sparkles, Lock } from "lucide-react";

export const WelcomeStep = ({ onPrivacyOpen }: { onPrivacyOpen: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {t("onboarding.welcome.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("onboarding.welcome.subtitle")}
        </p>
        <p className="text-xs text-muted-foreground">
          ⏱️ {t("onboarding.welcome.estimated_time")}
        </p>
      </div>

      <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-2.5">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          {t("onboarding.welcome.benefits_title")}
        </h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>✨ {t("onboarding.welcome.benefits.tailored_content")}</li>
          <li>🏛️ {t("onboarding.welcome.benefits.consulate_info")}</li>
          <li>💡 {t("onboarding.welcome.benefits.personalized_recommendations")}</li>
        </ul>
      </div>

      <div className="rounded-2xl bg-secondary/40 border border-border/50 p-4 space-y-2.5">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
          <Lock className="w-4 h-4 text-primary" />
          {t("onboarding.welcome.privacy_title")}
        </h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• {t("onboarding.welcome.privacy_points.no_sale")}</li>
          <li>• {t("onboarding.welcome.privacy_points.no_share")}</li>
          <li>• {t("onboarding.welcome.privacy_points.editable")}</li>
          <li>• {t("onboarding.welcome.privacy_points.deletable")}</li>
        </ul>
        <button
          onClick={onPrivacyOpen}
          className="text-xs text-primary hover:underline font-medium"
        >
          {t("onboarding.privacy_link")} →
        </button>
      </div>
    </div>
  );
};
