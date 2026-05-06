interface Props {
  emoji?: string | null;
  className?: string;
}

export const PlacePlaceholder = ({ emoji, className = "" }: Props) => (
  <div
    className={`w-full h-full bg-gradient-to-br from-emerald-900/40 via-emerald-700/20 to-amber-700/20 flex items-center justify-center ${className}`}
  >
    <span className="text-5xl opacity-70">{emoji ?? "🏬"}</span>
  </div>
);
