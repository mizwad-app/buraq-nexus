export interface BadgeStyle {
  bgColor: string;
  textColor: string;
  emoji?: string;
  borderClass?: string;
}

export function getExhibitionBadgeStyle(
  daysRemaining: number | null,
  isEnded = false,
): BadgeStyle {
  if (isEnded || daysRemaining === null || daysRemaining < 0) {
    return { bgColor: "bg-gray-100", textColor: "text-gray-500" };
  }
  if (daysRemaining === 0) {
    return { bgColor: "bg-[#e0a52e]", textColor: "text-white", emoji: "🔥" };
  }
  if (daysRemaining <= 7) {
    return {
      bgColor: "bg-[#27a87a]",
      textColor: "text-white",
      emoji: "⏰",
      borderClass: "border-2 border-emerald-400",
    };
  }
  if (daysRemaining <= 30) {
    return { bgColor: "bg-emerald-100", textColor: "text-emerald-800" };
  }
  if (daysRemaining <= 90) {
    return { bgColor: "bg-emerald-50", textColor: "text-emerald-700" };
  }
  return { bgColor: "bg-gray-100", textColor: "text-gray-600" };
}

export function computeDaysRemaining(startDate?: string | null): number | null {
  if (!startDate) return null;
  return Math.ceil((new Date(startDate).getTime() - Date.now()) / 86400000);
}

export function isExhibitionEnded(endDate?: string | null): boolean {
  if (!endDate) return false;
  return new Date(endDate).getTime() < Date.now();
}
