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

const SERIF_STACK = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

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
          "italic leading-none",
          "bg-clip-text text-transparent",
          "bg-gradient-to-br from-emerald-500 to-amber-500",
        )}
        style={{ fontFamily: SERIF_STACK, fontWeight: 600, letterSpacing: '-0.01em' }}
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
