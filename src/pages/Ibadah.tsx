import {
  Moon,
  Utensils,
  Clock,
  MapPin,
  BookOpen,
  Heart,
  ChevronRight,
} from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";

const prayerTimes = [
  { name: "Bomdod", time: "05:42", active: false },
  { name: "Peshin", time: "12:15", active: true },
  { name: "Asr", time: "15:48", active: false },
  { name: "Shom", time: "18:23", active: false },
  { name: "Xufton", time: "19:45", active: false },
];

const Ibadah = () => {
  return (
    <div className="min-h-screen eco-gradient-soft safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 eco-gradient rounded-xl shadow-eco">
              <Moon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Ibodat
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Halol hayot tarzi
          </h1>
          <p className="text-muted-foreground mt-1">
            Namoz vaqtlari va halol ovqat
          </p>
        </div>
      </header>

      {/* Prayer Times Card */}
      <section className="px-5 mb-6">
        <div className="bg-card rounded-3xl p-5 shadow-card animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-eco-emerald-light rounded-xl">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-foreground">
                  Namoz vaqtlari
                </h2>
                <p className="text-xs text-muted-foreground">
                  Toshkent, O'zbekiston
                </p>
              </div>
            </div>
            <button className="text-primary text-sm font-medium">
              Joylashuvni o'zgartirish
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {prayerTimes.map((prayer, index) => (
              <div
                key={prayer.name}
                className={`text-center p-3 rounded-xl transition-all animate-fade-in ${
                  prayer.active
                    ? "eco-gradient shadow-eco"
                    : "bg-muted"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p
                  className={`text-[10px] font-medium ${
                    prayer.active
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {prayer.name}
                </p>
                <p
                  className={`text-sm font-bold mt-1 ${
                    prayer.active ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {prayer.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Halal Food Section */}
      <section className="px-5 mb-6">
        <div
          className="bg-gradient-to-br from-eco-mint to-eco-sage rounded-3xl p-5 animate-scale-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Utensils className="w-5 h-5 text-eco-forest" />
            </div>
            <span className="text-sm font-medium text-eco-forest">
              Halol ovqat
            </span>
          </div>
          <h2 className="text-lg font-display font-bold text-eco-forest mb-2">
            Yaqin atrofdagi halol restoranlar
          </h2>
          <p className="text-sm text-eco-forest/80 mb-4">
            Sertifikatlangan halol mahsulotlar va xizmatlar
          </p>
          <button className="flex items-center gap-2 text-sm font-semibold text-eco-forest bg-primary/10 px-4 py-2 rounded-xl">
            Xaritada ko'rish
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Xizmatlar
        </h2>
        <div className="space-y-3">
          <ModuleCard
            icon={MapPin}
            title="Masjidlar xaritasi"
            description="Eng yaqin masjidlarni toping"
            iconBgClass="bg-eco-mint"
            delay={0}
          />
          <ModuleCard
            icon={Utensils}
            title="Halol restoranlar"
            description="Sertifikatlangan joylar ro'yxati"
            iconBgClass="bg-eco-sage"
            delay={100}
          />
          <ModuleCard
            icon={BookOpen}
            title="Islomiy bilim"
            description="Qur'on, hadis va maqolalar"
            iconBgClass="bg-secondary"
            delay={200}
          />
          <ModuleCard
            icon={Heart}
            title="Sadaqa va xayriya"
            description="Yaxshilik qilish oson"
            iconBgClass="bg-eco-emerald-light"
            delay={300}
          />
        </div>
      </section>
    </div>
  );
};

export default Ibadah;
