import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  Plane,
  Factory,
  MapPin,
  Calendar,
  Clock,
  Users,
  Phone,
  ChevronRight,
} from "lucide-react";
import { useCity, useMosquesByCity, useMarketsByCity } from "@/hooks/useCity";
import { useExhibitions } from "@/hooks/useExhibitions";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { cn } from "@/lib/utils";

const Section = ({
  title,
  emoji,
  children,
  className,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn("px-5", className)}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">
      <span className="mr-1">{emoji}</span>
      {title}
    </p>
    {children}
  </section>
);

const Stat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  </div>
);

const CityDetail = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  useSwipeBack();

  const { data: city, loading } = useCity(slug);
  const cityNameEn = city?.name_en;
  const { data: mosques } = useMosquesByCity(cityNameEn ?? undefined, 3);
  const { data: markets, total: marketsTotal } = useMarketsByCity(cityNameEn ?? undefined, 3);
  const { data: exhibitions } = useExhibitions({
    cityName: cityNameEn ?? null,
    limit: 3,
  });

  const cityName = city ? getField(city, "name") || city.name_en : "";

  const hasGeneral = !!(city?.population || city?.timezone || city?.phone_code);
  const hasTravel = !!city?.nearest_airport_code;
  const hasManufacturing =
    !!(city?.factory_count_estimated || getField(city ?? {}, "main_products") || markets.length > 0);
  const hasHalal = mosques.length > 0 || !!getField(city ?? {}, "halal_food_note");
  const hasExhibitions = exhibitions.length > 0;
  const hasFunFact = !!getField(city ?? {}, "fun_fact");

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl hover:bg-muted active:scale-95"
            aria-label={t("city.back")}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-muted-foreground">
              {city?.country_emoji} {city?.province || city?.country}
            </span>
            <h1
              className="text-xl italic font-medium text-foreground truncate"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {loading ? "…" : cityName}
            </h1>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !city ? (
        <div className="px-6 py-16 text-center">
          <div className="text-5xl mb-3">🚧</div>
          <h2 className="text-base font-medium text-foreground mb-1">
            {t("city.comingSoonTitle")}
          </h2>
          <p className="text-[12px] text-muted-foreground max-w-xs mx-auto">
            {t("city.comingSoonDesc")}
          </p>
        </div>
      ) : !city.is_active ? (
        <div className="px-6 py-16 text-center">
          <div className="text-5xl mb-3">🚧</div>
          <h2 className="text-base font-medium text-foreground mb-1">
            {t("city.comingSoonTitle")}
          </h2>
          <p className="text-[12px] text-muted-foreground max-w-xs mx-auto">
            {t("city.comingSoonDesc")}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {hasGeneral && (
            <Section title={t("city.general")} emoji="🏙️">
              <div className="grid grid-cols-2 gap-2">
                {city.population && (
                  <Stat
                    icon={<Users className="w-4 h-4" />}
                    label={t("city.population")}
                    value={city.population.toLocaleString()}
                  />
                )}
                {city.timezone && (
                  <Stat
                    icon={<Clock className="w-4 h-4" />}
                    label={t("city.timezone")}
                    value={city.timezone}
                  />
                )}
                {city.phone_code && (
                  <Stat
                    icon={<Phone className="w-4 h-4" />}
                    label={t("city.phoneCode")}
                    value={city.phone_code}
                  />
                )}
              </div>
            </Section>
          )}

          {hasTravel && (
            <Section title={t("city.travel")} emoji="✈️">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-medium text-foreground">
                    {getField(city, "nearest_airport_name") ||
                      city.nearest_airport_name_en}
                  </p>
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    {city.nearest_airport_code}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {city.airport_distance_km != null && (
                    <div className="bg-background/40 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {t("city.distance")}
                      </p>
                      <p className="text-sm font-medium">
                        {city.airport_distance_km} km
                      </p>
                    </div>
                  )}
                  {city.airport_taxi_cost_yuan != null && (
                    <div className="bg-background/40 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {t("city.taxiCost")}
                      </p>
                      <p className="text-sm font-medium">
                        ¥{city.airport_taxi_cost_yuan}
                      </p>
                    </div>
                  )}
                  {city.airport_taxi_duration_min != null && (
                    <div className="bg-background/40 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">
                        {t("city.duration")}
                      </p>
                      <p className="text-sm font-medium">
                        {city.airport_taxi_duration_min} min
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Section>
          )}

          {hasManufacturing && (
            <Section title={t("city.manufacturing")} emoji="🏭">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
                {city.factory_count_estimated != null && (
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm">
                      <span className="font-medium text-foreground">
                        {city.factory_count_estimated.toLocaleString()}+
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {t("city.factories").toLowerCase()}
                      </span>
                    </p>
                  </div>
                )}
                {!!getField(city, "main_products") && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {getField(city, "main_products")}
                  </p>
                )}
                {marketsTotal > 0 && (
                  <button
                    onClick={() => {
                      // Navigate to MarketDetail or markets list — fallback to category furniture for Foshan
                      navigate(`/business/markets/furniture`);
                    }}
                    className="w-full flex items-center justify-between bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-lg px-3 py-2 mt-1 transition-colors"
                  >
                    <span className="text-sm font-medium text-emerald-400">
                      {t("city.viewMarkets", { count: marketsTotal })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
              </div>
            </Section>
          )}

          {hasHalal && (
            <Section title={t("city.halal")} emoji="🕌">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
                {mosques.length > 0 && (
                  <>
                    <p className="text-[12px] text-muted-foreground">
                      {t("city.mosqueCount", { count: mosques.length })}
                    </p>
                    <div className="space-y-1.5">
                      {mosques.map((m) => (
                        <div
                          key={m.id as string}
                          className="flex items-start gap-2 bg-background/40 rounded-lg px-2.5 py-2"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {getField(m, "name") || (m.name as string)}
                            </p>
                            {!!getField(m, "address") && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {getField(m, "address")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {!!getField(city, "halal_food_note") && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                      {t("city.halalFood")}
                    </p>
                    <p className="text-[13px] text-foreground/90 leading-relaxed">
                      {getField(city, "halal_food_note")}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {hasExhibitions && (
            <Section title={t("city.exhibitions")} emoji="🎪">
              <div className="space-y-2">
                {exhibitions.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() =>
                      navigate(`/business/exhibitions/general/${ex.id}`)
                    }
                    className="w-full bg-card hover:bg-emerald-500/5 border border-border/50 hover:border-emerald-500/30 rounded-xl p-3 text-left transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {getField(ex, "name") || ex.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          📅 {ex.start_date} → {ex.end_date}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          📍 {ex.city}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {hasFunFact && (
            <Section title={t("city.funFact")} emoji="✨">
              <div className="bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-4">
                <p
                  className="text-[15px] italic text-foreground/95 leading-relaxed"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  “{getField(city, "fun_fact")}”
                </p>
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

export default CityDetail;
