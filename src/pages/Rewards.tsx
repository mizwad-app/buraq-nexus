import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Gift, 
  Star, 
  Plane, 
  Battery, 
  Smartphone, 
  Headphones,
  Watch,
  Briefcase,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserPoints {
  total_points: number;
  lifetime_points: number;
}

interface GiftItem {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: string;
}

const UMRA_TARGET = 10000;

const giftIcons: Record<string, any> = {
  "Power Bank": Battery,
  "Elektr Choynak": Zap,
  "Smartphone": Smartphone,
  "Bluetooth Quloqchin": Headphones,
  "Smart Soat": Watch,
  "Laptop Sumka": Briefcase,
};

const Rewards = () => {
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchGifts();
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchGifts = async () => {
    try {
      const { data, error } = await supabase
        .from("gifts")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (error) throw error;
      setGifts(data || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from("user_points")
        .select("total_points, lifetime_points")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUserPoints(data);
      } else {
        // Create points record if doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from("user_points")
          .insert({ user_id: user?.id, total_points: 0, lifetime_points: 0 })
          .select("total_points, lifetime_points")
          .single();
        
        if (!insertError && newData) {
          setUserPoints(newData);
        }
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };

  const handleRedeem = async (gift: GiftItem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!userPoints || userPoints.total_points < gift.points_required) {
      toast.error("Ballaringiz yetarli emas");
      return;
    }

    setRedeeming(gift.id);

    try {
      // Create redemption record
      const { error: redemptionError } = await supabase
        .from("gift_redemptions")
        .insert({
          user_id: user.id,
          gift_id: gift.id,
          points_spent: gift.points_required,
        });

      if (redemptionError) throw redemptionError;

      // Create points transaction
      await supabase.from("points_transactions").insert({
        user_id: user.id,
        amount: -gift.points_required,
        transaction_type: "redeemed",
        description: `${gift.name} uchun almashtirildi`,
      });

      // Update user points
      const newPoints = userPoints.total_points - gift.points_required;
      await supabase
        .from("user_points")
        .update({ total_points: newPoints })
        .eq("user_id", user.id);

      setUserPoints({ ...userPoints, total_points: newPoints });
      toast.success(`${gift.name} muvaffaqiyatli almashtirildi!`);
    } catch (error) {
      console.error("Error redeeming gift:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setRedeeming(null);
    }
  };

  const points = userPoints?.total_points || 0;
  const umraProgress = Math.min((points / UMRA_TARGET) * 100, 100);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background safe-bottom flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-600/20 mx-auto flex items-center justify-center mb-4">
            <Gift className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            Mukofotlar
          </h1>
          <p className="text-sm text-muted-foreground">
            Mukofotlarni ko'rish uchun tizimga kiring
          </p>
        </div>
        
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold px-8 py-6"
        >
          Kirish / Ro'yxatdan o'tish
        </Button>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          triggerReason="Mukofotlarni ko'rish uchun tizimga kiring"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Mukofotlar
            </h1>
            <p className="text-sm text-muted-foreground">
              Ballaringizni sovg'alarga almashtiring
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-amber-400">{points.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Umra Trip Card */}
      <section className="px-5 mb-6">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-yellow-600/20 to-emerald-600/30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                    Asosiy Mukofot
                  </span>
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  Umra Sayohati
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Muqaddas ziyoratga bepul sayohat
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-black" />
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Jarayonda</span>
                <span className="font-semibold text-foreground">
                  {points.toLocaleString()} / {UMRA_TARGET.toLocaleString()} ball
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-secondary/50 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                  style={{ width: `${umraProgress}%` }}
                />
                <div 
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400/50 to-yellow-300/50 blur-sm transition-all duration-500"
                  style={{ width: `${umraProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Yana {(UMRA_TARGET - points).toLocaleString()} ball kerak
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl" />
        </div>
      </section>

      {/* Redeemable Gifts */}
      <section className="px-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            Sovg'alar
          </h2>
          <button className="text-sm text-primary flex items-center gap-1">
            Barchasi <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {gifts.map((gift) => {
            const GiftIcon = giftIcons[gift.name] || Gift;
            const canRedeem = points >= gift.points_required;
            const isRedeeming = redeeming === gift.id;

            return (
              <div
                key={gift.id}
                className={cn(
                  "relative p-4 rounded-2xl border transition-all",
                  canRedeem 
                    ? "bg-card border-primary/30 hover:border-primary/50" 
                    : "bg-card/50 border-border/50 opacity-60"
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                    canRedeem ? "bg-primary/10" : "bg-secondary/50"
                  )}>
                    <GiftIcon className={cn(
                      "w-6 h-6",
                      canRedeem ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    {gift.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                    {gift.description}
                  </p>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-amber-400">
                      {gift.points_required.toLocaleString()}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    disabled={!canRedeem || isRedeeming}
                    onClick={() => handleRedeem(gift)}
                    className={cn(
                      "w-full h-9 text-xs font-semibold",
                      canRedeem 
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" 
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {isRedeeming ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : canRedeem ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        Olish
                      </>
                    ) : (
                      "Yetarli emas"
                    )}
                  </Button>
                </div>

                {canRedeem && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        triggerReason="Mukofotlarni ko'rish uchun tizimga kiring"
      />
    </div>
  );
};

export default Rewards;
