export const getFlagEmoji = (code: string): string => {
  const flags: Record<string, string> = {
    uz: "🇺🇿",
    ru: "🇷🇺",
    en: "🇬🇧",
    zh: "🇨🇳",
    ar: "🇸🇦",
    fr: "🇫🇷",
    tr: "🇹🇷",
    ko: "🇰🇷",
  };
  return flags[code?.toLowerCase()] || "🌐";
};

export interface TranslatorLanguage {
  code: string;
  name: string;
  level: string;
  verified?: boolean;
}

export const HSK_BADGE_CLASS = (level: number | null | undefined): string => {
  if (!level) return "bg-muted/50 text-muted-foreground border-border";
  if (level >= 5) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (level === 4) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (level === 3) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return "bg-muted/50 text-muted-foreground border-border";
};
