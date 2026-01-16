import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Phone, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerReason?: string;
}

type AuthStep = "info" | "verify";

export const AuthModal = ({ open, onOpenChange, triggerReason }: AuthModalProps) => {
  const [step, setStep] = useState<AuthStep>("info");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");

  const handleSendCode = async () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    // Phone number validation (Uzbek format)
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      toast.error("Telefon raqam noto'g'ri");
      return;
    }

    setLoading(true);
    
    // Since we're using mock SMS, we'll use email auth behind the scenes
    // with a generated email based on phone number
    const email = `${cleanPhone}@buraq-user.app`;
    setGeneratedEmail(email);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: cleanPhone + "_secure_password_2024",
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phoneNumber.trim(),
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        // If user already exists, try to sign in
        if (error.message.includes("already registered")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: cleanPhone + "_secure_password_2024",
          });

          if (signInError) {
            toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
            setLoading(false);
            return;
          }

          toast.success("Xush kelibsiz!");
          onOpenChange(false);
          resetForm();
          return;
        }
        throw error;
      }

      // For mock: move to verification step
      setStep("verify");
      toast.success("Tasdiqlash kodi yuborildi!");
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 4) {
      toast.error("4 xonali kod kiriting");
      return;
    }

    setLoading(true);

    // Mock verification - accept any 4-digit code
    // In production, this would verify an actual SMS code
    try {
      // For demo, any 4 digits work - user is already signed up
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Muvaffaqiyatli tasdiqlandi!");
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error("Tasdiqlash xatosi");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("info");
    setFullName("");
    setPhoneNumber("");
    setVerificationCode("");
    setGeneratedEmail("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative px-6 pt-8 pb-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center mb-4 shadow-glow">
              {step === "info" ? (
                <User className="w-8 h-8 text-primary-foreground" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              {step === "info" ? "Ro'yxatdan o'tish" : "Tasdiqlash"}
            </h2>
            {triggerReason && (
              <p className="text-sm text-muted-foreground mt-2">
                {triggerReason}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-8 space-y-5">
          {step === "info" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-foreground/80">
                  To'liq ism
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ismingizni kiriting"
                    className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm text-foreground/80">
                  Telefon raqam
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="pl-11 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-glow-lg transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Kodni yuborish
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-foreground/80">
                  SMS orqali yuborilgan 4 xonali kodni kiriting
                </Label>
                <p className="text-xs text-muted-foreground">
                  {phoneNumber} raqamiga kod yuborildi
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={verificationCode[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 1) {
                        const newCode = verificationCode.split("");
                        newCode[index] = value;
                        setVerificationCode(newCode.join(""));
                        
                        // Auto-focus next input
                        if (value && index < 3) {
                          const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                          nextInput?.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace
                      if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
                        const prevInput = (e.target as HTMLElement).parentElement?.children[index - 1] as HTMLInputElement;
                        prevInput?.focus();
                      }
                    }}
                    className={cn(
                      "w-14 h-14 text-center text-2xl font-bold rounded-xl",
                      "bg-secondary/50 border-2 border-border/50",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                      "transition-all duration-200"
                    )}
                  />
                ))}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Demo uchun istalgan 4 ta raqam kiriting
              </p>

              <Button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 4}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-glow-lg transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Tasdiqlash
                    <ShieldCheck className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <button
                onClick={() => setStep("info")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Orqaga qaytish
              </button>
            </>
          )}

          <p className="text-xs text-center text-muted-foreground pt-2">
            Davom etish orqali siz{" "}
            <span className="text-primary">Foydalanish shartlari</span>ga
            rozilik bildirasiz
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
