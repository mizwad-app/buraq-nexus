import { cn } from "@/lib/utils";

interface ImageCardProps {
  image: string;
  title: string;
  onClick?: () => void;
  delay?: number;
  className?: string;
  isPremium?: boolean;
}

export const ImageCard = ({
  image,
  title,
  onClick,
  delay = 0,
  className,
  isPremium = false,
}: ImageCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "module-card w-full text-left animate-scale-in group",
        isPremium && "ring-2 ring-amber-500/50",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background Image */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Gradient Overlay */}
      <div className={cn(
        "absolute inset-0",
        isPremium 
          ? "bg-gradient-to-t from-amber-950/90 via-amber-900/40 to-transparent"
          : "gradient-card-overlay"
      )} />
      
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full">
          <span className="text-[10px] font-bold text-black uppercase tracking-wider">Premium</span>
        </div>
      )}
      
      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className={cn(
          "font-display font-semibold text-lg leading-tight",
          isPremium ? "text-amber-100" : "text-foreground"
        )}>
          {title}
        </h3>
      </div>
      
      {/* Subtle border glow on hover */}
      <div className={cn(
        "absolute inset-0 rounded-[20px] border transition-colors duration-300",
        isPremium 
          ? "border-amber-500/30 group-hover:border-amber-400/50" 
          : "border-white/10 group-hover:border-primary/30"
      )} />
    </button>
  );
};
