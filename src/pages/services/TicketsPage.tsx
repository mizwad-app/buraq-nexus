import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plane, Train, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlightTicketSheet, TrainTicketSheet, HowItWorksSheet } from "@/components/tickets/TicketSheets";
import { ServicePageShell } from "./ServicePageShell";

const TicketsPage = () => {
  const { t } = useTranslation();
  const [flightSheetOpen, setFlightSheetOpen] = useState(false);
  const [trainSheetOpen, setTrainSheetOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const openTicketsChat = () => {
    const message = encodeURIComponent(t("tickets.heroTitle"));
    window.open(`https://wa.me/8613800138000?text=${message}`, "_blank");
  };

  return (
    <ServicePageShell title={t("services.cards.tickets.title")} subtitle={t("services.cards.tickets.subtitle")}>
      <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
          <Plane className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-display font-bold text-foreground">{t("tickets.heroTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-2">{t("tickets.heroSubtitle")}</p>
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          <span className="px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium">🇺🇿 {t("tickets.trustUzbek")}</span>
          <span className="px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium">✓ {t("tickets.trustReliable")}</span>
          <span className="px-2.5 py-1 rounded-full bg-background/60 text-xs font-medium">💰 {t("tickets.trustBestPrice")}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setFlightSheetOpen(true)}
          className="rounded-xl bg-card border border-border/50 p-4 text-left hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Plane className="w-8 h-8 text-primary mb-2" />
          <p className="font-semibold text-foreground">{t("tickets.flight")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("tickets.flightSubtitle")}</p>
        </button>
        <button
          onClick={() => setTrainSheetOpen(true)}
          className="rounded-xl bg-card border border-border/50 p-4 text-left hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
        >
          <Train className="w-8 h-8 text-primary mb-2" />
          <p className="font-semibold text-foreground">{t("tickets.train")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("tickets.trainSubtitle")}</p>
        </button>
      </div>

      <div className="space-y-2">
        <Button onClick={openTicketsChat} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
          <MessageSquare className="w-4 h-4 mr-2" />
          {t("tickets.quickChat")}
        </Button>
        <Button onClick={() => setHowItWorksOpen(true)} variant="outline" className="w-full" size="lg">
          <HelpCircle className="w-4 h-4 mr-2" />
          {t("tickets.howItWorks")}
        </Button>
      </div>

      <FlightTicketSheet open={flightSheetOpen} onOpenChange={setFlightSheetOpen} />
      <TrainTicketSheet open={trainSheetOpen} onOpenChange={setTrainSheetOpen} />
      <HowItWorksSheet open={howItWorksOpen} onOpenChange={setHowItWorksOpen} />
    </ServicePageShell>
  );
};

export default TicketsPage;
