import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function cityNameToSlug(cityName: string | null | undefined): string | null {
  if (!cityName) return null;
  return cityName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function useCityExists(cityName: string | null | undefined) {
  const slug = cityNameToSlug(cityName);

  return useQuery({
    queryKey: ["city-exists", slug],
    queryFn: async () => {
      if (!slug) return false;
      const { data, error } = await supabase
        .from("cities")
        .select("slug")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      return !error && !!data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
