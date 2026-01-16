import { cn } from "@/lib/utils";

interface ImageCardProps {
  image: string;
  title: string;
  onClick?: () => void;
  delay?: number;
  className?: string;
}

export const ImageCard = ({
  image,
  title,
  onClick,
  delay = 0,
  className,
}: ImageCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "module-card w-full text-left animate-scale-in group",
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
      <div className="absolute inset-0 gradient-card-overlay" />
      
      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display font-semibold text-foreground text-lg leading-tight">
          {title}
        </h3>
      </div>
      
      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-[20px] border border-white/10 group-hover:border-primary/30 transition-colors duration-300" />
    </button>
  );
};
