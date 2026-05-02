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
      className="text-left w-full rounded-2xl p-4 min-h-[120px] bg-emerald-900/40 border border-emerald-700/50 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-emerald-200">
          <Moon className="w-4 h-4" />
          <span className="text-xs font-medium">{t("home.nextPrayer")}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-200/80 bg-emerald-950/40 px-2 py-0.5 rounded-full">
          <MapPin className="w-3 h-3" />
          <span>{selectedCity}</span>
        </div>
      </div>

      <div className="font-display text-2xl font-bold text-foreground">
        {t(`prayers.${prayerKey}`)}
      </div>
      <div className="text-lg text-emerald-100/90 mt-0.5">{prayerTime}</div>

      <div className="text-[13px] text-muted-foreground mt-1">
        {countdown.hours > 0 && `${countdown.hours} ${t("common.hourShort", "soat")} `}
        {countdown.mins} {t("common.minuteShort", "daqiqa")} {t("home.timeRemaining")}
        {isApprox && (
          <span className="ml-2 text-amber-300/80">· {t("home.approximate")}</span>
        )}
        {isTomorrow && (
          <span className="ml-2 text-emerald-300/80">· {t("common.tomorrow", "ertaga")}</span>
        )}
      </div>
    </button>
  );
};
