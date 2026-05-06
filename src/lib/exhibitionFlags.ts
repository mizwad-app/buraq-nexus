export const exhibitionFlag = (code?: string | null): string => {
  if (!code || code === "CN") return "🇨🇳";
  const flags: Record<string, string> = {
    DE: "🇩🇪", IT: "🇮🇹", US: "🇺🇸", FR: "🇫🇷", GB: "🇬🇧",
    ES: "🇪🇸", JP: "🇯🇵", KR: "🇰🇷", HK: "🇭🇰", TW: "🇹🇼",
    AE: "🇦🇪", RU: "🇷🇺", TR: "🇹🇷", BR: "🇧🇷",
  };
  return flags[code] || "🌍";
};
