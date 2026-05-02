import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, MapPin } from "lucide-react";
import { useCity } from "@/contexts/CityContext";

const PRAYER_TIMES_GUANGZHOU: Record<string, string> = {
  fajr: "05:42",
  dhuhr: "12:15",
  asr: "15:48",
  maghrib: "18:23",
  isha: "19:45",
};

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const PrayerTimeCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedCity } = useCity();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { prayerKey, prayerTime, countdown, isTomorrow } = useMemo(() => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let nextKey: string | null = null;
    for (const key of PRAYER_ORDER) {
      if (toMinutes(PRAYER_TIMES_GUANGZHOU[key]) > currentMinutes) {
        nextKey = key;
        break;
      }
    }
    const tomorrow = nextKey === null;
    const key = nextKey ?? "fajr";
    const time = PRAYER_TIMES_GUANGZHOU[key];
    let diff = toMinutes(time) - currentMinutes;
    if (tomorrow) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return {
      prayerKey: key,
      prayerTime: time,
      countdown: { hours, mins },
      isTomorrow: tomorrow,
    };
  }, [now]);

  const isApprox = selectedCity !== "Guangzhou";

  return (
    <button
      onClick={() => navigate("/ibadah?tab=mosques")}
      className="text-left w-full h-full rounded-2xl p-3 min-h-[120px] bg-primary/10 border border-primary/30 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-2 gap-1">
        <div className="flex items-center gap-1 text-primary min-w-0">
          <Moon className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-medium truncate">{t("home.nextPrayer")}</span>
        </div>
        <div className="flex items-center gap-0.5 text-[10px] text-primary/90 shrink-0">
          <MapPin className="w-2.5 h-2.5" />
          <span className="truncate max-w-[55px]">{selectedCity}</span>
        </div>
      </div>

      <div className="font-display text-xl font-bold text-foreground leading-tight">
        {t(`prayers.${prayerKey}`)}
      </div>
      <div className="text-base text-foreground/90 mt-0.5 font-mono">{prayerTime}</div>

      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
        {countdown.hours > 0 && `${countdown.hours}${t("common.hourShort", "s")} `}
        {countdown.mins}{t("common.minuteShort", "d")} {t("home.timeRemaining")}
        {isApprox && (
          <span className="ml-1 text-gold/90">·{t("home.approximate")}</span>
        )}
        {isTomorrow && (
          <span className="ml-1 text-primary/90">·{t("common.tomorrow", "ertaga")}</span>
        )}
      </div>
    </button>
  );
};
