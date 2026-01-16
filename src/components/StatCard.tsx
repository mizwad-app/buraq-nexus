import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}

export const StatCard = ({
  icon: Icon,
  value,
  label,
  trend = "neutral",
  trendValue,
  delay = 0,
}: StatCardProps) => {
  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-card animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="icon-container bg-secondary">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trendValue && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              trend === "up" && "bg-eco-emerald-light text-eco-emerald-dark",
              trend === "down" && "bg-destructive/10 text-destructive",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trendValue}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-display font-bold text-foreground">
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
};
