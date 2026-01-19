import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ImageCard } from "@/components/ImageCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SupportChat } from "@/components/SupportChat";
import { 
  Plane, 
  Trophy, 
  Star, 
  Package, 
  ChevronRight, 
  Factory,
  Warehouse,
  Ship,
  Shield,
  CheckCircle2,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

import halalFood from "@/assets/halol-food.jpg";
import travelNature from "@/assets/travel-nature.jpg";
import business from "@/assets/business.jpg";
import cargoImg from "@/assets/cargo.jpg";
import mosque from "@/assets/mosque.jpg";
import ecoProjects from "@/assets/eco-projects.jpg";
import travelGuide from "@/assets/travel-guide.jpg";

interface UserPoints {
  total_points: number;
  lifetime_points: number;
}

interface CargoTracking {
  id: string;
  tracking_number: string;
  status: string;
  volume_m3: number | null;
  points_earned: number;
  origin: string;
  destination: string;
  created_at: string;
}

const UMRA_TARGET = 10000;

const trackingSteps = [
  { id: "factory_departed", label: "Zavoddan jo'natildi", icon: Factory },
  { id: "china_warehouse", label: "Xitoy ombori", icon: Warehouse },
  { id: "in_transit", label: "Yo'lda", icon: Ship },
  { id: "customs", label: "Bojxona", icon: Shield },
  { id: "tashkent_warehouse", label: "Toshkent ombori", icon: Warehouse },
  { id: "delivered", label: "Yetkazildi", icon: CheckCircle2 },
];

const getStepInfo = (status: string) => {
  const index = trackingSteps.findIndex(s => s.id === status);
  return { step: trackingSteps[index] || trackingSteps[0], index: index === -1 ? 0 : index };
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [latestCargo, setLatestCargo] = useState<CargoTracking | null>(null);
  const [loading, setLoading] = useState(true);

  const modules = [
    { id: "halol", title: t("modules.halal"), image: halalFood, route: "/ibadah" },
    { id: "travel", title: t("modules.travel"), image: travelNature, route: "/travel" },
    { id: "business", title: t("modules.business"), image: business, route: "/business" },
    { id: "cargo", title: t("modules.cargo"), image: cargoImg, route: "/cargo" },
    { id: "mosque", title: t("modules.mosques"), image: mosque, route: "/mosques" },
    { id: "eco", title: t("modules.eco"), image: ecoProjects, route: "/eco" },
    { id: "guide", title: t("modules.guide"), image: travelGuide, route: "/guide" },
  ];

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user points
      const { data: pointsData } = await supabase
        .from("user_points")
        .select("total_points, lifetime_points")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (pointsData) {
        setUserPoints(pointsData);
      }

      // Fetch latest cargo tracking
      const { data: cargoData } = await supabase
        .from("cargo_trackings")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cargoData) {
        setLatestCargo(cargoData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const points = userPoints?.total_points || 0;
  const umraProgress = Math.min((points / UMRA_TARGET) * 100, 100);
  const cargoStepInfo = latestCargo ? getStepInfo(latestCargo.status) : null;

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
              {user ? `${t("app.welcome")}, ${user.user_metadata?.full_name || "Foydalanuvchi"}!` : "Premium xizmatlar platformasi"}
            </p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Umra Progress Card */}
      {user && (
        <section className="px-5 mb-4">
          <button 
            onClick={() => navigate("/rewards")}
            className="w-full text-left"
          >
            <div className="relative rounded-2xl overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-yellow-600/20 to-emerald-600/30" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent" />
              
              {/* Content */}
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                      <Trophy className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                          {t("home.umraProgress")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("home.sacredPilgrimage")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-400">{points.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("home.progress")}</span>
                    <span className="text-foreground">
                      {points.toLocaleString()} / {UMRA_TARGET.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-black/30 overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{ width: `${umraProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </section>
      )}

      {/* Active Cargo Widget */}
      {user && latestCargo && cargoStepInfo && (
        <section className="px-5 mb-5">
          <button 
            onClick={() => navigate("/cargo")}
            className="w-full text-left"
          >
            <div className="relative rounded-2xl bg-card border border-border/50 p-4 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("home.latestCargo")}</p>
                    <p className="font-mono font-semibold text-foreground">
                      {latestCargo.tracking_number}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const StepIcon = cargoStepInfo.step.icon;
                    return (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                        <StepIcon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {cargoStepInfo.step.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {trackingSteps.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        idx <= cargoStepInfo.index ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{latestCargo.origin} → {latestCargo.destination}</span>
              </div>
            </div>
          </button>
        </section>
      )}

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

      {/* Support Chat FAB */}
      <SupportChat />
    </div>
  );
};

export default Home;
