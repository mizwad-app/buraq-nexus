import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone, Mail, Globe, MapPin, Clock,
  AlertTriangle, ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Consulate {
  id: string;
  country_code: string;
  city: string;
  type: "embassy" | "consulate_general" | "consulate" | "honorary_consulate";
  name_uz: string | null; name_ru: string | null; name_en: string | null;
  name_ar: string | null; name_zh: string | null;
  address_uz: string | null; address_ru: string | null; address_en: string | null;
  address_ar: string | null; address_zh: string | null;
  phone_main: string | null;
  phone_emergency: string | null;
  phone_consular: string | null;
  email_main: string | null;
  website: string | null;
  working_hours_uz: string | null; working_hours_ru: string | null; working_hours_en: string | null;
  working_hours_ar: string | null; working_hours_zh: string | null;
  services_uz: string[] | null; services_ru: string[] | null; services_en: string[] | null;
  services_ar: string[] | null; services_zh: string[] | null;
  latitude: number | null;
  longitude: number | null;
  verification_status: string;
  [key: string]: unknown;
}

interface ConsulateInfoProps {
  countryCode: string;
}

export const ConsulateInfo = ({ countryCode }: ConsulateInfoProps) => {
  const { t, i18n } = useTranslation();
  const [consulates, setConsulates] = useState<Consulate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("consulates")
      .select("*")
      .eq("country_code", countryCode)
      .eq("is_active", true)
      .order("type")
      .then(({ data }) => {
        if (cancelled) return;
        setConsulates((data as Consulate[]) || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [countryCode]);

  const lang = i18n.language;
  const pickField = (c: Consulate, base: string): string => {
    return ((c as any)[`${base}_${lang}`] as string) || ((c as any)[`${base}_en`] as string) || "";
  };
  const pickServices = (c: Consulate): string[] => {
    return ((c as any)[`services_${lang}`] as string[]) || (c.services_en as string[]) || [];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (consulates.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium text-foreground">{t("consulate.no_data")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("consulate.no_data_subtitle")}</p>
      </Card>
    );
  }

  const typeLabels: Record<string, string> = {
    embassy: t("consulate.types.embassy"),
    consulate_general: t("consulate.types.consulate_general"),
    consulate: t("consulate.types.consulate"),
    honorary_consulate: t("consulate.types.honorary_consulate"),
  };

  return (
    <div className="space-y-4">
      {consulates.map((c) => {
        const services = pickServices(c);
        const address = pickField(c, "address");
        const hours = pickField(c, "working_hours");
        const name = pickField(c, "name");
        return (
          <Card key={c.id} className="p-4 space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <Badge variant="secondary" className="text-xs">{typeLabels[c.type]}</Badge>
                <Badge variant="outline" className="text-xs">📍 {c.city}</Badge>
                {c.verification_status === "admin_verified" ? (
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-xs gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {t("common.verified", "Tasdiqlangan")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-3 h-3" />
                    {t("common.unverified", "Tasdiqlanmagan")}
                  </Badge>
                )}
              </div>
              <h3 className="font-display font-bold text-foreground leading-snug">{name}</h3>
            </div>

            {c.verification_status === "unverified" && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{t("consulate.unverified_warning")}</p>
              </div>
            )}

            {address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{address}</span>
              </div>
            )}

            {hours && (
              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{hours}</span>
              </div>
            )}

            {/* Phones */}
            <div className="space-y-2">
              {c.phone_emergency && (
                <a
                  href={`tel:${c.phone_emergency}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 hover:bg-destructive/15 transition-colors"
                >
                  <Phone className="w-5 h-5 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-destructive">
                      🚨 {t("consulate.emergency")}
                    </p>
                    <p className="font-bold text-foreground">{c.phone_emergency}</p>
                  </div>
                </a>
              )}
              {c.phone_main && (
                <a
                  href={`tel:${c.phone_main}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
                >
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t("consulate.main_phone")}</p>
                    <p className="font-medium text-foreground">{c.phone_main}</p>
                  </div>
                </a>
              )}
              {c.phone_consular && c.phone_consular !== c.phone_main && (
                <a
                  href={`tel:${c.phone_consular}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
                >
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{t("consulate.consular_phone")}</p>
                    <p className="font-medium text-foreground">{c.phone_consular}</p>
                  </div>
                </a>
              )}
            </div>

            {/* Email & website */}
            <div className="flex flex-wrap gap-2">
              {c.email_main && (
                <a
                  href={`mailto:${c.email_main}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {c.email_main}
                </a>
              )}
              {c.website && (
                <a
                  href={c.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {t("consulate.website")}
                </a>
              )}
            </div>

            {services.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {t("consulate.services")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {c.latitude && c.longitude && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`,
                    "_blank"
                  )
                }
              >
                <MapPin className="w-4 h-4 mr-2" />
                {t("consulate.directions")}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
};
