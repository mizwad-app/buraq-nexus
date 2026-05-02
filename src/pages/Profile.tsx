import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { BusinessSurveyModal } from "@/components/BusinessSurveyModal";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  User, 
  Settings, 
  MapPin, 
  LogOut, 
  ChevronRight,
  Bell,
  CalendarCheck,
  Languages,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslatorBooking {
  id: string;
  booking_date: string;
  status: string;
  total_amount: number;
  translator_amount: number | null;
  service_fee: number | null;
  translator: {
    name: string;
    city: string;
  } | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [bookings, setBookings] = useState<TranslatorBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [hasInterests, setHasInterests] = useState<boolean | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);

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
    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user?.id)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!roleData);

    // Check if user completed business survey
    const { data: interestsData } = await supabase
      .from("user_interests")
      .select("id")
      .eq("user_id", user?.id)
      .maybeSingle();
    setHasInterests(!!interestsData);

    // Fetch translator bookings
    setBookingsLoading(true);
    const { data: bookingsData } = await supabase
      .from("translator_bookings")
      .select(`
        id,
        booking_date,
        status,
        total_amount,
        translator_amount,
        service_fee,
        translator:translator_id (
          name,
          city
        )
      `)
      .eq("client_id", user?.id)
      .order("booking_date", { ascending: false })
      .limit(10);

    if (bookingsData) {
      setBookings(bookingsData as unknown as TranslatorBooking[]);
    }
    setBookingsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = [
    { icon: CalendarCheck, label: t("profile.myBookings"), action: () => {} },
    { icon: MapPin, label: t("profile.savedPlaces") },
    { icon: Bell, label: t("profile.notifications") },
    { icon: Settings, label: t("profile.settings") },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-primary bg-primary/10';
      case 'pending': return 'text-gold bg-gold/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      case 'cancelled': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return t("booking.confirmed");
      case 'pending': return t("booking.pending");
      case 'completed': return t("booking.completed");
      case 'cancelled': return t("booking.cancelled");
      default: return status;
    }
  };

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
            {t("profile.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("profile.loginPrompt")}
          </p>
        </div>
        
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8 py-6 shadow-glow"
        >
          {t("profile.login")}
        </Button>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          triggerReason={t("profile.loginPrompt")}
        />
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || t("profile.user");
  const userPhone = user.user_metadata?.phone || user.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {t("profile.title")}
        </h1>
      </header>

      {/* User Card */}
      <section className="px-5 mb-4">
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
            </div>
          </div>
        </div>
      </section>

      {/* Admin Access */}
      {isAdmin && (
        <section className="px-5 mb-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-gold/30 hover:border-amber-500/50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">
              {t("profile.adminPanel")}
            </span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </section>
      )}

      {/* Complete Profile (Business Survey opt-in) */}
      {hasInterests === false && (
        <section className="px-5 mb-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  {t("profile.completeProfile.title")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("profile.completeProfile.subtitle")}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowSurvey(true)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              {t("profile.completeProfile.start")}
            </Button>
          </div>
        </section>
      )}

      {/* Translator Bookings */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t("profile.translatorBookings")}
          </h3>
          <button 
            onClick={() => navigate("/translators")}
            className="text-xs text-primary hover:underline"
          >
            {t("profile.viewAll")}
          </button>
        </div>

        {bookingsLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-6 bg-card rounded-xl border border-border/50">
            <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("profile.noBookings")}</p>
            <Button
              variant="link"
              onClick={() => navigate("/translators")}
              className="mt-2 text-primary"
            >
              {t("profile.findTranslator")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {booking.translator?.name || t("profile.unknownTranslator")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.translator?.city}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getStatusColor(booking.status)
                  )}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(booking.booking_date), "dd.MM.yyyy")}
                  </span>
                  <span className="font-semibold text-primary">
                    ¥{booking.total_amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Menu Items */}
      <section className="px-5 mb-6">
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          {/* Language Selector */}
          <LanguageSelector variant="menu-item" />
          
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
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Sign Out */}
      <section className="px-5 pb-8">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t("profile.signOut")}
        </Button>
      </section>

      <BusinessSurveyModal
        open={showSurvey}
        onOpenChange={(open) => {
          setShowSurvey(open);
          if (!open) {
            // Re-check after closing in case user submitted
            supabase
              .from("user_interests")
              .select("id")
              .eq("user_id", user?.id)
              .maybeSingle()
              .then(({ data }) => setHasInterests(!!data));
          }
        }}
      />
    </div>
  );
};

export default Profile;
