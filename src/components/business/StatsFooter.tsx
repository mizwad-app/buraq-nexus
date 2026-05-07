import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const StatsFooter = () => {
  const [stats, setStats] = useState({ markets: 0, hubs: 0, exhibitions: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [m, h, e] = await Promise.all([
        supabase.from("wholesale_markets").select("id", { count: "exact", head: true }),
        supabase.from("production_hubs").select("id", { count: "exact", head: true }),
        supabase
          .from("exhibitions")
          .select("id", { count: "exact", head: true })
          .gte("end_date", today)
          .eq("is_active", true),
      ]);
      setStats({
        markets: m.count ?? 0,
        hubs: h.count ?? 0,
        exhibitions: e.count ?? 0,
      });
    })();
  }, []);

  return (
    <div className="space-y-2.5">
      <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-emerald-400 text-xs">✦</span>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
            Mizwad'da hozir
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatItem value={stats.markets} label="Bozor" />
          <StatItem value={stats.hubs} label="Hub" />
          <StatItem value={stats.exhibitions} label="Ko'rgazma" />
        </div>
      </div>

      <button
        onClick={() => navigate("/business/lawyers")}
        className="w-full text-left text-[12px] text-muted-foreground hover:text-foreground py-2 px-1 flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span>⚖️</span>
          <span>Yuridik yordam (advokatlar)</span>
        </span>
        <span>→</span>
      </button>
    </div>
  );
};

const StatItem = ({ value, label }: { value: number; label: string }) => (
  <div className="text-center">
    <p className="text-xl font-semibold text-emerald-400 leading-none">{value}+</p>
    <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
  </div>
);
