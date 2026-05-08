import { useEffect, useMemo, useState } from "react";
import { X, MapPin } from "lucide-react";
import PrayTimes from "praytimes";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_LAT = 41.3111;
const DEFAULT_LNG = 69.2797;
const DEFAULT_CITY = "Tashkent";

const PRAYER_LABELS = {
  fajr: "Bomdod",
  dhuhr: "Peshin",
  asr: "Asr",
  maghrib: "Shom",
  isha: "Xufton",
} as const;

type PrayerKey = keyof typeof PRAYER_LABELS;
const PRAYER_KEYS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

function parseTimeToTimestamp(timeStr: string, baseDate: Date): number {
  const [hh, mm] = timeStr.split(":").map((s) => parseInt(s, 10));
  const d = new Date(baseDate);
  d.setHours(hh, mm, 0, 0);
  return d.getTime();
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0 daqiqa";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} soat ${minutes} daqiqa`;
  return `${minutes} daqiqa`;
}

export const PrayerTimesModal = ({ open, onClose }: Props) => {
  const [now, setNow] = useState(Date.now());
  const [coords, setCoords] = useState({
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    city: DEFAULT_CITY,
  });

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("mizwad_location_v1");
      if (!raw) return;
      const cached = JSON.parse(raw);
      if (cached.status === "in_china" && cached.city) {
        setCoords({
          lat: Number(cached.city.latitude),
          lng: Number(cached.city.longitude),
          city: cached.city.name_uz,
        });
      }
    } catch {}
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [open]);

  const prayers = useMemo(() => {
    const pt = new PrayTimes("Karachi");
    pt.adjust({ asr: "Hanafi" });
    const today = new Date();
    const times = pt.getTimes(today, [coords.lat, coords.lng], "auto", "auto", "24h");
    return PRAYER_KEYS.map((key) => ({
      key,
      label: PRAYER_LABELS[key],
      time: times[key],
      timestamp: parseTimeToTimestamp(times[key], today),
    }));
  }, [coords]);

  const currentIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < prayers.length; i++) {
      if (prayers[i].timestamp <= now) idx = i;
      else break;
    }
    return idx;
  }, [prayers, now]);

  const nextIndex = currentIndex < prayers.length - 1 ? currentIndex + 1 : -1;
  const countdown = nextIndex !== -1 ? formatCountdown(prayers[nextIndex].timestamp - now) : null;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-card border-t sm:border border-border sm:rounded-2xl rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              🕌 Bugungi namoz vaqtlari
            </h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span>{coords.city}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg hover:bg-muted active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-1.5">
          {prayers.map((p, i) => {
            const isCurrent = i === currentIndex;
            const isPast = p.timestamp < now && !isCurrent;
            return (
              <div
                key={p.key}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl border transition-colors",
                  isCurrent && "bg-emerald-500/15 border-emerald-500/40",
                  !isCurrent && !isPast && "bg-card border-border",
                  isPast && "bg-muted/30 border-border/50 opacity-60",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-medium", isCurrent ? "text-emerald-300" : "text-foreground")}>
                    {p.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-medium">
                      Joriy
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-mono text-sm", isCurrent ? "text-emerald-200" : "text-foreground")}>
                    {p.time}
                  </span>
                  {isPast && (
                    <span className="text-[10px] text-muted-foreground">o'tdi</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {countdown && nextIndex !== -1 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-[11px] uppercase tracking-wide text-amber-300/80 font-medium mb-1">
              Keyingi namoz
            </div>
            <div className="text-sm text-foreground">
              <span className="font-semibold">{prayers[nextIndex].label}</span>{" "}
              <span className="text-muted-foreground">({prayers[nextIndex].time})</span>
            </div>
            <div className="text-xs text-amber-200/90 mt-1">
              ⏱️ {countdown} qoldi
            </div>
          </div>
        )}

        {nextIndex === -1 && (
          <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-border">
            <div className="text-xs text-muted-foreground text-center">
              Bugungi barcha namozlar o'tdi. Ertangi namoz Bomdod bilan boshlanadi.
            </div>
          </div>
        )}

        <div className="mt-4 text-[10px] text-muted-foreground/70 leading-relaxed text-center">
          Vaqtlar astronomik hisob-kitob asosida (Karachi metodi, Hanafiy mazhabi). Mahalliy masjid vaqtlari biroz farq qilishi mumkin.
        </div>
      </div>
    </div>
  );
};
