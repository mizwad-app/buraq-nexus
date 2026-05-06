import { cn } from "@/lib/utils";
import { MizwadInsightBox } from "./MizwadInsightBox";

interface CityRankCardProps {
  rank: number;
  city: string;
  markets: number;
  hubs: number;
  exhibitions: number;
  insight?: string | null;
}

const rankBadge = (rank: number) => {
  if (rank === 1) return "bg-amber-500/15 text-amber-400";
  if (rank === 2) return "bg-gray-400/15 text-gray-300";
  if (rank === 3) return "bg-orange-700/20 text-orange-400";
  return "bg-emerald-500/15 text-emerald-400";
};

export const CityRankCard = ({ rank, city, markets, hubs, exhibitions, insight }: CityRankCardProps) => (
  <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-3.5">
    <div className="flex items-center gap-2.5">
      <div className={cn("w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold", rankBadge(rank))}>
        {rank}
      </div>
      <span className="text-sm font-medium text-foreground flex-1">{city}</span>
      <span className="text-sm">🇨🇳</span>
    </div>
    <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[11px] text-muted-foreground">
      <span>{markets} ta bozor</span>
      <span className="text-emerald-500">●</span>
      <span>{hubs} ta zavod</span>
      <span className="text-emerald-500">●</span>
      <span>{exhibitions} ko'rgazma</span>
    </div>
    {rank === 1 && insight && <MizwadInsightBox text={insight} />}
  </div>
);
