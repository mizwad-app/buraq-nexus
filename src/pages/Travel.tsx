import {
  Plane,
  MapPin,
  Compass,
  Mountain,
  Palmtree,
  Camera,
  ChevronRight,
} from "lucide-react";
import { ModuleCard } from "@/components/ModuleCard";

const destinations = [
  { name: "Samarqand", type: "Tarixiy shahar", image: "🏛️" },
  { name: "Chimyon", type: "Tog' dam olish", image: "🏔️" },
  { name: "Xiva", type: "Qadimiy qal'a", image: "🏰" },
];

const Travel = () => {
  return (
    <div className="min-h-screen eco-gradient-soft safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 eco-gradient rounded-xl shadow-eco">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Sayohat
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Sayohat va dam olish
          </h1>
          <p className="text-muted-foreground mt-1">
            Yangi joylarni kashf eting
          </p>
        </div>
      </header>

      {/* Featured Destination */}
      <section className="px-5 mb-6">
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-eco-forest to-eco-emerald-dark p-6 min-h-[180px] animate-scale-in"
        >
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-primary-foreground/20 rounded-full text-xs font-medium text-primary-foreground mb-3">
              ✨ Tavsiya etilgan
            </span>
            <h2 className="text-xl font-display font-bold text-primary-foreground mb-1">
              O'zbekiston bo'ylab sayohat
            </h2>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Qadimiy shaharlar va go'zal tabiat
            </p>
            <button className="flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary-foreground/20 px-4 py-2 rounded-xl">
              Ko'rish
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-30">🌍</div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Mashhur joylar
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {destinations.map((dest, index) => (
            <div
              key={dest.name}
              className="flex-shrink-0 w-32 bg-card rounded-2xl p-4 shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-3">{dest.image}</div>
              <h3 className="font-semibold text-foreground text-sm">
                {dest.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dest.type}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Kategoriyalar
        </h2>
        <div className="space-y-3">
          <ModuleCard
            icon={Compass}
            title="Eko-turlar"
            description="Tabiat bilan uyg'un sayohatlar"
            iconBgClass="bg-eco-mint"
            delay={0}
          />
          <ModuleCard
            icon={Mountain}
            title="Tog' turizmi"
            description="Sarguzasht va dam olish"
            iconBgClass="bg-eco-sage"
            delay={100}
          />
          <ModuleCard
            icon={Palmtree}
            title="Oilaviy dam olish"
            description="Butun oila uchun sayohatlar"
            iconBgClass="bg-secondary"
            delay={200}
          />
          <ModuleCard
            icon={Camera}
            title="Foto-turlar"
            description="Eng go'zal manzaralar"
            iconBgClass="bg-eco-emerald-light"
            delay={300}
          />
        </div>
      </section>
    </div>
  );
};

export default Travel;
