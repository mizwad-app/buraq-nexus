import { useNavigate } from "react-router-dom";
import { ChevronLeft, Store } from "lucide-react";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { SupportChat } from "@/components/SupportChat";
import { CategoryGrid } from "@/components/business/CategoryGrid";
import { StatsFooter } from "@/components/business/StatsFooter";

const BusinessHome = () => {
  const navigate = useNavigate();
  useSwipeBack();

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow">
            <Store className="w-[18px] h-[18px] text-amber-950" />
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-[18px] italic font-medium text-foreground leading-tight"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Tijorat Markazi
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Mahsulot turini tanlang
            </p>
          </div>
        </div>
      </header>

      <section className="px-5 mb-6">
        <CategoryGrid />
      </section>

      <section className="px-5">
        <StatsFooter />
      </section>

      <SupportChat />
    </div>
  );
};

export default BusinessHome;
