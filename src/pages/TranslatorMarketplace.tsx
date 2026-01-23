import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  MapPin, 
  Star, 
  BadgeCheck, 
  ChevronLeft,
  Filter,
  Clock,
  Video,
  Calendar,
  DollarSign,
  Shield,
  Search,
  SlidersHorizontal,
  X,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { TranslatorProfileCard } from "@/components/marketplace/TranslatorProfileCard";
import { TranslatorDetailSheet } from "@/components/marketplace/TranslatorDetailSheet";
import { BookingSheet } from "@/components/marketplace/BookingSheet";
import { ChatSheet } from "@/components/marketplace/ChatSheet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MarketplaceTranslator {
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
  self_declared_hsk?: number | null;
  buraq_verified_hsk?: number | null;
  buraq_verified_at?: string | null;
  specializations: string[] | null;
  bio?: string | null;
  bio_uz?: string | null;
  bio_ru?: string | null;
  bio_en?: string | null;
  bio_ar?: string | null;
  price_per_day: number | null;
  hourly_rate?: number | null;
  daily_rate?: number | null;
  is_verified: boolean;
  is_available: boolean;
  avatar_url: string | null;
  intro_video_url?: string | null;
  rating: number;
  total_reviews: number;
  total_bookings?: number;
  completed_bookings?: number;
  years_experience?: number;
  age?: number | null;
  gender?: string | null;
  telegram_username?: string | null;
  whatsapp_number?: string | null;
  user_id?: string | null;
  // Transport & Driving fields
  has_personal_car?: boolean | null;
  has_chinese_driving_license?: boolean | null;
  // Rating breakdown averages (computed from reviews)
  avg_reliability?: number | null;
  avg_expertise?: number | null;
  avg_punctuality?: number | null;
  avg_language?: number | null;
  [key: string]: unknown;
}

const SPECIALIZATIONS = [
  { value: 'medical', label: 'Tibbiyot' },
  { value: 'legal', label: 'Huquqiy' },
  { value: 'it', label: 'IT' },
  { value: 'construction', label: 'Qurilish' },
  { value: 'manufacturing', label: 'Ishlab chiqarish' },
  { value: 'electronics', label: 'Elektronika' },
  { value: 'furniture', label: 'Mebel' },
  { value: 'textile', label: "To'qimachilik" },
  { value: 'automotive', label: 'Avtomobil' },
  { value: 'trade', label: 'Savdo' },
  { value: 'tourism', label: 'Turizm' },
  { value: 'education', label: "Ta'lim" },
  { value: 'finance', label: 'Moliya' },
  { value: 'general', label: 'Umumiy' },
];

const TranslatorMarketplace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { getField } = useTranslatedField();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [translators, setTranslators] = useState<MarketplaceTranslator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTranslator, setSelectedTranslator] = useState<MarketplaceTranslator | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Filters
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchTranslators();
  }, []);

  // Handle incoming translator selection from /translators page
  useEffect(() => {
    const selectedId = location.state?.selectedTranslatorId;
    if (selectedId && translators.length > 0) {
      const translator = translators.find(t => t.id === selectedId);
      if (translator) {
        handleChat(translator);
      }
    }
  }, [location.state?.selectedTranslatorId, translators]);

  const fetchTranslators = async () => {
    try {
      const { data, error } = await supabase
        .from("translators")
        .select("*")
        .eq("is_available", true)
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false });

      if (error) throw error;
      setTranslators((data || []) as MarketplaceTranslator[]);
    } catch (error) {
      console.error("Error fetching translators:", error);
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(translators.map(t => t.city).filter(Boolean))];
    return uniqueCities;
  }, [translators]);

  const filteredTranslators = useMemo(() => {
    return translators.filter(translator => {
      // Search filter
      if (searchQuery) {
        const name = getField(translator, 'name').toLowerCase();
        const city = getField(translator, 'city').toLowerCase();
        const query = searchQuery.toLowerCase();
        if (!name.includes(query) && !city.includes(query)) return false;
      }
      
      // City filter
      if (selectedCity !== "all" && translator.city !== selectedCity) return false;
      
      // Specialization filter
      if (selectedSpecialization !== "all") {
        if (!translator.specializations?.includes(selectedSpecialization)) return false;
      }
      
      // Gender filter
      if (selectedGender !== "all" && translator.gender !== selectedGender) return false;
      
      // Price filter
      const price = translator.daily_rate || translator.price_per_day || 0;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      
      // Rating filter
      if (translator.rating < minRating) return false;
      
      // Verified filter
      if (verifiedOnly && !translator.buraq_verified_hsk) return false;
      
      return true;
    });
  }, [translators, searchQuery, selectedCity, selectedSpecialization, selectedGender, priceRange, minRating, verifiedOnly, getField]);

  const clearFilters = () => {
    setSelectedCity("all");
    setSelectedSpecialization("all");
    setSelectedGender("all");
    setPriceRange([0, 2000]);
    setMinRating(0);
    setVerifiedOnly(false);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCity !== "all" || selectedSpecialization !== "all" || 
    selectedGender !== "all" || minRating > 0 || verifiedOnly || searchQuery !== "";

  const handleBooking = (translator: MarketplaceTranslator) => {
    setSelectedTranslator(translator);
    setDetailOpen(false);
    setBookingOpen(true);
  };

  const handleChat = async (translator: MarketplaceTranslator) => {
    if (!user) {
      toast({ title: "Iltimos, avval tizimga kiring", variant: "destructive" });
      return;
    }
    
    try {
      // Check for existing conversation or create new one
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('client_id', user.id)
        .eq('translator_id', translator.id)
        .limit(1)
        .single();
      
      if (existing) {
        setConversationId(existing.id);
      } else {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({
            client_id: user.id,
            translator_id: translator.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        setConversationId(newConv.id);
      }
      
      setSelectedTranslator(translator);
      setDetailOpen(false);
      setChatOpen(true);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({ title: "Chat ochishda xatolik", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <Badge variant="secondary" className="text-[10px]">PRO</Badge>
            </div>
            <h1 className="text-xl font-display font-bold text-foreground mt-1">
              Tarjimonlar Marketplace
            </h1>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ism yoki shahar bo'yicha qidirish..."
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <Button 
            variant={hasActiveFilters ? "default" : "outline"} 
            size="icon"
            onClick={() => setFilterOpen(true)}
            className="relative"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
        </div>

        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCity !== "all" && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="w-3 h-3" />
                {selectedCity}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCity("all")} />
              </Badge>
            )}
            {selectedSpecialization !== "all" && (
              <Badge variant="secondary" className="gap-1">
                <Briefcase className="w-3 h-3" />
                {selectedSpecialization}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSpecialization("all")} />
              </Badge>
            )}
            {verifiedOnly && (
              <Badge variant="secondary" className="gap-1 bg-primary/20">
                <Shield className="w-3 h-3" />
                Buraq Verified
                <X className="w-3 h-3 cursor-pointer" onClick={() => setVerifiedOnly(false)} />
              </Badge>
            )}
            <button 
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Hammasini tozalash
            </button>
          </div>
        )}
      </header>

      {/* Results Count */}
      <div className="px-5 py-3 border-b border-border/30">
        <p className="text-sm text-muted-foreground">
          {filteredTranslators.length} tarjimon topildi
        </p>
      </div>

      {/* Translators Grid */}
      <section className="px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTranslators.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tarjimonlar topilmadi
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Boshqa filterni sinab ko'ring
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Filtrlarni tozalash
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTranslators.map((translator) => (
              <TranslatorProfileCard
                key={translator.id}
                translator={translator}
                onClick={() => { setSelectedTranslator(translator); setDetailOpen(true); }}
                onBook={() => handleBooking(translator)}
                onChat={() => handleChat(translator)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Filter Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Filtrlar</SheetTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Qayta o'rnatish
              </Button>
            </div>
          </SheetHeader>
          
          <div className="space-y-6 overflow-y-auto h-[calc(100%-100px)]">
            {/* City Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Shahar
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Barcha shaharlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha shaharlar</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialization Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Mutaxassislik
              </label>
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Barcha mutaxassisliklar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha mutaxassisliklar</SelectItem>
                  {SPECIALIZATIONS.map(spec => (
                    <SelectItem key={spec.value} value={spec.value}>{spec.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Jins
              </label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="male">Erkak</SelectItem>
                  <SelectItem value="female">Ayol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Narx oralig'i (¥/kun)
              </label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={2000}
                  step={50}
                  className="mt-4"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>¥{priceRange[0]}</span>
                  <span>¥{priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Minimal reyting
              </label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg border transition-all",
                      minRating === rating 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {rating > 0 && <Star className="w-3 h-3 fill-amber-500 text-amber-500" />}
                    <span className="text-sm">{rating === 0 ? "Barchasi" : `${rating}+`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Buraq tasdiqlagan HSK</p>
                  <p className="text-xs text-muted-foreground">Video intervyu orqali tasdiqlangan</p>
                </div>
              </div>
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={cn(
                  "w-12 h-6 rounded-full transition-all",
                  verifiedOnly ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "w-5 h-5 bg-white rounded-full transition-all shadow-sm",
                  verifiedOnly ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
            <Button className="w-full" onClick={() => setFilterOpen(false)}>
              {filteredTranslators.length} natijani ko'rsatish
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Translator Detail Sheet */}
      <TranslatorDetailSheet
        translator={selectedTranslator}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onBook={() => selectedTranslator && handleBooking(selectedTranslator)}
        onChat={() => selectedTranslator && handleChat(selectedTranslator)}
      />

      {/* Booking Sheet */}
      <BookingSheet
        translator={selectedTranslator}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />

      {/* Chat Sheet */}
      <ChatSheet
        conversationId={conversationId}
        recipientName={selectedTranslator ? getField(selectedTranslator, 'name') : ''}
        recipientAvatar={selectedTranslator?.avatar_url}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  );
};

export default TranslatorMarketplace;
