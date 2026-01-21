import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Play, 
  Smartphone, 
  CreditCard, 
  Banknote, 
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Video,
  Building2,
  Phone,
  MapPin,
  Copy,
  ExternalLink,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface GuideItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  tips: string[];
  videoPlaceholder: boolean;
}

interface EmbassyInfo {
  id: string;
  type: "embassy" | "consulate";
  nameKey: string;
  phone: string;
  emergencyPhone?: string;
  addressChinese: string;
  city: string;
}

const EMBASSIES: EmbassyInfo[] = [
  {
    id: "beijing",
    type: "embassy",
    nameKey: "guide.embassy.beijing",
    phone: "+861065326305",
    addressChinese: "北京市-朝阳区-亮马桥路41号",
    city: "Beijing"
  },
  {
    id: "guangzhou",
    type: "consulate",
    nameKey: "guide.embassy.guangzhou",
    phone: "+8602087595247",
    addressChinese: "广东省-广州市-天河区-临江大道57号中和广场16层1609单元",
    city: "Guangzhou"
  },
  {
    id: "shanghai",
    type: "consulate",
    nameKey: "guide.embassy.shanghai",
    phone: "+862163071896",
    addressChinese: "上海市-虹口区-吴淞路308号耀江国际广场801室",
    city: "Shanghai"
  }
];

const FAQ_ITEMS = [
  { question: "guide.faq.q1", answer: "guide.faq.a1" },
  { question: "guide.faq.q2", answer: "guide.faq.a2" },
  { question: "guide.faq.q3", answer: "guide.faq.a3" },
  { question: "guide.faq.q4", answer: "guide.faq.a4" },
];

const TravelGuide = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const guideItems: GuideItem[] = [
    {
      id: "simcards",
      titleKey: "guide.simcards.title",
      descriptionKey: "guide.simcards.description",
      icon: Smartphone,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      tips: ["guide.simcards.tip1", "guide.simcards.tip2", "guide.simcards.tip3"],
      videoPlaceholder: true
    },
    {
      id: "payments",
      titleKey: "guide.payments.title",
      descriptionKey: "guide.payments.description",
      icon: CreditCard,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      tips: ["guide.payments.tip1", "guide.payments.tip2", "guide.payments.tip3"],
      videoPlaceholder: true
    },
    {
      id: "exchange",
      titleKey: "guide.exchange.title",
      descriptionKey: "guide.exchange.description",
      icon: Banknote,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      tips: ["guide.exchange.tip1", "guide.exchange.tip2", "guide.exchange.tip3"],
      videoPlaceholder: true
    },
    {
      id: "digital",
      titleKey: "guide.digital.title",
      descriptionKey: "guide.digital.description",
      icon: ShieldCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      tips: ["guide.digital.tip1", "guide.digital.tip2", "guide.digital.tip3"],
      videoPlaceholder: true
    }
  ];

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success(t("guide.embassy.addressCopied"));
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-card flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">
              {t("guide.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("guide.subtitle")}
            </p>
          </div>
        </div>
      </header>

      {/* Embassy Section - Priority */}
      <section className="px-5 py-4">
        <Card className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-lg">{t("guide.embassy.title")}</CardTitle>
                <CardDescription>{t("guide.embassy.subtitle")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {EMBASSIES.map((embassy) => (
              <div 
                key={embassy.id}
                className="p-4 rounded-xl bg-card border border-border/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "mb-2",
                        embassy.type === "embassy" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                      )}
                    >
                      {embassy.type === "embassy" ? t("guide.embassy.embassy") : t("guide.embassy.consulate")}
                    </Badge>
                    <h4 className="font-semibold text-foreground">{embassy.city}</h4>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <button
                    onClick={() => handleCall(embassy.phone)}
                    className="text-primary hover:underline font-mono text-sm"
                  >
                    {embassy.phone}
                  </button>
                </div>

                {/* Chinese Address */}
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-muted-foreground font-chinese">
                    {embassy.addressChinese}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCall(embassy.phone)}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {t("guide.embassy.call")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyAddress(embassy.addressChinese)}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t("guide.embassy.copyAddress")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Guide Items */}
      <section className="px-5 space-y-4">
        {guideItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.id} 
              className="overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.bgColor)}>
                    <Icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{t(item.titleKey)}</CardTitle>
                    <CardDescription className="mt-1">
                      {t(item.descriptionKey)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Video Placeholder */}
                {item.videoPlaceholder && (
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
                )}

                {/* Tips */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {t("guide.tipsTitle")}
                  </h4>
                  <ul className="space-y-2">
                    {item.tips.map((tipKey, tipIndex) => (
                      <li 
                        key={tipIndex}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {t(tipKey)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Warning Note for Exchange */}
                {item.id === "exchange" && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {t("guide.exchange.warning")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* FAQ Section */}
      <section className="px-5 py-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t("guide.faq.title")}</CardTitle>
                <CardDescription>{t("guide.faq.subtitle")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {t(faq.question)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">
                    {t(faq.answer)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  );
};

export default TravelGuide;
