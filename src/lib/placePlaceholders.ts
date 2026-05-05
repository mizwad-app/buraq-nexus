import { ShoppingBag, Store, Landmark, UtensilsCrossed, Moon, TreePine, Building2, type LucideIcon } from "lucide-react";

export type PlaceTypeKey = "park" | "mall" | "historical" | "market" | "restaurant" | "mosque";

export const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  park: "from-emerald-500/15 to-emerald-700/10",
  mall: "from-emerald-500/10 to-amber-500/10",
  market: "from-amber-500/10 to-orange-500/10",
  historical: "from-blue-500/10 to-emerald-500/10",
  restaurant: "from-red-500/10 to-amber-500/10",
  mosque: "from-emerald-500/15 to-emerald-700/10",
};

export const PLACEHOLDER_ICONS: Record<string, LucideIcon> = {
  park: TreePine,
  mall: ShoppingBag,
  market: Store,
  historical: Landmark,
  restaurant: UtensilsCrossed,
  mosque: Moon,
};

export const getPlaceholderIcon = (type: string): LucideIcon =>
  PLACEHOLDER_ICONS[type] ?? Building2;

export const getPlaceholderGradient = (type: string): string =>
  PLACEHOLDER_GRADIENTS[type] ?? "from-muted/20 to-muted/40";
