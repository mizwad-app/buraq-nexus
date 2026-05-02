import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ScanLine, X, Check, AlertTriangle, Loader2, FileSearch, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";

type ScanResult = "halol" | "haram" | "shubhali" | null;

interface AIScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Reference list of ingredients to avoid — shown as educational info inside the scanner
const HARMFUL_INGREDIENTS = [
  { name: "Gelatin (pork)", category: "haram" as const },
  { name: "E120 (Carmine)", category: "suspicious" as const },
  { name: "E441 (Gelatin)", category: "suspicious" as const },
  { name: "Alcohol", category: "haram" as const },
  { name: "E422 (Glycerin)", category: "suspicious" as const },
  { name: "E471 (Mono and diglycerides)", category: "suspicious" as const },
];

export const AIScannerModal = ({ open, onOpenChange }: AIScannerModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Localized result config
  const resultConfig = {
    halol: {
      icon: Check,
      title: t("scanner.resultHalal"),
      subtitle: t("scanner.resultHalalDesc"),
      bgClass: "bg-gradient-to-br from-emerald-500/20 to-green-600/20",
      borderClass: "border-emerald-500/50",
      iconBgClass: "bg-emerald-500",
      textClass: "text-emerald-400",
    },
    haram: {
      icon: X,
      title: t("scanner.resultHaram"),
      subtitle: t("scanner.resultHaramDesc"),
      bgClass: "bg-gradient-to-br from-red-500/20 to-rose-600/20",
      borderClass: "border-red-500/50",
      iconBgClass: "bg-red-500",
      textClass: "text-red-400",
    },
    shubhali: {
      icon: AlertTriangle,
      title: t("scanner.resultDoubtful"),
      subtitle: t("scanner.resultDoubtfulDesc"),
      bgClass: "bg-gradient-to-br from-amber-500/20 to-yellow-600/20",
      borderClass: "border-amber-500/50",
      iconBgClass: "bg-amber-500",
      textClass: "text-amber-400",
    },
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCameraCapture = useCallback(() => {
    // On mobile, this will open the camera
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  }, []);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate AI analysis with delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Random mock result
    const results: ScanResult[] = ["halol", "haram", "shubhali"];
    const randomResult = results[Math.floor(Math.random() * results.length)];
    
    setScanResult(randomResult);
    setIsScanning(false);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setScanResult(null);
    setIsScanning(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onOpenChange(false);
  }, [handleReset, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="flex items-center gap-3 text-foreground font-display">
            <div className="p-2 rounded-xl gradient-glow">
              <ScanLine className="w-5 h-5 text-primary-foreground" />
            </div>
            {t("scanner.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-5">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Image Preview or Upload Area */}
          {selectedImage ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={selectedImage}
                alt="Scanned product"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCameraCapture}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{t("scanner.camera")}</span>
              </button>

              <button
                onClick={handleUploadClick}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all group"
              >
                <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{t("scanner.upload")}</span>
              </button>
            </div>
          )}

          {/* Scan Button */}
          {selectedImage && !scanResult && (
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full h-14 text-base font-semibold gradient-glow text-primary-foreground rounded-2xl shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-70"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t("scanner.analyzing")}
                </>
              ) : (
                <>
                  <ScanLine className="w-5 h-5 mr-2" />
                  {t("scanner.scan")}
                </>
              )}
            </Button>
          )}

          {/* Scanning Animation */}
          {isScanning && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-4 rounded-full border-2 border-primary/40 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                {t("scanner.aiAnalyzing")}
              </p>
            </div>
          )}

          {/* Result Card */}
          {scanResult && (
            <div
              className={cn(
                "p-5 rounded-2xl border animate-scale-in",
                resultConfig[scanResult].bgClass,
                resultConfig[scanResult].borderClass
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-3 rounded-2xl shrink-0",
                    resultConfig[scanResult].iconBgClass
                  )}
                >
                  {(() => {
                    const Icon = resultConfig[scanResult].icon;
                    return <Icon className="w-6 h-6 text-white" strokeWidth={3} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "text-xl font-display font-bold",
                      resultConfig[scanResult].textClass
                    )}
                  >
                    {resultConfig[scanResult].title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resultConfig[scanResult].subtitle}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 border-border/50 hover:bg-secondary/50"
                >
                  {t("scanner.scanAgain")}
                </Button>
                <Button
                  onClick={() => {
                    if (!user) {
                      setShowAuthModal(true);
                    } else {
                      // Would trigger deep check in production
                      alert(t("scanner.deepCheckStart"));
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  <FileSearch className="w-4 h-4 mr-2" />
                  {t("scanner.deepCheck")}
                </Button>
              </div>
            </div>
          )}

          {/* Ingredients to Avoid — educational reference */}
          <div className="border border-border/50 rounded-2xl overflow-hidden bg-secondary/30">
            <button
              type="button"
              onClick={() => setShowIngredients(v => !v)}
              className="w-full flex items-center justify-between gap-3 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">
                  {t("halal.ingredientsToAvoid")}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showIngredients ? "rotate-180" : ""}`} />
            </button>
            {showIngredients && (
              <div className="px-3 pb-3 space-y-2">
                {HARMFUL_INGREDIENTS.map((ingredient) => (
                  <div
                    key={ingredient.name}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/50"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        ingredient.category === "haram" ? "bg-red-500/20" : "bg-amber-500/20"
                      }`}
                    >
                      {ingredient.category === "haram" ? (
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{ingredient.name}</p>
                      <p
                        className={`text-[10px] ${
                          ingredient.category === "haram" ? "text-red-500" : "text-amber-500"
                        }`}
                      >
                        {t(`halal.${ingredient.category}`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Auth Modal for Deep Check */}
        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          triggerReason={t("scanner.loginForDeepCheck")}
        />
      </DialogContent>
    </Dialog>
  );
};
