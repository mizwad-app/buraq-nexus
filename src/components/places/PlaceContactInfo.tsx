import { Phone, Clock, ShieldCheck, ShieldAlert, ExternalLink, Globe, Mail, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DataSource {
  url?: string;
  type?: string;
  citation?: string;
  note?: string;
}

interface Props {
  phone?: string | null;
  phone_secondary?: string | null;
  email?: string | null;
  website?: string | null;
  working_hours?: string | null;
  district?: string | null;
  district_zh?: string | null;
  verification_status?: string | null;
  data_sources?: unknown;
}

export const PlaceContactInfo = ({
  phone,
  phone_secondary,
  email,
  website,
  working_hours,
  district,
  district_zh,
  verification_status,
  data_sources,
}: Props) => {
  const { t, i18n } = useTranslation();
  const isUz = i18n.language === "uz";

  const sources: DataSource[] = Array.isArray(data_sources)
    ? (data_sources as DataSource[]).filter((s) => s && typeof s === "object")
    : [];

  const verificationBadge = (() => {
    switch (verification_status) {
      case "admin_verified":
        return {
          icon: <ShieldCheck className="w-3 h-3" />,
          label: isUz ? "Tasdiqlangan" : t("verification.verified", "Verified"),
          cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
        };
      case "community_verified":
        return {
          icon: <ShieldCheck className="w-3 h-3" />,
          label: isUz ? "Hamjamiyat tasdig'i" : t("verification.community", "Community verified"),
          cls: "bg-blue-500/10 text-blue-600 border-blue-500/30",
        };
      case "unverified":
        return {
          icon: <ShieldAlert className="w-3 h-3" />,
          label: isUz ? "Tasdiqlanmagan" : t("verification.unverified", "Unverified"),
          cls: "bg-orange-500/10 text-orange-600 border-orange-500/30",
        };
      default:
        return null;
    }
  })();

  const hasAny =
    phone || phone_secondary || email || website || working_hours || district || district_zh ||
    verificationBadge || sources.length > 0;
  if (!hasAny) return null;

  return (
    <div className="space-y-3">
      {verificationBadge && (
        <span
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${verificationBadge.cls}`}
        >
          {verificationBadge.icon}
          {verificationBadge.label}
        </span>
      )}

      <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-2.5">
        {(district || district_zh) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-foreground">
              {district}
              {district && district_zh ? " · " : ""}
              {district_zh && <span className="font-mono">{district_zh}</span>}
            </span>
          </div>
        )}

        {working_hours && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-foreground">{working_hours}</span>
          </div>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono">{phone}</span>
          </a>
        )}

        {phone_secondary && (
          <a
            href={`tel:${phone_secondary}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono">{phone_secondary}</span>
          </a>
        )}

        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
          >
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>{email}</span>
          </a>
        )}

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            <span>{website}</span>
          </a>
        )}
      </div>

      {sources.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border/50">
          <h3 className="font-semibold text-foreground mb-2 text-sm">
            {isUz ? "Manbalar" : t("places.sources", "Sources")}
          </h3>
          <ul className="space-y-1.5">
            {sources.map((src, i) => {
              if (!src.url && !src.citation) return null;
              return (
                <li key={i} className="text-xs text-muted-foreground">
                  {src.url ? (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-1 text-primary hover:underline break-all"
                    >
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{src.citation || src.type || src.url}</span>
                    </a>
                  ) : (
                    <span>{src.citation}</span>
                  )}
                  {src.note && (
                    <span className="block text-muted-foreground/70 mt-0.5">{src.note}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
