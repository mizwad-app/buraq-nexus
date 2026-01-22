import { Star, MapPin, BadgeCheck, Shield, Video, Calendar, Briefcase, MessageCircle, ExternalLink, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MarketplaceTranslator } from "@/pages/TranslatorMarketplace";

const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

// Helper functions for video embedding
const getYoutubeId = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : '';
};

const getVimeoId = (url: string): string => {
  const match = url.match(/vimeo\.com\/(?:.*\/)?([0-9]+)/);
  return match ? match[1] : '';
};

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

interface TranslatorDetailSheetProps {
  translator: MarketplaceTranslator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: () => void;
  onChat?: () => void;
}

export const TranslatorDetailSheet = ({ translator, open, onOpenChange, onBook, onChat }: TranslatorDetailSheetProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();

  if (!translator) return null;

  const price = translator.daily_rate || translator.price_per_day || 0;
  const hourlyPrice = translator.hourly_rate || Math.round(price / 8);

  const renderHSKSection = () => {
    return (
      <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          HSK Darajasi
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Self-declared */}
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">O'zi e'lon qilgan</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-sm font-bold text-white",
                (translator.self_declared_hsk || translator.hsk_level || 0) >= 5 ? "bg-amber-500" : 
                (translator.self_declared_hsk || translator.hsk_level || 0) >= 3 ? "bg-blue-500" : "bg-gray-500"
              )}>
                HSK {translator.self_declared_hsk || translator.hsk_level || "—"}
              </span>
            </div>
          </div>
          
          {/* Buraq Verified */}
          <div className={cn(
            "rounded-xl p-3",
            translator.buraq_verified_hsk 
              ? "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30" 
              : "bg-background/50"
          )}>
            <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Buraq tasdiqlagan
            </p>
            {translator.buraq_verified_hsk ? (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-sm font-bold bg-gradient-to-r from-primary to-accent text-white">
                  HSK {translator.buraq_verified_hsk} ✓
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Tasdiqlanmagan</span>
            )}
          </div>
        </div>
        
        {translator.buraq_verified_hsk && (
          <p className="text-[10px] text-muted-foreground bg-primary/10 rounded-lg p-2">
            ✓ Video intervyu orqali tasdiqlangan ({translator.buraq_verified_at ? new Date(translator.buraq_verified_at as string).toLocaleDateString() : ''})
          </p>
        )}
      </div>
    );
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
        <div className="h-full flex flex-col">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Header Section */}
            <div className="p-5 pb-4">
              <SheetHeader className="text-left">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={translator.avatar_url || AVATAR_PLACEHOLDER}
                      alt={getField(translator, 'name')}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    {translator.is_verified && (
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full shadow-lg">
                        <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-xl mb-1">{getField(translator, 'name')}</SheetTitle>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{getField(translator, 'city')}</span>
                    </div>
                    
                    {translator.is_verified && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                        <BadgeCheck className="w-3 h-3" />
                        Buraq Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </SheetHeader>
            </div>

            {/* Video Preview - Embedded Player */}
            <div className="px-5 mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                Tanishuv videosi (1 daqiqa)
              </h4>
              {translator.intro_video_url ? (
                translator.intro_video_url.includes('youtube') || translator.intro_video_url.includes('youtu.be') ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYoutubeId(translator.intro_video_url)}?rel=0`}
                      title="Tanishuv videosi"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : translator.intro_video_url.includes('vimeo') ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                    <iframe
                      src={`https://player.vimeo.com/video/${getVimeoId(translator.intro_video_url)}`}
                      title="Tanishuv videosi"
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a
                    href={translator.intro_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-xl border border-red-500/20"
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Tanishuv videosi</p>
                      <p className="text-xs text-muted-foreground">Tashqi havola</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground" />
                  </a>
                )
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-muted/80 to-muted/40 border border-border/50 flex flex-col items-center justify-center">
                  <Video className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Video tanishtiruv yaqin orada yuklanadi</p>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="px-5 mb-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{translator.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Reyting</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground mb-1">{translator.total_reviews}</div>
                  <p className="text-[10px] text-muted-foreground">Sharhlar</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground mb-1">{translator.completed_bookings || 0}</div>
                  <p className="text-[10px] text-muted-foreground">Buyurtmalar</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground mb-1">{translator.years_experience || 0}</div>
                  <p className="text-[10px] text-muted-foreground">Yil tajriba</p>
                </div>
              </div>
            </div>

            {/* HSK Section */}
            <div className="px-5 mb-4">
              {renderHSKSection()}
            </div>

            {/* Bio */}
            {getField(translator, 'bio') && (
              <div className="px-5 mb-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Haqida</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getField(translator, 'bio')}
                </p>
              </div>
            )}

            {/* Specializations */}
            {translator.specializations && translator.specializations.length > 0 && (
              <div className="px-5 mb-4">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Mutaxassisliklar
                </h4>
                <div className="flex flex-wrap gap-2">
                  {translator.specializations.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      {SPECIALIZATIONS[spec.toLowerCase()] || spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="px-5 mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Narxlar</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Kunlik</p>
                  <p className="text-2xl font-bold text-primary">¥{price}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Soatlik</p>
                  <p className="text-2xl font-bold text-foreground">¥{hourlyPrice}</p>
                </div>
              </div>
            </div>


            {/* Spacer for bottom button */}
            <div className="h-24" />
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            <div className="flex gap-2">
              {/* Primary: Online Chat */}
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={onChat}
              >
                <MessageCircle className="w-5 h-5" />
                Xabar yozish
              </Button>
              
              {/* Secondary: Book */}
              <Button size="lg" className="flex-1 gap-2" onClick={onBook}>
                <Calendar className="w-5 h-5" />
                Bron qilish
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
