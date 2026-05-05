import { useState, useRef, useMemo } from "react";
import { Star, MapPin, BadgeCheck, Shield, Video, Calendar, Briefcase, MessageCircle, ExternalLink, Award, Play, Pause, Volume2, VolumeX, GraduationCap, Clock, Car, IdCard, ChevronRight, Languages, Info, DollarSign, Phone, FileText } from "lucide-react";
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
import { getFlagEmoji, HSK_BADGE_CLASS, type TranslatorLanguage } from "@/lib/flags";
import type { MarketplaceTranslator } from "@/types/marketplace";

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

// Specializations will use translations from i18n
const getSpecializationTranslation = (t: (key: string) => string, key: string): string => {
  const translations: Record<string, string> = {
    medical: t("translators.specialization.medical"),
    legal: t("translators.specialization.legal"),
    it: t("translators.specialization.it"),
    construction: t("translators.specialization.construction"),
    manufacturing: t("translators.specialization.manufacturing"),
    electronics: t("translators.specialization.electronics"),
    furniture: t("translators.specialization.furniture"),
    textile: t("translators.specialization.textile"),
    automotive: t("translators.specialization.automotive"),
    trade: t("translators.specialization.trade"),
    tourism: t("translators.specialization.tourism"),
    education: t("translators.specialization.education"),
    finance: t("translators.specialization.finance"),
    general: t("translators.specialization.general"),
    business: t("translators.specialization.business"),
    factory: t("translators.specialization.factory"),
  };
  return translations[key.toLowerCase()] || key;
};

// Sample resume data - fully localized in Uzbek
const getSampleResume = (t: (key: string) => string) => [
  { period: "2022 — 2024", title: t("translators.translator"), description: t("translators.cantonFair") },
  { period: "2018 — 2022", title: t("translators.study"), description: t("translators.university") },
];

interface TranslatorDetailSheetProps {
  translator: MarketplaceTranslator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: () => void;
  onChat?: () => void;
}

export const TranslatorDetailSheet = ({ translator, open, onOpenChange, onBook, onChat }: TranslatorDetailSheetProps) => {
  const { t, i18n } = useTranslation();
  const { getField } = useTranslatedField();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [reviewsOpen, setReviewsOpen] = useState(false);
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

  // Language proficiency badges - all neutral, level shown by text only
  const renderLanguageBadges = () => {
    const hskLevel = translator.buraq_verified_hsk || translator.self_declared_hsk || translator.hsk_level || 0;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        <Badge variant="outline" className="bg-secondary/60 text-foreground border-border text-xs">
          {t("translators.languages.uzbekNative")}
        </Badge>
        <Badge variant="outline" className="bg-secondary/60 text-foreground border-border text-xs">
          {t("translators.languages.chinese")} (HSK {hskLevel})
        </Badge>
        <Badge variant="outline" className="bg-secondary/60 text-foreground border-border text-xs">
          {t("translators.languages.english")} (B1)
        </Badge>
      </div>
    );
  };

  const renderHSKSection = () => {
    const selfHsk = translator.self_declared_hsk || translator.hsk_level || 0;
    const verifiedHsk = translator.buraq_verified_hsk;
    return (
      <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          HSK Darajasi
        </h4>

        <div className={cn("grid gap-3", verifiedHsk ? "grid-cols-2" : "grid-cols-1")}>
          {/* Self-declared */}
          <div className="bg-background/50 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">O'zi e'lon qilgan</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-sm font-bold border",
                HSK_BADGE_CLASS(selfHsk)
              )}>
                HSK {selfHsk || "—"}
              </span>
            </div>
          </div>

          {/* Mizwad Verified */}
          {verifiedHsk && (
            <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Mizwad tasdiqlagan
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-sm font-bold bg-emerald-500 text-white flex items-center gap-1">
                  HSK {verifiedHsk}
                  <BadgeCheck className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}
        </div>

        {verifiedHsk && (
          <p className="text-[10px] text-muted-foreground bg-primary/10 rounded-lg p-2">
            ✓ Video intervyu orqali tasdiqlangan ({translator.buraq_verified_at ? new Date(translator.buraq_verified_at as string).toLocaleDateString() : ''})
          </p>
        )}
      </div>
    );
  };

  // Resume timeline section
  const renderResumeSection = () => {
    const resumeData = getSampleResume(t);
    return (
      <div className="px-5 mb-4">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          {t("translators.myResume")}
        </h4>
        <div className="space-y-3">
          {resumeData.map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                {idx < resumeData.length - 1 && (
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
                      
                      {/* Centered Play Button - Mizwad Brand Style */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-primary backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform">
                          <Play className="w-10 h-10 text-primary-foreground ml-1 fill-current" />
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
                          Mizwad Verified
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

            {/* Specializations (PRIORITY — emerald chips) */}
            {translator.specializations && translator.specializations.length > 0 && (
              <div className="px-5 mb-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Mutaxassisliklar
                </h4>
                <div className="flex flex-wrap gap-2">
                  {translator.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium"
                    >
                      {getSpecializationTranslation(t, spec)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages (with verification badges) */}
            {(() => {
              const t2 = translator as Record<string, unknown>;
              let langs: TranslatorLanguage[] = [];
              const raw = t2.languages;
              if (Array.isArray(raw)) langs = raw as unknown as TranslatorLanguage[];
              else if (typeof raw === "string") { try { langs = JSON.parse(raw); } catch { /* noop */ } }
              if (langs.length === 0) return null;
              return (
                <div className="px-5 mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-emerald-400" />
                    Tillar
                  </h4>
                  <div className="space-y-1 bg-muted/30 rounded-xl p-2 border border-border/30">
                    {langs.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl leading-none">{getFlagEmoji(lang.code)}</span>
                          <div>
                            <div className="text-sm font-medium text-foreground">{lang.name}</div>
                            <div className="text-xs text-muted-foreground">{lang.level}</div>
                          </div>
                        </div>
                        {lang.verified && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[11px] font-medium">
                            <BadgeCheck className="w-3 h-3" />
                            Mizwad tasdiqlagan
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Detailed Rating Matrix — REAL DB values with variance */}
            <div className="px-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Baholashlar
                </h4>
                <span className="text-xs text-muted-foreground">{translator.total_reviews || 0} sharh</span>
              </div>
              <div className="space-y-2.5 bg-muted/30 rounded-xl p-4 border border-border/30">
                {(() => {
                  const t2 = translator as Record<string, unknown>;
                  const fallback = Number(translator.rating) || 0;
                  const rows = [
                    { label: "Ishonchlilik", value: Number(t2.rating_reliability) || fallback },
                    { label: "Muzokara san'ati", value: Number(t2.rating_negotiation) || fallback },
                    { label: "Vaqtga rioya qilish", value: Number(t2.rating_punctuality) || fallback },
                    { label: "Bilim darajasi", value: Number(t2.rating_knowledge) || fallback },
                  ];
                  return rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-3.5 h-3.5",
                                star <= Math.round(row.value)
                                  ? "fill-emerald-400 text-emerald-400"
                                  : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium w-8 text-right text-foreground">{row.value.toFixed(1)}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="px-5 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-primary text-lg mb-1">{translator.completed_bookings || 150}+</div>
                  <p className="text-[10px] text-muted-foreground">Xizmat ko'rsatilgan mijozlar</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewsOpen(true)}
                  className="bg-muted/50 rounded-xl p-3 text-center hover:bg-muted/70 transition-colors flex flex-col items-center justify-center relative group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground absolute top-2 right-2 group-hover:translate-x-0.5 transition-transform" />
                  <div className="font-bold text-foreground text-lg mb-1">{translator.total_reviews}</div>
                  <p className="text-[10px] text-muted-foreground">Sharhlar</p>
                </button>
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

            {/* Bio — auto-translated from DB columns (bio_uz/ru/en) */}
            {(() => {
              const t2 = translator as Record<string, unknown>;
              const lang = (i18n.language || "uz").toLowerCase();
              const bio =
                (typeof t2[`bio_${lang}`] === "string" && (t2[`bio_${lang}`] as string).trim()) ||
                (typeof t2.bio_uz === "string" && (t2.bio_uz as string).trim()) ||
                (typeof t2.bio_en === "string" && (t2.bio_en as string).trim()) ||
                (typeof t2.bio === "string" && (t2.bio as string).trim()) ||
                "";
              if (!bio) return null;
              return (
                <div className="px-5 mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Haqida</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                </div>
              );
            })()}

            {/* Resume Timeline Section */}
            {renderResumeSection()}

            {/* Pricing — with fee transparency */}
            <div className="px-5 mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Narxlar
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Kunlik</p>
                  <p className="text-2xl font-bold text-emerald-400">¥{price}</p>
                  <p className="text-xs text-muted-foreground">8 soat ish</p>
                </div>
                <div className="bg-muted/30 border border-border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground mb-1">Soatlik</p>
                  <p className="text-2xl font-bold text-foreground">¥{hourlyPrice}</p>
                  <p className="text-xs text-muted-foreground">+ ovqat alohida</p>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Yakuniy narxga Mizwad xizmat haqi 10% qo'shiladi.</span>
              </div>
            </div>

            {/* Contact / quick info */}
            <div className="px-5 mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                Aloqa
              </h4>
              <div className="space-y-2 text-sm">
                {(() => {
                  const t2 = translator as Record<string, unknown>;
                  const responseTime = t2.response_time_avg as number | null;
                  const availableToday = t2.available_today === true;
                  return (
                    <>
                      {responseTime ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Odatda {responseTime} daqiqada javob beradi</span>
                        </div>
                      ) : null}
                      {availableToday && (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Bugun mavjud</span>
                        </div>
                      )}
                    </>
                  );
                })()}
                {translator.has_personal_car && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Car className="w-3.5 h-3.5" />
                    <span>Avtomobili bor</span>
                  </div>
                )}
                {translator.has_chinese_driving_license && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xitoy haydovchilik guvohnomasi bor</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom spacer (room for sticky CTA) */}
            <div className="pb-24" />
          </div>

          {/* Sticky Bottom CTA — iOS Safari safe (flex-shrink-0 in column flex) */}
          <div className="flex-shrink-0 relative z-10 bg-background/95 backdrop-blur-md border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={onChat}
              >
                <MessageCircle className="w-5 h-5" />
                Xabar yozish
              </Button>
              <Button size="lg" className="flex-[2] gap-2" onClick={onBook}>
                <Calendar className="w-5 h-5" />
                Bron qilish
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>

      {/* Reviews Placeholder Sheet */}
      <Sheet open={reviewsOpen} onOpenChange={setReviewsOpen}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-left">Sharhlar ({translator.total_reviews || 0})</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full -mt-12 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Sharhlar tez orada qo'shiladi
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </Sheet>
  );
};

export default TranslatorDetailSheet;
