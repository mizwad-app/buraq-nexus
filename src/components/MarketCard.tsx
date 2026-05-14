import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  Store, 
  MapPin, 
  Copy, 
  Check,
  Car,
  Clock,
  Train,
  Navigation
} from "lucide-react";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cityNameToSlug, useCityExists } from "@/hooks/useCityLink";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WholesaleMarket {
  id: string;
  city: string;
  country: string;
  category: string;
  name: string;
  description: string | null;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  address?: string | null;
  address_chinese?: string | null;
  travel_tips?: string | null;
  travel_tips_uz?: string | null;
  travel_tips_ru?: string | null;
  travel_tips_en?: string | null;
  travel_tips_ar?: string | null;
  working_hours?: string | null;
  market_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown;
}

interface MarketCardProps {
  market: WholesaleMarket;
  onClick: () => void;
}

// Parse travel tips to extract structured info
const parseTravelInfo = (tips: string | null | undefined) => {
  if (!tips) return { taxi: null, metro: null, distance: null };
  
  const taxiMatch = tips.match(/(\d{2,3}[-–]\d{2,3}\s*(?:RMB|¥|yuan))/i) || 
                    tips.match(/taxi[:\s]*(\d{2,3}[-–]\d{2,3})/i);
  const metroMatch = tips.match(/(?:Line\s*)?(\d+)[,\s]*(\w+(?:\s+\w+)*\s*(?:Station|站))/i) ||
                     tips.match(/Metro[:\s]*([^,;]+)/i);
  const distanceMatch = tips.match(/(\d+(?:\.\d+)?\s*(?:km|kilometers?))/i);
  
  return {
    taxi: taxiMatch ? taxiMatch[1] || taxiMatch[0] : null,
    metro: metroMatch ? (metroMatch[1] && metroMatch[2] ? `L${metroMatch[1]}, ${metroMatch[2]}` : metroMatch[1]) : null,
    distance: distanceMatch ? distanceMatch[1] : null
  };
};

export const MarketCard = ({ market, onClick }: MarketCardProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const [copied, setCopied] = useState(false);

  const translatedName = getField(market, 'name');
  const translatedCity = getField(market, 'city');
  const translatedTips = getField(market, 'travel_tips');
  const translatedCategory = getField(market, 'category');
  
  const citySlug = cityNameToSlug(translatedCity);
  const { data: cityExists } = useCityExists(translatedCity);
  
  const chineseAddress = market.address_chinese || market.address;
  const travelInfo = parseTravelInfo(translatedTips);
  
  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (chineseAddress) {
      navigator.clipboard.writeText(chineseAddress);
      setCopied(true);
      toast.success(t("business.legalSection.addressCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header with name and type */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {/* Chinese name for taxi */}
            <p className="text-xs text-muted-foreground font-mono truncate">{market.name}</p>
            {/* Translated name */}
            <h3 className="font-semibold text-foreground leading-tight">{translatedName}</h3>
            
            {/* Tags */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-[10px] font-medium text-accent-foreground">
                {translatedCategory}
              </span>
              {market.market_type && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                  market.market_type === 'wholesale' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-gold/20 text-gold'
                )}>
                  {market.market_type === 'wholesale' ? t("business.marketCard.wholesale") : t("business.marketCard.retail")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chinese Address with Copy */}
      {chineseAddress && (
        <div className="mx-4 mb-2 p-2.5 bg-muted/40 rounded-lg border border-border/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground mb-0.5">{t("business.marketCard.addressForTaxi")}</p>
              <p className="text-xs font-mono text-foreground truncate">{chineseAddress}</p>
            </div>
            <button 
              onClick={copyAddress}
              className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-primary" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Icon Grid - Travel Info */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-4 gap-1.5">
          {/* Taxi Fare */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            travelInfo.taxi ? "bg-gold/10" : "bg-muted/30"
          )}>
            <Car className={cn("w-4 h-4 mb-0.5", travelInfo.taxi ? "text-gold" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.taxiFare")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", travelInfo.taxi ? "text-gold" : "text-muted-foreground")}>
              {travelInfo.taxi || "—"}
            </span>
          </div>

          {/* Metro */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            travelInfo.metro ? "bg-blue-500/10" : "bg-muted/30"
          )}>
            <Train className={cn("w-4 h-4 mb-0.5", travelInfo.metro ? "text-blue-500" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.metro")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", travelInfo.metro ? "text-blue-600" : "text-muted-foreground")}>
              {travelInfo.metro || "—"}
            </span>
          </div>

          {/* Hours */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            market.working_hours ? "bg-primary/10" : "bg-muted/30"
          )}>
            <Clock className={cn("w-4 h-4 mb-0.5", market.working_hours ? "text-primary" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.hours")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", market.working_hours ? "text-primary" : "text-muted-foreground")}>
              {market.working_hours || "—"}
            </span>
          </div>

          {/* Distance */}
          <div className={cn(
            "flex flex-col items-center p-2 rounded-lg",
            travelInfo.distance ? "bg-purple-500/10" : "bg-muted/30"
          )}>
            <Navigation className={cn("w-4 h-4 mb-0.5", travelInfo.distance ? "text-purple-500" : "text-muted-foreground/50")} />
            <span className="text-[9px] text-muted-foreground">{t("business.marketCard.distance")}</span>
            <span className={cn("text-[10px] font-semibold truncate max-w-full", travelInfo.distance ? "text-purple-600" : "text-muted-foreground")}>
              {travelInfo.distance || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* City footer */}
      <div className="px-4 py-2 bg-muted/20 border-t border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{translatedCity}, {market.country}</span>
        </div>
        <span className="text-[10px] text-primary font-medium">{t("common.more")} →</span>
      </div>
    </div>
  );
};

export default MarketCard;
