interface Stat {
  value: number;
  label: string;
}

const formatStat = (n: number) => {
  if (n >= 100) {
    const bucket = Math.floor(n / 50) * 50;
    return `${bucket}+`;
  }
  return String(n);
};

export const StatsRow = ({ stats }: { stats: Stat[] }) => (
  <div className="grid grid-cols-3 gap-2">
    {stats.map((s, i) => (
      <div key={i} className="bg-white/[0.03] rounded-lg py-2 px-1.5 text-center">
        <p className="text-base font-medium text-emerald-400 leading-none">{formatStat(s.value)}</p>
        <p className="text-[9px] text-muted-foreground mt-1 leading-tight">{s.label}</p>
      </div>
    ))}
  </div>
);
