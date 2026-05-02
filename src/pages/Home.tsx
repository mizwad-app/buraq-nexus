import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { ImageCard } from "@/components/ImageCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SupportChat } from "@/components/SupportChat";
import { BusinessSurveyModal } from "@/components/BusinessSurveyModal";
import { supabase } from "@/integrations/supabase/client";
import { 
  Star, 
  ChevronRight,
  ClipboardCheck,
  Lock,
} from "lucide-react";

// Images
import halalFood from "@/assets/halol-food.jpg";
import travelNature from "@/assets/travel-nature.jpg";
import business from "@/assets/business.jpg";
import mosque from "@/assets/mosque.jpg";
import travelGuide from "@/assets/travel-guide.jpg";
import translatorsImg from "@/assets/translators.jpg";
import b2bHub from "@/assets/b2b-hub.jpg";
import wallet from "@/assets/wallet.jpg";
import attractions from "@/assets/attractions.jpg";
import exhibitions from "@/assets/exhibitions.jpg";
import legalHelp from "@/assets/legal-help.jpg";
import cargo from "@/assets/cargo.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showSurvey, setShowSurvey] = useState(false);

  // Check if user has completed the business survey
  useEffect(() => {
    const checkUserInterests = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("user_interests")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // Show survey if user hasn't completed it yet
      if (!data) {
        // Small delay for better UX
        setTimeout(() => setShowSurvey(true), 1000);
      }
    };

    checkUserInterests();
  }, [user]);

  // Unified modules grid (6 cards)
  const activeModules = [
    { id: "b2bHub", title: t("modules.b2bHub"), image: b2bHub, route: "/business" },
    { id: "deepCheck", title: t("modules.deepCheck"), image: travelGuide, route: "/deep-check" },
    { id: "exhibitions", title: t("modules.exhibitions"), image: exhibitions, route: "/business" },
    { id: "translators", title: t("modules.translators"), image: translatorsImg, route: "/translators" },
    { id: "wallet", title: t("modules.wallet"), image: wallet, route: "/profile" },
    { id: "transportVpn", title: t("modules.transportVpn"), image: cargo, route: "/transport" },
  ];

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("app.name")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user ? `${t("app.welcome")}, ${user.user_metadata?.full_name || t("home.user")}!` : t("home.tagline")}
            </p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Guest Prompt */}
      {!user && (
        <section className="px-5 mb-5">
          <button 
            onClick={() => navigate("/profile")}
            className="w-full"
          >
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

      {/* Quick Access Section */}
      <section className="px-5 mb-4">
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">
          {t("home.quickAccess")}
        </h2>
        <button
          onClick={() => navigate("/checklist")}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">{t("home.travelChecklist")}</span>
        </button>
      </section>

      {/* Section Title */}
      <section className="px-5 mb-3">
        <h2 className="text-lg font-display font-semibold text-foreground">
          {t("app.services")}
        </h2>
      </section>

      {/* Module Grid - 2 columns x 3 rows */}
      <section className="px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {activeModules.map((module, index) => (
            <ImageCard
              key={module.id}
              image={module.image}
              title={module.title}
              onClick={() => navigate(module.route)}
              delay={index * 60}
              isPremium={module.id === "wallet"}
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

      {/* Business Survey Modal */}
      <BusinessSurveyModal open={showSurvey} onOpenChange={setShowSurvey} />
    </div>
  );
};

export default Home;
