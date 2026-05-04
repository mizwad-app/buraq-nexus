import { useTranslation } from "react-i18next";
import { 
  MapPin, 
  Star,
  Navigation,
  Sparkles,
  Utensils,
  Droplets,
  Landmark,
  Train,
  Banknote,
  ChevronRight
} from "lucide-react";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { HalalStatusBadge } from "@/components/icons/HalalStatusIcons";
import { MapNavigationSheet } from "@/components/MapNavigationSheet";
import { PlaceContactInfo } from "@/components/places/PlaceContactInfo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Restaurant {
  id: string;
  name: string;
  city: string;
  country: string;
  cuisine_type: string;
  address: string | null;
  description: string | null;
  rating: number | null;
  rating_service?: number | null;
  rating_taste?: number | null;
  rating_cleanliness?: number | null;
  is_halal_certified: boolean;
  halal_status: 'certified' | 'doubtful' | 'not_halal' | null;
  serves_alcohol: boolean | null;
  halal_status_note: string | null;
  has_prayer_room?: boolean | null;
  has_currency_exchange_nearby?: boolean | null;
  nearest_metro?: string | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  phone_secondary?: string | null;
  email?: string | null;
  website?: string | null;
  working_hours?: string | null;
  working_hours_uz?: string | null;
  working_hours_en?: string | null;
  district?: string | null;
  district_zh?: string | null;
  verification_status?: string | null;
  data_sources?: unknown;
  cuisine_type_label?: string | null;
  halal_certified?: boolean | null;
  halal_certification_source?: string | null;
  [key: string]: unknown;
}

interface RestaurantDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant | null;
}

const RESTAURANT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80";

export const RestaurantDetailSheet = ({ open, onOpenChange, restaurant }: RestaurantDetailSheetProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const [mapOpen, setMapOpen] = useState(false);

  if (!restaurant) return null;

  const status = (restaurant.halal_status || (restaurant.is_halal_certified ? 'certified' : 'not_halal')) as 'certified' | 'doubtful' | 'not_halal';

  const renderRatingBar = (value: number | null | undefined, label: string, color: string) => {
    const rating = value || 0;
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-24">{label}</span>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all", color)}
            style={{ width: `${(rating / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-foreground w-8 text-right">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden">
          {/* Hero Image */}
          <div className="relative h-48 w-full">
            <img
              src={restaurant.image_url || RESTAURANT_FALLBACK_IMAGE}
              alt={getField(restaurant, 'name')}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = RESTAURANT_FALLBACK_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            {/* Halal Badge */}
            <div className="absolute top-4 right-4">
              <div className={cn(
                "rounded-xl p-1.5 shadow-lg backdrop-blur-sm",
                status === 'certified' && "bg-primary/90",
                status === 'doubtful' && "bg-gold/90",
                status === 'not_halal' && "bg-red-500/90"
              )}>
                <HalalStatusBadge 
                  status={status}
                  size={32}
                  showTooltip={false}
                />
              </div>
            </div>

            {/* Title on Image */}
            <div className="absolute bottom-4 left-5 right-5">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg mb-2",
                status === 'certified' && "bg-primary text-white",
                status === 'doubtful' && "bg-gold text-white",
                status === 'not_halal' && "bg-red-500 text-white"
              )}>
                {t(`halal.status.${status}`)}
              </span>
              <h2 className="text-2xl font-display font-bold text-white drop-shadow-lg">
                {getField(restaurant, 'name')}
              </h2>
              <p className="text-white/80 text-sm">{getField(restaurant, 'cuisine_type')}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto h-[calc(90vh-12rem)]">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span>{getField(restaurant, 'address') || `${getField(restaurant, 'city')}, ${restaurant.country}`}</span>
            </div>

            {/* Overall Rating */}
            {restaurant.rating && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-gold/10 rounded-xl">
                <div className="w-14 h-14 rounded-xl bg-gold flex items-center justify-center">
                  <Star className="w-7 h-7 text-white fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{restaurant.rating.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">{t("restaurant.overallRating")}</p>
                </div>
              </div>
            )}

            {/* Detailed Ratings */}
            {(restaurant.rating_service || restaurant.rating_taste || restaurant.rating_cleanliness) && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-3">{t("restaurant.detailedRatings")}</h4>
                <div className="space-y-3 p-4 bg-card rounded-xl border border-border/50">
                  {renderRatingBar(restaurant.rating_service, t("restaurant.service"), "bg-blue-500")}
                  {renderRatingBar(restaurant.rating_taste, t("restaurant.taste"), "bg-gold")}
                  {renderRatingBar(restaurant.rating_cleanliness, t("restaurant.cleanliness"), "bg-primary")}
                </div>
              </div>
            )}

            {/* Facilities */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">{t("restaurant.facilities")}</h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Prayer Room */}
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border",
                  restaurant.has_prayer_room 
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-muted/30 border-border/30"
                )}>
                  <Landmark className={cn(
                    "w-5 h-5",
                    restaurant.has_prayer_room ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{t("restaurant.prayerRoom")}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {restaurant.has_prayer_room ? t("common.available") : t("common.notAvailable")}
                    </p>
                  </div>
                </div>

                {/* Currency Exchange */}
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border",
                  restaurant.has_currency_exchange_nearby 
                    ? "bg-gold/10 border-gold/30" 
                    : "bg-muted/30 border-border/30"
                )}>
                  <Banknote className={cn(
                    "w-5 h-5",
                    restaurant.has_currency_exchange_nearby ? "text-gold" : "text-muted-foreground"
                  )} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{t("restaurant.currencyExchange")}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {restaurant.has_currency_exchange_nearby ? t("restaurant.nearby") : "—"}
                    </p>
                  </div>
                </div>

                {/* Nearest Metro */}
                {restaurant.nearest_metro && (
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-blue-500/10 border-blue-500/30 col-span-2">
                    <Train className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{t("restaurant.nearestMetro")}</p>
                      <p className="text-[10px] text-muted-foreground">{getField(restaurant, 'nearest_metro')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {getField(restaurant, 'description') && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-foreground mb-2">{t("restaurant.about")}</h4>
                <p className="text-sm text-muted-foreground">{getField(restaurant, 'description')}</p>
              </div>
            )}

            {/* Halal Status Note */}
            {getField(restaurant, 'halal_status_note') && (
              <div className={cn(
                "mb-6 p-4 rounded-xl border",
                status === 'certified' && "bg-primary/10 border-primary/30",
                status === 'doubtful' && "bg-gold/10 border-gold/30",
                status === 'not_halal' && "bg-red-500/10 border-red-500/30"
              )}>
                <p className="text-sm text-foreground">{getField(restaurant, 'halal_status_note')}</p>
              </div>
            )}

            {/* Navigate Button */}
            {(restaurant.latitude && restaurant.longitude) && (
              <button
                onClick={() => setMapOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <Navigation className="w-5 h-5" />
                {t("restaurant.openInMaps")}
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Map Navigation */}
      {restaurant.latitude && restaurant.longitude && (
        <MapNavigationSheet
          open={mapOpen}
          onOpenChange={setMapOpen}
          latitude={restaurant.latitude}
          longitude={restaurant.longitude}
          name={getField(restaurant, 'name')}
        />
      )}
    </>
  );
};

export default RestaurantDetailSheet;
