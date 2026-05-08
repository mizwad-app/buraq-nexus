import { MapPin, Loader2, Check, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { cn } from "@/lib/utils";

interface Props {
  onCityDetected: (cityKey: string, cityNameUz: string) => void;
  className?: string;
}

export const LocationDetectButton = ({ onCityDetected, className }: Props) => {
  const { state, detect } = useLocationDetection();

  useEffect(() => {
    if (state.status === "success") {
      const key = state.city.name_en || state.city.name_uz;
      onCityDetected(key, state.city.name_uz);
    }
  }, [state, onCityDetected]);

  const isLoading = state.status === "requesting";
  const isSuccess = state.status === "success";

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={detect}
        disabled={isLoading}
        className={cn(
          "w-full flex items-center justify-center gap-2",
          "rounded-xl px-4 py-3 text-[14px] font-medium",
          "border transition-colors min-h-[48px]",
          isSuccess
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
            : "bg-card border-border/40 hover:border-emerald-500/40 text-foreground",
          isLoading && "opacity-70 cursor-wait"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Joylashuv aniqlanmoqda...
          </>
        ) : isSuccess ? (
          <>
            <Check className="w-4 h-4" />
            {state.city.name_uz} aniqlandi ({Math.round(state.distanceKm)} km)
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            📍 Joriy joylashuvim
          </>
        )}
      </button>

      {state.status === "denied" && (
        <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Joylashuv ruxsati berilmadi. Brauzer sozlamalarida ruxsat bering yoki shaharni qo'lda tanlang.
          </span>
        </div>
      )}

      {state.status === "unavailable" && (
        <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg px-3 py-2">
          Brauzer joylashuvni qo'llab-quvvatlamaydi. Shaharni qo'lda tanlang.
        </div>
      )}

      {state.status === "outside_china" && (
        <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Siz Xitoyda emassiz yoki yaqin atrofda Mizwad qo'llab-quvvatlaydigan shahar yo'q. Shaharni qo'lda tanlang.
          </span>
        </div>
      )}

      {state.status === "error" && (
        <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          Xatolik: {state.message}
        </div>
      )}
    </div>
  );
};
