import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { HeaderAvatar } from "@/components/HeaderAvatar";

interface Props {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  children: ReactNode;
}

export const ServicePageShell = ({ title, icon, subtitle, children }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => navigate("/xizmatlar")}
            className="flex items-center gap-1 -ml-2 px-2 py-2 rounded-xl hover:bg-muted transition-all active:scale-95"
            aria-label={t("nav.services")}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium text-foreground">{t("nav.services")}</span>
          </button>
          <HeaderAvatar />
        </div>
        <div className="mt-2 flex items-center gap-2">
          {icon}
          {subtitle && <span className="text-sm font-medium text-muted-foreground">{subtitle}</span>}
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mt-1">{title}</h1>
      </header>
      <section className="px-5 space-y-4">{children}</section>
    </div>
  );
};
