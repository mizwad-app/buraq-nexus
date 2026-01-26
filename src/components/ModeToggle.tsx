import { cn } from "@/lib/utils";
import { Briefcase, Plane } from "lucide-react";

export type AppMode = "business" | "travel";

interface ModeToggleProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex items-center bg-card rounded-2xl p-1 border border-border/50">
      <button
        onClick={() => onModeChange("business")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
          mode === "business"
            ? "bg-primary text-primary-foreground shadow-lg"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Briefcase className="w-4 h-4" />
        <span>Biznes</span>
      </button>
      <button
        onClick={() => onModeChange("travel")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
          mode === "travel"
            ? "bg-primary text-primary-foreground shadow-lg"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Plane className="w-4 h-4" />
        <span>Sayohat</span>
      </button>
    </div>
  );
};
