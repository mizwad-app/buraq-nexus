import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const languages = [
  { code: "uz", label: "O'zbek", shortLabel: "UZ", flag: "🇺🇿" },
  { code: "ru", label: "Русский", shortLabel: "RU", flag: "🇷🇺" },
  { code: "en", label: "English", shortLabel: "EN", flag: "🇬🇧" },
  { code: "ar", label: "العربية", shortLabel: "AR", flag: "🇸🇦", rtl: true },
  { code: "zh", label: "中文", shortLabel: "ZH", flag: "🇨🇳" },
  { code: "fr", label: "Français", shortLabel: "FR", flag: "🇫🇷" },
];

interface LanguageSelectorProps {
  variant?: "button" | "menu-item";
}

export const LanguageSelector = ({ variant = "button" }: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    // Set RTL for Arabic
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    setOpen(false);
  };

  if (variant === "menu-item") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors border-b border-border/30">
            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">
              {t("profile.language")}
            </span>
            <span className="text-2xl">{currentLang.flag}</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{t("language.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
                  i18n.language === lang.code
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-secondary/30 hover:bg-secondary/50"
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium text-foreground">
                  {lang.label}
                </span>
                {i18n.language === lang.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
          <span className="text-lg">{currentLang.flag}</span>
          <Globe className="w-4 h-4 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>{t("language.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
                i18n.language === lang.code
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary/30 hover:bg-secondary/50"
              )}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="flex-1 text-left font-medium text-foreground">
                {lang.label}
              </span>
              {i18n.language === lang.code && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
