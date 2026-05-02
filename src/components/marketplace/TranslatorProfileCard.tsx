import { Star, MapPin, BadgeCheck, Shield, Clock, Video, MessageCircle, Users, CalendarCheck, Car, IdCard, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceTranslator } from "@/types/marketplace";

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
          level && level >= 5 ? "bg-gold" : level && level >= 3 ? "bg-blue-500" : "bg-gray-500"
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
      {/* Preply-Style Video Preview - Top Section */}
      <div 
        className="relative aspect-video cursor-pointer group"
        onClick={onClick}
      >
        {/* Video Thumbnail / Avatar as Background */}
        <img
          src={translator.avatar_url || AVATAR_PLACEHOLDER}
          alt={getField(translator, 'name')}
          className="w-full h-full object-cover"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Play Button - Preply Pink Style */}
        <div className="absolute bottom-3 left-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
            translator.intro_video_url 
              ? "bg-primary shadow-primary/30" 
              : "bg-muted-foreground/50"
          )}>
            <Play className={cn(
              "w-6 h-6 ml-0.5",
              translator.intro_video_url ? "text-primary-foreground fill-primary-foreground" : "text-white/70"
            )} />
          </div>
        </div>
        
        {/* Video Label */}
        {translator.intro_video_url && (
          <div className="absolute bottom-3 left-[68px]">
            <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
              <Video className="w-3 h-3" />
              Video tanishuv
            </span>
          </div>
        )}
        
        {/* Verification Badge - Top Right */}
        {translator.is_verified && (
          <div className="absolute top-3 right-3 p-1.5 bg-primary rounded-full shadow-lg">
            <BadgeCheck className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        
        {/* Availability Status - Top Left */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm",
            translator.is_available 
              ? "bg-primary/90 text-primary-foreground" 
              : "bg-muted/80 text-muted-foreground"
          )}>
            {translator.is_available ? "Mavjud" : "Band"}
          </span>
        </div>
      </div>

      {/* Card Content - Below Video */}
      <div className="p-4 cursor-pointer" onClick={onClick}>
        <div className="flex items-start gap-3">
          {/* Small Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={translator.avatar_url || AVATAR_PLACEHOLDER}
              alt={getField(translator, 'name')}
              className="w-14 h-14 rounded-xl object-cover border-2 border-background shadow-md -mt-10"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            {/* Name & HSK Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-foreground truncate text-lg">{getField(translator, 'name')}</h3>
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
          </div>
        </div>

        {/* Stats Row - Preply Style */}
        <div className="flex items-center justify-between py-3 mt-2 border-t border-border/50">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="font-bold text-foreground">{translator.rating?.toFixed(1) || "5.0"}</span>
          </div>
          
          {/* Price */}
          <div className="text-center">
            <span className="text-lg font-bold text-foreground">¥{price}</span>
            <span className="text-xs text-muted-foreground">/kun</span>
          </div>
          
          {/* Reviews / Clients */}
          <div className="text-right">
            <span className="font-medium text-foreground">{translator.total_reviews || 0}</span>
            <span className="text-xs text-muted-foreground ml-1">sharhlar</span>
          </div>
          
          {/* Bookings */}
          <div className="text-right">
            <span className="font-medium text-foreground">{translator.completed_bookings || 0}</span>
            <span className="text-xs text-muted-foreground ml-1">mijoz</span>
          </div>
        </div>

        {/* Transport & Specialization Badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {/* Transport Badges */}
          {translator.has_personal_car && (
            <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 bg-primary/15 text-primary border-primary/30 gap-1 font-medium">
              <Car className="w-3 h-3" />
              🚗 Avtomobil
            </Badge>
          )}
          {translator.has_chinese_driving_license && (
            <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 bg-primary/15 text-primary border-primary/30 gap-1 font-medium">
              <IdCard className="w-3 h-3" />
              🪪 Guvohnoma
            </Badge>
          )}
          
          {/* Specializations */}
          {translator.specializations && translator.specializations.slice(0, 2).map((spec, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
              {SPECIALIZATIONS[spec.toLowerCase()] || spec}
            </Badge>
          ))}
          {translator.specializations && translator.specializations.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              +{translator.specializations.length - 2}
            </Badge>
          )}
        </div>
      </div>

      {/* Card Footer - Action Buttons */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border/30 flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={(e) => { e.stopPropagation(); onChat(); }}
          className="flex-1 gap-1.5 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <MessageCircle className="w-4 h-4" />
          Xabar
        </Button>
        <Button 
          size="sm" 
          onClick={(e) => { e.stopPropagation(); onBook(); }}
          className="flex-1 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
        >
          <CalendarCheck className="w-4 h-4" />
          Band qilish
        </Button>
      </div>
    </div>
  );
};
