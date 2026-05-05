import { Star, MapPin, BadgeCheck, Car, MessageCircle, CalendarCheck, Play, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getFlagEmoji, HSK_BADGE_CLASS, type TranslatorLanguage } from "@/lib/flags";
import type { MarketplaceTranslator } from "@/types/marketplace";

const AVATAR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

interface TranslatorProfileCardProps {
  translator: MarketplaceTranslator;
  onClick: () => void;
  onBook: () => void;
  onChat: () => void;
}

export const TranslatorProfileCard = ({
  translator,
  onClick,
  onBook,
  onChat,
}: TranslatorProfileCardProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();

  const t2 = translator as Record<string, unknown> & MarketplaceTranslator;
  const availableToday = t2.available_today === true;
  const hasVideo = !!translator.intro_video_url;
  const verified =
    !!translator.is_verified || !!translator.buraq_verified_hsk;
  const dailyRate = translator.daily_rate || translator.price_per_day || 0;
  const hourlyRate = translator.hourly_rate || (dailyRate ? Math.round(Number(dailyRate) / 8) : 0);
  const hskLevel = translator.buraq_verified_hsk || translator.self_declared_hsk || translator.hsk_level || null;
  const hskVerified = !!translator.buraq_verified_hsk;
  const responseTime = (t2.response_time_avg as number | null) ?? null;

  const specs: string[] = Array.isArray(translator.specializations) ? translator.specializations : [];

  // Languages JSON parsing (DB stores JSONB array)
  let langs: TranslatorLanguage[] = [];
  const rawLangs = t2.languages;
  if (Array.isArray(rawLangs)) {
    langs = rawLangs as unknown as TranslatorLanguage[];
  } else if (typeof rawLangs === "string") {
    try { langs = JSON.parse(rawLangs); } catch { langs = []; }
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-4 bg-card transition-all hover:border-primary/40",
        availableToday
          ? "border-l-4 border-l-emerald-500 border-y border-r border-border"
          : "border border-border"
      )}
    >
      {/* Top row: Avatar + identity */}
      <div className="flex gap-3 mb-3 cursor-pointer" onClick={onClick}>
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            src={translator.avatar_url || AVATAR_PLACEHOLDER}
            alt={getField(translator, "name")}
            className="w-full h-full rounded-2xl object-cover"
          />
          {hasVideo && (
            <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg ring-2 ring-card">
              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <h3 className="font-semibold text-base text-foreground truncate">
              {getField(translator, "name")}
            </h3>
            {verified && <BadgeCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {hskLevel && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-0.5 flex-shrink-0",
                  HSK_BADGE_CLASS(hskLevel)
                )}
              >
                HSK {hskLevel}
                {hskVerified && <Check className="w-2.5 h-2.5" />}
              </span>
            )}
          </div>

          {/* Specializations (PRIORITY — emerald chips) */}
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {specs.slice(0, 3).map((spec) => (
                <span
                  key={spec}
                  className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Languages with flags */}
          {langs.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
              {langs.slice(0, 4).map((lang, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span>{getFlagEmoji(lang.code)}</span>
                  <span>{lang.level}</span>
                  {lang.verified && <BadgeCheck className="w-3 h-3 text-emerald-400" />}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-border/50 my-3" />

      {/* Meta row: city, experience, rating */}
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{getField(translator, "city")}</span>
          {translator.years_experience ? (
            <>
              <span>·</span>
              <span>{translator.years_experience} yil</span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-medium text-foreground">{translator.rating?.toFixed(1) || "5.0"}</span>
          <span className="text-muted-foreground text-xs">({translator.total_reviews || 0})</span>
        </div>
      </div>

      {/* Pricing row */}
      <div className="flex items-center gap-3 text-sm mb-2">
        <span className="font-semibold text-emerald-400">
          ¥{dailyRate}
          <span className="text-xs text-muted-foreground font-normal">/kun</span>
        </span>
        {hourlyRate > 0 && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">¥{hourlyRate}/soat</span>
          </>
        )}
      </div>

      {/* Indicators */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs mb-3">
        {availableToday && (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Bugun mavjud
          </span>
        )}
        {translator.has_personal_car && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Car className="w-3 h-3" />
            Avtomobil
          </span>
        )}
        {responseTime && responseTime <= 30 && (
          <span className="text-muted-foreground">{responseTime} daq javob</span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onChat();
          }}
        >
          <MessageCircle className="w-4 h-4" />
          Xabar
        </Button>
        <Button
          size="sm"
          className="flex-[2] gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
        >
          <CalendarCheck className="w-4 h-4" />
          Bron qilish
        </Button>
      </div>
    </div>
  );
};
