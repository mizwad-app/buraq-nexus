import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface City {
  id: number;
  slug: string;
  name_uz: string;
  name_en: string;
  name_ru: string | null;
  name_ar: string | null;
  name_zh: string | null;
  name_fr: string | null;
  province: string | null;
  country: string;
  country_emoji: string | null;
  is_active: boolean;
  population: number | null;
  timezone: string | null;
  phone_code: string | null;
  nearest_airport_code: string | null;
  nearest_airport_name_en: string | null;
  nearest_airport_name_uz: string | null;
  airport_distance_km: number | null;
  airport_taxi_cost_yuan: number | null;
  airport_taxi_duration_min: number | null;
  factory_count_estimated: number | null;
  main_products_uz: string | null;
  main_products_en: string | null;
  main_products_ru: string | null;
  main_products_ar: string | null;
  main_products_zh: string | null;
  main_products_fr: string | null;
  halal_food_note_uz: string | null;
  halal_food_note_en: string | null;
  halal_food_note_ru: string | null;
  halal_food_note_ar: string | null;
  halal_food_note_zh: string | null;
  halal_food_note_fr: string | null;
  fun_fact_uz: string | null;
  fun_fact_en: string | null;
  fun_fact_ru: string | null;
  fun_fact_ar: string | null;
  fun_fact_zh: string | null;
  fun_fact_fr: string | null;
  data_confidence: string | null;
  [k: string]: unknown;
}

export function useCity(slug: string | undefined) {
  const [data, setData] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (k: string, v: string) => {
            maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
          };
        };
      };
    })
      .from("cities")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data: row }) => {
        if (cancelled) return;
        setData((row as City | null) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading };
}

export function useMosquesByCity(cityName: string | undefined, limit = 3) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!cityName) {
      setData([]);
      return;
    }
    supabase
      .from("mosques")
      .select("*")
      .or(`city_en.eq.${cityName},city.eq.${cityName}`)
      .eq("is_active", true)
      .limit(limit)
      .then(({ data: rows }) => {
        if (!cancelled) setData((rows ?? []) as Record<string, unknown>[]);
      });
    return () => {
      cancelled = true;
    };
  }, [cityName, limit]);

  return { data };
}

export function useMarketsByCity(cityName: string | undefined, limit = 3) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!cityName) {
      setData([]);
      setTotal(0);
      return;
    }
    supabase
      .from("markets")
      .select("*", { count: "exact" })
      .or(`city_en.eq.${cityName},city.eq.${cityName}`)
      .eq("is_active", true)
      .limit(limit)
      .then(({ data: rows, count }) => {
        if (cancelled) return;
        setData((rows ?? []) as Record<string, unknown>[]);
        setTotal(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [cityName, limit]);

  return { data, total };
}
