import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyHintProps {
  children: React.ReactNode;
  example?: React.ReactNode;
  variant?: "default" | "highlight";
  className?: string;
}

export const WhyHint = ({ children, example, variant = "default", className }: WhyHintProps) => {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 p-3 rounded-xl border text-sm",
        variant === "highlight"
          ? "bg-primary/5 border-primary/20 text-foreground"
          : "bg-secondary/40 border-border/50 text-muted-foreground",
        className
      )}
    >
      <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
      <div className="flex-1 space-y-1.5">
        <p className="leading-relaxed">{children}</p>
        {example && (
          <p className="text-xs italic text-muted-foreground/90 bg-background/50 rounded-md px-2 py-1">
            📌 {example}
          </p>
        )}
      </div>
    </div>
  );
};
