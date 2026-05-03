import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { ImageCard } from "@/components/ImageCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SupportChat } from "@/components/SupportChat";
import { PrayerTimeCard } from "@/components/home/PrayerTimeCard";
import { ExchangeRateCard } from "@/components/home/ExchangeRateCard";
import { cn } from "@/lib/utils";
import {
  Star,
  ChevronRight,
  ClipboardCheck,
  Lock,
  Moon,
  Wallet as WalletIcon,
  type LucideIcon,
} from "lucide-react";

// Images
import mosque from "@/assets/mosque.jpg";
import tijoratImg from "@/assets/module-tijorat.jpg";
import tarjimonlarImg from "@/assets/module-tarjimonlar.jpg";
import sayohatImg from "@/assets/module-sayohat.jpg";
import hamyonImg from "@/assets/module-hamyon.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const modules = [
    { id: "b2bHub", title: t("modules.b2bHub"), image: tijoratImg, route: "/business" },
    { id: "translators", title: t("modules.translators"), image: tarjimonlarImg, route: "/translators" },
    { id: "halal", title: t("modules.halal"), image: mosque, route: "/ibadah" },
    { id: "travel", title: t("modules.travel"), image: sayohatImg, route: "/travel" },
    { id: "wallet", title: t("modules.wallet"), image: hamyonImg, route: "/profile" },
  ];

  const quickPills: { icon: LucideIcon; label: string; route: string }[] = [
    { icon: ClipboardCheck, label: t("home.checklistShort"), route: "/checklist" },
    { icon: Moon, label: t("home.mosquesShort"), route: "/ibadah?tab=mosques" },
    { icon: WalletIcon, label: t("home.walletShort"), route: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between animate-fade-in">
          <h1 className="text-xl font-display font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("app.name")}
          </h1>
          <LanguageSelector />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-5 py-10 text-center overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"
        />
        <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("app.name")}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-sm mx-auto">
          {t("brand.tagline")}
        </p>
        {user && (
          <p className="mt-6 text-sm text-muted-foreground">
            {`${t("app.welcome")}, ${user.user_metadata?.full_name || t("home.user")}!`}
          </p>
        )}
      </section>

      {/* Smart Info Cards */}
      <section className="px-5 mb-5">
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">
          {t("home.todayInfo")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <PrayerTimeCard />
          <ExchangeRateCard />
        </div>
      </section>

      {/* Guest Prompt */}
      {!user && (
        <section className="px-5 mb-5">
          <button onClick={() => navigate("/profile")} className="w-full">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{t("home.guestPrompt")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.guestPromptDesc")}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </button>
        </section>
      )}

      {/* Quick Access Pill Strip */}
      <section className="px-5 mb-5">
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">
          {t("home.quickAccess")}
        </h2>
        <div className="flex gap-2">
          {quickPills.map(({ icon: Icon, label, route }) => (
            <button
              key={label}
              onClick={() => navigate(route)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-secondary/60 hover:bg-secondary transition-all active:scale-95"
            >
              <Icon className="w-4 h-4 text-foreground" />
              <span className="text-[13px] font-medium text-foreground truncate">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Section Title */}
      <section className="px-5 mb-3">
        <h2 className="text-lg font-display font-semibold text-foreground">
          {t("app.services")}
        </h2>
      </section>

      {/* Module Grid - 2 columns x 3 rows (compact) */}
      <section className="px-5 pb-6">
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {modules.map((module, index) => (
            <ImageCard
              key={module.id}
              image={module.image}
              title={module.title}
              onClick={() => navigate(module.route)}
              delay={index * 60}
              isPremium={module.id === "wallet"}
              isCompact
              className={cn(
                "aspect-[4/3]",
                index === modules.length - 1 && modules.length % 2 === 1 && "col-span-2 aspect-[16/7]"
              )}
            />
          ))}
        </div>
      </section>

      {/* Admin Entry - Footer */}
      <footer className="px-5 pb-24 flex justify-center">
        <button
          onClick={() => navigate("/admin/login")}
          className="flex items-center gap-2 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <Lock className="w-3 h-3" />
          <span>Admin</span>
        </button>
      </footer>

      {/* Support Chat FAB */}
      <SupportChat />
    </div>
  );
};

export default Home;
