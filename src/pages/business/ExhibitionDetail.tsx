import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, CalendarPlus, Globe, Share2, Navigation, Hotel, Users, UtensilsCrossed, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { cityNameToSlug, useCityExists } from "@/hooks/useCityLink";
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
  country_code?: string | null;
  country_name?: string | null;
  world_rank?: number | null;
  china_rank?: number | null;
  regional_rank?: string | null;
  attendees_count?: number | null;
  countries_count?: number | null;
  exhibitors_count?: number | null;
  area_sqm?: number | null;
  frequency?: string | null;
  recurring_pattern?: string | null;
  mizwad_note_uz?: string | null;
  mizwad_note_ru?: string | null;
  mizwad_note_en?: string | null;
  official_website?: string | null;
  data_source?: string | null;
  data_verified_date?: string | null;
  phase_number?: number | null;
  phase_info_uz?: string | null;
  phase_info_ru?: string | null;
  phase_info_en?: string | null;
  [k: string]: unknown;
}

const fmtRange = (months: string[], s: string, e: string) => {
  const a = new Date(s);
  const b = new Date(e);
  if (a.getMonth() === b.getMonth()) return `${a.getDate()}-${b.getDate()} ${months[a.getMonth()]} ${a.getFullYear()}`;
  return `${a.getDate()} ${months[a.getMonth()]} – ${b.getDate()} ${months[b.getMonth()]} ${b.getFullYear()}`;
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
  const { t, i18n } = useTranslation();
  const { categorySlug = "", exhibitionId = "" } = useParams();
  const { getField } = useTranslatedField();
  useSwipeBack();
  const months = t("business.months", { returnObjects: true }) as string[];
  const lang = i18n.language;

  const [category, setCategory] = useState<Category | null>(null);
  const [ex, setEx] = useState<Exhibition | null>(null);
  const [related, setRelated] = useState<Exhibition[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const citySlug = cityNameToSlug(ex?.city ?? null);
  const { data: cityExists } = useCityExists(ex?.city ?? null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [catR, exR] = await Promise.all([
        supabase.from("product_categories").select("*").eq("slug", categorySlug).maybeSingle(),
        supabase.from("exhibitions").select("*, exhibition_category:exhibition_categories!exhibitions_category_id_fkey(id, slug, emoji, name_uz, name_en, name_ru, name_ar, name_zh)").eq("id", exhibitionId).maybeSingle(),
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
  if (!ex) return <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">{t("business.exhibitionDetail.notFound")}</div>;

  const name = getField(ex as unknown as Record<string, unknown>, "name") || ex.name;
  const venue = getField(ex as unknown as Record<string, unknown>, "venue") || (ex.venue as string | undefined);
  const description = getField(ex as unknown as Record<string, unknown>, "description") || (ex.description as string | undefined);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); return; } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    toast.success(t("business.exhibitionDetail.linkCopied"));
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
        <p className="text-[12px] text-muted-foreground mt-1">📅 {fmtRange(months, ex.start_date, ex.end_date)}</p>
        <p className="text-[12px] text-muted-foreground">
          📍 {ex.city && cityExists && citySlug ? (
            <Link to={`/city/${citySlug}`} className="inline-flex items-center gap-0.5 text-emerald-400 hover:underline">
              {ex.city}
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : ex.city}
          {exhibitionFlag(ex.country_code)}
          {ex.country_code && ex.country_code !== "CN" && ex.country_name ? ` (${ex.country_name})` : ""}
          {venue ? ` · ${venue}` : ""}
        </p>
      </div>

      <div className="px-5 mt-2 flex items-center gap-1.5 flex-wrap">
        {ex.is_international === true && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🌐 {t("exhibitions.badge.international")}
          </span>
        )}
        {ex.is_international === false && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            🇨🇳 {t("exhibitions.badge.domestic")}
          </span>
        )}
        {(() => {
          const cat = ex.exhibition_category as { emoji?: string | null; name_en?: string | null; name_uz?: string | null; [k: string]: unknown } | null | undefined;
          if (!cat) return null;
          const name = (cat[`name_${lang}`] as string | undefined) ?? cat.name_en ?? cat.name_uz;
          return (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-foreground/80 border border-white/10">
              {cat.emoji ?? "📂"} {name}
            </span>
          );
        })()}
      </div>

      {(ex.world_rank || ex.china_rank || ex.regional_rank || ex.attendees_count) && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide mb-2">{t("business.exhibitionDetail.ratingBlock.title")}</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {ex.china_rank && (
              <div className="rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-[11px]">
                {t("business.exhibitionDetail.chinaRank")} <span className="font-semibold text-foreground">№{ex.china_rank}</span>
              </div>
            )}
            {ex.world_rank && (
              <div className="rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-[11px]">
                {t("business.exhibitionDetail.worldRank")} <span className="font-semibold text-foreground">№{ex.world_rank}</span>
              </div>
            )}
            {ex.regional_rank && !ex.world_rank && (
              <div className="rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-[11px]">{ex.regional_rank}</div>
            )}
          </div>
          {(ex.attendees_count || ex.countries_count || ex.exhibitors_count) && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {ex.attendees_count && (
                <div className="text-center bg-white/[0.03] rounded-lg py-2">
                  <div className="text-sm font-semibold text-foreground">
                    {ex.attendees_count >= 1000 ? `${Math.round(ex.attendees_count / 1000)}K+` : ex.attendees_count}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{t("business.exhibitionDetail.stats.attendees")}</div>
                </div>
              )}
              {ex.countries_count && (
                <div className="text-center bg-white/[0.03] rounded-lg py-2">
                  <div className="text-sm font-semibold text-foreground">{ex.countries_count}+</div>
                  <div className="text-[10px] text-muted-foreground">{t("business.exhibitionDetail.stats.countries")}</div>
                </div>
              )}
              {ex.exhibitors_count && (
                <div className="text-center bg-white/[0.03] rounded-lg py-2">
                  <div className="text-sm font-semibold text-foreground">
                    {ex.exhibitors_count >= 1000 ? `${(ex.exhibitors_count / 1000).toFixed(1)}K+` : ex.exhibitors_count}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{t("business.exhibitionDetail.stats.exhibitors")}</div>
                </div>
              )}
            </div>
          )}
          {(ex.frequency || ex.recurring_pattern) && (
            <div className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-amber-500/10">
              🔄 {ex.frequency}
              {ex.recurring_pattern && ` · ${ex.recurring_pattern}`}
            </div>
          )}
        </div>
      )}

      {ex.phase_info_uz && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-base">📋</span>
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">
              {ex.phase_number ? t("business.exhibitionDetail.phase.titleWithNum", { n: ex.phase_number }) : t("business.exhibitionDetail.phase.title")}
            </span>
          </div>
          <p className="text-[13px] text-foreground/90 leading-relaxed">
            {(getField(ex as unknown as Record<string, unknown>, "phase_info") as string) || ex.phase_info_uz}
          </p>
        </div>
      )}

      {ex.mizwad_note_uz && (
        <div className="mx-4 mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3">
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">✦</span>
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-emerald-400 mb-1">{t("business.exhibitionDetail.mizwadAdvice")}</div>
              <div className="text-[12px] text-foreground/90 leading-relaxed">{ex.mizwad_note_uz}</div>
            </div>
          </div>
        </div>
      )}

      {(ex.data_source || ex.official_website) && (
        <div className="mx-4 mt-2 text-[10px] text-muted-foreground/70 leading-relaxed">
          ℹ️ {t("business.exhibitionDetail.sourceNote.before")}{" "}
          {ex.official_website ? (
            <a href={ex.official_website} target="_blank" rel="noreferrer" className="text-emerald-400 underline">{t("business.exhibitionDetail.sourceNote.officialSite")}</a>
          ) : (
            t("business.exhibitionDetail.sourceNote.officialSite")
          )}{" "}
          {t("business.exhibitionDetail.sourceNote.after")}
          {ex.data_source && <span className="block mt-1">{t("business.exhibitionDetail.sourceNote.source", { source: ex.data_source })}</span>}
        </div>
      )}

      <div className="px-5 mt-4 grid grid-cols-4 gap-2">
        <Action icon={CalendarPlus} label={t("business.exhibitionDetail.actions.calendar")} onClick={() => downloadIcs(ex)} />
        <Action icon={Navigation} label={t("business.exhibitionDetail.actions.directions")} onClick={handleNavigate} />
        <Action icon={Globe} label={t("business.exhibitionDetail.actions.website")} onClick={() => (ex.official_website || ex.website_url) && window.open((ex.official_website || ex.website_url)!, "_blank")} disabled={!ex.official_website && !ex.website_url} />
        <Action icon={Share2} label={t("business.exhibitionDetail.actions.share")} onClick={handleShare} />
      </div>

      <section className="px-5 mt-5">
        <div className="bg-card border border-border/40 rounded-xl px-3 py-1">
          <InfoRow label={t("business.exhibitionDetail.info.date")} value={fmtRange(months, ex.start_date, ex.end_date)} />
          <InfoRow label={t("business.exhibitionDetail.info.location")} value={`${venue ?? ""} ${ex.city}`.trim()} />
          {ex.website_url && <InfoRow label={t("business.exhibitionDetail.info.website")} value={ex.website_url} href={ex.website_url} />}
          {ex.category && <InfoRow label={t("business.exhibitionDetail.info.category")} value={ex.category} />}
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
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">{t("business.exhibitionDetail.travelPrep")}</p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => navigate(`/travel`)} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border/40">
            <Hotel className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-foreground">{t("business.exhibitionDetail.travelOptions.hotel")}</span>
          </button>
          <button onClick={() => navigate(`/translators`)} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border/40">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-foreground">{t("business.exhibitionDetail.travelOptions.translator")}</span>
          </button>
          <button onClick={() => navigate(`/travel`)} className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card border border-border/40">
            <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-foreground">{t("business.exhibitionDetail.travelOptions.halal")}</span>
          </button>
        </div>
      </section>

      {related.length > 0 && (
        <section className="px-5 mt-6">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">{t("business.exhibitionDetail.moreInCategory")}</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/business/exhibitions/${categorySlug}/${r.id}`)}
                className="shrink-0 w-44 bg-card border border-border/40 rounded-xl p-3 text-left"
              >
                <p className="text-[12px] font-medium text-foreground line-clamp-2">{getField(r as unknown as Record<string, unknown>, "name") || r.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{r.city}</p>
                <p className="text-[10px] text-muted-foreground">{fmtRange(months, r.start_date, r.end_date)}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ExhibitionDetail;
