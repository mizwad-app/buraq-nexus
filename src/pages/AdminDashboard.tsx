import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  FileSearch, 
  Users, 
  Briefcase, 
  Store, 
  Utensils,
  Clock,
  CheckCircle2,
  TrendingUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaceCount {
  active: number;
  total: number;
}

interface InactiveCityRow {
  table: string;
  city: string;
  count: number;
}

interface Stats {
  markets: PlaceCount;
  restaurants: PlaceCount;
  translators: number;
  deepChecksPending: number;
  deepChecksCompleted: number;
  serviceRequests: number;
  totalActive: number;
  totalInactive: number;
  inactiveByCity: InactiveCityRow[];
}

const PLACE_TABLES = [
  "mosques",
  "wholesale_markets",
  "shopping_malls",
  "restaurants",
  "halal_shops",
  "historical_sites",
  "parks",
  "production_hubs",
  "exhibitions",
  "companies",
] as const;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: marketsTotal },
        { count: marketsActive },
        { count: restaurantsTotal },
        { count: restaurantsActive },
        { count: translatorsCount },
        { count: deepChecksPending },
        { count: deepChecksCompleted },
        { count: serviceRequestsCount },
      ] = await Promise.all([
        supabase.from("wholesale_markets").select("*", { count: "exact", head: true }),
        supabase.from("wholesale_markets").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("restaurants").select("*", { count: "exact", head: true }),
        supabase.from("restaurants").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("translators").select("*", { count: "exact", head: true }),
        supabase.from("deep_checks").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("deep_checks").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("service_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      // Aggregate active/inactive across all place tables + inactive-by-city breakdown
      let totalActive = 0;
      let totalInactive = 0;
      const inactiveByCity: InactiveCityRow[] = [];

      await Promise.all(
        PLACE_TABLES.map(async (tbl) => {
          const [{ count: activeC }, { data: inactiveRows }] = await Promise.all([
            supabase.from(tbl as never).select("*", { count: "exact", head: true }).eq("is_active", true),
            supabase.from(tbl as never).select("city").eq("is_active", false),
          ]);
          totalActive += activeC || 0;
          const rows = (inactiveRows as Array<{ city: string }> | null) || [];
          totalInactive += rows.length;
          const grouped = new Map<string, number>();
          rows.forEach((r) => grouped.set(r.city, (grouped.get(r.city) || 0) + 1));
          grouped.forEach((count, city) => inactiveByCity.push({ table: tbl, city, count }));
        })
      );

      inactiveByCity.sort((a, b) => b.count - a.count);

      setStats({
        markets: { active: marketsActive || 0, total: marketsTotal || 0 },
        restaurants: { active: restaurantsActive || 0, total: restaurantsTotal || 0 },
        translators: translatorsCount || 0,
        deepChecksPending: deepChecksPending || 0,
        deepChecksCompleted: deepChecksCompleted || 0,
        serviceRequests: serviceRequestsCount || 0,
        totalActive,
        totalInactive,
        inactiveByCity,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fmtPlace = (p?: PlaceCount) =>
    p ? `${p.active} / ${p.total}` : "0 / 0";

  const statCards = [
    {
      title: "Bozorlar (faol / jami)",
      value: fmtPlace(stats?.markets),
      icon: Store,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      route: "/admin/locations",
    },
    {
      title: "Restoranlar (faol / jami)",
      value: fmtPlace(stats?.restaurants),
      icon: Utensils,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/admin/locations",
    },
    {
      title: "Tarjimonlar",
      value: stats?.translators ?? 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      route: "/admin/locations",
    },
    {
      title: "Kutilayotgan tekshiruvlar",
      value: stats?.deepChecksPending || 0,
      icon: Clock,
      color: "text-gold",
      bgColor: "bg-gold/10",
      route: "/admin/deep-checks",
    },
    {
      title: "Bajarilgan tekshiruvlar",
      value: stats?.deepChecksCompleted || 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      route: "/admin/deep-checks",
    },
    {
      title: "Xizmat so'rovlari",
      value: stats?.serviceRequests || 0,
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10",
      route: "/admin/service-requests",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Umumiy statistika va tezkor havolalar
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => navigate(card.route)}
              className="bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", card.bgColor)}>
                  <Icon className={cn("w-6 h-6", card.color)} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-display font-semibold text-foreground mb-4">
          Tezkor amallar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/admin/locations")}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all"
          >
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Joylashuvlarni boshqarish</span>
          </button>
          <button
            onClick={() => navigate("/admin/deep-checks")}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-gold/20 hover:border-gold/40 transition-all"
          >
            <FileSearch className="w-5 h-5 text-gold" />
            <span className="font-medium text-foreground">Tekshiruvlarni ko'rish</span>
          </button>
          <button
            onClick={() => navigate("/admin/service-requests")}
            className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all"
          >
            <Briefcase className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-foreground">Xizmat so'rovlari</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border hover:border-primary/20 transition-all"
          >
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Ilovaga qaytish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
