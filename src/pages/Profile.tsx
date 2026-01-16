import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { MyReports } from "@/components/MyReports";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Settings, 
  History, 
  MapPin, 
  LogOut, 
  ChevronRight,
  Scan,
  FileText,
  Bell,
  Star,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ scans: 0, places: 0, reports: 0 });

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    // Fetch points
    const { data: pointsData } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", user?.id)
      .maybeSingle();
    
    if (pointsData) {
      setUserPoints(pointsData.total_points);
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!roleData);

    // Fetch stats
    const { count: reportsCount } = await supabase
      .from("deep_checks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id);

    const { count: cargoCount } = await supabase
      .from("cargo_trackings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id);

    const { count: placesCount } = await supabase
      .from("saved_places")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id);

    setStats({
      scans: cargoCount || 0,
      places: placesCount || 0,
      reports: reportsCount || 0,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { icon: FileText, label: "Mening hisobotlarim", count: stats.reports, action: () => setShowReports(!showReports) },
    { icon: History, label: "Skanerlash tarixi", count: stats.scans },
    { icon: MapPin, label: "Saqlangan joylar", count: stats.places },
    { icon: Bell, label: "Bildirishnomalar" },
    { icon: Settings, label: "Sozlamalar" },
  ];

  if (loading) {
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
          <div className="w-20 h-20 rounded-full bg-secondary/50 mx-auto flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            Profilga kirish
          </h1>
          <p className="text-sm text-muted-foreground">
            Profilingizni ko'rish uchun tizimga kiring
          </p>
        </div>
        
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8 py-6 shadow-glow"
        >
          Kirish / Ro'yxatdan o'tish
        </Button>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          triggerReason="Profilingizni ko'rish uchun tizimga kiring"
        />
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || "Foydalanuvchi";
  const userPhone = user.user_metadata?.phone || user.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Profil
        </h1>
      </header>

      {/* User Card */}
      <section className="px-5 mb-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-display font-bold text-foreground">
                {userName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {userPhone}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{userPoints.toLocaleString()} ball</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border/30">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{stats.scans}</p>
              <p className="text-xs text-muted-foreground">Yuklar</p>
            </div>
            <div className="text-center border-x border-border/30">
              <p className="text-xl font-bold text-primary">{stats.places}</p>
              <p className="text-xs text-muted-foreground">Joylar</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{stats.reports}</p>
              <p className="text-xs text-muted-foreground">Hisobotlar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate("/deep-check")}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scan className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Chuqur tekshiruv</span>
          </button>
          <button 
            onClick={() => navigate("/rewards")}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-foreground">Mukofotlar</span>
          </button>
        </div>
      </section>

      {/* Admin Access */}
      {isAdmin && (
        <section className="px-5 mb-4">
          <button
            onClick={() => navigate("/admin/deep-checks")}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">
              Admin Panel
            </span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </section>
      )}

      {/* Menu Items */}
      <section className="px-5 mb-6">
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={cn(
                  "w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors",
                  index !== menuItems.length - 1 && "border-b border-border/30"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left text-sm font-medium text-foreground">
                  {item.label}
                </span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </section>

      {/* My Reports Section */}
      {showReports && (
        <section className="px-5 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Mening hisobotlarim
          </h3>
          <MyReports />
        </section>
      )}

      {/* Sign Out */}
      <section className="px-5 pb-8">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Chiqish
        </Button>
      </section>
    </div>
  );
};

export default Profile;
