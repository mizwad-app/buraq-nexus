import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Crown, Award, User } from "lucide-react";

interface MembershipBadgeProps {
  annualVolume: number;
  variant?: "small" | "large";
  className?: string;
}

type MembershipTier = "gold" | "silver" | "standard";

const getTier = (volume: number): MembershipTier => {
  if (volume >= 1500) return "gold";
  if (volume >= 1000) return "silver";
  return "standard";
};

const tierConfig = {
  gold: {
    icon: Crown,
    titleKey: "loyalty.goldStatus",
    gradient: "from-amber-400 via-yellow-300 to-amber-500",
    textColor: "text-amber-400",
    bgColor: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/40",
    iconColor: "text-amber-400",
  },
  silver: {
    icon: Award,
    titleKey: "loyalty.silverStatus",
    gradient: "from-slate-300 via-gray-200 to-slate-400",
    textColor: "text-slate-300",
    bgColor: "bg-gradient-to-r from-slate-400/20 to-gray-300/20",
    borderColor: "border-slate-400/40",
    iconColor: "text-slate-300",
  },
  standard: {
    icon: User,
    titleKey: "loyalty.standardStatus",
    gradient: "from-primary/80 to-accent/80",
    textColor: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    iconColor: "text-primary",
  },
};

export const MembershipBadge = ({ annualVolume, variant = "small", className }: MembershipBadgeProps) => {
  const { t } = useTranslation();
  const tier = getTier(annualVolume);
  const config = tierConfig[tier];
  const Icon = config.icon;

  // Calculate next tier info
  const nextTierInfo = (() => {
    if (tier === "gold") return null;
    if (tier === "silver") {
      return { needed: 1500 - annualVolume, tierKey: "loyalty.goldStatus" };
    }
    return { needed: 1000 - annualVolume, tierKey: "loyalty.silverStatus" };
  })();

  if (variant === "small") {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
        config.bgColor,
        config.borderColor,
        className
      )}>
        <Icon className={cn("w-4 h-4", config.iconColor)} />
        <span className={cn("text-sm font-semibold", config.textColor)}>
          {t(config.titleKey)}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative p-4 rounded-2xl border overflow-hidden",
      config.bgColor,
      config.borderColor,
      className
    )}>
      {/* Shimmer effect for gold */}
      {tier === "gold" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-pulse" />
      )}

      <div className="relative flex items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center",
          `bg-gradient-to-br ${config.gradient}`,
          tier === "gold" && "shadow-lg shadow-amber-500/30"
        )}>
          <Icon className={cn(
            "w-7 h-7",
            tier === "gold" || tier === "silver" ? "text-black" : "text-primary-foreground"
          )} />
        </div>

        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
            {t("loyalty.membershipStatus")}
          </p>
          <h3 className={cn("text-lg font-display font-bold", config.textColor)}>
            {t(config.titleKey)}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("loyalty.annualVolume")}: <span className="font-semibold text-foreground">{annualVolume} kub</span>
          </p>
        </div>
      </div>

      {/* Next tier progress */}
      {nextTierInfo && (
        <div className="relative mt-4 pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            {t("loyalty.nextTierMessage", { 
              volume: nextTierInfo.needed, 
              tier: t(nextTierInfo.tierKey) 
            })}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
            <div 
              className={cn("h-full rounded-full", `bg-gradient-to-r ${config.gradient}`)}
              style={{ 
                width: tier === "silver" 
                  ? `${((annualVolume - 1000) / 500) * 100}%`
                  : `${(annualVolume / 1000) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
