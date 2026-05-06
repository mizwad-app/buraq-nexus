import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Construction } from "lucide-react";
import { useSwipeBack } from "@/hooks/useSwipeBack";

interface Props {
  question: "markets" | "exhibitions";
  title: string;
  subtitle: string;
}

const PhaseTwoPlaceholder = ({ question, title, subtitle }: Props) => {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  useSwipeBack();
  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] text-muted-foreground">{subtitle}</span>
            <h1 className="text-base italic font-medium text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {title}
            </h1>
          </div>
        </div>
      </header>
      <div className="px-5 mt-10 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
          <Construction className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Tez orada</p>
        <p className="text-xs text-muted-foreground">
          {question === "markets"
            ? "Optom bozorlar ekrani Phase 2 da yangilanadi."
            : "Ko'rgazmalar ekrani Phase 2 da yangilanadi."}
          {categorySlug && ` (${categorySlug})`}
        </p>
      </div>
    </div>
  );
};

export default PhaseTwoPlaceholder;
