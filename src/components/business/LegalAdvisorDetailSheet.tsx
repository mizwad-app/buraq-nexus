import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { ShieldCheck, MapPin, Briefcase, Phone, Mail, MessageCircle, Globe, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { LegalAdvisor } from "./LegalAdvisorsList";

interface Props {
  advisor: LegalAdvisor | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

export const LegalAdvisorDetailSheet = ({ advisor, open, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();

  if (!advisor) return null;

  const bio = getField(advisor as unknown as Record<string, unknown>, "bio");

  const copyWeChat = async () => {
    if (!advisor.wechat_id) return;
    await navigator.clipboard.writeText(advisor.wechat_id);
    toast.success(t("legal.contact.wechatCopied", { id: advisor.wechat_id }));
  };

  const mapUrl = advisor.office_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(advisor.office_address)}`
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="sr-only">{advisor.name}</SheetTitle>
        </SheetHeader>

        <div className="flex items-start gap-4 mt-2">
          {advisor.avatar_url ? (
            <img src={advisor.avatar_url} alt={advisor.name} className="w-24 h-24 rounded-2xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {initials(advisor.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{advisor.name}</h2>
              {advisor.buraq_verified && (
                <ShieldCheck className="w-5 h-5 text-primary" aria-label={t("legal.verified")} />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{advisor.firm_name}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{advisor.city}</span>
              {advisor.years_experience > 0 && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {t("legal.yearsExperience", { count: advisor.years_experience })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {bio && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">{t("legal.detail.bio")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
          </section>
        )}

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t("legal.detail.specializations")}</h3>
          <div className="flex flex-wrap gap-2">
            {advisor.specializations.map((s) => (
              <Badge key={s} variant="secondary" className="rounded-full">
                {t(`legal.specialization.${s}`, s)}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">{t("legal.detail.languages")}</h3>
          <div className="flex flex-wrap gap-2">
            {advisor.languages.map((l) => (
              <Badge key={l} variant="secondary" className="rounded-full inline-flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {t(`legal.language.${l}`, l)}
              </Badge>
            ))}
          </div>
        </section>

        {advisor.office_address && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">{t("legal.detail.office")}</h3>
            <div className="bg-secondary/40 rounded-xl p-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-foreground">{advisor.office_address}</p>
              </div>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  {t("legal.detail.viewOnMap")}
                </a>
              )}
            </div>
          </section>
        )}

        <section className="mt-6 space-y-2">
          {advisor.wechat_id && (
            <Button onClick={copyWeChat} variant="outline" className="w-full justify-start gap-2">
              <MessageCircle className="w-4 h-4" />
              {t("legal.contact.wechat")} · {advisor.wechat_id}
            </Button>
          )}
          {advisor.phone && (
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href={`tel:${advisor.phone}`}>
                <Phone className="w-4 h-4" />
                {t("legal.contact.phone")} · {advisor.phone}
              </a>
            </Button>
          )}
          {advisor.email && (
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href={`mailto:${advisor.email}`}>
                <Mail className="w-4 h-4" />
                {advisor.email}
              </a>
            </Button>
          )}
        </section>

        <p className="mt-6 text-[11px] text-muted-foreground leading-relaxed">
          {t("legal.detail.disclaimer")}
        </p>
      </SheetContent>
    </Sheet>
  );
};
