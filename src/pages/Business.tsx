import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  TrendingUp,
  Store,
  BarChart3,
  Users,
  ShoppingBag,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  FileSearch,
} from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";

const stats = [
  { label: "Daromad", value: "45.2M", change: "+12.5%", up: true },
  { label: "Buyurtmalar", value: "1,234", change: "+8.2%", up: true },
  { label: "Mijozlar", value: "856", change: "-2.1%", up: false },
];

const Business = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-glow">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Biznes
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Biznes analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Savdo va bozor ma'lumotlari
          </p>
        </div>
      </header>

      {/* Deep Check Banner */}
      <section className="px-5 mb-6">
        <button
          onClick={() => navigate("/deep-check")}
          className="w-full text-left"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-amber-500/10 p-4 border border-primary/20">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                <FileSearch className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground">
                  Chuqur Tekshiruv
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mahsulot yoki kompaniyani to'liq tahlil qiling
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </button>
      </section>

      {/* Stats Overview */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-4 border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </p>
              <p className="text-lg font-display font-bold text-foreground mt-1">
                {stat.value}
              </p>
              <div
                className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  stat.up ? "text-primary" : "text-destructive"
                }`}
              >
                {stat.up ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chart Placeholder */}
      <section className="px-5 mb-6">
        <div
          className="bg-card rounded-3xl p-5 border border-border/50 animate-scale-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">
                  Haftalik sotuvlar
                </h2>
                <p className="text-xs text-muted-foreground">
                  So'nggi 7 kun
                </p>
              </div>
            </div>
            <button className="text-primary text-sm font-medium flex items-center gap-1">
              Batafsil
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Simple chart visualization */}
          <div className="flex items-end justify-between h-32 gap-2 mt-4">
            {[65, 45, 80, 55, 90, 75, 85].map((height, index) => (
              <div
                key={index}
                className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500 animate-slide-up"
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Du</span>
            <span>Se</span>
            <span>Ch</span>
            <span>Pa</span>
            <span>Ju</span>
            <span>Sh</span>
            <span>Ya</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Xizmatlar
        </h2>
        <div className="space-y-3">
          <ModuleCard
            icon={Store}
            title="Bozor maydoni"
            description="Mahsulotlarni sotish va xarid qilish"
            iconBgClass="bg-primary/10"
            delay={0}
          />
          <ModuleCard
            icon={TrendingUp}
            title="Bozor tahlili"
            description="Narxlar va trendlar"
            iconBgClass="bg-accent/10"
            delay={100}
          />
          <ModuleCard
            icon={Users}
            title="Hamkorlar"
            description="Biznes aloqalar tarmog'i"
            iconBgClass="bg-secondary"
            delay={200}
          />
          <ModuleCard
            icon={ShoppingBag}
            title="Buyurtmalar"
            description="Faol buyurtmalarni boshqarish"
            iconBgClass="bg-primary/10"
            delay={300}
          />
        </div>
      </section>
    </div>
  );
};

export default Business;
