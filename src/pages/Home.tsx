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
  MapPin,
  ClipboardCheck,
  Briefcase,
  Lock,
  Ticket,
  Utensils,
  Map,
  Users
} from "lucide-react";

import halalFood from "@/assets/halol-food.jpg";
import travelNature from "@/assets/travel-nature.jpg";
import business from "@/assets/business.jpg";
import mosque from "@/assets/mosque.jpg";
import travelGuide from "@/assets/travel-guide.jpg";
import translatorsImg from "@/assets/translators.jpg";

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

  const modules = [
    { id: "halol", title: t("modules.halalGuide"), image: halalFood, route: "/ibadah", icon: Utensils },
    { id: "travel", title: t("modules.travel"), image: travelNature, route: "/travel", icon: Map },
    { id: "mosques", title: t("modules.mosques"), image: mosque, route: "/mosques", icon: MapPin },
    { id: "business", title: t("modules.business"), image: business, route: "/business", icon: Briefcase },
    { id: "translators", title: "Tarjimonlar", image: translatorsImg, route: "/translators", icon: Users },
    { id: "guide", title: t("modules.guide"), image: travelGuide, route: "/guide", icon: ClipboardCheck },
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
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate("/checklist")}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">{t("home.travelChecklist")}</span>
          </button>
          <button
            onClick={() => navigate("/transport")}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">{t("home.transport")}</span>
          </button>
          <button
            onClick={() => navigate("/services")}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground text-center">{t("home.services")}</span>
          </button>
        </div>
      </section>

      {/* Section Title */}
      <section className="px-5 mb-3">
        <h2 className="text-lg font-display font-semibold text-foreground">
          {t("app.services")}
        </h2>
      </section>

      {/* Module Grid */}
      <section className="px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {modules.map((module, index) => (
            <ImageCard
              key={module.id}
              image={module.image}
              title={module.title}
              onClick={() => navigate(module.route)}
              delay={index * 60}
              isPremium={module.id === "business"}
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
