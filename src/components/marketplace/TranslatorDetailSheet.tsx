import { useState, useRef } from "react";
import { Star, MapPin, BadgeCheck, Shield, Video, Calendar, Briefcase, MessageCircle, ExternalLink, Award, Play, Pause, Volume2, VolumeX } from "lucide-react";
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
const VIDEO_POSTER_PLACEHOLDER = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80";

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!translator) return null;

  const price = translator.daily_rate || translator.price_per_day || 0;
  const hourlyPrice = translator.hourly_rate || Math.round(price / 8);

  // Check if video URL is a direct video file (mp4, webm, etc.)
  const isDirectVideo = translator.intro_video_url && 
    (translator.intro_video_url.includes('.mp4') || 
     translator.intro_video_url.includes('.webm') || 
     translator.intro_video_url.includes('.mov'));
  
  // Check if video is YouTube/Vimeo
  const isYoutube = translator.intro_video_url && 
    (translator.intro_video_url.includes('youtube') || translator.intro_video_url.includes('youtu.be'));
  const isVimeo = translator.intro_video_url && translator.intro_video_url.includes('vimeo');

  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    } else if (isYoutube || isVimeo) {
      // For embedded videos, just show the iframe
      setIsVideoPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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
            
            {/* Preply-Style Video Introduction - TOP SECTION */}
            <div className="relative">
              {translator.intro_video_url ? (
                <div className="relative aspect-video bg-black/90 rounded-t-3xl overflow-hidden">
                  {/* Video or Embed */}
                  {!isVideoPlaying ? (
                    // Thumbnail with Play Button Overlay
                    <div 
                      className="absolute inset-0 cursor-pointer group"
                      onClick={handlePlayVideo}
                    >
                      {/* Poster/Thumbnail */}
                      <img
                        src={translator.avatar_url || VIDEO_POSTER_PLACEHOLDER}
                        alt={getField(translator, 'name')}
                        className="w-full h-full object-cover"
                      />
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                      
                      {/* Centered Play Button - Preply Style */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-foreground ml-1 fill-current" />
                        </div>
                      </div>
                      
                      {/* Video Duration Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5" />
                          1:00 tanishuv
                        </span>
                      </div>
                      
                      {/* Translator Name Overlay */}
                      <div className="absolute bottom-4 right-4">
                        <span className="px-3 py-1.5 rounded-xl bg-primary/90 text-primary-foreground text-sm font-medium">
                          {getField(translator, 'name')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Video Player Active
                    <>
                      {isYoutube ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${getYoutubeId(translator.intro_video_url)}?rel=0&autoplay=1`}
                          title="Tanishuv videosi"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : isVimeo ? (
                        <iframe
                          src={`https://player.vimeo.com/video/${getVimeoId(translator.intro_video_url)}?autoplay=1`}
                          title="Tanishuv videosi"
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      ) : isDirectVideo ? (
                        <div className="relative w-full h-full">
                          <video
                            ref={videoRef}
                            src={translator.intro_video_url}
                            className="w-full h-full object-cover"
                            poster={translator.avatar_url || VIDEO_POSTER_PLACEHOLDER}
                            muted={isMuted}
                            playsInline
                            onEnded={() => setIsVideoPlaying(false)}
                          />
                          {/* Video Controls Overlay */}
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                            <button
                              onClick={handlePlayVideo}
                              className="p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                            >
                              {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>
                            <button
                              onClick={toggleMute}
                              className="p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        // External link fallback
                        <a
                          href={translator.intro_video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20"
                        >
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                              <ExternalLink className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-sm text-foreground font-medium">Videoni ko'rish</p>
                          </div>
                        </a>
                      )}
                    </>
                  )}
                </div>
              ) : (
                // No Video Placeholder - Preply Style
                <div className="aspect-video rounded-t-3xl overflow-hidden bg-gradient-to-br from-muted to-muted/60 flex flex-col items-center justify-center border-b border-border/30">
                  <div className="w-20 h-20 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium text-center px-8">
                    Video tanishtiruv yaqin orada yuklanadi
                  </p>
                </div>
              )}
            </div>

            {/* Header Section - Below Video */}
            <div className="p-5 pb-4">
              <SheetHeader className="text-left">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={translator.avatar_url || AVATAR_PLACEHOLDER}
                      alt={getField(translator, 'name')}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-background shadow-lg -mt-12"
                    />
                    {translator.is_verified && (
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full shadow-lg">
                        <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <SheetTitle className="text-xl mb-1">{getField(translator, 'name')}</SheetTitle>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>{getField(translator, 'city')}</span>
                    </div>
                    
                    {translator.age && (
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Yosh:</span> {String(translator.age)}
                      </div>
                    )}
                    
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

            {/* Detailed Rating Matrix (replaces single rating box) */}
            <div className="px-5 mb-4">
              <div className="space-y-3 bg-muted/30 rounded-xl p-4 border border-border/30">
                {([
                  { label: "Ishonchlilik", value: translator.rating },
                  { label: "Muzokara san'ati", value: translator.rating },
                  { label: "Vaqtga rioya qilish", value: translator.rating },
                  { label: "Bilim darajasi", value: translator.rating },
                ] as const).map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-sm text-foreground/80">{row.label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-4 h-4 transition-colors",
                            star <= Math.round(Number(row.value) || 0)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="px-5 mb-4">
              <div className="grid grid-cols-3 gap-2">
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
