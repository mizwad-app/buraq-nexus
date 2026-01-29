import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export const PageHeader = ({ title, subtitle, icon, className, onBack }: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={cn("px-5 pt-12 pb-4", className)}>
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={handleBack} 
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-all duration-200 active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          {(icon || subtitle) && (
            <div className="flex items-center gap-2">
              {icon}
              {subtitle && (
                <span className="text-sm font-medium text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          )}
          <h1 className="text-2xl font-display font-bold text-foreground mt-1">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
};
