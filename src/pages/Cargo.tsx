import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Plus,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Mock tracking data
const mockTrackingHistory = [
  { id: "1", number: "UZ123456789", status: "transit", location: "Toshkent, UZ", date: "14 Yan, 10:30" },
  { id: "2", number: "UZ987654321", status: "delivered", location: "Samarqand, UZ", date: "12 Yan, 15:45" },
];

const statusConfig = {
  transit: { label: "Yo'lda", color: "text-amber-400", bgColor: "bg-amber-400/10", icon: Truck },
  delivered: { label: "Yetkazildi", color: "text-emerald-400", bgColor: "bg-emerald-400/10", icon: CheckCircle2 },
  pending: { label: "Kutilmoqda", color: "text-blue-400", bgColor: "bg-blue-400/10", icon: Clock },
};

const Cargo = () => {
  const { user } = useAuth();
  const { requireAuth, showAuthModal, setShowAuthModal, authTriggerReason } = useRequireAuth();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [savedTrackings, setSavedTrackings] = useState(mockTrackingHistory);

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      toast.error("Kuzatuv raqamini kiriting");
      return;
    }

    // Just show tracking info without saving
    toast.success(`"${trackingNumber}" raqami bo'yicha ma'lumot topildi`);
  };

  const handleSaveTracking = () => {
    if (!trackingNumber.trim()) {
      toast.error("Kuzatuv raqamini kiriting");
      return;
    }

    // Require authentication for saving
    requireAuth(
      () => {
        // This would save to database in production
        const newTracking = {
          id: Date.now().toString(),
          number: trackingNumber,
          status: "pending" as const,
          location: "Noma'lum",
          date: new Date().toLocaleDateString("uz-UZ"),
        };
        setSavedTrackings([newTracking, ...savedTrackings]);
        setTrackingNumber("");
        toast.success("Kuzatuv raqami saqlandi!");
      },
      "Kuzatuv raqamini saqlash uchun tizimga kiring"
    );
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
              Yuk Kuzatuvi
            </h1>
            <p className="text-sm text-muted-foreground">
              Buyurtmalaringizni kuzatib boring
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
            placeholder="Kuzatuv raqamini kiriting"
            className="pl-12 pr-4 h-14 bg-card border-border/50 text-base rounded-xl"
          />
        </div>
        
        <div className="flex gap-3 mt-3">
          <Button
            onClick={handleTrack}
            className="flex-1 h-12 bg-secondary hover:bg-secondary/80 text-foreground"
          >
            <Search className="w-4 h-4 mr-2" />
            Kuzatish
          </Button>
          <Button
            onClick={handleSaveTracking}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Saqlash
          </Button>
        </div>
      </section>

      {/* Saved Trackings */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            Saqlangan kuzatuvlar
          </h2>
          {!user && (
            <span className="text-xs text-muted-foreground">
              Kirish talab qilinadi
            </span>
          )}
        </div>

        {user ? (
          <div className="space-y-3">
            {savedTrackings.map((tracking) => {
              const status = statusConfig[tracking.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <button
                  key={tracking.id}
                  className="w-full p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono font-semibold text-foreground">
                        {tracking.number}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {tracking.location}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full", status.bgColor)}>
                      <StatusIcon className={cn("w-4 h-4", status.color)} />
                      <span className={cn("text-xs font-medium", status.color)}>
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {tracking.date}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary/50 mx-auto flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Saqlangan kuzatuvlarni ko'rish uchun tizimga kiring
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Kirish
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
