import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Phone, Navigation, Share2, Globe, Clock, MapPin, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslatedField } from "@/hooks/useTranslatedField";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { fetchMarketsForCategory } from "@/lib/businessFetchers";
import { PlacePlaceholder } from "@/components/business/PlacePlaceholder";
import { MizwadInsightBox } from "@/components/business/MizwadInsightBox";
import { toast } from "sonner";

interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  [k: string]: unknown;
}

interface Market {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  address_chinese?: string | null;
  phone?: string | null;
  website?: string | null;
  working_hours?: string | null;
  market_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  [k: string]: unknown;
}

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
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-[12px] text-emerald-400 text-right break-all">
        {value}
      </a>
    ) : (
      <span className="text-[12px] text-foreground text-right break-words flex-1">{value}</span>
    )}
  </div>
);

const MarketDetail = () => {
  const navigate = useNavigate();
  const { categorySlug = "", marketId = "" } = useParams();
  const { getField } = useTranslatedField();
  useSwipeBack();

  const [category, setCategory] = useState<Category | null>(null);
  const [market, setMarket] = useState<Market | null>(null);
  const [related, setRelated] = useState<Market[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [catR, mR] = await Promise.all([
        supabase.from("product_categories").select("*").eq("slug", categorySlug).maybeSingle(),
        supabase.from("wholesale_markets").select("*").eq("id", marketId).maybeSingle(),
      ]);
      const cat = catR.data as Category | null;
      const m = mR.data as Market | null;
      if (cat) setCategory(cat);
      if (m) setMarket(m);

      if (m && cat) {
        const all = await fetchMarketsForCategory(categorySlug, cat.name);
        setRelated((all as unknown as Market[]).filter((x) => x.city === m.city && x.id !== m.id).slice(0, 3));
        const ins = await supabase
          .from("mizwad_city_insights")
          .select("insight_uz")
          .eq("category_slug", categorySlug)
          .eq("city", m.city)
          .maybeSingle();
        if (ins.data) setInsight((ins.data as { insight_uz: string }).insight_uz);
      }
      setLoading(false);
    })();
  }, [categorySlug, marketId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        Bozor topilmadi
      </div>
    );
  }

  const name = getField(market as unknown as Record<string, unknown>, "name") || market.name;
  const address = getField(market as unknown as Record<string, unknown>, "address") || market.address || market.address_chinese;
  const description = getField(market as unknown as Record<string, unknown>, "description") || (market.description as string | undefined);
  const filledFields = [market.phone, market.website, market.working_hours, address, market.latitude].filter(Boolean).length;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch { /* cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Havola nusxalandi");
  };

  const handleNavigate = () => {
    if (market.latitude && market.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${market.latitude},${market.longitude}`, "_blank");
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address as string)}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background safe-bottom pb-24">
      <div className="relative h-44 w-full">
        {market.image_url ? (
          <img src={market.image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <PlacePlaceholder emoji={category?.emoji} />
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-5 pt-4">
        <h1 className="text-lg font-semibold text-foreground leading-tight">{name}</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {market.city} 🇨🇳 {market.market_type ? `· ${market.market_type}` : ""}
        </p>
      </div>

      <div className="px-5 mt-4 grid grid-cols-4 gap-2">
        <Action icon={Phone} label="Qo'ng'iroq" onClick={() => market.phone && (window.location.href = `tel:${market.phone}`)} disabled={!market.phone} />
        <Action icon={Navigation} label="Yo'l ko'rsat" onClick={handleNavigate} disabled={!market.latitude && !address} />
        <Action icon={Globe} label="Sayt" onClick={() => market.website && window.open(market.website, "_blank")} disabled={!market.website} />
        <Action icon={Share2} label="Ulashish" onClick={handleShare} />
      </div>

      <section className="px-5 mt-5">
        <div className="bg-card border border-border/40 rounded-xl px-3 py-1">
          {address && <InfoRow label="Manzil" value={address as string} />}
          {market.address_chinese && market.address_chinese !== address && (
            <InfoRow label="中文地址" value={market.address_chinese} />
          )}
          {market.working_hours && <InfoRow label="Ish vaqti" value={market.working_hours} />}
          {market.phone && <InfoRow label="Telefon" value={market.phone} href={`tel:${market.phone}`} />}
          {market.website && <InfoRow label="Sayt" value={market.website} href={market.website} />}
          {market.market_type && <InfoRow label="Mahsulotlar" value={market.market_type} />}
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

      {filledFields < 2 && (
        <p className="px-5 mt-4 text-[11px] text-muted-foreground italic">
          Bu bozor haqida to'liq ma'lumot tez orada qo'shiladi.
        </p>
      )}

      {related.length > 0 && (
        <section className="px-5 mt-6">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 font-medium">Shu shaharda yana</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/business/markets/${categorySlug}/${r.id}`)}
                className="shrink-0 w-44 bg-card border border-border/40 rounded-xl p-3 text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <p className="text-[12px] font-medium text-foreground line-clamp-2">
                    {getField(r as unknown as Record<string, unknown>, "name") || r.name}
                  </p>
                </div>
                {r.market_type && <p className="text-[10px] text-muted-foreground truncate">{r.market_type}</p>}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MarketDetail;
