import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Moon,
  Navigation,
  MapPin,
  Check,
  Users,
  Star,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { MapNavigationSheet } from "./MapNavigationSheet";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { Card, CardContent } from "@/components/ui/card";

const MOSQUE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80";

interface MosqueDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mosque: {
    id: string;
    name: string;
    city: string;
    country: string;
    address: string | null;
    description: string | null;
    has_friday_prayer: boolean;
    has_womens_section: boolean;
    latitude: number | null;
    longitude: number | null;
    image_url?: string | null;
    built_year?: number | null;
    friday_prayer_time?: string | null;
    verification_status?: string | null;
    notable_features?: unknown;
    data_sources?: unknown;
    [key: string]: unknown;
  } | null;
}

type LangCode = "uz" | "ru" | "en" | "ar" | "fr" | "zh";

const pickLocalized = (
  obj: Record<string, unknown> | null | undefined,
  baseKey: string,
  lang: string,
): string => {
  if (!obj) return "";
  const order: LangCode[] = [lang as LangCode, "uz", "en", "ru", "ar", "fr", "zh"];
  const seen = new Set<string>();
  for (const code of order) {
    const key = `${baseKey}_${code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  const base = obj[baseKey];
  return typeof base === "string" ? base : "";
};

export const MosqueDetailSheet = ({ open, onOpenChange, mosque }: MosqueDetailSheetProps) => {
  const { t, i18n } = useTranslation();
  const { getField } = useTranslatedField();
  const [mapSheetOpen, setMapSheetOpen] = useState(false);

  if (!mosque) return null;

  const lang = i18n.language;
  const isUz = lang === "uz";

  const translatedName = getField(mosque, "name");
  const translatedDescription = getField(mosque, "description");
  const translatedAddress = getField(mosque, "address");
  const translatedCity = getField(mosque, "city");

  const historicalFacts = pickLocalized(
    mosque as Record<string, unknown>,
    "historical_facts",
    lang,
  );
  const historicalPeriod = pickLocalized(
    mosque as Record<string, unknown>,
    "historical_period",
    lang,
  );

  // notable_features: JSONB array of { feature_uz, feature_en, ... }
  const notableFeatures: string[] = (() => {
    const raw = mosque.notable_features;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return pickLocalized(item as Record<string, unknown>, "feature", lang);
        }
        return "";
      })
      .filter((s) => s && s.trim().length > 0);
  })();

  // data_sources: JSONB array of { url?, citation?, type?, note? }
  const dataSources: Array<{ url?: string; citation?: string; note?: string }> = (() => {
    const raw = mosque.data_sources;
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (s): s is { url?: string; citation?: string; note?: string } =>
        !!s && typeof s === "object",
    );
  })();

  const builtYearLabel = isUz ? "Qurilgan yili" : t("mosque.builtYear", "Built");
  const sourcesLabel = isUz ? "Manbalar" : t("mosque.sources", "Sources");
  const featuresLabel = isUz ? "O'ziga xos jihatlar" : t("mosque.features", "Features");
  const historyLabel = isUz ? "Tarixi" : t("mosque.history", "History");

  const verificationBadge = (() => {
    switch (mosque.verification_status) {
      case "admin_verified":
        return {
          icon: <ShieldCheck className="w-3 h-3" />,
          label: isUz ? "Tasdiqlangan" : "Verified",
          cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
        };
      case "community_verified":
        return {
          icon: <ShieldCheck className="w-3 h-3" />,
          label: isUz ? "Hamjamiyat tasdig'i" : "Community verified",
          cls: "bg-blue-500/10 text-blue-600 border-blue-500/30",
        };
      case "unverified":
        return {
          icon: <ShieldAlert className="w-3 h-3" />,
          label: isUz ? "Tasdiqlanmagan" : "Unverified",
          cls: "bg-orange-500/10 text-orange-600 border-orange-500/30",
        };
      default:
        return null;
    }
  })();

  const heroImage = mosque.image_url || MOSQUE_FALLBACK_IMAGE;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl px-0">
          <SheetHeader className="px-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-left text-lg leading-tight">
                  {translatedName}
                </SheetTitle>
                <p className="text-sm text-muted-foreground font-mono mt-0.5">{mosque.name}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto h-full pb-20 px-5 pt-4 space-y-4">
            {/* Hero image */}
            <div className="relative h-56 w-full rounded-2xl overflow-hidden">
              <img
                src={heroImage}
                alt={translatedName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = MOSQUE_FALLBACK_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Built year */}
            {mosque.built_year && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-3 border border-primary/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{builtYearLabel}</p>
                  <p className="font-bold text-foreground">
                    {mosque.built_year}
                    {historicalPeriod ? ` · ${historicalPeriod}` : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {verificationBadge && (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${verificationBadge.cls}`}
                >
                  {verificationBadge.icon}
                  {verificationBadge.label}
                </span>
              )}
              {mosque.has_friday_prayer && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Check className="w-3 h-3" />
                  {t("mosques.fridayPrayer")}
                  {mosque.friday_prayer_time ? ` · ${mosque.friday_prayer_time}` : ""}
                </span>
              )}
              {mosque.has_womens_section && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  <Users className="w-3 h-3" />
                  {t("mosques.womensSection")}
                </span>
              )}
            </div>

            {/* Address */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t("common.address")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {translatedAddress || `${translatedCity}, ${mosque.country}`}
              </p>
            </div>

            {/* Consolidated info card */}
            <Card className="bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-green-500/5 border-primary/20 overflow-hidden">
              <CardContent className="p-5 space-y-5">
                {translatedDescription && (
                  <div>
                    <h3 className="font-bold text-foreground flex items-center gap-2 mb-2 text-base">
                      <Moon className="w-4 h-4 text-primary" />
                      {t("mosque.about", "About")}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {translatedDescription}
                    </p>
                  </div>
                )}

                {historicalFacts && (
                  <div className="pt-4 border-t border-border/30">
                    <h3 className="font-bold text-foreground flex items-center gap-2 mb-2 text-base">
                      <Star className="w-4 h-4 text-blue-500" />
                      {historyLabel}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {historicalFacts}
                    </p>
                  </div>
                )}

                {notableFeatures.length > 0 && (
                  <div className="pt-4 border-t border-border/30">
                    <h3 className="font-bold text-foreground mb-3 text-base">{featuresLabel}</h3>
                    <ul className="space-y-2">
                      {notableFeatures.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {dataSources.length > 0 && (
                  <div className="pt-4 border-t border-border/30">
                    <h3 className="font-bold text-foreground mb-3 text-base">{sourcesLabel}</h3>
                    <ul className="space-y-2">
                      {dataSources.map((src, index) => {
                        const label = src.citation || src.url || "";
                        if (!label && !src.url) return null;
                        return (
                          <li key={index} className="text-xs text-muted-foreground leading-relaxed">
                            {src.url ? (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-start gap-1 text-primary hover:underline break-all"
                              >
                                <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{src.citation || src.url}</span>
                              </a>
                            ) : (
                              <span>{src.citation}</span>
                            )}
                            {src.note && (
                              <span className="block text-muted-foreground/70 mt-0.5">
                                {src.note}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigate */}
            {mosque.latitude && mosque.longitude && (
              <button
                onClick={() => setMapSheetOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
              >
                <Navigation className="w-5 h-5" />
                {t("mosques.directions")}
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {mosque.latitude && mosque.longitude && (
        <MapNavigationSheet
          open={mapSheetOpen}
          onOpenChange={setMapSheetOpen}
          latitude={mosque.latitude}
          longitude={mosque.longitude}
          name={translatedName}
          address={translatedAddress || undefined}
        />
      )}
    </>
  );
};
