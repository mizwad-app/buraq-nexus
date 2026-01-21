import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { 
  Backpack, 
  Plane, 
  Star, 
  CheckCircle2,
  Lock,
  Trophy
} from "lucide-react";

interface LoyaltyRoadmapProps {
  currentVolume: number;
  className?: string;
}

interface Milestone {
  id: string;
  volume: number;
  titleKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const milestones: Milestone[] = [
  {
    id: "backpack",
    volume: 100,
    titleKey: "loyalty.backpackTitle",
    descKey: "loyalty.backpackDesc",
    icon: Backpack,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    id: "ticket",
    volume: 800,
    titleKey: "loyalty.ticketTitle",
    descKey: "loyalty.ticketDesc",
    icon: Plane,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
  {
    id: "umra",
    volume: 1200,
    titleKey: "loyalty.umraTitle",
    descKey: "loyalty.umraDesc",
    icon: Trophy,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
  },
];

export const LoyaltyRoadmap = ({ currentVolume, className }: LoyaltyRoadmapProps) => {
  const { t } = useTranslation();

  const overallProgress = Math.min((currentVolume / 1200) * 100, 100);

  // Find next goal
  const nextMilestone = milestones.find(m => currentVolume < m.volume);
  const volumeToNext = nextMilestone ? nextMilestone.volume - currentVolume : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("loyalty.roadmapTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("loyalty.currentVolume")}: <span className="font-bold text-primary">{currentVolume} kub</span>
          </p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">{currentVolume}</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="relative h-3 rounded-full bg-secondary/50 overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500 transition-all duration-700"
          style={{ width: `${overallProgress}%` }}
        />
        {/* Milestone markers */}
        {milestones.map((milestone) => {
          const markerPosition = (milestone.volume / 1200) * 100;
          const isReached = currentVolume >= milestone.volume;
          return (
            <div
              key={milestone.id}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all",
                isReached 
                  ? "bg-white border-white" 
                  : "bg-secondary border-muted-foreground/30"
              )}
              style={{ left: `calc(${markerPosition}% - 6px)` }}
            />
          );
        })}
      </div>

      {/* Next Goal Message */}
      {nextMilestone && volumeToNext > 0 && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <p className="text-sm text-foreground">
            ✨ {t("loyalty.nextGoalMessage", { 
              volume: volumeToNext, 
              reward: t(nextMilestone.titleKey) 
            })}
          </p>
        </div>
      )}

      {/* Milestone Cards */}
      <div className="space-y-3">
        {milestones.map((milestone, index) => {
          const isCompleted = currentVolume >= milestone.volume;
          const isCurrent = !isCompleted && (index === 0 || currentVolume >= milestones[index - 1].volume);
          const Icon = milestone.icon;
          const progress = isCompleted ? 100 : Math.min((currentVolume / milestone.volume) * 100, 100);

          return (
            <div
              key={milestone.id}
              className={cn(
                "relative p-4 rounded-xl border transition-all",
                isCompleted 
                  ? "bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-500/30" 
                  : isCurrent
                  ? "bg-card border-primary/30 ring-1 ring-primary/20"
                  : "bg-card/50 border-border/50 opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  isCompleted ? "bg-emerald-500/20" : milestone.bgColor
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Icon className={cn("w-6 h-6", milestone.color)} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">
                      {t(milestone.titleKey)}
                    </h4>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      isCompleted 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-secondary text-muted-foreground"
                    )}>
                      {milestone.volume} kub
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t(milestone.descKey)}
                  </p>

                  {/* Individual progress */}
                  {!isCompleted && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{t("loyalty.progress")}</span>
                        <span className="text-foreground">{currentVolume}/{milestone.volume}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            milestone.color.replace("text-", "bg-")
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Completed badge */}
                  {isCompleted && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="font-medium">{t("loyalty.claimed")}</span>
                    </div>
                  )}
                </div>

                {/* Lock icon for unreached */}
                {!isCompleted && !isCurrent && (
                  <Lock className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
