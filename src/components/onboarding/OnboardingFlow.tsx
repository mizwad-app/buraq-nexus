import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X, Shield } from "lucide-react";
import { PrivacyModal } from "./PrivacyModal";
import { WelcomeStep } from "./steps/WelcomeStep";
import { PurposeStep } from "./steps/PurposeStep";
import { FrequencyStep } from "./steps/FrequencyStep";
import { IndustriesStep } from "./steps/IndustriesStep";
import { InterestsStep } from "./steps/InterestsStep";
import { CountryStep } from "./steps/CountryStep";
import { ConfirmStep } from "./steps/ConfirmStep";
import { toast } from "sonner";

export interface OnboardingState {
  travelPurpose: "business" | "tourism" | "both" | null;
  visitFrequency: string | null;
  businessIndustries: string[];
  tourismInterests: string[];
  countryCode: string | null;
  countryName: string | null;
  phoneCountryCode: string | null;
}

const ALL_STEPS = ["welcome", "purpose", "frequency", "business", "tourism", "country", "confirm"] as const;
type StepId = typeof ALL_STEPS[number];

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    travelPurpose: null,
    visitFrequency: null,
    businessIndustries: [],
    tourismInterests: [],
    countryCode: null,
    countryName: null,
    phoneCountryCode: null,
  });

  useEffect(() => {
    if (!loading && !user) navigate("/profile");
  }, [user, loading, navigate]);

  const visibleSteps = useMemo<StepId[]>(() => {
    return ALL_STEPS.filter((step) => {
      if (step === "business" && state.travelPurpose === "tourism") return false;
      if (step === "tourism" && state.travelPurpose === "business") return false;
      return true;
    }) as StepId[];
  }, [state.travelPurpose]);

  const safeIndex = Math.min(currentStepIndex, visibleSteps.length - 1);
  const currentStep = visibleSteps[safeIndex];
  const isFirstStep = safeIndex === 0;
  const isLastStep = safeIndex === visibleSteps.length - 1;
  const progress = ((safeIndex + 1) / visibleSteps.length) * 100;

  const isStepValid = (step: StepId): boolean => {
    switch (step) {
      case "welcome": return true;
      case "purpose": return state.travelPurpose !== null;
      case "frequency": return state.visitFrequency !== null;
      case "business": return state.businessIndustries.length >= 1;
      case "tourism": return state.tourismInterests.length >= 1;
      case "country": return state.countryCode !== null;
      case "confirm": return true;
    }
  };

  const handleNext = () => {
    if (isLastStep) handleComplete();
    else if (isStepValid(currentStep)) setCurrentStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (safeIndex > 0) setCurrentStepIndex((i) => i - 1);
  };

  const handleSkip = async () => {
    if (!user) return navigate("/");
    await supabase.from("profiles").update({ onboarding_skipped: true }).eq("user_id", user.id);
    navigate("/");
  };

  const handleComplete = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("profiles").update({
      travel_purpose: state.travelPurpose,
      visit_frequency: state.visitFrequency,
      business_industries: state.businessIndustries,
      tourism_interests: state.tourismInterests,
      country_code: state.countryCode,
      country_name: state.countryName,
      phone_country_code: state.phoneCountryCode,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate("/");
  };

  const jumpToStep = (s: StepId) => {
    const idx = visibleSteps.indexOf(s);
    if (idx >= 0) setCurrentStepIndex(idx);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        {!isFirstStep ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center"
            aria-label={t("onboarding.navigation.back")}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="flex-1">
          <Progress value={progress} className="h-1.5" />
        </div>
        <button
          onClick={handleSkip}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1"
        >
          {t("onboarding.navigation.skip")}
          <X className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Step content */}
      <main className="flex-1 px-5 py-4 overflow-y-auto">
        {currentStep === "welcome" && <WelcomeStep onPrivacyOpen={() => setPrivacyOpen(true)} />}
        {currentStep === "purpose" && <PurposeStep state={state} setState={setState} />}
        {currentStep === "frequency" && <FrequencyStep state={state} setState={setState} />}
        {currentStep === "business" && <IndustriesStep state={state} setState={setState} />}
        {currentStep === "tourism" && <InterestsStep state={state} setState={setState} />}
        {currentStep === "country" && <CountryStep state={state} setState={setState} />}
        {currentStep === "confirm" && <ConfirmStep state={state} onEdit={jumpToStep} />}
      </main>

      {/* Footer */}
      <footer className="px-5 pb-6 pt-3 space-y-3 border-t border-border/30 bg-background">
        <button
          onClick={() => setPrivacyOpen(true)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 mx-auto"
        >
          <Shield className="w-3.5 h-3.5" />
          {t("onboarding.privacy_link")}
        </button>
        <Button
          onClick={handleNext}
          disabled={!isStepValid(currentStep) || submitting}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLastStep ? t("onboarding.confirm.complete") : t("onboarding.navigation.next")}
        </Button>
      </footer>

      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </div>
  );
};

export default OnboardingFlow;
