import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findClosestChinaCity, ChinaCity } from "@/lib/geo";

const STORAGE_KEY = "mizwad_location_v1";

export type BusinessLocationState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "in_china"; city: ChinaCity; distanceKm: number }
  | { status: "outside_china" }
  | { status: "denied" }
  | { status: "unavailable" }
  | { status: "error"; message: string };

interface CachedLocation {
  status: "in_china" | "outside_china";
  city?: ChinaCity;
  distanceKm?: number;
  timestamp: number;
}

export function useBusinessLocation() {
  const [state, setState] = useState<BusinessLocationState>({ status: "idle" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const cached: CachedLocation = JSON.parse(raw);
      if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) return;
      if (cached.status === "in_china" && cached.city) {
        setState({ status: "in_china", city: cached.city, distanceKm: cached.distanceKm ?? 0 });
      } else if (cached.status === "outside_china") {
        setState({ status: "outside_china" });
      }
    } catch {}
  }, []);

  const detect = useCallback(async () => {
    if (!navigator.geolocation) {
      setState({ status: "unavailable" });
      return;
    }
    setState({ status: "requesting" });

    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setState({ status: "denied" });
          else setState({ status: "error", message: err.message });
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });

    if (!position) return;
    const { latitude, longitude } = position.coords;

    const { data: cities, error } = await supabase
      .from("china_cities")
      .select("slug, name_uz, latitude, longitude")
      .eq("is_active", true);

    if (error || !cities) {
      setState({ status: "error", message: "Shaharlar yuklanmadi" });
      return;
    }

    const normalized: ChinaCity[] = (cities as Array<{
      slug: string; name_uz: string; latitude: number | string; longitude: number | string;
    }>).map((c) => ({
      slug: c.slug,
      name_uz: c.name_uz,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
    }));

    const result = findClosestChinaCity(latitude, longitude, normalized, 200);

    if (!result) {
      setState({ status: "outside_china" });
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ status: "outside_china", timestamp: Date.now() }));
      } catch {}
      return;
    }

    setState({ status: "in_china", city: result.city, distanceKm: result.distanceKm });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        status: "in_china",
        city: result.city,
        distanceKm: result.distanceKm,
        timestamp: Date.now(),
      }));
    } catch {}
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { state, detect, reset };
}
