import { supabase } from "@/integrations/supabase/client";
import { matchesCategory } from "./businessCategoryMatch";

export async function fetchMarketsForCategory(categorySlug: string, categoryName?: string) {
  const { data: junction } = await supabase
    .from("category_markets")
    .select("market_id, wholesale_markets(*)")
    .eq("category_slug", categorySlug);

  let markets = (junction ?? [])
    .map((r: { wholesale_markets: unknown }) => r.wholesale_markets)
    .filter(Boolean) as Record<string, unknown>[];

  if (markets.length === 0) {
    const { data } = await supabase.from("wholesale_markets").select("*").eq("is_active", true);
    markets = ((data ?? []) as Record<string, unknown>[]).filter((m) =>
      matchesCategory(m.category as string, categorySlug, categoryName)
    );
  }
  return markets;
}

export async function fetchExhibitionsForCategory(categorySlug: string, categoryName?: string) {
  const { data: junction } = await supabase
    .from("category_exhibitions")
    .select("exhibition_id, exhibitions(*)")
    .eq("category_slug", categorySlug);

  let exhibitions = (junction ?? [])
    .map((r: { exhibitions: unknown }) => r.exhibitions)
    .filter(Boolean) as Record<string, unknown>[];

  if (exhibitions.length === 0) {
    const { data } = await supabase.from("exhibitions").select("*").eq("is_active", true);
    exhibitions = ((data ?? []) as Record<string, unknown>[]).filter((e) =>
      matchesCategory(e.category as string, categorySlug, categoryName)
    );
  }
  return exhibitions;
}
