import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent?: "emerald" | "amber";
  onClick: () => void;
}

export const QuestionCard = ({ icon: Icon, title, subtitle, accent = "emerald", onClick }: QuestionCardProps) => {
  const isAmber = accent === "amber";
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-xl p-3.5 border text-left transition-all active:scale-[0.99]",
        "bg-emerald-500/[0.06] border-emerald-500/30 hover:border-emerald-500/50",
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
          isAmber ? "bg-amber-500/[0.12]" : "bg-emerald-500/[0.12]",
        )}
      >
        <Icon className={cn("w-[18px] h-[18px]", isAmber ? "text-amber-400" : "text-emerald-400")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </button>
  );
};
