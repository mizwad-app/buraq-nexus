import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { LegalAdvisorsList } from "@/components/business/LegalAdvisorsList";
import { useSwipeBack } from "@/hooks/useSwipeBack";

const LawyersPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useSwipeBack();
  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95" aria-label={t("business.home.back")}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] text-muted-foreground">{t("business.title")}</span>
            <h1 className="text-base italic font-medium text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {t("business.lawyers.verifiedLawyers")}
            </h1>
          </div>
        </div>
      </header>
      <LegalAdvisorsList />
    </div>
  );
};

export default LawyersPage;
