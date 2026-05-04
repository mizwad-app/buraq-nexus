import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, PlayCircle, FileText, Plane, Briefcase } from "lucide-react";
import { HeaderAvatar } from "@/components/HeaderAvatar";
import { cn } from "@/lib/utils";

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      id: "yoriqnoma",
      icon: BookOpen,
      title: t("services.cards.yoriqnoma.title"),
      subtitle: t("services.cards.yoriqnoma.subtitle"),
      route: "/xizmatlar/yo-riqnoma",
      gradient: "from-primary/20 via-primary/5 to-transparent",
      iconBg: "bg-primary/15 text-primary",
    },
    {
      id: "video",
      icon: PlayCircle,
      title: t("services.cards.video.title"),
      subtitle: t("services.cards.video.subtitle"),
      route: "/xizmatlar/video",
      gradient: "from-gold/20 via-gold/5 to-transparent",
      iconBg: "bg-gold/15 text-gold",
    },
    {
      id: "documents",
      icon: FileText,
      title: t("services.cards.documents.title"),
      subtitle: t("services.cards.documents.subtitle"),
      route: "/xizmatlar/hujjatlar",
      gradient: "from-primary/20 via-primary/5 to-transparent",
      iconBg: "bg-primary/15 text-primary",
    },
    {
      id: "tickets",
      icon: Plane,
      title: t("services.cards.tickets.title"),
      subtitle: t("services.cards.tickets.subtitle"),
      route: "/xizmatlar/biletlar",
      gradient: "from-gold/20 via-gold/5 to-transparent",
      iconBg: "bg-gold/15 text-gold",
    },
  ];

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="p-2 eco-gradient rounded-xl shadow-eco">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t("services.subtitle", "Sayohat va biznes xizmatlari")}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">
              {t("nav.services")}
            </h1>
          </div>
          <HeaderAvatar />
        </div>
      </header>

      <section className="px-5">
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.route)}
                style={{ animationDelay: `${index * 60}ms` }}
                className={cn(
                  "animate-fade-in text-left rounded-2xl p-4 border border-border/50 glass-effect bg-gradient-to-br",
                  "hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]",
                  card.gradient
                )}
              >
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-3", card.iconBg)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-base leading-tight">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {card.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Services;
