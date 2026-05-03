import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, CreditCard, Shield, CheckCircle2, AlertCircle, Wallet, Plus, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { format, addDays, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";
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
import type { MarketplaceTranslator } from "@/types/marketplace";

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
  
  // Wallet state
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  
  // Booked dates state
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  // Form state - Multi-day selection
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [serviceType, setServiceType] = useState<'hourly' | 'daily'>('daily');
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Fetch wallet balance and booked dates
  useEffect(() => {
    if (open && user && translator) {
      fetchWalletBalance();
      fetchBookedDates();
    }
  }, [open, user, translator]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching wallet:', error);
        setWalletBalance(0);
        return;
      }

      // If wallet doesn't exist yet, create it with 0 balance.
      if (!data) {
        const { error: insertError } = await supabase
          .from('user_wallets')
          .insert({ user_id: user.id, balance: 0, held_balance: 0 })
          .select('balance')
          .maybeSingle();

        if (insertError) {
          console.error('Error creating wallet:', insertError);
          setWalletBalance(0);
          return;
        }
      }

      setWalletBalance(Number(data?.balance ?? 0));
    } catch (err) {
      console.error('Wallet fetch error:', err);
      setWalletBalance(0);
    }
  };

  const fetchBookedDates = async () => {
    if (!translator) return;
    
    try {
      const { data, error } = await supabase
        .from('translator_bookings')
        .select('booking_date')
        .eq('translator_id', translator.id)
        .in('status', ['pending', 'confirmed', 'in_progress']);
      
      if (error) {
        console.error('Error fetching booked dates:', error);
        return;
      }
      
      const dates = (data || []).map(d => new Date(d.booking_date));
      setBookedDates(dates);
    } catch (err) {
      console.error('Booked dates fetch error:', err);
    }
  };

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      setStep('datetime');
      setBookingComplete(false);
      setSelectedDates([]);
      setStartTime("09:00");
      setEndTime("18:00");
      setServiceType('daily');
      setSpecialization("");
      setLocation("");
      setDescription("");
      setInsufficientBalance(false);
    }
  }, [open]);

  if (!translator) return null;

  const dailyPrice = translator.daily_rate || translator.price_per_day || 0;
  const hourlyPrice = translator.hourly_rate || Math.round(dailyPrice / 8);

  const SERVICE_FEE_RATE = 0.10;

  // What the translator earns (their advertised price × days/hours)
  const calculateTranslatorAmount = () => {
    const numDays = selectedDates.length || 1;
    if (serviceType === 'daily') {
      return dailyPrice * numDays;
    } else {
      const start = parseInt(startTime.split(':')[0]);
      const end = parseInt(endTime.split(':')[0]);
      const hours = Math.max(1, end - start);
      return hours * hourlyPrice * numDays;
    }
  };

  const calculateServiceFee = () => Math.round(calculateTranslatorAmount() * SERVICE_FEE_RATE);

  // What the user pays (translator amount + 10% Buraq fee)
  const calculateTotal = () => Math.round(calculateTranslatorAmount() + calculateServiceFee());

  const calculateHours = () => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return Math.max(1, end - start);
  };

  // Check if a date is already booked
  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => isSameDay(bookedDate, date));
  };

  // Check if a date is disabled (past or booked)
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today) || isDateBooked(date);
  };

  // Handle date selection (toggle)
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const isAlreadySelected = selectedDates.some(d => isSameDay(d, date));
    
    if (isAlreadySelected) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, date)));
    } else {
      setSelectedDates([...selectedDates, date].sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  const handleNext = () => {
    if (step === 'datetime') {
      if (selectedDates.length === 0) {
        toast({ title: "Kamida bir kun tanlang", variant: "destructive" });
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
      // Check wallet balance
      const total = calculateTotal();
      if (walletBalance < total) {
        setInsufficientBalance(true);
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('datetime');
    else if (step === 'payment') setStep('details');
    else if (step === 'confirm') setStep('payment');
    setInsufficientBalance(false);
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      toast({ title: "Iltimos, avval tizimga kiring", variant: "destructive" });
      return;
    }

    if (selectedDates.length === 0) return;

    const totalAmount = calculateTotal();
    
    // Check balance one more time (client-side check for UX only - server validates atomically)
    if (walletBalance < totalAmount) {
      toast({ title: "Balans yetarli emas", variant: "destructive" });
      setStep('payment');
      setInsufficientBalance(true);
      return;
    }

    setLoading(true);
    try {
      // Process each booking date atomically using secure RPC function
      // This prevents race conditions and double-spend attacks
      const bookingResults: { success: boolean; booking_id?: string; new_balance?: number; error?: string }[] = [];
      
      for (const date of selectedDates) {
        const perDayTranslatorAmount = serviceType === 'daily' ? dailyPrice : (calculateHours() * hourlyPrice);
        const perDayServiceFee = Math.round(perDayTranslatorAmount * SERVICE_FEE_RATE);
        const perDayTotal = Math.round(perDayTranslatorAmount + perDayServiceFee);

        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'process_booking_payment',
          {
            p_translator_id: translator.id,
            p_booking_date: format(date, 'yyyy-MM-dd'),
            p_start_time: startTime,
            p_end_time: endTime,
            p_service_type: serviceType,
            p_specialization: specialization || '',
            p_location: location,
            p_description: description || '',
            p_agreed_rate: serviceType === 'daily' ? dailyPrice : hourlyPrice,
            p_total_hours: serviceType === 'hourly' ? calculateHours() : null,
            p_translator_amount: perDayTranslatorAmount,
            p_service_fee: perDayServiceFee,
            p_total_amount: perDayTotal,
          } as never
        );

        if (rpcError) {
          throw rpcError;
        }

        const result = rpcResult as { success?: boolean; error?: string; booking_id?: string; new_balance?: number } | null;
        
        if (!result?.success) {
          // If insufficient balance, show appropriate message
          if (result?.error === 'Insufficient balance') {
            setInsufficientBalance(true);
            setStep('payment');
            toast({ title: "Balans yetarli emas", variant: "destructive" });
            return;
          }
          throw new Error(result?.error || 'Booking failed');
        }
        
        bookingResults.push({
          success: true,
          booking_id: result.booking_id,
          new_balance: result.new_balance
        });
      }

      // Update local wallet balance from the last successful booking
      const lastResult = bookingResults[bookingResults.length - 1];
      if (lastResult?.new_balance !== undefined) {
        setWalletBalance(lastResult.new_balance);
      }

      // Send automated message to translator in chat
      const dateList = selectedDates.map(d => format(d, 'dd.MM.yyyy')).join(', ');
      const chatMessage = `📅 Mijoz ${dateList} kunlari uchun sizni band qildi va to'lovni amalga oshirdi. Jami: ¥${totalAmount}`;
      
      // Find or create conversation
      let conversationId: string | null = null;
      
      const { data: existingConv } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('client_id', user.id)
        .eq('translator_id', translator.id)
        .maybeSingle();
      
      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({
            client_id: user.id,
            translator_id: translator.id,
          })
          .select()
          .single();
        
        if (newConv) {
          conversationId = newConv.id;
        }
      }
      
      // Send system message
      if (conversationId) {
        await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: chatMessage,
            message_type: 'system'
          });
        
        // Update conversation's last_message_at
        await supabase
          .from('chat_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      }

      setBookingComplete(true);
      toast({ title: "Bron tasdiqlandi!", description: `To'lov: ¥${totalAmount} escrow hisobga o'tkazildi.` });
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
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Bron tasdiqlandi!</h3>
          <p className="text-muted-foreground mb-6">
            {getField(translator, 'name')} ga xabar yuborildi. To'lov escrow hisobda saqlanmoqda.
          </p>
          <div className="bg-muted/50 rounded-xl p-4 w-full mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Tanlangan kunlar</span>
              <span className="font-medium">{selectedDates.length} kun</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jami to'lov</span>
              <span className="font-bold text-primary">¥{calculateTotal()}</span>
            </div>
          </div>
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
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
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

            {/* Multi-Day Calendar Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Kunlarni tanlang <span className="text-muted-foreground">({selectedDates.length} tanlangan)</span>
              </label>
              <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  disabled={isDateDisabled}
                  modifiers={{
                    booked: bookedDates
                  }}
                  modifiersStyles={{
                    booked: {
                      backgroundColor: 'hsl(var(--destructive) / 0.2)',
                      color: 'hsl(var(--destructive))',
                      textDecoration: 'line-through'
                    }
                  }}
                  classNames={{
                    day_today: "border-2 border-primary text-foreground bg-transparent",
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  }}
                  className="w-full pointer-events-auto"
                />
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Tanlangan</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-destructive/30" />
                  <span>Band</span>
                </div>
              </div>
            </div>

            {/* Selected Dates Summary */}
            {selectedDates.length > 0 && (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Tanlangan kunlar:</span>
                  <span className="text-lg font-bold text-primary">{selectedDates.length} kun</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.slice(0, 5).map((date, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {format(date, 'dd.MM')}
                    </span>
                  ))}
                  {selectedDates.length > 5 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                      +{selectedDates.length - 5} kun
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-primary/20 flex justify-between items-center">
                  <span className="text-muted-foreground">Jami summa:</span>
                  <span className="text-xl font-bold text-primary">¥{calculateTotal()}</span>
                </div>
              </div>
            )}

            {/* Time Selection (for hourly) */}
            {serviceType === 'hourly' && (
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
            )}
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
        const total = calculateTotal();
        const hasEnoughBalance = walletBalance >= total;
        
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

            {/* Pricing Summary with explicit fee breakdown */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kunlar soni</span>
                <span className="font-medium">{selectedDates.length} kun</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('booking.translatorPrice')} {serviceType === 'hourly' && `(${calculateHours()} soat)`}
                </span>
                <span className="font-medium">¥{calculateTranslatorAmount().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  {t('booking.serviceFee')} ({t('booking.serviceFeeRate')})
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={t('booking.feeInfo.title')}
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="center" className="w-64 p-3">
                      <p className="font-semibold text-sm text-foreground mb-1">
                        {t('booking.feeInfo.title')}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('booking.feeInfo.body')}
                      </p>
                    </PopoverContent>
                  </Popover>
                </span>
                <span className="font-medium">¥{calculateServiceFee().toLocaleString()}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-foreground">{t('booking.totalPayment')}</span>
                <span className="text-2xl font-bold text-primary">¥{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className={cn(
              "p-4 rounded-xl border-2 flex items-center gap-3 transition-colors",
              hasEnoughBalance 
                ? "border-primary bg-primary/5" 
                : "border-destructive bg-destructive/5"
            )}>
              <Wallet className={cn("w-6 h-6", hasEnoughBalance ? "text-primary" : "text-destructive")} />
              <div className="flex-1">
                <p className="font-semibold">Buraq Wallet</p>
                <p className={cn(
                  "text-sm",
                  hasEnoughBalance ? "text-muted-foreground" : "text-destructive"
                )}>
                  Balans: ¥{walletBalance.toLocaleString()}
                </p>
              </div>
              {hasEnoughBalance && (
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                </div>
              )}
            </div>

            {/* Insufficient Balance Warning — based on TOTAL (translator + fee) */}
            {!hasEnoughBalance && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive mb-3">
                      {t('booking.insufficientBalance', {
                        needed: total.toLocaleString(),
                        available: walletBalance.toLocaleString(),
                      })}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-primary text-primary"
                      onClick={() => {
                        toast({ title: "Hamyonni to'ldirish", description: "Bu funksiya tez orada qo'shiladi" });
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Hamyonni to'ldirish
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment methods coming soon */}
            <button disabled className="w-full p-4 rounded-xl border border-border flex items-center gap-3 opacity-50">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
              <div className="text-left flex-1">
                <p className="font-semibold text-muted-foreground">Karta bilan to'lash</p>
                <p className="text-xs text-muted-foreground">Tez orada...</p>
              </div>
            </button>
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
                <span className="text-muted-foreground">Tanlangan kunlar</span>
                <span className="font-medium">{selectedDates.length} kun</span>
              </div>
              <div className="py-2 border-b border-border/50">
                <span className="text-muted-foreground block mb-2">Sanalar:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                      {format(date, 'dd.MM.yyyy')}
                    </span>
                  ))}
                </div>
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
                <span className="font-medium text-right max-w-[60%]">{location}</span>
              </div>
              <div className="py-3 bg-primary/5 rounded-xl px-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarjimon narxi</span>
                  <span className="font-medium">¥{calculateTranslatorAmount().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Buraq xizmat haqi (10%)</span>
                  <span className="font-medium">¥{calculateServiceFee().toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-primary/20">
                  <span className="font-semibold">Jami to'lov</span>
                  <span className="text-xl font-bold text-primary">¥{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Escrow Notice */}
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-start gap-2">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                To'lov escrow hisobda saqlanadi va xizmat tugagandan so'ng tarjimonga o'tkaziladi.
              </p>
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
      case 'payment': 
        const total = calculateTotal();
        return walletBalance >= total ? 'Tasdiqlash' : 'Davom etish';
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
              disabled={loading || (step === 'payment' && walletBalance < calculateTotal())}
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
