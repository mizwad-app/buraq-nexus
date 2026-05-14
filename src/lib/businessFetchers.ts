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
  const dedup = new Map<string, Record<string, unknown>>();

  // Primary source: M:N bridge `exhibition_category_links` joined via exhibition_categories.slug
  const { data: catRow } = await supabase
    .from("exhibition_categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (catRow?.id) {
    const { data: links } = await supabase
      .from("exhibition_category_links")
      .select("exhibitions(*)")
      .eq("category_id", catRow.id);
    for (const r of (links ?? []) as Array<{ exhibitions: Record<string, unknown> | null }>) {
      const ex = r.exhibitions;
      if (ex && ex.id) dedup.set(ex.id as string, ex);
    }
  }

  // Legacy junction
  const { data: junction } = await supabase
    .from("category_exhibitions")
    .select("exhibition_id, exhibitions(*)")
    .eq("category_slug", categorySlug);
  for (const r of (junction ?? []) as Array<{ exhibitions: Record<string, unknown> | null }>) {
    const ex = r.exhibitions;
    if (ex && ex.id) dedup.set(ex.id as string, ex);
  }

  if (dedup.size === 0) {
    const { data } = await supabase.from("exhibitions").select("*").eq("is_active", true);
    for (const e of ((data ?? []) as Record<string, unknown>[])) {
      if (matchesCategory(e.category as string, categorySlug, categoryName) && e.id) {
        dedup.set(e.id as string, e);
      }
    }
  }

  return Array.from(dedup.values()).filter((e) => e.is_active !== false);
}
