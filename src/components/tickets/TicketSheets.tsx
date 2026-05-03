import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus, Minus, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PHONE_REGEX = /^\+(998|86)\d{7,12}$/;
const CITY_SUGGESTIONS = [
  "Tashkent", "Beijing", "Shanghai", "Guangzhou",
  "Urumqi", "Almaty", "Istanbul", "Dubai",
];

interface BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function CityInput({
  value, onChange, placeholder, id,
}: { value: string; onChange: (v: string) => void; placeholder: string; id: string }) {
  return (
    <>
      <Input
        id={id}
        list={`${id}-list`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <datalist id={`${id}-list`}>
        {CITY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
      </datalist>
    </>
  );
}

function Stepper({
  label, value, onChange, min = 0, max = 9,
}: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-40"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-6 text-center font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function FlightTicketSheet({ open, onOpenChange, onSubmitted }: BaseProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tripType, setTripType] = useState<"one_way" | "round_trip">("round_trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(todayStr());
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState<"economy" | "business" | "first">("economy");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPhoneError("");
  }, [open]);

  const phoneValid = PHONE_REGEX.test(phone);
  const isValid = origin.trim() && destination.trim() && departureDate &&
    (tripType === "one_way" || returnDate) && phoneValid;

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t("services.loginRequired") || "Iltimos, avval tizimga kiring");
      return;
    }
    if (!phoneValid) {
      setPhoneError(t("tickets.form.phoneInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      const ticketDetails = {
        trip_type: tripType, origin, destination,
        departure_date: departureDate,
        return_date: tripType === "round_trip" ? returnDate : null,
        passengers: { adults, children, infants },
        class: travelClass, phone,
      };
      const { error } = await supabase.from("service_requests").insert({
        user_id: user.id,
        service_type: "flight_ticket",
        title: `${t("tickets.flight")}: ${origin} → ${destination}`,
        description: notes || null,
        status: "pending",
        ticket_details: ticketDetails,
      } as any);
      if (error) throw error;
      toast.success(t("tickets.form.success"));
      onOpenChange(false);
      onSubmitted?.();
    } catch (e) {
      console.error(e);
      toast.error(t("services.requestError") || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("tickets.flight")}</SheetTitle>
          <SheetDescription>{t("tickets.flightSubtitle")}</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label className="text-sm">{t("tickets.form.tripType")}</Label>
            <RadioGroup value={tripType} onValueChange={(v) => setTripType(v as any)} className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="round_trip" /> {t("tickets.form.roundTrip")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="one_way" /> {t("tickets.form.oneWay")}
              </label>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="origin" className="text-sm">{t("tickets.form.origin")} *</Label>
              <CityInput id="origin" value={origin} onChange={setOrigin} placeholder="Tashkent" />
            </div>
            <div>
              <Label htmlFor="destination" className="text-sm">{t("tickets.form.destination")} *</Label>
              <CityInput id="destination" value={destination} onChange={setDestination} placeholder="Beijing" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">{t("tickets.form.departureDate")} *</Label>
              <Input type="date" min={todayStr()} value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
            </div>
            {tripType === "round_trip" && (
              <div>
                <Label className="text-sm">{t("tickets.form.returnDate")} *</Label>
                <Input type="date" min={departureDate || todayStr()} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            )}
          </div>

          <div className="rounded-xl bg-secondary/40 p-3">
            <Label className="text-sm font-semibold">{t("tickets.form.passengers")}</Label>
            <Stepper label={t("tickets.form.adults")} value={adults} onChange={setAdults} min={1} max={9} />
            <Stepper label={t("tickets.form.children")} value={children} onChange={setChildren} />
            <Stepper label={t("tickets.form.infants")} value={infants} onChange={setInfants} />
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.class")}</Label>
            <RadioGroup value={travelClass} onValueChange={(v) => setTravelClass(v as any)} className="flex gap-4 mt-2 flex-wrap">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="economy" /> {t("tickets.form.economy")}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="business" /> {t("tickets.form.business")}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="first" /> {t("tickets.form.first")}</label>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.phone")} *</Label>
            <Input
              type="tel"
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
              className={cn(phoneError && "border-destructive")}
            />
            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {t("tickets.form.submit")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TrainTicketSheet({ open, onOpenChange, onSubmitted }: BaseProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(todayStr());
  const [timePref, setTimePref] = useState("any");
  const [trainType, setTrainType] = useState("any");
  const [passengers, setPassengers] = useState(1);
  const [seatClass, setSeatClass] = useState("any");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => { if (!open) setPhoneError(""); }, [open]);

  const phoneValid = PHONE_REGEX.test(phone);
  const isValid = origin.trim() && destination.trim() && departureDate && phoneValid;

  const handleSubmit = async () => {
    if (!user) {
      toast.error(t("services.loginRequired") || "Iltimos, avval tizimga kiring");
      return;
    }
    if (!phoneValid) {
      setPhoneError(t("tickets.form.phoneInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      const ticketDetails = {
        origin, destination, departure_date: departureDate,
        time_preference: timePref, train_type: trainType,
        passengers, seat_class: seatClass, phone,
      };
      const { error } = await supabase.from("service_requests").insert({
        user_id: user.id,
        service_type: "train_ticket",
        title: `${t("tickets.train")}: ${origin} → ${destination}`,
        description: notes || null,
        status: "pending",
        ticket_details: ticketDetails,
      } as any);
      if (error) throw error;
      toast.success(t("tickets.form.success"));
      onOpenChange(false);
      onSubmitted?.();
    } catch (e) {
      console.error(e);
      toast.error(t("services.requestError") || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("tickets.train")}</SheetTitle>
          <SheetDescription>{t("tickets.trainSubtitle")}</SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">{t("tickets.form.origin")} *</Label>
              <CityInput id="t-origin" value={origin} onChange={setOrigin} placeholder="Beijing" />
            </div>
            <div>
              <Label className="text-sm">{t("tickets.form.destination")} *</Label>
              <CityInput id="t-dest" value={destination} onChange={setDestination} placeholder="Shanghai" />
            </div>
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.departureDate")} *</Label>
            <Input type="date" min={todayStr()} value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.timePreference")}</Label>
            <Select value={timePref} onValueChange={setTimePref}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t("tickets.form.timeMorning")}</SelectItem>
                <SelectItem value="before_noon">{t("tickets.form.timeBeforeNoon")}</SelectItem>
                <SelectItem value="after_noon">{t("tickets.form.timeAfterNoon")}</SelectItem>
                <SelectItem value="evening">{t("tickets.form.timeEvening")}</SelectItem>
                <SelectItem value="any">{t("tickets.form.timeAny")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.trainType")}</Label>
            <RadioGroup value={trainType} onValueChange={setTrainType} className="flex gap-3 mt-2 flex-wrap">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="high_speed" /> {t("tickets.form.trainHighSpeed")}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="regular" /> {t("tickets.form.trainRegular")}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="any" /> {t("tickets.form.timeAny")}</label>
            </RadioGroup>
          </div>

          <div className="rounded-xl bg-secondary/40 p-3">
            <Stepper label={t("tickets.form.passengers")} value={passengers} onChange={setPassengers} min={1} max={9} />
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.class")}</Label>
            <RadioGroup value={seatClass} onValueChange={setSeatClass} className="grid grid-cols-2 gap-2 mt-2">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="first" /> {t("tickets.form.seatFirst")}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="second" /> {t("tickets.form.seatSecond")}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="sleeper" /> {t("tickets.form.seatSleeper")}</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="any" /> {t("tickets.form.timeAny")}</label>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div>
            <Label className="text-sm">{t("tickets.form.phone")} *</Label>
            <Input
              type="tel"
              placeholder="+8613800138000"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
              className={cn(phoneError && "border-destructive")}
            />
            {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {t("tickets.form.submit")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function HowItWorksSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const steps = [
    t("tickets.howItWorksStep1"),
    t("tickets.howItWorksStep2"),
    t("tickets.howItWorksStep3"),
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>{t("tickets.howItWorks")}</SheetTitle>
        </SheetHeader>
        <div className="py-6 space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="pt-1.5 text-sm">{step}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
