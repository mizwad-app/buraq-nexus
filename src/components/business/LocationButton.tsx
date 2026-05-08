import { useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { useBusinessLocation } from "@/hooks/useBusinessLocation";
import { cn } from "@/lib/utils";

export const LocationButton = () => {
  const { state, detect, reset } = useBusinessLocation();
  const [showModal, setShowModal] = useState(false);

  let label = "Joylashuv";
  let tone: "idle" | "active" | "muted" = "idle";

  if (state.status === "requesting") {
    label = "Aniqlanmoqda...";
  } else if (state.status === "in_china") {
    label = state.city.name_uz;
    tone = "active";
  } else if (state.status === "outside_china") {
    label = "Xitoy emas";
    tone = "muted";
  } else if (state.status === "denied") {
    label = "Ruxsat yo'q";
    tone = "muted";
  } else if (state.status === "unavailable") {
    label = "GPS yo'q";
    tone = "muted";
  }

  const handleClick = () => {
    if (state.status === "idle" || state.status === "denied" || state.status === "unavailable") {
      detect();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors active:scale-95",
          tone === "active" && "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
          tone === "muted" && "bg-muted/30 border-border/40 text-muted-foreground",
          tone === "idle" && "bg-card border-border/40 text-muted-foreground hover:border-emerald-500/40",
        )}
      >
        {state.status === "requesting" ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <MapPin className="w-3 h-3" />
        )}
        <span>{label}</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm bg-card border border-border rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-foreground">📍 Joylashuv</h3>
              <button onClick={() => setShowModal(false)} className="p-1 -mr-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {state.status === "in_china" && (
              <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3">
                <p className="text-[11px] uppercase tracking-wide text-emerald-400/80 mb-1">Joriy joy</p>
                <p className="text-[15px] font-semibold text-foreground">📍 {state.city.name_uz}</p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Sizdan ~{Math.round(state.distanceKm)} km uzoqlikda
                </p>
              </div>
            )}

            {state.status === "outside_china" && (
              <div className="mb-4 rounded-xl bg-muted/20 border border-border/40 p-3">
                <p className="text-[13px] font-semibold text-foreground mb-1">Siz Xitoyda emassiz</p>
                <p className="text-[12px] text-muted-foreground">
                  Mizwad Xitoyga sayohat va biznes uchun. GPS Xitoyda bo'lganingizda ishlaydi.
                </p>
              </div>
            )}

            {state.status === "denied" && (
              <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
                <p className="text-[12px] text-amber-400">
                  Joylashuv ruxsati berilmadi. Brauzer sozlamalaridan ruxsat bering.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                reset();
                detect();
                setShowModal(false);
              }}
              className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl py-3 text-[13px] font-medium transition-colors mb-2"
            >
              🔄 Joylashuvni qaytadan aniqlash
            </button>

            <p className="text-[10px] text-muted-foreground/70 text-center mt-2">
              Joylashuv 24 soat saqlanadi.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
