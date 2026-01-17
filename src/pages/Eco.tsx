import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  TreePine, 
  Leaf, 
  Globe2, 
  ChevronRight,
  Package,
  Sprout,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EcoStats {
  totalVolume: number;
  treesPlanted: number;
}

type ProjectId = "fergana" | "karakalpakstan" | "tashkent" | "samarkand";

interface EcoProject {
  id: number;
  projectKey: ProjectId;
  trees: number;
  target: number;
  image: string;
  status: "active" | "upcoming";
}

const ecoProjects: EcoProject[] = [
  {
    id: 1,
    projectKey: "fergana",
    trees: 5420,
    target: 10000,
    image: "🌳",
    status: "active"
  },
  {
    id: 2,
    projectKey: "karakalpakstan",
    trees: 12300,
    target: 25000,
    image: "🌲",
    status: "active"
  },
  {
    id: 3,
    projectKey: "tashkent",
    trees: 8900,
    target: 15000,
    image: "🌴",
    status: "active"
  },
  {
    id: 4,
    projectKey: "samarkand",
    trees: 3200,
    target: 8000,
    image: "🌿",
    status: "upcoming"
  },
];

const TREES_PER_M3 = 2; // 2 trees planted per cubic meter of cargo

const Eco = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [ecoStats, setEcoStats] = useState<EcoStats>({ totalVolume: 0, treesPlanted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEcoStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEcoStats = async () => {
    try {
      const { data: cargoData } = await supabase
        .from("cargo_trackings")
        .select("volume_m3")
        .eq("user_id", user?.id);

      if (cargoData) {
        const totalVolume = cargoData.reduce((sum, cargo) => sum + (cargo.volume_m3 || 0), 0);
        const treesPlanted = Math.floor(totalVolume * TREES_PER_M3);
        setEcoStats({ totalVolume, treesPlanted });
      }
    } catch (error) {
      console.error("Error fetching eco stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {t("eco.subtitle")}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("eco.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("eco.desc")}
          </p>
        </div>
      </header>

      {/* Eco Contribution Card */}
      <section className="px-5 mb-6">
        <div className="relative rounded-2xl overflow-hidden animate-scale-in">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 via-green-600/20 to-teal-600/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/10 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <TreePine className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("eco.treesPlanted")}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-emerald-400">
                      {loading ? "..." : ecoStats.treesPlanted}
                    </span>
                    <span className="text-lg text-emerald-400/70">{t("eco.treesCount")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">{t("eco.totalVolume")}</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {loading ? "..." : `${ecoStats.totalVolume.toFixed(1)} m³`}
                </p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Globe2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">{t("eco.co2Reduction")}</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {loading ? "..." : `${(ecoStats.treesPlanted * 21).toLocaleString()} kg`}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
        </div>
      </section>

      {/* Formula Explanation */}
      <section className="px-5 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/50 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Sprout className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t("eco.howItWorks")}</p>
              <p className="text-xs text-muted-foreground">
                {t("eco.formula")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="px-5 pb-32">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            {t("eco.currentProjects")}
          </h2>
          <span className="text-xs text-muted-foreground">
            {t("eco.projectsCount", { count: ecoProjects.length })}
          </span>
        </div>

        <div className="space-y-3">
          {ecoProjects.map((project, index) => {
            const progress = (project.trees / project.target) * 100;
            
            return (
              <div 
                key={project.id}
                className={cn(
                  "bg-card rounded-2xl p-4 border border-border/50 animate-fade-in",
                  project.status === "upcoming" && "opacity-70"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center text-2xl">
                    {project.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {t(`eco.projects.${project.projectKey}`)}
                      </h3>
                      {project.status === "upcoming" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-medium">
                          {t("eco.comingSoon")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(`eco.projects.${project.projectKey}Desc`)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-emerald-500">
                      <TreePine className="w-3 h-3" />
                      <span>{project.trees.toLocaleString()} {t("eco.planted")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-3 h-3" />
                      <span>{t("eco.target")}: {project.target.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Eco;