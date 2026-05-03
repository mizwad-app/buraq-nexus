import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Scale,
  ShieldCheck,
  MapPin,
  Briefcase,
  Phone,
  MessageCircle,
  Globe,
  Filter,
  Loader2,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LegalAdvisorDetailSheet } from "./LegalAdvisorDetailSheet";

export interface LegalAdvisor {
  id: string;
  name: string;
  firm_name: string;
  city: string;
  specializations: string[];
  languages: string[];
  phone: string | null;
  wechat_id: string | null;
  email: string | null;
  office_address: string | null;
  bio: string | null;
  bio_uz: string | null;
  bio_ru: string | null;
  bio_en: string | null;
  bio_ar: string | null;
  bio_fr: string | null;
  bio_zh: string | null;
  avatar_url: string | null;
  firm_logo_url: string | null;
  years_experience: number;
  buraq_verified: boolean;
  is_active: boolean;
  display_order: number;
}

const SPECIALIZATIONS = ["contracts", "intellectual_property", "tax", "disputes", "immigration", "corporate"];
const LANGUAGES = ["zh", "en", "ru", "ar", "uz"];

const initials = (name: string) =>
  name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

export const LegalAdvisorsList = () => {
  const { t } = useTranslation();
  const [advisors, setAdvisors] = useState<LegalAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [detail, setDetail] = useState<LegalAdvisor | null>(null);

  // filters
  const [city, setCity] = useState<string>("");
  const [langs, setLangs] = useState<string[]>([]);
  const [specs, setSpecs] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("legal_advisors")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) {
        console.error(error);
      } else {
        setAdvisors((data || []) as LegalAdvisor[]);
      }
      setLoading(false);
    })();
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(advisors.map((a) => a.city))).sort(),
    [advisors]
  );

  const filtered = useMemo(() => {
    return advisors.filter((a) => {
      if (city && a.city !== city) return false;
      if (verifiedOnly && !a.buraq_verified) return false;
      if (langs.length && !langs.every((l) => a.languages.includes(l))) return false;
      if (specs.length && !specs.some((s) => a.specializations.includes(s))) return false;
      return true;
    });
  }, [advisors, city, langs, specs, verifiedOnly]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const clearAll = () => {
    setCity("");
    setLangs([]);
    setSpecs([]);
    setVerifiedOnly(false);
  };

  const copyWeChat = async (id: string) => {
    await navigator.clipboard.writeText(id);
    toast.success(t("legal.contact.wechatCopied", { id }));
  };

  return (
    <div className="px-5 pb-6 space-y-4">
      {/* Hero */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-foreground">{t("legal.heroTitle")}</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t("legal.heroSubtitle")}
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-2 leading-relaxed">
              {t("legal.heroNote")}
            </p>
          </div>
        </div>
      </div>

      {/* Filter button */}
      <Button
        variant="outline"
        onClick={() => setFilterOpen(true)}
        className="w-full justify-between"
      >
        <span className="inline-flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {t("legal.filter.button", { count: filtered.length })}
        </span>
      </Button>

      {/* List */}
      {loading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-2xl border border-border/50">
          <SearchX className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-medium text-foreground text-sm">{t("legal.empty.title")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("legal.empty.subtitle")}</p>
          <Button onClick={clearAll} variant="ghost" size="sm" className="mt-3">
            {t("legal.empty.clearFilters")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="bg-card rounded-xl border border-border/50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt={a.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-base font-bold text-primary">
                    {initials(a.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-foreground truncate">{a.name}</h3>
                    {a.buraq_verified && (
                      <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" aria-label={t("legal.verified")} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{a.firm_name}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{a.city}</span>
                    {a.years_experience > 0 && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {t("legal.yearsExperience", { count: a.years_experience })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {a.specializations.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-secondary/60 text-[11px]">
                    {t(`legal.specialization.${s}`, s)}
                  </span>
                ))}
                {a.languages.map((l) => (
                  <span key={l} className="px-2 py-0.5 rounded-full bg-secondary/60 text-[11px] inline-flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    {t(`legal.language.${l}`, l)}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {a.wechat_id && (
                  <Button size="sm" variant="outline" onClick={() => copyWeChat(a.wechat_id!)} className="gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {t("legal.contact.wechat")}
                  </Button>
                )}
                {a.phone && (
                  <Button size="sm" variant="outline" asChild className="gap-1.5">
                    <a href={`tel:${a.phone}`}>
                      <Phone className="w-3.5 h-3.5" />
                      {t("legal.contact.phone")}
                    </a>
                  </Button>
                )}
                <Button size="sm" onClick={() => setDetail(a)} className="ml-auto">
                  {t("legal.contact.details")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader className="text-left">
            <SheetTitle>{t("legal.filter.title")}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground">{t("legal.filter.city")}</Label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{t("legal.filter.allCities")}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">{t("legal.filter.languages")}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => toggle(langs, setLangs, l)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs border transition-colors",
                      langs.includes(l)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/40 border-border text-foreground"
                    )}
                  >
                    {t(`legal.language.${l}`, l)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">{t("legal.filter.specializations")}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SPECIALIZATIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(specs, setSpecs, s)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs border transition-colors",
                      specs.includes(s)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/40 border-border text-foreground"
                    )}
                  >
                    {t(`legal.specialization.${s}`, s)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-secondary/40 rounded-xl p-3">
              <Label htmlFor="verified-only" className="text-sm font-medium">
                {t("legal.filter.verifiedOnly")}
              </Label>
              <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
            </div>
          </div>

          <div className="sticky bottom-0 bg-background pt-3 pb-2 mt-6 flex gap-2">
            <Button variant="outline" onClick={clearAll} className="flex-1">
              {t("legal.filter.clear")}
            </Button>
            <Button onClick={() => setFilterOpen(false)} className="flex-1">
              {t("legal.filter.confirm", { count: filtered.length })}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <LegalAdvisorDetailSheet
        advisor={detail}
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
      />
    </div>
  );
};
