import { useTranslation } from "react-i18next";
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

const Travel = () => {
  const { t } = useTranslation();

  const destinations = [
    { 
      nameKey: "samarkand", 
      typeKey: "samarkandType", 
      image: "🏛️" 
    },
    { 
      nameKey: "chimgan", 
      typeKey: "chimganType", 
      image: "🏔️" 
    },
    { 
      nameKey: "khiva", 
      typeKey: "khivaType", 
      image: "🏰" 
    },
  ];

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
              {t("travel.subtitle")}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("travel.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("travel.discoverPlaces")}
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
              ✨ {t("travel.recommended")}
            </span>
            <h2 className="text-xl font-display font-bold text-primary-foreground mb-1">
              {t("travel.travelAcross")}
            </h2>
            <p className="text-sm text-primary-foreground/80 mb-4">
              {t("travel.ancientCities")}
            </p>
            <button className="flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary-foreground/20 px-4 py-2 rounded-xl">
              {t("travel.view")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute right-4 bottom-4 text-6xl opacity-30">🌍</div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t("travel.popularPlaces")}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {destinations.map((dest, index) => (
            <div
              key={dest.nameKey}
              className="flex-shrink-0 w-32 bg-card rounded-2xl p-4 shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-3">{dest.image}</div>
              <h3 className="font-semibold text-foreground text-sm">
                {t(`travel.destinations.${dest.nameKey}`)}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(`travel.destinations.${dest.typeKey}`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 pb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          {t("travel.categories")}
        </h2>
        <div className="space-y-3">
          <ModuleCard
            icon={Compass}
            title={t("travel.ecoTours")}
            description={t("travel.ecoToursDesc")}
            iconBgClass="bg-eco-mint"
            delay={0}
          />
          <ModuleCard
            icon={Mountain}
            title={t("travel.mountainTourism")}
            description={t("travel.mountainTourismDesc")}
            iconBgClass="bg-eco-sage"
            delay={100}
          />
          <ModuleCard
            icon={Palmtree}
            title={t("travel.familyVacation")}
            description={t("travel.familyVacationDesc")}
            iconBgClass="bg-secondary"
            delay={200}
          />
          <ModuleCard
            icon={Camera}
            title={t("travel.photoTours")}
            description={t("travel.photoToursDesc")}
            iconBgClass="bg-eco-emerald-light"
            delay={300}
          />
        </div>
      </section>
    </div>
  );
};

export default Travel;