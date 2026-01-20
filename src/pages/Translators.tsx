import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  MapPin, 
  Star, 
  BadgeCheck, 
  MessageCircle,
  ChevronLeft,
  Filter,
  Globe,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Translator {
  id: string;
  name: string;
  name_uz?: string | null;
  name_ru?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  city: string;
  city_uz?: string | null;
  city_ru?: string | null;
  city_en?: string | null;
  city_ar?: string | null;
  hsk_level: number | null;
  specializations: string[] | null;
  bio?: string | null;
  bio_uz?: string | null;
  bio_ru?: string | null;
  bio_en?: string | null;
  bio_ar?: string | null;
  price_per_day: number | null;
  is_verified: boolean;
  is_available: boolean;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  phone?: string | null;
  [key: string]: unknown;
}

const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

// WhatsApp and Telegram icons
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const Translators = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getField } = useTranslatedField();
  const [translators, setTranslators] = useState<Translator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedTranslator, setSelectedTranslator] = useState<Translator | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    fetchTranslators();
  }, []);

  const fetchTranslators = async () => {
    try {
      // Use the public view that excludes sensitive contact info (email/phone)
      // Authenticated users will see phone for WhatsApp contact
      const { data, error } = await supabase
        .from("translators_public")
        .select("*")
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false });

      if (error) throw error;
      setTranslators(data || []);
    } catch (error) {
      console.error("Error fetching translators:", error);
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(translators.map(t => t.city))];
    return uniqueCities;
  }, [translators]);

  const filteredTranslators = useMemo(() => {
    if (selectedCity === "all") return translators;
    return translators.filter(t => t.city === selectedCity);
  }, [translators, selectedCity]);

  const openContact = (translator: Translator, method: 'whatsapp' | 'telegram') => {
    const message = encodeURIComponent(
      t("translators.contactMessage", { name: getField(translator, 'name') })
    );
    
    if (method === 'whatsapp' && translator.phone) {
      window.open(`https://wa.me/${translator.phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    } else {
      // Default telegram support
      window.open(`https://t.me/halaltrade_support?text=${message}`, '_blank');
    }
  };

  const renderHSKBadge = (level: number | null) => {
    if (!level) return null;
    
    const colors: Record<number, string> = {
      1: "bg-gray-500",
      2: "bg-blue-400",
      3: "bg-blue-500",
      4: "bg-green-500",
      5: "bg-amber-500",
      6: "bg-red-500",
    };

    return (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold text-white",
        colors[level] || "bg-gray-500"
      )}>
        HSK {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {t("translators.subtitle")}
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mt-1">
              {t("translators.title")}
            </h1>
          </div>
        </div>

        {/* City Filter */}
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder={t("translators.allCities")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("translators.allCities")}</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {/* Translators List */}
      <section className="px-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTranslators.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("translators.noResults")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTranslators.map((translator) => (
              <div
                key={translator.id}
                onClick={() => { setSelectedTranslator(translator); setDetailOpen(true); }}
                className="bg-card rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={translator.avatar_url || AVATAR_PLACEHOLDER}
                      alt={getField(translator, 'name')}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    {translator.is_verified && (
                      <div className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-full">
                        <BadgeCheck className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{getField(translator, 'name')}</h3>
                      {renderHSKBadge(translator.hsk_level)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{getField(translator, 'city')}</span>
                    </div>

                    {/* Specializations */}
                    {translator.specializations && translator.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {translator.specializations.slice(0, 3).map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-muted rounded-full text-[10px] text-muted-foreground">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        {translator.rating > 0 && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-medium">{translator.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-muted-foreground">({translator.total_reviews})</span>
                          </div>
                        )}
                        <span className={cn(
                          "flex items-center gap-1 text-xs",
                          translator.is_available ? "text-emerald-500" : "text-muted-foreground"
                        )}>
                          <Clock className="w-3 h-3" />
                          {translator.is_available ? t("translators.available") : t("translators.busy")}
                        </span>
                      </div>
                      {translator.price_per_day && (
                        <span className="text-sm font-semibold text-primary">
                          ¥{translator.price_per_day}/day
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Translator Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          {selectedTranslator && (
            <div className="h-full overflow-y-auto">
              <SheetHeader className="text-left pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={selectedTranslator.avatar_url || AVATAR_PLACEHOLDER}
                      alt={getField(selectedTranslator, 'name')}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    {selectedTranslator.is_verified && (
                      <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full">
                        <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SheetTitle className="text-xl">{getField(selectedTranslator, 'name')}</SheetTitle>
                      {renderHSKBadge(selectedTranslator.hsk_level)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{getField(selectedTranslator, 'city')}</span>
                    </div>
                    {selectedTranslator.is_verified && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                        <BadgeCheck className="w-3 h-3" />
                        {t("translators.verifiedByBuraq")}
                      </div>
                    )}
                  </div>
                </div>
              </SheetHeader>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{selectedTranslator.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t("translators.rating")}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-foreground mb-1">{selectedTranslator.total_reviews}</div>
                  <p className="text-[10px] text-muted-foreground">{t("translators.reviews")}</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <div className="font-bold text-primary mb-1">
                    {selectedTranslator.price_per_day ? `¥${selectedTranslator.price_per_day}` : "—"}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t("translators.perDay")}</p>
                </div>
              </div>

              {/* Bio */}
              {getField(selectedTranslator, 'bio') && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">{t("translators.about")}</h4>
                  <p className="text-sm text-muted-foreground">{getField(selectedTranslator, 'bio')}</p>
                </div>
              )}

              {/* Specializations */}
              {selectedTranslator.specializations && selectedTranslator.specializations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">{t("translators.specializations")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTranslator.specializations.map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Buttons */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <button
                  onClick={() => openContact(selectedTranslator, 'whatsapp')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                    <WhatsAppIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">{t("translators.contactVia", { method: "WhatsApp" })}</p>
                  </div>
                </button>

                <button
                  onClick={() => openContact(selectedTranslator, 'telegram')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                    <TelegramIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground">Telegram</p>
                    <p className="text-sm text-muted-foreground">{t("translators.contactVia", { method: "Telegram" })}</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Translators;
