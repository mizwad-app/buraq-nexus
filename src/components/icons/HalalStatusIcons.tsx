import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Halal Certified Icon - Green checkmark inside crescent
export const HalalCertifiedIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("", className)}
  >
    {/* Background circle */}
    <circle cx="16" cy="16" r="15" fill="#10B981" />
    {/* Crescent moon shape */}
    <path
      d="M12 6C8.5 8.5 7 12.5 7 16C7 21 10.5 25 16 26C13 24 11 20.5 11 16C11 11.5 13 8 17 6C15.5 5.5 13.5 5.5 12 6Z"
      fill="white"
      fillOpacity="0.3"
    />
    {/* Checkmark */}
    <path
      d="M11 16.5L14.5 20L21 12"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Inner glow */}
    <circle cx="16" cy="16" r="13" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
  </svg>
);

// Doubtful/Shubhali Icon - Orange exclamation in circle
export const DoubtfulIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("", className)}
  >
    {/* Background circle */}
    <circle cx="16" cy="16" r="15" fill="#F59E0B" />
    {/* Triangle warning shape */}
    <path
      d="M16 7L26 25H6L16 7Z"
      fill="white"
      fillOpacity="0.2"
    />
    {/* Exclamation mark */}
    <rect x="14.5" y="10" width="3" height="9" rx="1.5" fill="white" />
    <circle cx="16" cy="23" r="1.8" fill="white" />
    {/* Inner glow */}
    <circle cx="16" cy="16" r="13" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
  </svg>
);

// Not Halal / Alcohol Warning Icon - Red forbidden glass
export const AlcoholWarningIcon = ({ className, size = 24 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("", className)}
  >
    {/* Background circle */}
    <circle cx="16" cy="16" r="15" fill="#EF4444" />
    {/* Wine glass shape */}
    <path
      d="M12 8H20L19 14C19 16.5 17.5 18 16 18C14.5 18 13 16.5 13 14L12 8Z"
      fill="white"
      fillOpacity="0.3"
    />
    {/* Glass stem */}
    <rect x="15" y="18" width="2" height="4" fill="white" fillOpacity="0.3" />
    {/* Glass base */}
    <rect x="13" y="22" width="6" height="2" rx="1" fill="white" fillOpacity="0.3" />
    {/* Forbidden slash */}
    <line
      x1="8"
      y1="8"
      x2="24"
      y2="24"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="8"
      x2="24"
      y2="24"
      stroke="#EF4444"
      strokeWidth="1"
      strokeLinecap="round"
    />
    {/* Inner border */}
    <circle cx="16" cy="16" r="13" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
  </svg>
);

// Status badge component with tooltip
interface HalalStatusBadgeProps {
  status: 'certified' | 'doubtful' | 'not_halal';
  size?: number;
  showTooltip?: boolean;
  tooltipText?: string;
  className?: string;
}

export const HalalStatusBadge = ({ 
  status, 
  size = 28, 
  showTooltip = true,
  tooltipText,
  className 
}: HalalStatusBadgeProps) => {
  const icons = {
    certified: HalalCertifiedIcon,
    doubtful: DoubtfulIcon,
    not_halal: AlcoholWarningIcon,
  };

  const Icon = icons[status] || HalalCertifiedIcon;

  return (
    <div 
      className={cn(
        "relative group cursor-pointer",
        className
      )}
    >
      <Icon size={size} className="drop-shadow-lg" />
      {showTooltip && tooltipText && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none border border-border">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
};

export default HalalStatusBadge;
