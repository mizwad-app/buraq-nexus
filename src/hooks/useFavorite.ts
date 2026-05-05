import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type FavoritePlaceType =
  | "park"
  | "mall"
  | "historical"
  | "market"
  | "restaurant"
  | "mosque";

export const useFavorite = (placeId: string | undefined, placeType: FavoritePlaceType) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user || !placeId) {
      setIsFavorite(false);
      return;
    }
    supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("place_id", placeId)
      .eq("place_type", placeType)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setIsFavorite(!!data);
      });
    return () => {
      active = false;
    };
  }, [user, placeId, placeType]);

  const toggle = useCallback(
    async (e?: React.MouseEvent | React.PointerEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (!placeId) return;
      if (!user) {
        toast.error("Sevimli qo'shish uchun tizimga kiring");
        return;
      }
      setLoading(true);
      try {
        if (isFavorite) {
          await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("place_id", placeId)
            .eq("place_type", placeType);
          setIsFavorite(false);
          toast.success("Sevimlilardan olib tashlandi");
        } else {
          await supabase.from("user_favorites").insert({
            user_id: user.id,
            place_id: placeId,
            place_type: placeType,
          });
          setIsFavorite(true);
          toast.success("Sevimlilar ro'yxatiga qo'shildi");
        }
      } catch (err) {
        console.error("favorite toggle failed", err);
        toast.error("Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    },
    [user, placeId, placeType, isFavorite]
  );

  return { isFavorite, toggle, loading };
};
