import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, CreditCard, Shield, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { format, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { MarketplaceTranslator } from "@/pages/TranslatorMarketplace";

const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

interface BookingSheetProps {
  translator: MarketplaceTranslator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BookingStep = 'datetime' | 'details' | 'payment' | 'confirm';

export const BookingSheet = ({ translator, open, onOpenChange }: BookingSheetProps) => {
  const { t } = useTranslation();
  const { getField } = useTranslatedField();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<BookingStep>('datetime');
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [serviceType, setServiceType] = useState<'hourly' | 'daily'>('daily');
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      setStep('datetime');
      setBookingComplete(false);
      setSelectedDate(undefined);
      setStartTime("09:00");
      setEndTime("18:00");
      setServiceType('daily');
      setSpecialization("");
      setLocation("");
      setDescription("");
    }
  }, [open]);

  if (!translator) return null;

  const dailyPrice = translator.daily_rate || translator.price_per_day || 0;
  const hourlyPrice = translator.hourly_rate || Math.round(dailyPrice / 8);

  const calculateTotal = () => {
    if (serviceType === 'daily') {
      return dailyPrice;
    } else {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      const hours = Math.max(1, end - start);
      return hours * hourlyPrice;
    }
  };

  const calculateHours = () => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return Math.max(1, end - start);
  };

  const handleNext = () => {
    if (step === 'datetime') {
      if (!selectedDate) {
        toast({ title: "Sana tanlang", variant: "destructive" });
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      if (!location.trim()) {
        toast({ title: "Manzilni kiriting", variant: "destructive" });
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('datetime');
    else if (step === 'payment') setStep('details');
    else if (step === 'confirm') setStep('payment');
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Iltimos, avval tizimga kiring", variant: "destructive" });
      return;
    }

    if (!selectedDate) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('translator_bookings')
        .insert({
          translator_id: translator.id,
          client_id: user.id,
          booking_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          service_type: serviceType,
          specialization: specialization || null,
          location: location,
          description: description || null,
          agreed_rate: serviceType === 'daily' ? dailyPrice : hourlyPrice,
          total_hours: serviceType === 'hourly' ? calculateHours() : null,
          total_amount: calculateTotal(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create reminder records (mock - would need edge function for actual notifications)
      const reminderTypes = ['3_days', '1_day', '1_hour'];
      const reminderDates = [
        addDays(selectedDate, -3),
        addDays(selectedDate, -1),
        selectedDate
      ];

      setBookingComplete(true);
      toast({ title: "Buyurtma yuborildi!", description: "Tarjimon tez orada tasdiqlaydi." });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({ title: "Xatolik yuz berdi", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (bookingComplete) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Buyurtma yuborildi!</h3>
          <p className="text-muted-foreground mb-6">
            {getField(translator, 'name')} sizning buyurtmangizni ko'rib chiqadi va tez orada tasdiqlaydi.
          </p>
          <div className="w-full space-y-3">
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Yopish
            </Button>
          </div>
        </div>
      );
    }

    switch (step) {
      case 'datetime':
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Service Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Xizmat turi</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setServiceType('daily')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    serviceType === 'daily' 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-semibold">Kunlik</p>
                  <p className="text-xl font-bold text-primary">¥{dailyPrice}</p>
                </button>
                <button
                  onClick={() => setServiceType('hourly')}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    serviceType === 'hourly' 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <p className="font-semibold">Soatlik</p>
                  <p className="text-xl font-bold text-primary">¥{hourlyPrice}</p>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Sana</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Sana tanlang"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Boshlanish</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Tugash</label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <Clock className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.filter(t => t > startTime).map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Specialization */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Soha (ixtiyoriy)</label>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Sohani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trade">Savdo</SelectItem>
                  <SelectItem value="manufacturing">Ishlab chiqarish</SelectItem>
                  <SelectItem value="electronics">Elektronika</SelectItem>
                  <SelectItem value="furniture">Mebel</SelectItem>
                  <SelectItem value="textile">To'qimachilik</SelectItem>
                  <SelectItem value="medical">Tibbiyot</SelectItem>
                  <SelectItem value="legal">Huquqiy</SelectItem>
                  <SelectItem value="general">Umumiy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Uchrashuv joyi</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bozor, zavod yoki manzil"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Qo'shimcha ma'lumot</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nima uchun tarjimon kerak? Qanday ishlar qilasiz?"
                rows={4}
              />
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Escrow Info */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Buraq Wallet Escrow</h4>
                  <p className="text-sm text-muted-foreground">
                    Pulingiz xavfsiz saqlanadi. Xizmat muvaffaqiyatli tugagandan keyingina tarjimonga o'tkaziladi.
                  </p>
                </div>
              </div>
            </div>

            {/* Mock Payment Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground mb-2 block">To'lov usuli</label>
              
              <button className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-3">
                <Wallet className="w-6 h-6 text-primary" />
                <div className="text-left flex-1">
                  <p className="font-semibold">Buraq Wallet</p>
                  <p className="text-xs text-muted-foreground">Balans: ¥0.00</p>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
              </button>

              <button disabled className="w-full p-4 rounded-xl border border-border flex items-center gap-3 opacity-50">
                <CreditCard className="w-6 h-6 text-muted-foreground" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-muted-foreground">Karta bilan to'lash</p>
                  <p className="text-xs text-muted-foreground">Tez orada...</p>
                </div>
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Hozircha to'lov simulyatsiya qilingan. Tez orada real to'lov qo'shiladi.
              </p>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <h3 className="font-semibold text-lg">Buyurtma tafsilotlari</h3>
            
            {/* Translator Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <img
                src={translator.avatar_url || AVATAR_PLACEHOLDER}
                alt={getField(translator, 'name')}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="font-semibold">{getField(translator, 'name')}</p>
                <p className="text-sm text-muted-foreground">{getField(translator, 'city')}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Sana</span>
                <span className="font-medium">{selectedDate ? format(selectedDate, "PPP") : ""}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Vaqt</span>
                <span className="font-medium">{startTime} - {endTime}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Xizmat turi</span>
                <span className="font-medium">{serviceType === 'daily' ? 'Kunlik' : `Soatlik (${calculateHours()} soat)`}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Manzil</span>
                <span className="font-medium">{location}</span>
              </div>
              <div className="flex justify-between py-3 bg-primary/5 rounded-xl px-3">
                <span className="font-semibold">Jami to'lov</span>
                <span className="text-xl font-bold text-primary">¥{calculateTotal()}</span>
              </div>
            </div>

            {/* Reminders Notice */}
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">
                📅 Sizga eslatmalar yuboriladi: 3 kun oldin, 1 kun oldin va 1 soat oldin.
              </p>
            </div>
          </div>
        );
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 'datetime': return 'Davom etish';
      case 'details': return "To'lovga o'tish";
      case 'payment': return 'Tasdiqlash';
      case 'confirm': return `¥${calculateTotal()} to'lash va bron qilish`;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border/50">
          <SheetHeader className="text-left">
            <SheetTitle>
              {bookingComplete ? 'Muvaffaqiyat!' : step === 'confirm' ? 'Tasdiqlash' : 'Bron qilish'}
            </SheetTitle>
          </SheetHeader>
          
          {/* Progress Steps */}
          {!bookingComplete && (
            <div className="flex gap-2 mt-4">
              {(['datetime', 'details', 'payment', 'confirm'] as BookingStep[]).map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all",
                    i <= ['datetime', 'details', 'payment', 'confirm'].indexOf(step)
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {renderStep()}

        {/* Footer Buttons */}
        {!bookingComplete && (
          <div className="p-4 border-t border-border/50 bg-background flex gap-3">
            {step !== 'datetime' && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Orqaga
              </Button>
            )}
            <Button 
              onClick={step === 'confirm' ? handleConfirmBooking : handleNext}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Yuklanmoqda..." : getButtonText()}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
