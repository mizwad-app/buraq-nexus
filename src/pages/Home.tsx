import {
  Leaf,
  MapPin,
  Utensils,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  Bell,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";
import { QuickAction } from "@/components/QuickAction";
import { StatCard } from "@/components/StatCard";

const Home = () => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Xayrli tong"
      : currentHour < 18
      ? "Xayrli kun"
      : "Xayrli kech";

  return (
    <div className="min-h-screen eco-gradient-soft safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              {greeting} 👋
            </p>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">
              Xush kelibsiz, Komiljon!
            </h1>
          </div>
          <button className="relative p-3 bg-card rounded-xl shadow-card transition-all hover:shadow-lg active:scale-95">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
          </button>
        </div>
      </header>

      {/* Eco Banner */}
      <section className="px-5 mb-6">
        <div
          className="eco-gradient rounded-3xl p-5 shadow-eco animate-scale-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary-foreground/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-primary-foreground/90">
              Ekotizim yangiliklari
            </span>
          </div>
          <h2 className="text-lg font-display font-bold text-primary-foreground mb-1">
            Yashil kelajak uchun birga!
          </h2>
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            Barqaror rivojlanish va halol hayot tarzi uchun birlashgan platforma
          </p>
          <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary-foreground/20 px-4 py-2 rounded-xl transition-all hover:bg-primary-foreground/30">
            Batafsil
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Tezkor harakatlar
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={MapPin} label="Joylashuv" delay={0} />
          <QuickAction icon={Calendar} label="Taqvim" delay={50} />
          <QuickAction icon={Users} label="Jamoa" delay={100} />
          <QuickAction icon={TrendingUp} label="Statistika" variant="primary" delay={150} />
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Leaf}
            value="12,450"
            label="Eko ball"
            trend="up"
            trendValue="+8%"
            delay={0}
          />
          <StatCard
            icon={Users}
            value="1,234"
            label="Foydalanuvchilar"
            trend="up"
            trendValue="+12%"
            delay={100}
          />
        </div>
      </section>

      {/* Main Modules */}
      <section className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Asosiy modullar
        </h2>
        <div className="space-y-3">
          <ModuleCard
            icon={MapPin}
            title="Sayohat va dam olish"
            description="Eko-turlar, sayohat rejalari va foydali maslahatlar"
            iconBgClass="bg-eco-mint"
            delay={0}
          />
          <ModuleCard
            icon={Utensils}
            title="Halol ovqatlanish"
            description="Sertifikatlangan halol mahsulotlar va restoranlar"
            iconBgClass="bg-eco-sage"
            delay={100}
          />
          <ModuleCard
            icon={Building2}
            title="Biznes va bozor"
            description="Biznes analytics va savdo maydoni"
            iconBgClass="bg-secondary"
            delay={200}
          />
          <ModuleCard
            icon={Leaf}
            title="Ekologiya"
            description="Atrof-muhit muhofazasi va barqaror rivojlanish"
            iconBgClass="bg-eco-emerald-light"
            delay={300}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
