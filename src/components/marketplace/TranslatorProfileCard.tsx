import { Star, MapPin, BadgeCheck, Shield, Clock, Video, MessageCircle, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceTranslator } from "@/pages/TranslatorMarketplace";

const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

const SPECIALIZATIONS: Record<string, string> = {
  medical: "Tibbiyot",
  legal: "Huquqiy",
  it: "IT",
  construction: "Qurilish",
  manufacturing: "Ishlab chiqarish",
  electronics: "Elektronika",
  furniture: "Mebel",
  textile: "To'qimachilik",
  automotive: "Avtomobil",
  trade: "Savdo",
  tourism: "Turizm",
  education: "Ta'lim",
  finance: "Moliya",
  general: "Umumiy"
};

interface TranslatorProfileCardProps {
  translator: MarketplaceTranslator;
  onClick: () => void;
  onBook: () => void;
  onChat: () => void;
}

export const TranslatorProfileCard = ({ translator, onClick, onBook, onChat }: TranslatorProfileCardProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();

  const renderHSKBadges = () => {
    const badges = [];
    
    // Self-declared HSK
    if (translator.self_declared_hsk || translator.hsk_level) {
      const level = translator.self_declared_hsk || translator.hsk_level;
      badges.push(
        <span key="self" className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold text-white",
          level && level >= 5 ? "bg-amber-500" : level && level >= 3 ? "bg-blue-500" : "bg-gray-500"
        )}>
          HSK {level}
        </span>
      );
    }
    
    // Buraq Verified HSK (special badge)
    if (translator.buraq_verified_hsk) {
      badges.push(
        <span key="verified" className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-primary to-accent text-white flex items-center gap-1">
          <Shield className="w-3 h-3" />
          HSK {translator.buraq_verified_hsk} ✓
        </span>
      );
    }
    
    return badges;
  };

  const price = translator.daily_rate || translator.price_per_day || 0;
  const hourlyPrice = translator.hourly_rate || Math.round(price / 8);

  return (
    <div
      className="bg-card rounded-2xl border border-border/50 hover:border-primary/30 transition-all overflow-hidden"
    >
      {/* Card Header - Clickable */}
      <div className="p-4 cursor-pointer" onClick={onClick}>
        <div className="flex items-start gap-4">
          {/* Avatar with Verification Badge */}
          <div className="relative flex-shrink-0">
            <img
              src={translator.avatar_url || AVATAR_PLACEHOLDER}
              alt={getField(translator, 'name')}
              className="w-20 h-20 rounded-xl object-cover"
            />
            {translator.is_verified && (
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full shadow-lg">
                <BadgeCheck className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
            {translator.intro_video_url && (
              <div className="absolute -top-1 -left-1 p-1 bg-red-500 rounded-full">
                <Video className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Name & HSK Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-foreground truncate">{getField(translator, 'name')}</h3>
              {renderHSKBadges()}
            </div>
            
            {/* Location & Age */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{getField(translator, 'city')}</span>
              {translator.age && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{String(translator.age)} yosh</span>
                </>
              )}
              {translator.years_experience && translator.years_experience > 0 && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>{translator.years_experience} yil</span>
                </>
              )}
            </div>

            {/* Specializations */}
            {translator.specializations && translator.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {translator.specializations.slice(0, 3).map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0">
                    {SPECIALIZATIONS[spec.toLowerCase()] || spec}
                  </Badge>
                ))}
                {translator.specializations.length > 3 && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0">
                    +{translator.specializations.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              {/* Rating */}
              {translator.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="font-medium text-foreground">{translator.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-xs">({translator.total_reviews})</span>
                </div>
              )}

              {/* Completed Clients - Xizmat ko'rsatilgan mijozlar */}
              {translator.completed_bookings && translator.completed_bookings > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs">{translator.completed_bookings} mijoz</span>
                </div>
              )}

              {/* Availability */}
              <span className={cn(
                "flex items-center gap-1 text-xs",
                translator.is_available ? "text-emerald-500" : "text-muted-foreground"
              )}>
                <Clock className="w-3 h-3" />
                {translator.is_available ? "Mavjud" : "Band"}
              </span>

              {/* Buraq Verified Badge */}
              {translator.is_verified && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/50 text-primary gap-0.5">
                  <BadgeCheck className="w-3 h-3" />
                  Buraq tasdiqlagan
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer - Pricing & Chat Button */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border/30 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">¥{price}</span>
            <span className="text-xs text-muted-foreground">/kun</span>
          </div>
          {hourlyPrice > 0 && (
            <span className="text-xs text-muted-foreground">¥{hourlyPrice}/soat</span>
          )}
        </div>
        <Button 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); onChat(); }}
          className="gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          Xabar yozish
        </Button>
      </div>
    </div>
  );
};
