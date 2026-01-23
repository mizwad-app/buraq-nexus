import { useState, useRef } from "react";
import { Star, MapPin, BadgeCheck, Shield, Video, Calendar, Briefcase, MessageCircle, ExternalLink, Award, Play, Pause, Volume2, VolumeX, GraduationCap, Clock, Car, IdCard } from "lucide-react";
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

// Sample resume data - in production this would come from database
const SAMPLE_RESUME = [
  { period: "2022 — 2024", title: "Tarjimon", description: "Canton Fair" },
  { period: "2018 — 2022", title: "O'qish", description: "Guangzhou University" },
];

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

  // Language proficiency badges
  const renderLanguageBadges = () => {
    const hskLevel = translator.buraq_verified_hsk || translator.self_declared_hsk || translator.hsk_level || 0;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
          O'zbek (Native)
        </Badge>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
          Xitoy (HSK {hskLevel})
        </Badge>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
          Ingliz (B1)
        </Badge>
      </div>
    );
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

  // Resume timeline section
  const renderResumeSection = () => {
    return (
      <div className="px-5 mb-4">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          Mening rezyumem
        </h4>
        <div className="space-y-3">
          {SAMPLE_RESUME.map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                {idx < SAMPLE_RESUME.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-1" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-xs text-muted-foreground">{item.period}</p>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
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
                // No Video Placeholder - Professional style with loading message
                <div className="aspect-video rounded-t-3xl overflow-hidden bg-gradient-to-br from-muted to-muted/60 flex flex-col items-center justify-center border-b border-border/30">
                  <div className="w-20 h-20 rounded-full bg-muted-foreground/10 flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium text-center px-8">
                    Video tanishtiruv yuklanmoqda...
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
                    
                    {/* City + Experience Badge */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{getField(translator, 'city')}</span>
                      </div>
                      <span className="text-muted-foreground/30">•</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        {translator.years_experience || 6} yillik tajriba
                      </Badge>
                    </div>
                    
                    {translator.age && (
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="font-medium">Yosh:</span> {String(translator.age)}
                      </div>
                    )}

                    {/* Language Proficiency Badges */}
                    {renderLanguageBadges()}
                    
                    {/* Verification Badge */}
                    {translator.is_verified && (
                      <div className="mt-2">
                        <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                          <BadgeCheck className="w-3 h-3" />
                          Buraq Verified
                        </Badge>
                      </div>
                    )}
                    
                    {/* Transport Badges - Clear Visual */}
                    {(translator.has_personal_car || translator.has_chinese_driving_license) && (
                      <div className="flex flex-wrap gap-2 mt-3 p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                        {translator.has_personal_car && (
                          <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 gap-1.5 text-xs px-3 py-1 font-medium">
                            <Car className="w-3.5 h-3.5" />
                            🚗 Shaxsiy avtomobil
                          </Badge>
                        )}
                        {translator.has_chinese_driving_license && (
                          <Badge variant="outline" className="bg-primary/15 text-primary border-primary/30 gap-1.5 text-xs px-3 py-1 font-medium">
                            <IdCard className="w-3.5 h-3.5" />
                            🪪 Xitoy guvohnomasi
                          </Badge>
                        )}
                      </div>
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
                  { label: "Vaqtga rioya qilish (Punktualnost)", value: translator.rating },
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
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-primary text-lg mb-1">{translator.completed_bookings || 150}+</div>
                  <p className="text-[10px] text-muted-foreground">Xizmat ko'rsatilgan mijozlar</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground text-lg mb-1">{translator.total_reviews}</div>
                  <p className="text-[10px] text-muted-foreground">Sharhlar</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground mb-1">{translator.years_experience || 6}</div>
                  <p className="text-[10px] text-muted-foreground">Yil tajriba</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground mb-1">HSK {translator.hsk_level || "—"}</div>
                  <p className="text-[10px] text-muted-foreground">Til darajasi</p>
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

            {/* Resume Timeline Section */}
            {renderResumeSection()}

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
            <div className="h-28" />
          </div>

          {/* Fixed Bottom Buttons with Social Proof */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
            {/* Social Proof Text */}
            <p className="text-xs text-center text-muted-foreground mb-2">
              Xizmat ko'rsatilgan mijozlar: <span className="text-primary font-semibold">{translator.completed_bookings || 150}+</span>
            </p>
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

export default TranslatorDetailSheet;
