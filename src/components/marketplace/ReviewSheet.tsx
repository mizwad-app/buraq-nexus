import { useState } from "react";
import { Star, Send, ThumbsUp, Globe, Briefcase, Clock, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ReviewSheetProps {
  translatorId: string;
  translatorName: string;
  bookingId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface RatingCategory {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  value: number;
}

export const ReviewSheet = ({ 
  translatorId, 
  translatorName, 
  bookingId,
  open, 
  onOpenChange,
  onSuccess 
}: ReviewSheetProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [ratings, setRatings] = useState<RatingCategory[]>([
    { key: 'language_proficiency', label: 'Til bilish', description: 'Xitoy tilini qanchalik yaxshi biladi?', icon: <Globe className="w-5 h-5" />, value: 0 },
    { key: 'work_expertise', label: 'Ish bilish', description: 'Sohani qanchalik tushunadi?', icon: <Briefcase className="w-5 h-5" />, value: 0 },
    { key: 'reliability', label: 'Ishonchlilik', description: 'Qanchalik ishonchli va mas\'uliyatli?', icon: <Shield className="w-5 h-5" />, value: 0 },
    { key: 'punctuality', label: 'Punktuallik', description: 'Vaqtga qanchalik rioya qiladi?', icon: <Clock className="w-5 h-5" />, value: 0 },
  ]);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  const setRating = (key: string, value: number) => {
    setRatings(prev => prev.map(r => 
      r.key === key ? { ...r, value } : r
    ));
  };

  const isComplete = ratings.every(r => r.value > 0);
  const averageRating = ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;

  const handleSubmit = async () => {
    if (!user || !isComplete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('translator_reviews')
        .insert({
          translator_id: translatorId,
          user_id: user.id,
          booking_id: bookingId || null,
          language_proficiency: ratings.find(r => r.key === 'language_proficiency')?.value,
          work_expertise: ratings.find(r => r.key === 'work_expertise')?.value,
          reliability: ratings.find(r => r.key === 'reliability')?.value,
          punctuality: ratings.find(r => r.key === 'punctuality')?.value,
          comment: reviewText || null,
          is_public: true
        });

      if (error) throw error;

      toast({ title: "Sharh yuborildi!", description: "Fikr-mulohazangiz uchun rahmat." });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({ title: "Xatolik yuz berdi", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (category: RatingCategory) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(category.key, star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={cn(
                "w-7 h-7 transition-colors",
                star <= category.value
                  ? "fill-amber-500 text-amber-500"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border/50">
          <SheetHeader className="text-left">
            <SheetTitle>Sharh qoldiring</SheetTitle>
            <p className="text-sm text-muted-foreground">{translatorName} haqida fikringiz</p>
          </SheetHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Rating Categories */}
          {ratings.map((category) => (
            <div key={category.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {category.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{category.label}</p>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
              </div>
              {renderStars(category)}
            </div>
          ))}

          {/* Overall Preview */}
          {isComplete && (
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                  <span className="text-2xl font-bold text-amber-500">{averageRating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Umumiy baho</p>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                {averageRating >= 4.5 ? "A'lo darajada!" : 
                 averageRating >= 3.5 ? "Yaxshi!" : 
                 averageRating >= 2.5 ? "O'rtacha" : "Qoniqarsiz"}
              </div>
            </div>
          )}

          {/* Written Review */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Yozma sharh (ixtiyoriy)</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tajribangiz haqida batafsil yozing..."
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-background">
          <Button 
            className="w-full gap-2" 
            onClick={handleSubmit}
            disabled={!isComplete || loading}
          >
            {loading ? "Yuklanmoqda..." : (
              <>
                <Send className="w-4 h-4" />
                Sharhni yuborish
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
