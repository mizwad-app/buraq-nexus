import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MapPin,
  Clock,
  Car,
  Train,
  Copy,
  Check,
  Navigation,
  MessageCircle,
  Store,
  Ruler,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MapNavigationSheet } from "./MapNavigationSheet";
import { AskAgentButton } from "./SupportChat";
import { useTranslatedField } from "@/hooks/useTranslatedField";

interface MarketDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: {
    id: string;
    name: string;
    name_en?: string | null;
    name_uz?: string | null;
    name_ru?: string | null;
    name_ar?: string | null;
    city: string;
    city_en?: string | null;
    city_uz?: string | null;
    city_ru?: string | null;
    city_ar?: string | null;
    category: string;
    category_en?: string | null;
    category_uz?: string | null;
    category_ru?: string | null;
    category_ar?: string | null;
    description?: string | null;
    description_en?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    description_ar?: string | null;
    address_chinese?: string | null;
    address_en?: string | null;
    address_uz?: string | null;
    address_ru?: string | null;
    travel_tips?: string | null;
    travel_tips_en?: string | null;
    travel_tips_uz?: string | null;
    travel_tips_ru?: string | null;
    working_hours?: string | null;
    market_type?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    [key: string]: unknown;
  } | null;
}

export const MarketDetailSheet = ({ open, onOpenChange, market }: MarketDetailSheetProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [mapSheetOpen, setMapSheetOpen] = useState(false);

  if (!market) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(t("business.legalSection.addressCopied"));
    setTimeout(() => setCopiedField(null), 2000);
  };

  const translatedName = getField(market, 'name');
  const translatedCity = getField(market, 'city');
  const translatedCategory = getField(market, 'category');
  const translatedDescription = getField(market, 'description');
  const translatedTravelTips = getField(market, 'travel_tips');

  // Parse travel tips for icons
  const hasTaxi = translatedTravelTips?.includes('🚕') || translatedTravelTips?.includes('Taxi');
  const hasMetro = translatedTravelTips?.includes('🚇') || translatedTravelTips?.includes('Metro');
  const hasHours = translatedTravelTips?.includes('🕒') || market.working_hours;

  // Extract info from travel tips
  const extractTaxiInfo = () => {
    if (!translatedTravelTips) return null;
    const taxiMatch = translatedTravelTips.match(/(?:🚕\s*)?(?:Taxi|Taksi|Такси)[:\s]+([^.🚇🕒]+)/i);
    return taxiMatch ? taxiMatch[1].trim() : null;
  };

  const extractMetroInfo = () => {
    if (!translatedTravelTips) return null;
    const metroMatch = translatedTravelTips.match(/(?:🚇\s*)?Metro[:\s]+([^.🚕🕒]+)/i);
    return metroMatch ? metroMatch[1].trim() : null;
  };

  const extractDistanceInfo = () => {
    if (!translatedTravelTips) return null;
    const distMatch = translatedTravelTips.match(/\((\d+)km\)/i);
    return distMatch ? `${distMatch[1]}km from Airport` : null;
  };

  const taxiInfo = extractTaxiInfo();
  const metroInfo = extractMetroInfo();
  const distanceInfo = extractDistanceInfo();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-0">
          <SheetHeader className="px-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-left text-lg leading-tight">
                  {translatedName}
                </SheetTitle>
                <p className="text-sm text-muted-foreground font-mono mt-0.5">{market.name}</p>
              </div>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto h-full pb-20 px-5 pt-4 space-y-4">
            {/* Category & Type Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-accent/20 text-sm font-medium text-accent-foreground">
                {translatedCategory}
              </span>
              {market.market_type && (
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  market.market_type === 'wholesale' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {market.market_type === 'wholesale' ? 'Wholesale' : 'Retail'}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {t('business.location')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{translatedCity}</span>
                  <span className="text-xs text-muted-foreground">{String(market.country || 'China')}</span>
                </div>
                
                {market.address_chinese && (
                  <div className="bg-muted/30 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{t('business.addressForTaxi')}</span>
                      <button
                        onClick={() => copyToClipboard(market.address_chinese!, 'address')}
                        className="p-1.5 rounded-lg bg-background hover:bg-muted transition-colors"
                      >
                        {copiedField === 'address' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-mono text-foreground">{market.address_chinese}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Travel Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Taxi Info */}
              {taxiInfo && (
                <div className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Car className="w-4 h-4 text-yellow-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{t('business.taxi')}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{taxiInfo}</p>
                </div>
              )}

              {/* Metro Info */}
              {metroInfo && (
                <div className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Train className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{t('business.metro')}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{metroInfo}</p>
                </div>
              )}

              {/* Working Hours */}
              {market.working_hours && (
                <div className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{t('business.hours')}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{market.working_hours}</p>
                </div>
              )}

              {/* Distance */}
              {distanceInfo && (
                <div className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Ruler className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{t('business.distance')}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{distanceInfo}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {translatedDescription && (
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <h3 className="font-semibold text-foreground mb-2">{t('business.description')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{translatedDescription}</p>
              </div>
            )}

            {/* Full Travel Tips */}
            {translatedTravelTips && (
              <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-4 border border-accent/20">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Train className="w-4 h-4 text-accent" />
                  {t('business.travelTips')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{translatedTravelTips}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Navigate Button */}
              {market.latitude && market.longitude && (
                <button
                  onClick={() => setMapSheetOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition-opacity"
                >
                  <Navigation className="w-5 h-5" />
                  {t('business.openInMaps')}
                </button>
              )}

              {/* Ask Agent */}
              <div className="flex justify-center">
                <AskAgentButton 
                  marketName={`${market.name} (${translatedName})`} 
                  className="w-full justify-center py-3"
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Map Navigation Sheet */}
      {market.latitude && market.longitude && (
        <MapNavigationSheet
          open={mapSheetOpen}
          onOpenChange={setMapSheetOpen}
          latitude={market.latitude}
          longitude={market.longitude}
          name={translatedName}
          address={market.address_chinese || undefined}
        />
      )}
    </>
  );
};
