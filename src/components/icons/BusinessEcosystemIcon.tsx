import { cn } from "@/lib/utils";

interface BusinessEcosystemIconProps {
  className?: string;
}

export const BusinessEcosystemIcon = ({ className }: BusinessEcosystemIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-5 h-5", className)}
    >
      {/* Globe base */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      
      {/* Globe meridians */}
      <ellipse
        cx="12"
        cy="12"
        rx="3.5"
        ry="9"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        opacity="0.4"
      />
      
      {/* Globe horizontal line */}
      <path
        d="M3.5 12h17"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.4"
      />
      
      {/* Factory silhouette on globe */}
      <g opacity="0.9">
        {/* Factory building */}
        <rect
          x="6"
          y="10"
          width="4"
          height="5"
          fill="currentColor"
          rx="0.5"
        />
        {/* Factory chimney */}
        <rect
          x="7"
          y="7"
          width="1.5"
          height="3"
          fill="currentColor"
          rx="0.25"
        />
        {/* Smoke */}
        <circle cx="7.75" cy="5.5" r="0.75" fill="currentColor" opacity="0.5" />
      </g>
      
      {/* Market stall */}
      <g opacity="0.9">
        {/* Roof */}
        <path
          d="M14 8l3 2h-6l3-2z"
          fill="currentColor"
        />
        {/* Stall base */}
        <rect
          x="12"
          y="10"
          width="4"
          height="4"
          fill="currentColor"
          rx="0.5"
        />
        {/* Products/boxes */}
        <rect
          x="12.5"
          y="11"
          width="1.2"
          height="1.2"
          fill="currentColor"
          opacity="0.5"
        />
        <rect
          x="14.3"
          y="11"
          width="1.2"
          height="1.2"
          fill="currentColor"
          opacity="0.5"
        />
      </g>
      
      {/* Connecting trade arrow */}
      <path
        d="M10.5 12.5 L11.5 12 L10.5 11.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.7"
      />
      
      {/* Globe shine effect */}
      <path
        d="M6 6 C8 4, 11 3.5, 14 5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
