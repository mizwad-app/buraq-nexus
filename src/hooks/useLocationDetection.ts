import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { findClosestCity, City } from "@/lib/geo";

type DetectionState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "success"; city: City; distanceKm: number }
  | { status: "denied" }
  | { status: "unavailable" }
  | { status: "outside_china" }
  | { status: "error"; message: string };

export function useLocationDetection() {
  const [state, setState] = useState<DetectionState>({ status: "idle" });

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
          if (err.code === err.PERMISSION_DENIED) {
            setState({ status: "denied" });
          } else {
            setState({ status: "error", message: err.message });
          }
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });

    if (!position) return;

    const { latitude, longitude } = position.coords;

    const { data: cities, error } = await supabase
      .from("china_cities")
      .select("slug, name_uz, name_en, latitude, longitude")
      .eq("is_active", true);

    if (error || !cities) {
      setState({ status: "error", message: "Shaharlar yuklanmadi" });
      return;
    }

    const normalized: City[] = (cities as Array<{
      slug: string;
      name_uz: string;
      name_en: string | null;
      latitude: number | string;
      longitude: number | string;
    }>).map((c) => ({
      slug: c.slug,
      name_uz: c.name_uz,
      name_en: c.name_en,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
    }));

    const result = findClosestCity(latitude, longitude, normalized, 200);

    if (!result) {
      setState({ status: "outside_china" });
      return;
    }

    setState({ status: "success", city: result.city, distanceKm: result.distanceKm });

    try {
      sessionStorage.setItem(
        "mizwad_detected_city",
        JSON.stringify({
          slug: result.city.slug,
          name_uz: result.city.name_uz,
          name_en: result.city.name_en,
          timestamp: Date.now(),
        })
      );
    } catch {
      // ignore storage errors
    }
  }, []);

  return { state, detect, reset: () => setState({ status: "idle" }) };
}
