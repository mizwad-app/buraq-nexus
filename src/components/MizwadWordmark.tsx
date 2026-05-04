import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface MizwadWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<MizwadWordmarkProps["size"]>, string> = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

const taglineSizeClasses: Record<NonNullable<MizwadWordmarkProps["size"]>, string> = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

const SERIF_STACK = "'Fraunces', Georgia, 'Times New Roman', 'Noto Serif', serif";

/**
 * Mizwad brand wordmark.
 * - Italic Georgia serif, weight 400
 * - Emerald (#27a87a) → Gold (#e0a52e) horizontal gradient on the wordmark
 * - Optional tagline in muted-foreground, also Georgia italic
 */
export const MizwadWordmark = ({
  size = "md",
  showTagline = false,
  className,
}: MizwadWordmarkProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col min-w-0", className)}>
      <span
        className={cn(
          sizeClasses[size],
          "italic font-normal tracking-tight leading-none",
          "bg-clip-text text-transparent",
          "bg-gradient-to-r from-[#27a87a] to-[#e0a52e]",
        )}
        style={{ fontFamily: SERIF_STACK }}
      >
        Mizwad
      </span>
      {showTagline && (
        <span
          className={cn(
            taglineSizeClasses[size],
            "italic text-muted-foreground mt-1 truncate",
          )}
          style={{ fontFamily: SERIF_STACK }}
        >
          {t("brand.tagline", "Musulmon sayyohning raqamli karmoni")}
        </span>
      )}
    </div>
  );
};

export default MizwadWordmark;
