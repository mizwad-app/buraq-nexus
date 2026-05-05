import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorite, type FavoritePlaceType } from "@/hooks/useFavorite";

interface Props {
  placeId: string | undefined;
  placeType: FavoritePlaceType;
  className?: string;
  variant?: "card" | "sheet";
}

export const FavoriteButton = ({ placeId, placeType, className, variant = "card" }: Props) => {
  const { isFavorite, toggle } = useFavorite(placeId, placeType);
  const sheet = variant === "sheet";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFavorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
      className={cn(
        "rounded-full flex items-center justify-center transition-all active:scale-90",
        sheet
          ? "w-9 h-9 bg-secondary/70 hover:bg-secondary"
          : "w-9 h-9 bg-black/50 backdrop-blur-md hover:bg-black/70",
        className
      )}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all",
          isFavorite ? "text-red-500 fill-red-500" : sheet ? "text-foreground" : "text-white"
        )}
      />
    </button>
  );
};
