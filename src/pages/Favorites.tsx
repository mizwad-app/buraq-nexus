import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { PlaceDetailSheet, type PlaceType, type PlaceData } from "@/components/travel/PlaceDetailSheet";
import { FavoriteButton } from "@/components/travel/FavoriteButton";
import { getPlaceholderGradient, getPlaceholderIcon } from "@/lib/placePlaceholders";
import { cn } from "@/lib/utils";
import type { FavoritePlaceType } from "@/hooks/useFavorite";

const TYPE_TO_TABLE: Record<FavoritePlaceType, string> = {
  park: "parks",
  mall: "shopping_malls",
  historical: "historical_sites",
  market: "markets",
  restaurant: "restaurants",
  mosque: "mosques",
};

const SECTION_ORDER: { type: FavoritePlaceType; emoji: string; label: string }[] = [
  { type: "historical", emoji: "🏛️", label: "Tarixiy joylar" },
  { type: "mall", emoji: "🛍️", label: "Savdo markazlari" },
  { type: "market", emoji: "🛒", label: "Bozorlar" },
  { type: "park", emoji: "🌳", label: "Parklar" },
  { type: "restaurant", emoji: "🍽️", label: "Restoranlar" },
  { type: "mosque", emoji: "🕌", label: "Masjidlar" },
];

interface FavRow {
  id: string;
  place_id: string;
  place_type: FavoritePlaceType;
}

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { getField } = useTranslatedField();
  useSwipeBack();
  const [groups, setGroups] = useState<Record<FavoritePlaceType, PlaceData[]>>({
    park: [], mall: [], historical: [], market: [], restaurant: [], mosque: [],
  });
  const [fetching, setFetching] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<{ type: PlaceType; data: PlaceData } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setFetching(true);
      const { data: favs } = await supabase
        .from("user_favorites")
        .select("id, place_id, place_type")
        .eq("user_id", user.id);
      const byType: Record<FavoritePlaceType, string[]> = {
        park: [], mall: [], historical: [], market: [], restaurant: [], mosque: [],
      };
      (favs as FavRow[] | null)?.forEach((f) => {
        if (byType[f.place_type]) byType[f.place_type].push(f.place_id);
      });
      const next: Record<FavoritePlaceType, PlaceData[]> = {
        park: [], mall: [], historical: [], market: [], restaurant: [], mosque: [],
      };
      await Promise.all(
        (Object.keys(byType) as FavoritePlaceType[]).map(async (type) => {
          const ids = byType[type];
          if (ids.length === 0) return;
          const { data } = await supabase
            .from(TYPE_TO_TABLE[type] as never)
            .select("*")
            .in("id", ids);
          next[type] = (data as unknown as PlaceData[]) ?? [];
        })
      );
      setGroups(next);
      setFetching(false);
    })();
  }, [user]);

  const total = Object.values(groups).reduce((a, b) => a + b.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background safe-bottom pb-24 px-5 pt-12">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mb-4">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center py-16">
          <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-foreground font-medium">Sevimli qo'shish uchun tizimga kiring</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">
            ❤️ Mening sevimlilarim ({total})
          </h1>
        </div>
      </header>

      <section className="px-5">
        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-foreground font-medium">Sevimli joylar yo'q</p>
            <p className="text-sm mt-1">
              Sayohat sahifasida ❤️ tugmasini bosing.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {SECTION_ORDER.filter((s) => groups[s.type].length > 0).map((section) => {
              const PIcon = getPlaceholderIcon(section.type);
              return (
                <div key={section.type}>
                  <h2 className="text-sm font-semibold text-foreground mb-3">
                    {section.emoji} {section.label} ({groups[section.type].length})
                  </h2>
                  <div className="space-y-3">
                    {groups[section.type].map((place) => (
                      <button
                        key={place.id}
                        onClick={() => {
                          setDetail({ type: section.type as PlaceType, data: place });
                          setDetailOpen(true);
                        }}
                        className="w-full text-left bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/40 transition-all"
                      >
                        <div className="relative h-32 overflow-hidden bg-muted">
                          {place.image_url ? (
                            <img
                              src={place.image_url}
                              alt={getField(place, "name")}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className={cn(
                              "w-full h-full bg-gradient-to-br flex items-center justify-center",
                              getPlaceholderGradient(section.type)
                            )}>
                              <PIcon className="w-10 h-10 text-emerald-500/60" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 z-10">
                            <FavoriteButton placeId={place.id} placeType={section.type} />
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-foreground truncate">{getField(place, "name")}</h3>
                          <p className="text-xs text-muted-foreground">{getField(place, "city") || place.city}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <PlaceDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        place={detail?.data ?? null}
        type={detail?.type ?? "mall"}
      />
    </div>
  );
};

export default Favorites;
