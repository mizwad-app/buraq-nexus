import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { LoyaltyRoadmap } from "@/components/LoyaltyRoadmap";
import { MembershipBadge } from "@/components/MembershipBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Gift, 
  Star, 
  Battery, 
  Smartphone, 
  Headphones,
  Watch,
  Briefcase,
  ChevronRight,
  Sparkles,
  Zap,
  TreePine
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

// Demo user constants
const DEMO_PHONE = "+998900006611";
const DEMO_ANNUAL_VOLUME = 750;
const DEMO_TREES_PLANTED = 12;

const giftIcons: Record<string, any> = {
  "Power Bank": Battery,
  "Elektr Choynak": Zap,
  "Smartphone": Smartphone,
  "Bluetooth Quloqchin": Headphones,
  "Smart Soat": Watch,
  "Laptop Sumka": Briefcase,
};

const Rewards = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [annualVolume, setAnnualVolume] = useState(0);
  const [treesPlanted, setTreesPlanted] = useState(0);

  // Check if demo user
  const isDemoUser = user?.phone === DEMO_PHONE;

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchGifts();
    if (user) {
      fetchUserData();
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

  const fetchUserData = async () => {
    try {
      // Demo user gets hardcoded values
      if (isDemoUser) {
        setUserPoints({ total_points: 7500, lifetime_points: 7500 });
        setAnnualVolume(DEMO_ANNUAL_VOLUME);
        setTreesPlanted(DEMO_TREES_PLANTED);
        return;
      }

      // Fetch user points
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

      // Calculate annual volume from cargo trackings
      const { data: cargoData } = await supabase
        .from("cargo_trackings")
        .select("volume_m3")
        .eq("user_id", user?.id);

      if (cargoData) {
        const totalVolume = cargoData.reduce((sum, cargo) => sum + (cargo.volume_m3 || 0), 0);
        setAnnualVolume(Math.round(totalVolume));
        setTreesPlanted(Math.floor(totalVolume * 2));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleRedeem = async (gift: GiftItem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!userPoints || userPoints.total_points < gift.points_required) {
      toast.error(t("rewards.notEnoughPoints"));
      return;
    }

    setRedeeming(gift.id);

    try {
      // Use atomic RPC function to redeem gift
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        "redeem_gift",
        { p_gift_id: gift.id }
      );

      if (rpcError) throw rpcError;
      
      const result = rpcResult as { success?: boolean; error?: string; gift_name?: string } | null;
      if (!result?.success) {
        toast.error(result?.error || t("rewards.error"));
        return;
      }

      // Update local state with new points
      const newPoints = userPoints.total_points - gift.points_required;
      setUserPoints({ ...userPoints, total_points: newPoints });
      toast.success(t("rewards.redeemSuccess", { name: result.gift_name }));
    } catch (error) {
      console.error("Error redeeming gift:", error);
      toast.error(t("rewards.error"));
    } finally {
      setRedeeming(null);
    }
  };

  const points = userPoints?.total_points || 0;

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
          <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            {t("rewards.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("rewards.viewPrompt")}
          </p>
        </div>
        
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8 py-6"
        >
          {t("rewards.signInUp")}
        </Button>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          triggerReason={t("rewards.viewPrompt")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("rewards.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("rewards.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">{points.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Membership Badge */}
      <section className="px-5 mb-5">
        <MembershipBadge annualVolume={annualVolume} variant="large" />
      </section>

      {/* Eco Impact Widget */}
      {treesPlanted > 0 && (
        <section className="px-5 mb-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-primary/20">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-primary">{t("home.ecoImpact")}</p>
              <p className="text-sm font-bold text-foreground">{treesPlanted} {t("eco.treesCount")}</p>
            </div>
          </div>
        </section>
      )}

      {/* Loyalty Roadmap */}
      <section className="px-5 mb-6">
        <LoyaltyRoadmap currentVolume={annualVolume} />
      </section>

      {/* Redeemable Gifts */}
      <section className="px-5 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-foreground">
            {t("rewards.gifts")}
          </h2>
          <button className="text-sm text-primary flex items-center gap-1">
            {t("rewards.viewAll")} <ChevronRight className="w-4 h-4" />
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
                    <Star className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">
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
                        {t("rewards.redeem")}
                      </>
                    ) : (
                      t("rewards.notEnough")
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
        triggerReason={t("rewards.viewPrompt")}
      />
    </div>
  );
};

export default Rewards;
