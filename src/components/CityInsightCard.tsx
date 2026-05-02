import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  MapPin, 
  Plane, 
  Train, 
  Store, 
  Factory,
  Calendar,
  ChevronRight,
  Navigation,
  Clock,
  Copy,
  Check
} from "lucide-react";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CityData {
  cityName: string;
  cityNameTranslated: string;
  province: string;
  industries: string[];
  nearestAirport: string;
  airportCode: string;
  trainInfo: string;
  markets: { name: string; nameTranslated: string; address?: string }[];
  upcomingExhibition?: {
    name: string;
    nameTranslated: string;
    date: string;
    phase?: string;
  };
}

interface CityInsightCardProps {
  city: CityData;
  selectedProduct?: string;
  onViewMarkets?: () => void;
  onViewExhibition?: () => void;
}

export const CityInsightCard = ({ 
  city, 
  selectedProduct,
  onViewMarkets,
  onViewExhibition 
}: CityInsightCardProps) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t("business.legalSection.addressCopied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all">
      {/* City Header */}
      <div className="bg-gradient-to-br from-primary/15 to-accent/10 p-4 border-b border-border/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-foreground">
                {city.cityNameTranslated}
              </h3>
              <p className="text-sm text-muted-foreground">{city.province}</p>
            </div>
          </div>
          {city.industries.length > 0 && (
            <div className="flex flex-wrap gap-1 max-w-[140px] justify-end">
              {city.industries.slice(0, 2).map((ind, i) => (
                <span 
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-primary/20 text-[10px] font-medium text-primary"
                >
                  {ind}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Strategic Info */}
      <div className="p-4 space-y-3">
        {/* Production Info */}
        {selectedProduct && (
          <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
            <div className="flex items-start gap-2">
              <Factory className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">
                  {t("sourcing.productionInfo")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedProduct} {t("sourcing.mainlyProducedIn")} {city.cityNameTranslated} ({city.province})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How to Get There */}
        <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-500" />
            {t("sourcing.howToGetThere")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-background/50 rounded-lg p-2">
              <Plane className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-muted-foreground">{t("sourcing.nearestAirport")}</p>
                <p className="text-xs font-medium text-foreground">{city.nearestAirport}</p>
                <p className="text-[10px] text-muted-foreground">{city.airportCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-background/50 rounded-lg p-2">
              <Train className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">{t("sourcing.trainFromGZ")}</p>
                <p className="text-xs font-medium text-foreground">{city.trainInfo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wholesale Markets */}
        {city.markets.length > 0 && (
          <div className="bg-gold/10 rounded-xl p-3 border border-gold/20">
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-gold" />
              {t("sourcing.wholesaleMarkets")}
            </p>
            <div className="space-y-2">
              {city.markets.slice(0, 2).map((market, i) => (
                <div key={i} className="flex items-center justify-between bg-background/50 rounded-lg p-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{market.nameTranslated}</p>
                    {market.address && (
                      <p className="text-[10px] text-muted-foreground truncate">{market.address}</p>
                    )}
                  </div>
                  {market.address && (
                    <button
                      onClick={() => copyToClipboard(market.address!)}
                      className="p-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 transition-colors ml-2"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-primary" />
                      ) : (
                        <Copy className="w-3 h-3 text-gold" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {city.markets.length > 2 && onViewMarkets && (
              <button
                onClick={onViewMarkets}
                className="w-full mt-2 text-xs text-primary hover:underline flex items-center justify-center gap-1"
              >
                {t("sourcing.viewAllMarkets")} ({city.markets.length})
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Upcoming Exhibition */}
        {city.upcomingExhibition && (
          <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              {t("sourcing.upcomingExhibition")}
            </p>
            <div className="flex items-center justify-between bg-background/50 rounded-lg p-2">
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  {city.upcomingExhibition.nameTranslated}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {city.upcomingExhibition.phase && `${city.upcomingExhibition.phase}, `}
                  {city.upcomingExhibition.date}
                </p>
              </div>
              {onViewExhibition && (
                <button
                  onClick={onViewExhibition}
                  className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-purple-500" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityInsightCard;
