import { useTranslation } from "react-i18next";
import { Smartphone, CreditCard, Banknote, ShieldCheck, Play, Video, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ServicePageShell } from "./ServicePageShell";

const GUIDE_ITEMS = [
  { id: "simcards", titleKey: "guide.simcards.title", descriptionKey: "guide.simcards.description", icon: Smartphone, color: "text-blue-500", bgColor: "bg-blue-500/10", tips: ["guide.simcards.tip1", "guide.simcards.tip2", "guide.simcards.tip3"] },
  { id: "payments", titleKey: "guide.payments.title", descriptionKey: "guide.payments.description", icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10", tips: ["guide.payments.tip1", "guide.payments.tip2", "guide.payments.tip3"] },
  { id: "exchange", titleKey: "guide.exchange.title", descriptionKey: "guide.exchange.description", icon: Banknote, color: "text-gold", bgColor: "bg-gold/10", tips: ["guide.exchange.tip1", "guide.exchange.tip2", "guide.exchange.tip3"] },
  { id: "digital", titleKey: "guide.digital.title", descriptionKey: "guide.digital.description", icon: ShieldCheck, color: "text-purple-500", bgColor: "bg-purple-500/10", tips: ["guide.digital.tip1", "guide.digital.tip2", "guide.digital.tip3"] },
];

const VideoTipsPage = () => {
  const { t } = useTranslation();
  return (
    <ServicePageShell title={t("services.cards.video.title")} subtitle={t("services.cards.video.subtitle")}>
      {GUIDE_ITEMS.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={item.id} className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.bgColor)}>
                  <Icon className={cn("w-6 h-6", item.color)} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{t(item.titleKey)}</CardTitle>
                  <CardDescription className="mt-1">{t(item.descriptionKey)}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="relative aspect-video rounded-xl bg-muted/50 border border-border/50 overflow-hidden group cursor-pointer hover:border-primary/30 transition-all">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Play className="w-6 h-6 text-primary ml-1" />
                  </div>
                  <span className="text-sm text-muted-foreground">{t("guide.videoPlaceholder")}</span>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    {t("guide.videoLabel")}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {t("guide.tipsTitle")}
                </h4>
                <ul className="space-y-2">
                  {item.tips.map((tipKey, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {t(tipKey)}
                    </li>
                  ))}
                </ul>
              </div>
              {item.id === "exchange" && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gold/10 border border-gold/20">
                  <AlertTriangle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gold dark:text-gold">{t("guide.exchange.warning")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </ServicePageShell>
  );
};

export default VideoTipsPage;
