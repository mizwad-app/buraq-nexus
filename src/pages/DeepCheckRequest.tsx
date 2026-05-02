import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileSearch, 
  Upload, 
  CreditCard, 
  Loader2,
  X,
  Image as ImageIcon,
  Building2,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEEP_CHECK_PRICE = 10;

const DeepCheckRequest = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!productName.trim() || !manufacturerName.trim()) {
      toast.error("Barcha maydonlarni to'ldiring");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = null;

      if (productImage) {
        const fileExt = productImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("deep-checks")
          .upload(fileName, productImage);

        if (uploadError) throw uploadError;

        const { data: signedUrlData } = await supabase.storage
          .from("deep-checks")
          .createSignedUrl(fileName, 60 * 60 * 24 * 365);

        imageUrl = signedUrlData?.signedUrl || null;
      }

      const { error: insertError } = await supabase
        .from("deep_checks")
        .insert({
          user_id: user.id,
          product_name: productName.trim(),
          manufacturer_name: manufacturerName.trim(),
          product_image_url: imageUrl,
          payment_type: "payment",
          points_spent: 0,
          amount_paid: DEEP_CHECK_PRICE,
        });

      if (insertError) throw insertError;

      toast.success("So'rov muvaffaqiyatli yuborildi!");
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting deep check:", error);
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background safe-bottom flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
            <FileSearch className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            Chuqur Tekshiruv
          </h1>
          <p className="text-sm text-muted-foreground">
            So'rov yuborish uchun tizimga kiring
          </p>
        </div>
        
        <Button
          onClick={() => setShowAuthModal(true)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8 py-6"
        >
          Kirish / Ro'yxatdan o'tish
        </Button>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          triggerReason="Chuqur tekshiruv uchun tizimga kiring"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <FileSearch className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Chuqur Tekshiruv
            </h1>
            <p className="text-sm text-muted-foreground">
              Mahsulotingizni to'liq tahlil qiling
            </p>
          </div>
        </div>
      </header>

      {/* Pricing Info */}
      <section className="px-5 mb-6">
        <div className="rounded-2xl bg-gradient-to-br from-amber-600/20 to-yellow-600/10 border border-gold/20 p-4">
          <p className="text-sm text-foreground mb-3 font-medium">
            Chuqur tekshiruv narxi:
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              <span className="font-bold text-gold">{DEEP_CHECK_POINTS} ball</span>
            </div>
            <span className="text-muted-foreground">yoki</span>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">${DEEP_CHECK_PRICE}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sizda: <span className="text-gold font-bold">{userPoints}</span> ball
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-5 space-y-5">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="productName" className="text-sm text-foreground/80 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Mahsulot nomi
          </Label>
          <Input
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Masalan: Nestle KitKat"
            className="h-12 bg-card border-border/50"
          />
        </div>

        {/* Manufacturer Name */}
        <div className="space-y-2">
          <Label htmlFor="manufacturerName" className="text-sm text-foreground/80 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Ishlab chiqaruvchi
          </Label>
          <Input
            id="manufacturerName"
            value={manufacturerName}
            onChange={(e) => setManufacturerName(e.target.value)}
            placeholder="Masalan: Nestle S.A."
            className="h-12 bg-card border-border/50"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-sm text-foreground/80 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Mahsulot rasmi (ixtiyoriy)
          </Label>
          
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => {
                  setProductImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="block">
              <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 transition-colors cursor-pointer bg-card/50">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Rasm yuklash</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Payment Type */}
        <div className="space-y-3">
          <Label className="text-sm text-foreground/80">To'lov usuli</Label>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentType("points")}
              disabled={!canPayWithPoints}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                paymentType === "points" && canPayWithPoints
                  ? "border-amber-500 bg-gold/10"
                  : canPayWithPoints
                  ? "border-border/50 bg-card hover:border-amber-500/50"
                  : "border-border/30 bg-card/30 opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-gold" />
                <span className="font-semibold text-foreground">{DEEP_CHECK_POINTS} ball</span>
              </div>
              {paymentType === "points" && canPayWithPoints && (
                <CheckCircle className="w-4 h-4 text-gold" />
              )}
              {!canPayWithPoints && (
                <p className="text-xs text-destructive">Yetarli emas</p>
              )}
            </button>

            <button
              onClick={() => setPaymentType("payment")}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                paymentType === "payment"
                  ? "border-emerald-500 bg-primary/10"
                  : "border-border/50 bg-card hover:border-emerald-500/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">${DEEP_CHECK_PRICE}</span>
              </div>
              {paymentType === "payment" && (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !productName.trim() || !manufacturerName.trim()}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow hover:shadow-glow-lg transition-all"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <FileSearch className="w-5 h-5 mr-2" />
              So'rov yuborish
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground pb-8">
          So'rov yuborilgandan so'ng 24-48 soat ichida natija keladi
        </p>
      </section>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        triggerReason="Chuqur tekshiruv uchun tizimga kiring"
      />
    </div>
  );
};

export default DeepCheckRequest;
