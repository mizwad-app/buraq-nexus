import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "default" | "primary";
  delay?: number;
}

export const QuickAction = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  delay = 0,
}: QuickActionProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 animate-scale-in",
        variant === "primary"
          ? "eco-gradient shadow-eco text-primary-foreground"
          : "bg-card shadow-card hover:shadow-lg active:scale-95"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          variant === "primary" ? "bg-primary-foreground/20" : "bg-secondary"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            variant === "primary" ? "text-primary-foreground" : "text-primary"
          )}
        />
      </div>
      <span
        className={cn(
          "text-xs font-medium text-center leading-tight",
          variant === "primary" ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
};
