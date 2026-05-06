import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Star,
  Building2,
  TreePine,
  Landmark,
  Store,
  Navigation,
  Phone,
  Globe,
  Clock,
  Copy,
  Sparkles,
  Train,
  Bus,
  Car,
  Wifi,
  CreditCard,
  Coins,
  Accessibility,
  Baby,
  Leaf,
  ParkingCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowUpRight,
  Footprints,
} from "lucide-react";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/travel/FavoriteButton";
import type { FavoritePlaceType } from "@/hooks/useFavorite";

export type PlaceType = "mall" | "park" | "historical" | "market";

export interface PlaceData {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  address_local?: string | null;
  description?: string | null;
  image_url?: string | null;
  gallery_images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  coordinates?: { lat: number; lng: number } | null;
  opening_hours?: Record<string, string> | null;
  phone?: string | null;
  website?: string | null;
  entry_fee?: string | null;
  price_range?: "budget" | "midrange" | "premium" | string | null;
  buraq_recommendation?: string | null;
  mall_brands?: string[] | null;
  amenities?: string[] | null;
  features?: string[] | null;
  transport_info?: { metro?: string; bus?: string; taxi_friendly?: boolean } | null;
  has_prayer_room?: boolean | null;
  has_halal_food?: boolean | null;
  rating?: number | null;
  metro_line?: string | null;
  metro_station?: string | null;
  metro_exit?: string | null;
  walking_distance_meters?: number | null;
  bus_routes?: string | null;
  mizwad_pick_rank?: number | null;
  mizwad_pick_reason_uz?: string | null;
  mizwad_pick_reason_ru?: string | null;
  mizwad_pick_reason_en?: string | null;
  [key: string]: unknown;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: PlaceData | null;
  type: PlaceType;
}

const TYPE_META: Record<PlaceType, { icon: React.ElementType; bg: string; text: string }> = {
  mall: { icon: Building2, bg: "bg-blue-500/10", text: "text-blue-500" },
  park: { icon: TreePine, bg: "bg-emerald-500/10", text: "text-emerald-500" },
  historical: { icon: Landmark, bg: "bg-amber-500/10", text: "text-amber-500" },
  market: { icon: Store, bg: "bg-orange-500/10", text: "text-orange-500" },
};

const AMENITY_ICONS: Record<string, React.ElementType> = {
  prayer_room: Sparkles,
  halal_food: Leaf,
  kids_area: Baby,
  wifi: Wifi,
  parking: ParkingCircle,
  atm: CreditCard,
  currency_exchange: Coins,
  wheelchair_accessible: Accessibility,
};

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function getCurrentDayKey() {
  const idx = new Date().getDay();
  // 0 = sun ... 6 = sat → map to mon-sun
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[idx];
}

function isOpenNow(hours: Record<string, string> | null | undefined): boolean | null {
  if (!hours) return null;
  const dayKey = getCurrentDayKey();
  const range = hours.all || hours[dayKey];
  if (!range) return null;
  const m = range.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = parseInt(m[1]) * 60 + parseInt(m[2]);
  const end = parseInt(m[3]) * 60 + parseInt(m[4]);
  return cur >= start && cur <= end;
}

export const PlaceDetailSheet = ({ open, onOpenChange, place, type }: Props) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [heroError, setHeroError] = useState(false);

  const gallery = useMemo(() => {
    if (!place) return [];
    const arr = (place.gallery_images && place.gallery_images.length > 0)
      ? place.gallery_images
      : (place.image_url ? [place.image_url] : []);
    return arr;
  }, [place]);

  if (!place) return null;

  const lat = place.latitude ?? place.coordinates?.lat ?? null;
  const lng = place.longitude ?? place.coordinates?.lng ?? null;
  const hasLocation = lat != null && lng != null;
  const name = getField(place, "name") || place.name;
  const description = getField(place, "description");
  const buraqTip = getField(place, "buraq_recommendation");
  const localAddress = place.address_local;
  const latinAddress = getField(place, "address") || place.address;
  const cityLabel = getField(place, "city") || place.city;

  const TypeIcon = TYPE_META[type].icon;
  const openStatus = isOpenNow(place.opening_hours);

  const handleDirections = () => {
    if (!hasLocation) return;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const encName = encodeURIComponent(name);
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    if (isIOS) url = `maps://?daddr=${lat},${lng}`;
    else if (isAndroid) url = `geo:${lat},${lng}?q=${lat},${lng}(${encName})`;
    window.open(url, "_blank");
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success(t("place.detail.addressCopied"));
  };

  const renderHours = () => {
    const h = place.opening_hours;
    if (!h) return null;
    if (h.all) {
      return <p className="text-sm text-foreground">{h.all}</p>;
    }
    const today = getCurrentDayKey();
    const dayLabel: Record<string, string> = {
      mon: "Du", tue: "Se", wed: "Cho", thu: "Pa", fri: "Ju", sat: "Sha", sun: "Ya",
    };
    return (
      <div className="space-y-1">
        {DAY_KEYS.map((d) => (
          <div
            key={d}
            className={cn(
              "flex justify-between text-sm py-1 px-2 rounded-md",
              d === today && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span>{dayLabel[d]}</span>
            <span>{h[d] || "—"}</span>
          </div>
        ))}
      </div>
    );
  };

  const brands = place.mall_brands || [];
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 10);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-3xl overflow-hidden flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>{name}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto pb-24">
            {/* Hero */}
            <div className="relative h-48 bg-muted">
              {gallery.length > 0 ? (
                <>
                  <img
                    src={gallery[galleryIdx]}
                    alt={name}
                    className="w-full h-full object-cover"
                    onClick={() => setLightboxIdx(galleryIdx)}
                  />
                  {gallery.length > 1 && (
                    <>
                      <button
                        onClick={() => setGalleryIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setGalleryIdx((i) => (i + 1) % gallery.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/70 flex items-center justify-center"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/60 rounded-full px-2 py-1">
                        {gallery.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setGalleryIdx(i)}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full transition-all",
                              i === galleryIdx ? "bg-foreground w-4" : "bg-foreground/40"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <TypeIcon className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-3 right-3 z-10">
                <FavoriteButton placeId={place.id} placeType={type as FavoritePlaceType} />
              </div>
            </div>

            {/* Title */}
            <div className="px-5 pt-4 pb-3 border-b border-border/50">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-xl font-display font-bold text-foreground flex-1">{name}</h2>
                <Badge variant="secondary" className={cn("flex-shrink-0", TYPE_META[type].bg, TYPE_META[type].text, "border-0")}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {t(`place.type.${type}`)}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {cityLabel}
                </span>
                {place.rating != null && (
                  <span className="flex items-center gap-1 text-gold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {place.rating}
                  </span>
                )}
                {openStatus !== null && (
                  <Badge variant="secondary" className={cn("text-xs", openStatus ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive", "border-0")}>
                    <Clock className="w-3 h-3 mr-1" />
                    {openStatus ? t("place.detail.openNow") : t("place.detail.closedNow")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action row */}
            <div className="px-5 py-3 border-b border-border/50 grid grid-cols-3 gap-2">
              <Button
                size="sm"
                onClick={handleDirections}
                disabled={!hasLocation}
                title={!hasLocation ? t("place.action.noLocation") : undefined}
                className="bg-primary text-primary-foreground"
              >
                <Navigation className="w-4 h-4 mr-1" />
                {t("place.action.directions")}
              </Button>
              {place.phone ? (
                <Button size="sm" variant="outline" onClick={() => window.open(`tel:${place.phone}`, "_self")}>
                  <Phone className="w-4 h-4 mr-1" />
                  {t("place.action.call")}
                </Button>
              ) : <div />}
              {place.website ? (
                <Button size="sm" variant="outline" onClick={() => window.open(place.website!, "_blank")}>
                  <Globe className="w-4 h-4 mr-1" />
                  {t("place.action.website")}
                </Button>
              ) : <div />}
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Mizwad pick reason */}
              {place.mizwad_pick_rank && (place.mizwad_pick_reason_uz || place.mizwad_pick_reason_ru || place.mizwad_pick_reason_en) && (
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-amber-500">
                      Mizwad tavsiyasi #{place.mizwad_pick_rank}
                    </span>
                  </div>
                  <p className="text-sm italic text-foreground/90 leading-relaxed">
                    "{place.mizwad_pick_reason_uz || place.mizwad_pick_reason_ru || place.mizwad_pick_reason_en}"
                  </p>
                </div>
              )}

              {/* Mizwad tip */}
              {buraqTip && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{t("place.detail.buraqTip")}</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{buraqTip}</p>
                </div>
              )}

              {/* About */}
              {description && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("place.detail.about")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </section>
              )}

              {/* Address */}
              {(localAddress || latinAddress) && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("place.detail.address")}</h3>
                  {localAddress && (
                    <button
                      onClick={() => handleCopyAddress(localAddress)}
                      className="w-full text-left p-3 bg-card border border-border/60 rounded-xl flex items-start gap-2 mb-2 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-base font-chinese flex-1 text-foreground">{localAddress}</span>
                      <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </button>
                  )}
                  {latinAddress && (
                    <button
                      onClick={() => handleCopyAddress(latinAddress)}
                      className="w-full text-left text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span className="flex-1">{latinAddress}</span>
                    </button>
                  )}
                </section>
              )}

              {/* Hours */}
              {place.opening_hours && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t("place.detail.hours")}
                  </h3>
                  {renderHours()}
                </section>
              )}

              {/* Entry */}
              {(place.entry_fee || place.price_range) && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("place.detail.entry")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.entry_fee && (
                      <span className="text-sm px-3 py-1 rounded-full bg-secondary/60">
                        {place.entry_fee}
                      </span>
                    )}
                    {place.price_range && (
                      <span className="text-sm px-3 py-1 rounded-full bg-gold/15 text-gold">
                        {t(`place.priceRange.${place.price_range}`)}
                      </span>
                    )}
                  </div>
                </section>
              )}

              {/* Brands */}
              {type === "mall" && brands.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("place.detail.brands")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {visibleBrands.map((b) => (
                      <span key={b} className="bg-secondary/60 rounded-full px-3 py-1 text-sm">{b}</span>
                    ))}
                    {!showAllBrands && brands.length > 10 && (
                      <button
                        onClick={() => setShowAllBrands(true)}
                        className="rounded-full px-3 py-1 text-sm bg-primary/10 text-primary"
                      >
                        {t("place.detail.moreBrands", { count: brands.length - 10 })}
                      </button>
                    )}
                  </div>
                </section>
              )}

              {/* Amenities */}
              {place.amenities && place.amenities.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("place.detail.amenities")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.amenities.map((a) => {
                      const Icon = AMENITY_ICONS[a] || Sparkles;
                      const highlight = a === "prayer_room" || a === "halal_food";
                      return (
                        <span
                          key={a}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm",
                            highlight ? "bg-primary/15 text-primary" : "bg-secondary/60"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {t(`place.amenity.${a}`, a)}
                        </span>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Features */}
              {place.features && place.features.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("place.detail.features")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.features.map((f) => (
                      <span key={f} className="bg-secondary/60 rounded-full px-3 py-1 text-sm">
                        {t(`place.feature.${f}`, f)}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Qanday borish */}
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-500" />
                  Qanday borish
                </h3>
                <div className="space-y-2">
                  {/* TAXI FIRST */}
                  <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Car className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Taxi (DiDi)</div>
                      <div className="text-xs text-muted-foreground">
                        Manzilni Xitoy tilida ko'rsating (yuqorida copy tugmasi)
                      </div>
                    </div>
                  </div>

                  {/* METRO */}
                  {place.metro_line && place.metro_station && (
                    <div className="flex flex-col gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Train className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">Metro</div>
                          <div className="text-sm text-muted-foreground">
                            {place.metro_line} · {place.metro_station} bekati
                          </div>
                        </div>
                      </div>
                      {place.metro_exit && (
                        <div className="ml-7 flex items-center gap-2 text-sm text-emerald-500 font-medium">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Exit {place.metro_exit} dan chiqing</span>
                        </div>
                      )}
                      {place.walking_distance_meters && (
                        <div className="ml-7 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Footprints className="w-3 h-3" />
                          <span>~{place.walking_distance_meters}m piyoda</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BUS */}
                  {(place.bus_routes || place.transport_info?.bus) && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Bus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">Avtobus</div>
                        <div className="text-xs text-muted-foreground">
                          {place.bus_routes || place.transport_info?.bus}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Gallery */}
              {gallery.length > 1 && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{t("place.detail.gallery")}</h3>
                  <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-5 px-5">
                    {gallery.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxIdx(i)}
                        className="snap-start flex-shrink-0 w-32 h-24 rounded-xl overflow-hidden bg-muted"
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-border bg-background/95 backdrop-blur">
            <Button
              onClick={handleDirections}
              disabled={!hasLocation}
              className="w-full bg-primary text-primary-foreground"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {t("place.action.directions")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Lightbox */}
      {lightboxIdx !== null && gallery[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
          >
            <X className="w-5 h-5" />
          </button>
          <img src={gallery[lightboxIdx]} alt="" className="max-w-[95vw] max-h-[90vh] object-contain" />
        </div>
      )}
    </>
  );
};
