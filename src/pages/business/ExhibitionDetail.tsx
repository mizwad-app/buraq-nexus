import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CalendarPlus, Globe, Share2, Navigation, Hotel, Users, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { fetchExhibitionsForCategory } from "@/lib/businessFetchers";
import { PlacePlaceholder } from "@/components/business/PlacePlaceholder";
import { MizwadInsightBox } from "@/components/business/MizwadInsightBox";
import { exhibitionFlag } from "@/lib/exhibitionFlags";
import { toast } from "sonner";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  [k: string]: unknown;
}

interface Exhibition {
  id: string;
  name: string;
  city: string;
  venue?: string | null;
  start_date: string;
  end_date: string;
  category?: string | null;
  website_url?: string | null;
  description?: string | null;
  [k: string]: unknown;
}

const MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const fmtRange = (s: string, e: string) => {
  const a = new Date(s);
  const b = new Date(e);
  if (a.getMonth() === b.getMonth()) return `${a.getDate()}-${b.getDate()} ${MONTHS_UZ[a.getMonth()]} ${a.getFullYear()}`;
  return `${a.getDate()} ${MONTHS_UZ[a.getMonth()]} – ${b.getDate()} ${MONTHS_UZ[b.getMonth()]} ${b.getFullYear()}`;
};

const Action = ({ icon: Icon, label, onClick, disabled }: { icon: React.ElementType; label: string; onClick?: () => void; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] disabled:opacity-30 active:scale-95 min-h-[60px]"
  >
    <Icon className="w-4 h-4 text-emerald-400" />
    <span className="text-[10px] text-foreground">{label}</span>
  </button>
);

const InfoRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
  <div className="flex items-start justify-between gap-3 py-2 border-b border-white/[0.05] last:border-0">
    <span className="text-[11px] text-muted-foreground">{label}</span>
    {href ? (
      <a href={href} target="_blank" rel="noreferrer" className="text-[12px] text-emerald-400 text-right break-all">
        {value}
      </a>
    ) : (
      <span className="text-[12px] text-foreground text-right break-words flex-1">{value}</span>
    )}
  </div>
);

const downloadIcs = (ex: Exhibition) => {
  const fmt = (d: string) => d.replace(/-/g, "");
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mizwad//Exhibition//EN
BEGIN:VEVENT
UID:${ex.id}@mizwad
DTSTART;VALUE=DATE:${fmt(ex.start_date)}
DTEND;VALUE=DATE:${fmt(ex.end_date)}
SUMMARY:${ex.name}
LOCATION:${ex.venue ?? ""} ${ex.city}
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ex.name}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

const ExhibitionDetail = () => {
  const navigate = useNavigate();
  const { categorySlug = "", exhibitionId = "" } = useParams();
  const { getField } = useTranslatedField();
  useSwipeBack();

  const [category, setCategory] = useState<Category | null>(null);
  const [ex, setEx] = useState<Exhibition | null>(null);
  const [related, setRelated] = useState<Exhibition[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [catR, exR] = await Promise.all([
        supabase.from("product_categories").select("*").eq("slug", categorySlug).maybeSingle(),
        supabase.from("exhibitions").select("*").eq("id", exhibitionId).maybeSingle(),
      ]);
      const cat = catR.data as Category | null;
      const e = exR.data as Exhibition | null;
      if (cat) setCategory(cat);
      if (e) setEx(e);
      if (e && cat) {
        const all = await fetchExhibitionsForCategory(categorySlug, cat.name);
        setRelated((all as unknown as Exhibition[]).filter((x) => x.id !== e.id).slice(0, 3));
        const ins = await supabase
          .from("mizwad_city_insights")
          .select("insight_uz")
          .eq("category_slug", categorySlug)
          .eq("city", e.city)
          .maybeSingle();
        if (ins.data) setInsight((ins.data as { insight_uz: string }).insight_uz);
      }
      setLoading(false);
    })();
  }, [categorySlug, exhibitionId]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!ex) return <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">Ko'rgazma topilmadi</div>;

  const name = getField(ex as unknown as Record<string, unknown>, "name") || ex.name;
  const venue = getField(ex as unknown as Record<string, unknown>, "venue") || (ex.venue as string | undefined);
  const description = getField(ex as unknown as Record<string, unknown>, "description") || (ex.description as string | undefined);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Havola nusxalandi");
  };

  const handleNavigate = () => {
    const q = `${venue ?? ""} ${ex.city}`.trim();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <div className="relative h-44 w-full">
        <PlacePlaceholder emoji={category?.emoji ?? "📅"} />
        <button onClick={() => navigate(-1)} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 pt-4">
        <h1 className="text-lg font-semibold text-foreground leading-tight">{name}</h1>
        <p className="text-[12px] text-muted-foreground mt-1">📅 {fmtRange(ex.start_date, ex.end_date)}</p>
        <p className="text-[12px] text-muted-foreground">📍 {ex.city} 🇨🇳{venue ? ` · ${venue}` : ""}</p>
      </div>

      <div className="px-5 mt-4 grid grid-cols-4 gap-2">
        <Action icon={CalendarPlus} label="Kalendar" onClick={() => downloadIcs(ex)} />
        <Action icon={Navigation} label="Yo'l" onClick={handleNavigate} />
        <Action icon={Globe} label="Sayt" onClick={() => ex.website_url && window.open(ex.website_url, "_blank")} disabled={!ex.website_url} />
        <Action icon={Share2} label="Ulashish" onClick={handleShare} />
      </div>

      <section className="px-5 mt-5">
        <div className="bg-card border border-border/40 rounded-xl px-3 py-1">
          <InfoRow label="Sana" value={fmtRange(ex.start_date, ex.end_date)} />
          <InfoRow label="Joy" value={`${venue ?? ""} ${ex.city}`.trim()} />
          {ex.website_url && <InfoRow label="Veb-sayt" value={ex.website_url} href={ex.website_url} />}
          {ex.category && <InfoRow label="Kategoriya" value={ex.category} />}
        </div>
      </section>

      {description && (
        <section className="px-5 mt-3">
          <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
        </section>
      )}

      {insight && (
        <section className="px-5 mt-4">
          <MizwadInsightBox text={insight} />
        </section>
      )}

      <section className="px-5 mt-6">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">Sayohatga tayyorgarlik</p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => navigate(`/travel`)} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border/40">
            <Hotel className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-foreground">Mehmonxona</span>
          </button>
          <button onClick={() => navigate(`/translators`)} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border/40">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-foreground">Tarjimon</span>
          </button>
          <button onClick={() => navigate(`/travel`)} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border/40">
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-foreground">Halol joylar</span>
          </button>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-5 mt-6">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">Shu kategoriyada yana</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/business/exhibitions/${categorySlug}/${r.id}`)}
                className="shrink-0 w-44 bg-card border border-border/40 rounded-xl p-3 text-left"
              >
                <p className="text-[12px] font-medium text-foreground line-clamp-2">{getField(r as unknown as Record<string, unknown>, "name") || r.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{r.city}</p>
                <p className="text-[10px] text-muted-foreground">{fmtRange(r.start_date, r.end_date)}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ExhibitionDetail;
