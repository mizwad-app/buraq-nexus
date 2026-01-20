import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Plane, 
  Train, 
  Shield, 
  Wifi,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PackageSearch,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ServiceType {
  id: string;
  icon: typeof Search;
  titleKey: string;
  descKey: string;
  color: string;
  bgColor: string;
}

const SERVICES: ServiceType[] = [
  {
    id: "cargo_inspection",
    icon: PackageSearch,
    titleKey: "services.cargoInspection.title",
    descKey: "services.cargoInspection.desc",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "flight_booking",
    icon: Plane,
    titleKey: "services.flightBooking.title",
    descKey: "services.flightBooking.desc",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "train_booking",
    icon: Train,
    titleKey: "services.trainBooking.title",
    descKey: "services.trainBooking.desc",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "vpn_setup",
    icon: Wifi,
    titleKey: "services.vpnSetup.title",
    descKey: "services.vpnSetup.desc",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "concierge",
    icon: Briefcase,
    titleKey: "services.concierge.title",
    descKey: "services.concierge.desc",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

// WhatsApp and Telegram icons
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const WHATSAPP_NUMBER = "+8613800138000";
const TELEGRAM_USERNAME = "halaltrade_support";

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleServiceClick = (service: ServiceType) => {
    setSelectedService(service);
    setSheetOpen(true);
    setDescription("");
  };

  const submitRequest = async (contactMethod: 'whatsapp' | 'telegram') => {
    if (!selectedService) return;

    const serviceTitle = t(selectedService.titleKey);
    const message = `${serviceTitle}\n\n${description || t("services.defaultMessage")}`;
    
    // If user is logged in, save the request
    if (user) {
      setSubmitting(true);
      try {
        await supabase.from("service_requests").insert({
          user_id: user.id,
          service_type: selectedService.id,
          title: serviceTitle,
          description: description,
          contact_method: contactMethod,
        });
      } catch (error) {
        console.error("Error saving request:", error);
      }
      setSubmitting(false);
    }

    // Open chat
    const encodedMessage = encodeURIComponent(message);
    if (contactMethod === 'whatsapp') {
      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodedMessage}`, '_blank');
    } else {
      window.open(`https://t.me/${TELEGRAM_USERNAME}?text=${encodedMessage}`, '_blank');
    }

    setSheetOpen(false);
    toast.success(t("services.requestSent"));
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t("services.subtitle")}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">
              {t("services.title")}
            </h1>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {t("services.description")}
        </p>
      </header>

      {/* Services Grid */}
      <section className="px-5">
        <div className="space-y-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className="w-full bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", service.bgColor)}>
                    <Icon className={cn("w-6 h-6", service.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{t(service.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{t(service.descKey)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Service Request Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl">
          {selectedService && (
            <>
              <SheetHeader className="text-left pb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", selectedService.bgColor)}>
                    <selectedService.icon className={cn("w-6 h-6", selectedService.color)} />
                  </div>
                  <div>
                    <SheetTitle>{t(selectedService.titleKey)}</SheetTitle>
                    <SheetDescription>{t(selectedService.descKey)}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("services.additionalDetails")}
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("services.detailsPlaceholder")}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    {t("services.contactVia")}
                  </p>
                  
                  <button
                    onClick={() => submitRequest('whatsapp')}
                    disabled={submitting}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                      <WhatsAppIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-foreground">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">{t("services.instantResponse")}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => submitRequest('telegram')}
                    disabled={submitting}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 transition-all disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                      <TelegramIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-foreground">Telegram</p>
                      <p className="text-sm text-muted-foreground">{t("services.instantResponse")}</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Services;
