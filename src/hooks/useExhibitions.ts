import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LocationFilter = "all" | "international" | "domestic";

export interface ExhibitionCategoryLite {
  id: number;
  slug: string;
  emoji: string | null;
  name_uz: string | null;
  name_en: string | null;
  name_ru: string | null;
  name_ar?: string | null;
  name_zh?: string | null;
}

export interface ExhibitionWithCategory {
  id: string;
  slug: string | null;
  name: string;
  name_uz: string | null;
  name_en: string | null;
  name_ru: string | null;
  name_ar: string | null;
  name_zh: string | null;
  city: string | null;
  venue: string | null;
  country_code: string | null;
  country_name: string | null;
  start_date: string;
  end_date: string;
  is_international: boolean | null;
  is_active: boolean | null;
  data_confidence: string | null;
  category_id: number | null;
  category?: ExhibitionCategoryLite | null;
  world_rank?: number | null;
  china_rank?: number | null;
  [k: string]: unknown;
}

export interface UseExhibitionsOptions {
  locationFilter?: LocationFilter;
  categoryId?: number | null;
  cityName?: string | null;
  limit?: number;
  activeOnly?: boolean;
  upcomingOnly?: boolean;
}

export function useExhibitions(options: UseExhibitionsOptions = {}) {
  const {
    locationFilter = "all",
    categoryId = null,
    cityName = null,
    limit,
    activeOnly = true,
    upcomingOnly = true,
  } = options;

  const [data, setData] = useState<ExhibitionWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("exhibitions")
          .select(
            `*, category:exhibition_categories!exhibitions_category_id_fkey (id, slug, emoji, name_uz, name_en, name_ru, name_ar, name_zh)`,
          )
          .order("start_date", { ascending: true });

        if (activeOnly) query = query.eq("is_active", true);
        if (upcomingOnly) {
          const today = new Date().toISOString().slice(0, 10);
          query = query.gte("end_date", today);
        }
        if (locationFilter === "international") query = query.eq("is_international", true);
        else if (locationFilter === "domestic") query = query.eq("is_international", false);
        if (categoryId !== null) query = query.eq("category_id", categoryId);
        if (limit) query = query.limit(limit);

        const { data: rows, error: qErr } = await query;
        if (qErr) throw qErr;
        if (!cancelled) {
          setData((rows ?? []) as unknown as ExhibitionWithCategory[]);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locationFilter, categoryId, limit, activeOnly, upcomingOnly]);

  return { data, loading, error };
}

export interface ExhibitionCategory {
  id: number;
  slug: string;
  emoji: string | null;
  name_uz: string | null;
  name_en: string | null;
  name_ru: string | null;
  name_ar: string | null;
  name_zh: string | null;
  sort_order: number | null;
}

export function useExhibitionCategories() {
  const [data, setData] = useState<ExhibitionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: rows } = await supabase
        .from("exhibition_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!cancelled) {
        setData((rows ?? []) as unknown as ExhibitionCategory[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
