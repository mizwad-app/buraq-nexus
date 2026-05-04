import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Phone, MapPin, Copy, FileText, HelpCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ServicePageShell } from "./ServicePageShell";

interface EmbassyInfo {
  id: string;
  type: "embassy" | "consulate";
  nameKey: string;
  phone: string;
  addressChinese: string;
  city: string;
}

const EMBASSIES: EmbassyInfo[] = [
  { id: "beijing", type: "embassy", nameKey: "guide.embassy.beijing", phone: "+861065326305", addressChinese: "北京市-朝阳区-亮马桥路41号", city: "Beijing" },
  { id: "guangzhou", type: "consulate", nameKey: "guide.embassy.guangzhou", phone: "+8602087595247", addressChinese: "广东省-广州市-天河区-临江大道57号中和广场16层1609单元", city: "Guangzhou" },
  { id: "shanghai", type: "consulate", nameKey: "guide.embassy.shanghai", phone: "+862163071896", addressChinese: "上海市-虹口区-吴淞路308号耀江国际广场801室", city: "Shanghai" },
];

const FAQ_ITEMS = [
  { question: "guide.faq.q1", answer: "guide.faq.a1" },
  { question: "guide.faq.q2", answer: "guide.faq.a2" },
  { question: "guide.faq.q3", answer: "guide.faq.a3" },
  { question: "guide.faq.q4", answer: "guide.faq.a4" },
];

const YoriqnomaPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceMessage, setServiceMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCall = (phone: string) => window.open(`tel:${phone}`, "_self");
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success(t("guide.embassy.addressCopied"));
  };

  const submit = async () => {
    if (!user) return toast.error(t("services.loginRequired") || "Iltimos, avval tizimga kiring");
    if (!serviceMessage.trim()) return toast.error(t("services.messageRequired") || "Iltimos, batafsil ma'lumot kiriting");
    setSubmitting(true);
    try {
      const { error } = await supabase.from("service_requests").insert({
        user_id: user.id,
        service_type: "visa_help",
        title: t("services.visaHelp.title") || "Vizа yordami so'rash",
        description: serviceMessage,
        status: "pending",
      });
      if (error) throw error;
      toast.success(t("services.requestSubmitted") || "So'rovingiz yuborildi");
      setServiceModalOpen(false);
      setServiceMessage("");
    } catch (e) {
      console.error(e);
      toast.error(t("services.requestError") || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ServicePageShell title={t("services.cards.yoriqnoma.title")} subtitle={t("services.cards.yoriqnoma.subtitle")}>
      <Button onClick={() => setServiceModalOpen(true)} className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
        <FileText className="w-4 h-4" />
        {t("services.visaHelp.title") || "Vizа yordami so'rash"}
      </Button>

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
            <div key={embassy.id} className="p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge variant="secondary" className={cn("mb-2", embassy.type === "embassy" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500")}>
                    {embassy.type === "embassy" ? t("guide.embassy.embassy") : t("guide.embassy.consulate")}
                  </Badge>
                  <h4 className="font-semibold text-foreground">{t(embassy.nameKey)}</h4>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <button onClick={() => handleCall(embassy.phone)} className="text-primary hover:underline font-mono text-sm">
                  {embassy.phone}
                </button>
              </div>
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-muted-foreground font-chinese">{embassy.addressChinese}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCall(embassy.phone)} className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  {t("guide.embassy.call")}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleCopyAddress(embassy.addressChinese)} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  {t("guide.embassy.copyAddress")}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
                <AccordionTrigger className="text-left text-sm">{t(faq.question)}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">{t(faq.answer)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Sheet open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("services.visaHelp.title") || "Vizа yordami so'rash"}</SheetTitle>
            <SheetDescription>{t("services.requestDescription") || "Quyidagi maydonga batafsil ma'lumot kiriting."}</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-3">
            <Textarea value={serviceMessage} onChange={(e) => setServiceMessage(e.target.value)} placeholder={t("services.requestPlaceholder") || "Sizga qanday yordam kerak?"} rows={5} />
            <Button onClick={submit} disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="w-4 h-4 mr-2" />
              {submitting ? (t("common.sending") || "Yuborilmoqda...") : (t("services.submit") || "Yuborish")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </ServicePageShell>
  );
};

export default YoriqnomaPage;
