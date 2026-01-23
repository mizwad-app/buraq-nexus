import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Cpu, 
  Shirt, 
  Sofa, 
  Car,
  AlertTriangle,
  Check,
  ChevronLeft
} from "lucide-react";

interface BusinessSurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SurveyStep = "category" | "subcategory" | "success";

interface MainCategory {
  id: string;
  label: string;
  labelUz: string;
  icon: React.ElementType;
  subCategories: { id: string; label: string }[];
}

const mainCategories: MainCategory[] = [
  {
    id: "construction",
    label: "Construction",
    labelUz: "Qurilish",
    icon: Building2,
    subCategories: [
      { id: "building_materials", label: "Qurilish materiallari" },
      { id: "plumbing", label: "Santexnika" },
      { id: "electrical", label: "Elektr jihozlari" },
      { id: "tools", label: "Asbob-uskunalar" },
      { id: "doors_windows", label: "Eshik va derazalar" },
      { id: "finishing", label: "Pardozlash materiallari" },
    ],
  },
  {
    id: "electronics",
    label: "Electronics",
    labelUz: "Elektronika",
    icon: Cpu,
    subCategories: [
      { id: "smartphones", label: "Smartfonlar" },
      { id: "computers", label: "Kompyuterlar" },
      { id: "accessories", label: "Aksessuarlar" },
      { id: "audio_video", label: "Audio/Video" },
      { id: "home_appliances", label: "Maishiy texnika" },
      { id: "components", label: "Elektronik komponentlar" },
    ],
  },
  {
    id: "textile",
    label: "Textile",
    labelUz: "Tekstil",
    icon: Shirt,
    subCategories: [
      { id: "fabrics", label: "Matolar" },
      { id: "clothing", label: "Kiyim-kechak" },
      { id: "home_textile", label: "Uy-ro'zg'or tekstili" },
      { id: "leather", label: "Teri va charm" },
      { id: "accessories_fashion", label: "Aksessuarlar" },
      { id: "yarn", label: "Ip va tolalar" },
    ],
  },
  {
    id: "furniture",
    label: "Furniture",
    labelUz: "Mebel",
    icon: Sofa,
    subCategories: [
      { id: "home_furniture", label: "Uy mebellari" },
      { id: "office_furniture", label: "Ofis mebellari" },
      { id: "outdoor", label: "Tashqi mebel" },
      { id: "mattresses", label: "Matraslar" },
      { id: "lighting", label: "Yoritish" },
      { id: "decor", label: "Dekor" },
    ],
  },
  {
    id: "auto_machinery",
    label: "Auto/Machinery",
    labelUz: "Avto/Texnika",
    icon: Car,
    subCategories: [
      { id: "auto_parts", label: "Avto ehtiyot qismlari" },
      { id: "machinery", label: "Sanoat texnikasi" },
      { id: "agricultural", label: "Qishloq xo'jaligi" },
      { id: "tools_equipment", label: "Asbob-uskunalar" },
      { id: "tires_wheels", label: "Shinalar va g'ildiraklar" },
      { id: "oils_fluids", label: "Moylar va suyuqliklar" },
    ],
  },
];

export const BusinessSurveyModal = ({ open, onOpenChange }: BusinessSurveyModalProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<SurveyStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

  const progress = step === "category" ? 50 : step === "subcategory" ? 100 : 100;

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setTimeout(() => {
        setStep("category");
        setSelectedCategory(null);
        setSelectedSubCategories([]);
        setShowSkipWarning(false);
      }, 300);
    }
  }, [open]);

  const handleCategorySelect = (category: MainCategory) => {
    setSelectedCategory(category);
    setSlideDirection("left");
    setTimeout(() => setStep("subcategory"), 50);
  };

  const handleSubCategoryToggle = (subCategoryId: string) => {
    setSelectedSubCategories(prev => 
      prev.includes(subCategoryId)
        ? prev.filter(id => id !== subCategoryId)
        : [...prev, subCategoryId]
    );
  };

  const handleBack = () => {
    setSlideDirection("right");
    setTimeout(() => {
      setStep("category");
      setSelectedSubCategories([]);
    }, 50);
  };

  const handleSkip = () => {
    if (!showSkipWarning) {
      setShowSkipWarning(true);
      return;
    }
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!user || !selectedCategory) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_interests")
        .upsert({
          user_id: user.id,
          main_category: selectedCategory.id,
          sub_categories: selectedSubCategories,
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      setStep("success");
      
      // Auto-redirect after success
      setTimeout(() => {
        onOpenChange(false);
        navigate("/");
      }, 2500);
    } catch (error) {
      console.error("Error saving interests:", error);
      toast({
        title: "Xatolik",
        description: "Ma'lumotlarni saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 bg-background border-border/50 overflow-hidden">
        {/* Progress Bar - Duolingo Style */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-4">
            {step === "subcategory" && (
              <button
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground font-medium">
              {step === "category" ? "1/2" : "2/2"}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative min-h-[400px] overflow-hidden">
          {/* Category Selection Step */}
          <div
            className={cn(
              "absolute inset-0 px-6 pb-6 transition-all duration-300 ease-out",
              step === "category" 
                ? "translate-x-0 opacity-100" 
                : slideDirection === "left"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
            )}
          >
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Biznes sohangizni tanlang
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Bu sizga muhim ko'rgazmalar haqida xabar berishimizga yordam beradi
            </p>

            <div className="grid grid-cols-2 gap-3">
              {mainCategories.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory?.id === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border/50 bg-card"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {category.labelUz}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Skip Warning */}
            {showSkipWarning && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-200">
                  Sohangizni tanlamasangiz, muhim ko'rgazmalarni o'tkazib yuborishingiz mumkin.
                </p>
              </div>
            )}

            {/* Skip Button */}
            <div className="mt-4 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showSkipWarning ? "Baribir o'tkazib yuborish" : "O'tkazib yuborish"}
              </button>
            </div>
          </div>

          {/* Subcategory Selection Step */}
          <div
            className={cn(
              "absolute inset-0 px-6 pb-6 transition-all duration-300 ease-out",
              step === "subcategory" 
                ? "translate-x-0 opacity-100" 
                : slideDirection === "left"
                  ? "translate-x-full opacity-0"
                  : "-translate-x-full opacity-0"
            )}
          >
            {selectedCategory && (
              <>
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  {selectedCategory.labelUz} - Yo'nalishlar
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Bir nechta yo'nalishni tanlay olasiz
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategory.subCategories.map((sub) => {
                    const isSelected = selectedSubCategories.includes(sub.id);
                    
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubCategoryToggle(sub.id)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                          "border-2",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/50 bg-card text-foreground hover:border-primary/50"
                        )}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>

                {/* Skip Warning */}
                {showSkipWarning && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-200">
                      Sohangizni tanlamasangiz, muhim ko'rgazmalarni o'tkazib yuborishingiz mumkin.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-colors"
                  >
                    O'tkazib yuborish
                  </button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || selectedSubCategories.length === 0}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Saqlash"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Success Step */}
          <div
            className={cn(
              "absolute inset-0 px-6 pb-6 flex flex-col items-center justify-center transition-all duration-300 ease-out",
              step === "success" 
                ? "translate-x-0 opacity-100 scale-100" 
                : "translate-x-full opacity-0 scale-95"
            )}
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-scale-in">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-xl font-display font-bold text-foreground text-center mb-2">
              Profil muvaffaqiyatli shaxsiylashtirildi!
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Sizga sohangizga oid xabarlar yuboriladi.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
