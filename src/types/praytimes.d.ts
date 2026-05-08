declare module "praytimes" {
  export interface PrayerTimes {
    imsak: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    sunset: string;
    maghrib: string;
    isha: string;
    midnight: string;
  }

  export type CalculationMethod =
    | "MWL" | "ISNA" | "Egypt" | "Makkah" | "Karachi"
    | "Tehran" | "Jafari";

  export default class PrayTimes {
    constructor(method?: CalculationMethod);
    setMethod(method: CalculationMethod): void;
    adjust(params: Record<string, unknown>): void;
    tune(offsets: Record<string, number>): void;
    getTimes(
      date: Date | number[],
      coords: [number, number] | [number, number, number],
      timezone?: number | "auto",
      dst?: 0 | 1 | "auto",
      format?: "24h" | "12h" | "12hNS" | "Float"
    ): PrayerTimes;
  }
}
