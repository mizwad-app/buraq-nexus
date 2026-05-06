import { LucideIcon } from "lucide-react";

export interface OtherServiceItem {
  icon: LucideIcon;
  label: string;
  meta: string;
  onClick: () => void;
}

export const OtherServicesList = ({ items }: { items: OtherServiceItem[] }) => (
  <div className="space-y-2">
    {items.map((it, i) => {
      const Icon = it.icon;
      return (
        <button
          key={i}
          onClick={it.onClick}
          className="w-full flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-[10px] py-2.5 px-3 hover:bg-white/[0.04] transition-colors text-left"
        >
          <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="flex-1 text-[13px] text-foreground">{it.label}</span>
          <span className="text-[11px] text-muted-foreground">{it.meta}</span>
        </button>
      );
    })}
  </div>
);
