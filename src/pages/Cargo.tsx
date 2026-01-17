import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Package, 
  Search, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Plus,
  ChevronRight,
  Factory,
  Warehouse,
  Ship,
  Shield,
  Star,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CargoTracking {
  id: string;
  tracking_number: string;
  status: string;
  volume_m3: number | null;
  points_earned: number;
  origin: string;
  destination: string;
  created_at: string;
}

type TrackingStepId = "factory_departed" | "china_warehouse" | "in_transit" | "customs" | "tashkent_warehouse" | "delivered";

const trackingStepIds: TrackingStepId[] = [
  "factory_departed",
  "china_warehouse", 
  "in_transit",
  "customs",
  "tashkent_warehouse",
  "delivered"
];

const stepIcons: Record<TrackingStepId, any> = {
  factory_departed: Factory,
  china_warehouse: Warehouse,
  in_transit: Ship,
  customs: Shield,
  tashkent_warehouse: Warehouse,
  delivered: CheckCircle2,
};

const getStepIndex = (status: string) => {
  const index = trackingStepIds.findIndex(s => s === status);
  return index === -1 ? 0 : index;
};

const Cargo = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { requireAuth, showAuthModal, setShowAuthModal, authTriggerReason } = useRequireAuth();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackings, setTrackings] = useState<CargoTracking[]>([]);
  const [selectedTracking, setSelectedTracking] = useState<CargoTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrackings();
    }
  }, [user]);

  const fetchTrackings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cargo_trackings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrackings(data || []);
    } catch (error) {
      console.error("Error fetching trackings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      toast.error(t("cargo.enterTrackingError"));
      return;
    }

    // Simulate tracking lookup - show demo data
    const mockTracking: CargoTracking = {
      id: "demo",
      tracking_number: trackingNumber,
      status: "in_transit",
      volume_m3: Math.random() * 5 + 0.5,
      points_earned: 0,
      origin: "Guangzhou, China",
      destination: "Tashkent, Uzbekistan",
      created_at: new Date().toISOString(),
    };
    
    setSelectedTracking(mockTracking);
  };

  const handleSaveTracking = () => {
    if (!trackingNumber.trim()) {
      toast.error(t("cargo.enterTrackingError"));
      return;
    }

    requireAuth(
      async () => {
        setSaving(true);
        try {
          // Generate random volume and calculate points
          const volume = Math.random() * 5 + 0.5; // 0.5 to 5.5 m³
          const pointsEarned = Math.floor(volume * 100); // $1/m³ = 100 points

          // Create cargo tracking
          const { data: cargoData, error: cargoError } = await supabase
            .from("cargo_trackings")
            .insert({
              user_id: user!.id,
              tracking_number: trackingNumber.trim(),
              status: "factory_departed",
              volume_m3: parseFloat(volume.toFixed(2)),
              points_earned: pointsEarned,
            })
            .select()
            .single();

          if (cargoError) throw cargoError;

          // Add points transaction
          await supabase.from("points_transactions").insert({
            user_id: user!.id,
            amount: pointsEarned,
            transaction_type: "earned",
            description: t("cargo.trackingDesc", { number: trackingNumber }),
            reference_id: cargoData.id,
          });

          // Update user points
          const { data: currentPoints } = await supabase
            .from("user_points")
            .select("total_points, lifetime_points")
            .eq("user_id", user!.id)
            .single();

          if (currentPoints) {
            await supabase
              .from("user_points")
              .update({
                total_points: currentPoints.total_points + pointsEarned,
                lifetime_points: currentPoints.lifetime_points + pointsEarned,
              })
              .eq("user_id", user!.id);
          }

          toast.success(t("cargo.savedSuccess", { points: pointsEarned }));
          setTrackingNumber("");
          setSelectedTracking(cargoData);
          fetchTrackings();
        } catch (error) {
          console.error("Error saving tracking:", error);
          toast.error(t("cargo.error"));
        } finally {
          setSaving(false);
        }
      },
      t("cargo.savePrompt")
    );
  };

  const currentStepIndex = selectedTracking ? getStepIndex(selectedTracking.status) : -1;

  const getStatusLabel = (stepId: TrackingStepId) => {
    return t(`cargo.status.${stepId}`);
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("cargo.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("cargo.subtitle")}
            </p>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="px-5 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder={t("cargo.enterTracking")}
            className="pl-12 pr-4 h-14 bg-card border-border/50 text-base rounded-xl"
          />
        </div>
        
        <div className="flex gap-3 mt-3">
          <Button
            onClick={handleTrack}
            className="flex-1 h-12 bg-secondary hover:bg-secondary/80 text-foreground"
          >
            <Search className="w-4 h-4 mr-2" />
            {t("cargo.track")}
          </Button>
          <Button
            onClick={handleSaveTracking}
            disabled={saving}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t("cargo.save")}
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Tracking Timeline */}
      {selectedTracking && (
        <section className="px-5 mb-6">
          <div className="rounded-2xl bg-card border border-border/50 p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="font-mono font-bold text-lg text-foreground">
                  {selectedTracking.tracking_number}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedTracking.origin} → {selectedTracking.destination}
                  </span>
                </div>
              </div>
              {selectedTracking.points_earned > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">
                    +{selectedTracking.points_earned}
                  </span>
                </div>
              )}
            </div>

            {/* Volume */}
            {selectedTracking.volume_m3 && (
              <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-secondary/30">
                <Box className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">
                  {t("cargo.volume")}: <span className="font-bold">{selectedTracking.volume_m3.toFixed(2)} m³</span>
                </span>
              </div>
            )}

            {/* Timeline */}
            <div className="relative">
              {trackingStepIds.map((stepId, index) => {
                const StepIcon = stepIcons[stepId];
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === trackingStepIds.length - 1;

                return (
                  <div key={stepId} className="flex gap-4">
                    {/* Line and Dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isCompleted
                            ? "bg-gradient-to-br from-primary to-accent shadow-glow"
                            : "bg-secondary/50 border border-border/50"
                        )}
                      >
                        <StepIcon
                          className={cn(
                            "w-5 h-5",
                            isCompleted ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        />
                      </div>
                      {!isLast && (
                        <div
                          className={cn(
                            "w-0.5 h-12 my-1 rounded-full transition-all",
                            isCompleted ? "bg-primary" : "bg-border"
                          )}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn("flex-1 pb-4", !isLast && "pb-8")}>
                      <p
                        className={cn(
                          "font-medium",
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {getStatusLabel(stepId)}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t("cargo.currentlyHere")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Saved Trackings */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            {t("cargo.savedTrackings")}
          </h2>
          {!user && (
            <span className="text-xs text-muted-foreground">
              {t("cargo.loginRequired")}
            </span>
          )}
        </div>

        {user ? (
          loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trackings.length > 0 ? (
            <div className="space-y-3 pb-4">
              {trackings.map((tracking) => {
                const stepIndex = getStepIndex(tracking.status);
                const stepId = trackingStepIds[stepIndex] || "factory_departed";
                const StepIcon = stepIcons[stepId] || Package;

                return (
                  <button
                    key={tracking.id}
                    onClick={() => setSelectedTracking(tracking)}
                    className={cn(
                      "w-full p-4 rounded-2xl bg-card border transition-all text-left",
                      selectedTracking?.id === tracking.id
                        ? "border-primary/50"
                        : "border-border/50 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono font-semibold text-foreground">
                          {tracking.tracking_number}
                        </p>
                        {tracking.volume_m3 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {tracking.volume_m3.toFixed(2)} m³
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {tracking.points_earned > 0 && (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">+{tracking.points_earned}</span>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 w-fit">
                      <StepIcon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {getStatusLabel(stepId)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("cargo.noSavedTrackings")}
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary/50 mx-auto flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("cargo.viewSavedPrompt")}
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              {t("cargo.login")}
            </Button>
          </div>
        )}
      </section>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        triggerReason={authTriggerReason}
      />
    </div>
  );
};

export default Cargo;