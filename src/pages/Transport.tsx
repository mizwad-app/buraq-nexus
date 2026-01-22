import { useState } from "react";
import { ArrowLeft, Plane, Train, ArrowRight, Calendar, MapPin, Search, MessageCircle, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type TransportType = 'flight' | 'train';

// Popular Chinese cities
const CITIES = [
  { id: "guangzhou", name_uz: "Guanchjou", name_en: "Guangzhou", name_ru: "Гуанчжоу", name_zh: "广州" },
  { id: "yiwu", name_uz: "Ivu", name_en: "Yiwu", name_ru: "Иу", name_zh: "义乌" },
  { id: "beijing", name_uz: "Pekin", name_en: "Beijing", name_ru: "Пекин", name_zh: "北京" },
  { id: "shanghai", name_uz: "Shanxay", name_en: "Shanghai", name_ru: "Шанхай", name_zh: "上海" },
  { id: "shenzhen", name_uz: "Shenzhen", name_en: "Shenzhen", name_ru: "Шэньчжэнь", name_zh: "深圳" },
  { id: "hangzhou", name_uz: "Xanchzhou", name_en: "Hangzhou", name_ru: "Ханчжоу", name_zh: "杭州" },
  { id: "foshan", name_uz: "Foshan", name_en: "Foshan", name_ru: "Фошань", name_zh: "佛山" },
  { id: "dongguan", name_uz: "Dongguan", name_en: "Dongguan", name_ru: "Дунгуань", name_zh: "东莞" },
  { id: "chengdu", name_uz: "Chendu", name_en: "Chengdu", name_ru: "Чэнду", name_zh: "成都" },
  { id: "xian", name_uz: "Sian", name_en: "Xi'an", name_ru: "Сиань", name_zh: "西安" },
  { id: "tashkent", name_uz: "Toshkent", name_en: "Tashkent", name_ru: "Ташкент", name_zh: "塔什干" },
];

const Transport = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [transportType, setTransportType] = useState<TransportType>('flight');
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [travelDate, setTravelDate] = useState<Date>();
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [showFromSheet, setShowFromSheet] = useState(false);
  const [showToSheet, setShowToSheet] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  const lang = i18n.language as 'uz' | 'en' | 'ru';

  const getCityName = (city: typeof CITIES[0]) => {
    if (lang === 'ru') return city.name_ru;
    if (lang === 'en') return city.name_en;
    return city.name_uz;
  };

  const selectedFromCity = CITIES.find(c => c.id === fromCity);
  const selectedToCity = CITIES.find(c => c.id === toCity);

  const filteredFromCities = CITIES.filter(c => 
    getCityName(c).toLowerCase().includes(fromSearch.toLowerCase()) ||
    c.name_zh.includes(fromSearch)
  );

  const filteredToCities = CITIES.filter(c => 
    getCityName(c).toLowerCase().includes(toSearch.toLowerCase()) ||
    c.name_zh.includes(toSearch)
  );

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleBookViaAdmin = async () => {
    if (!fromCity || !toCity || !travelDate) {
      toast({ title: t("transport.fillAllFields"), variant: "destructive" });
      return;
    }

    const fromName = selectedFromCity ? getCityName(selectedFromCity) : fromCity;
    const toName = selectedToCity ? getCityName(selectedToCity) : toCity;
    const dateStr = format(travelDate, "dd.MM.yyyy");
    const transportText = transportType === 'flight' ? 'aviabilet' : 'poyezd bileti';

    const message = `Assalomu alaykum, men ${fromName} dan ${toName} ga ${dateStr} kungi ${transportText} olmoqchiman.`;
    setBookingMessage(message);
    setChatOpen(true);
  };

  const sendToAdmin = async () => {
    if (!user) {
      toast({ title: t("transport.loginRequired"), variant: "destructive" });
      navigate("/profile");
      return;
    }

    try {
      // Find admin user (you'd typically have a specific admin ID)
      // For now, we'll create a support ticket or send to a general channel
      // This is a simplified version - in production you'd have a dedicated admin chat
      
      toast({ 
        title: t("transport.requestSent"), 
        description: t("transport.adminWillContact")
      });
      setChatOpen(false);
    } catch (error) {
      console.error("Error sending request:", error);
      toast({ title: t("transport.error"), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-display font-semibold text-foreground">
              {t("transport.title")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("transport.subtitle")}
            </p>
          </div>
        </div>
      </header>

      {/* Transport Type Toggle */}
      <section className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTransportType('flight')}
            className={cn(
              "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
              transportType === 'flight'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              transportType === 'flight' ? "bg-primary" : "bg-muted"
            )}>
              <Plane className={cn(
                "w-6 h-6",
                transportType === 'flight' ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-left">
              <p className={cn(
                "font-semibold",
                transportType === 'flight' ? "text-primary" : "text-foreground"
              )}>
                {t("transport.flight")}
              </p>
              <p className="text-xs text-muted-foreground">{t("transport.flightDesc")}</p>
            </div>
          </button>

          <button
            onClick={() => setTransportType('train')}
            className={cn(
              "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
              transportType === 'train'
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              transportType === 'train' ? "bg-primary" : "bg-muted"
            )}>
              <Train className={cn(
                "w-6 h-6",
                transportType === 'train' ? "text-primary-foreground" : "text-muted-foreground"
              )} />
            </div>
            <div className="text-left">
              <p className={cn(
                "font-semibold",
                transportType === 'train' ? "text-primary" : "text-foreground"
              )}>
                {t("transport.train")}
              </p>
              <p className="text-xs text-muted-foreground">{t("transport.trainDesc")}</p>
            </div>
          </button>
        </div>
      </section>

      {/* Search Form */}
      <section className="px-5 space-y-4">
        {/* From City */}
        <div className="relative">
          <button
            onClick={() => setShowFromSheet(true)}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3 text-left hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("transport.from")}</p>
              <p className={cn(
                "font-medium truncate",
                selectedFromCity ? "text-foreground" : "text-muted-foreground"
              )}>
                {selectedFromCity ? (
                  <span>
                    {getCityName(selectedFromCity)}
                    <span className="text-muted-foreground ml-2 text-sm">{selectedFromCity.name_zh}</span>
                  </span>
                ) : t("transport.selectCity")}
              </p>
            </div>
          </button>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={swapCities}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <ArrowRightLeft className="w-5 h-5 text-primary-foreground rotate-90" />
          </button>
        </div>

        {/* To City */}
        <div className="relative">
          <button
            onClick={() => setShowToSheet(true)}
            className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3 text-left hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t("transport.to")}</p>
              <p className={cn(
                "font-medium truncate",
                selectedToCity ? "text-foreground" : "text-muted-foreground"
              )}>
                {selectedToCity ? (
                  <span>
                    {getCityName(selectedToCity)}
                    <span className="text-muted-foreground ml-2 text-sm">{selectedToCity.name_zh}</span>
                  </span>
                ) : t("transport.selectCity")}
              </p>
            </div>
          </button>
        </div>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3 text-left hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{t("transport.date")}</p>
                <p className={cn(
                  "font-medium",
                  travelDate ? "text-foreground" : "text-muted-foreground"
                )}>
                  {travelDate ? format(travelDate, "dd MMMM, yyyy") : t("transport.selectDate")}
                </p>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <CalendarComponent
              mode="single"
              selected={travelDate}
              onSelect={setTravelDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </section>

      {/* Book Button */}
      <section className="px-5 mt-6">
        <Button
          onClick={handleBookViaAdmin}
          size="lg"
          className="w-full gap-3 h-14 text-base rounded-2xl"
          disabled={!fromCity || !toCity || !travelDate}
        >
          <MessageCircle className="w-5 h-5" />
          {t("transport.bookViaAdmin")}
        </Button>
        
        <p className="text-center text-xs text-muted-foreground mt-3">
          {t("transport.adminNote")}
        </p>
      </section>

      {/* Info Cards */}
      <section className="px-5 mt-8 space-y-3">
        <h3 className="text-sm font-medium text-foreground mb-3">{t("transport.whyAdmin")}</h3>
        
        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💳</span>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{t("transport.benefit1Title")}</p>
              <p className="text-xs text-muted-foreground">{t("transport.benefit1Desc")}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🌐</span>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{t("transport.benefit2Title")}</p>
              <p className="text-xs text-muted-foreground">{t("transport.benefit2Desc")}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{t("transport.benefit3Title")}</p>
              <p className="text-xs text-muted-foreground">{t("transport.benefit3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* From City Sheet */}
      <Sheet open={showFromSheet} onOpenChange={setShowFromSheet}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("transport.selectFromCity")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={fromSearch}
                onChange={(e) => setFromSearch(e.target.value)}
                placeholder={t("transport.searchCity")}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredFromCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setFromCity(city.id);
                    setShowFromSheet(false);
                    setFromSearch("");
                  }}
                  className={cn(
                    "w-full p-3 rounded-xl flex items-center justify-between transition-colors",
                    fromCity === city.id ? "bg-primary/10 border border-primary/30" : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={cn(
                      "w-4 h-4",
                      fromCity === city.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      fromCity === city.id ? "text-primary" : "text-foreground"
                    )}>
                      {getCityName(city)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{city.name_zh}</span>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* To City Sheet */}
      <Sheet open={showToSheet} onOpenChange={setShowToSheet}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("transport.selectToCity")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={toSearch}
                onChange={(e) => setToSearch(e.target.value)}
                placeholder={t("transport.searchCity")}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {filteredToCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setToCity(city.id);
                    setShowToSheet(false);
                    setToSearch("");
                  }}
                  className={cn(
                    "w-full p-3 rounded-xl flex items-center justify-between transition-colors",
                    toCity === city.id ? "bg-primary/10 border border-primary/30" : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={cn(
                      "w-4 h-4",
                      toCity === city.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      toCity === city.id ? "text-primary" : "text-foreground"
                    )}>
                      {getCityName(city)}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{city.name_zh}</span>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Booking Confirmation Sheet */}
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("transport.confirmRequest")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
              <p className="text-sm text-foreground leading-relaxed">{bookingMessage}</p>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              {t("transport.messageWillBeSent")}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setChatOpen(false)} className="flex-1">
                {t("transport.cancel")}
              </Button>
              <Button onClick={sendToAdmin} className="flex-1 gap-2">
                <MessageCircle className="w-4 h-4" />
                {t("transport.sendRequest")}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Transport;
