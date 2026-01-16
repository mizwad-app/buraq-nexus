import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgClass?: string;
  onClick?: () => void;
  delay?: number;
}

export const ModuleCard = ({
  icon: Icon,
  title,
  description,
  iconBgClass = "bg-secondary",
  onClick,
  delay = 0,
}: ModuleCardProps) => {
  return (
    <button
      onClick={onClick}
      className="module-card w-full text-left animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className={cn("icon-container shrink-0", iconBgClass)}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-base">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};
