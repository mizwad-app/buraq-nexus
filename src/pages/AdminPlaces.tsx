import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlaceType = "park" | "mall" | "historical" | "market";

const TABLE_BY_TYPE: Record<PlaceType, "parks" | "shopping_malls" | "historical_sites" | "markets"> = {
  park: "parks",
  mall: "shopping_malls",
  historical: "historical_sites",
  market: "markets",
};

const TYPE_LABEL: Record<PlaceType, string> = {
  park: "Parklar",
  mall: "Savdo markazlari",
  historical: "Tarixiy joylar",
  market: "Bozorlar",
};

const AMENITIES = ["prayer_room", "halal_food", "kids_area", "wifi", "parking", "atm", "currency_exchange", "wheelchair_accessible"];
const FEATURE_OPTIONS: Record<PlaceType, string[]> = {
  park: ["lake", "garden", "playground", "viewpoint"],
  mall: [],
  historical: ["museum", "guided_tour", "audio_guide"],
  market: ["wholesale", "retail", "food_court"],
};

interface PlaceRow {
  id?: string;
  name: string;
  city: string;
  country?: string;
  address?: string | null;
  address_local?: string | null;
  description?: string | null;
  image_url?: string | null;
  gallery_images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  opening_hours?: Record<string, string> | null;
  phone?: string | null;
  website?: string | null;
  entry_fee?: string | null;
  price_range?: string | null;
  buraq_recommendation?: string | null;
  buraq_recommendation_uz?: string | null;
  buraq_recommendation_ru?: string | null;
  buraq_recommendation_en?: string | null;
  buraq_recommendation_ar?: string | null;
  buraq_recommendation_fr?: string | null;
  buraq_recommendation_zh?: string | null;
  mall_brands?: string[] | null;
  amenities?: string[] | null;
  features?: string[] | null;
  transport_info?: { metro?: string; bus?: string; taxi_friendly?: boolean } | null;
  has_prayer_room?: boolean | null;
  has_halal_food?: boolean | null;
  is_active?: boolean | null;
  rating?: number | null;
  working_hours?: string | null;
  phone_secondary?: string | null;
  email?: string | null;
  district?: string | null;
  district_zh?: string | null;
  working_hours_uz?: string | null;
  working_hours_en?: string | null;
  verification_status?: string | null;
  data_sources?: unknown;
}

const empty = (): PlaceRow => ({
  name: "", city: "", country: "China",
  is_active: true, has_prayer_room: false, has_halal_food: false,
});

export default function AdminPlaces() {
  const [type, setType] = useState<PlaceType>("mall");
  const [rows, setRows] = useState<PlaceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<PlaceRow>(empty());

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(TABLE_BY_TYPE[type]).select("*").order("name");
    if (error) toast.error(error.message);
    setRows((data as unknown as PlaceRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [type]);

  const startEdit = (row?: PlaceRow) => { setDraft(row ? { ...row } : empty()); setEditOpen(true); };

  const save = async () => {
    if (!draft.name || !draft.city) { toast.error("Name va City majburiy"); return; }
    const payload: any = { ...draft };
    // Ensure null arrays not undefined
    const { id, ...rest } = payload;
    const { error } = id
      ? await supabase.from(TABLE_BY_TYPE[type]).update(rest).eq("id", id)
      : await supabase.from(TABLE_BY_TYPE[type]).insert(rest);
    if (error) { toast.error(error.message); return; }
    toast.success("Saqlandi");
    setEditOpen(false);
    load();
  };

  const remove = async (id?: string) => {
    if (!id || !confirm("O'chirish?")) return;
    const { error } = await supabase.from(TABLE_BY_TYPE[type]).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("O'chirildi");
    load();
  };

  const toggleArr = (field: "amenities" | "features", val: string) => {
    const cur = (draft[field] as string[] | null) || [];
    const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val];
    setDraft({ ...draft, [field]: next });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><MapPin className="w-6 h-6" />Joylar</h1>
          <p className="text-muted-foreground text-sm">Savdo markazlari, parklar, tarixiy joylar, bozorlar</p>
        </div>
        <Button onClick={() => startEdit()}><Plus className="w-4 h-4 mr-1" />Qo'shish</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(Object.keys(TYPE_LABEL) as PlaceType[]).map(tp => (
          <button
            key={tp}
            onClick={() => setType(tp)}
            className={cn("px-3 py-1.5 rounded-full text-sm font-medium",
              type === tp ? "bg-primary text-primary-foreground" : "bg-secondary")}
          >
            {TYPE_LABEL[tp]}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>{TYPE_LABEL[type]} ({rows.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p>Yuklanmoqda...</p> : (
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-muted-foreground">{r.city}{r.is_active === false && " · (yashirin)"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(r.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && <p className="text-muted-foreground text-sm">Bo'sh</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader><SheetTitle>{draft.id ? "Tahrirlash" : "Yangi joy"} — {TYPE_LABEL[type]}</SheetTitle></SheetHeader>
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nomi *</Label><Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
              <div><Label>Shahar *</Label><Input value={draft.city} onChange={e => setDraft({ ...draft, city: e.target.value })} /></div>
            </div>
            <div><Label>Tavsif</Label><Textarea value={draft.description || ""} onChange={e => setDraft({ ...draft, description: e.target.value })} /></div>
            <div><Label>Asosiy rasm URL</Label><Input value={draft.image_url || ""} onChange={e => setDraft({ ...draft, image_url: e.target.value })} /></div>
            <div><Label>Galereya (har qator URL)</Label>
              <Textarea value={(draft.gallery_images || []).join("\n")} onChange={e => setDraft({ ...draft, gallery_images: e.target.value.split("\n").filter(Boolean) })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>Manzil (Latin)</Label><Input value={draft.address || ""} onChange={e => setDraft({ ...draft, address: e.target.value })} /></div>
              <div><Label>Manzil (mahalliy)</Label><Input value={draft.address_local || ""} onChange={e => setDraft({ ...draft, address_local: e.target.value })} /></div>
              <div><Label>Latitude</Label><Input type="number" step="0.000001" value={draft.latitude ?? ""} onChange={e => setDraft({ ...draft, latitude: e.target.value ? parseFloat(e.target.value) : null })} /></div>
              <div><Label>Longitude</Label><Input type="number" step="0.000001" value={draft.longitude ?? ""} onChange={e => setDraft({ ...draft, longitude: e.target.value ? parseFloat(e.target.value) : null })} /></div>
              <div><Label>Telefon</Label><Input value={draft.phone || ""} onChange={e => setDraft({ ...draft, phone: e.target.value })} /></div>
              <div><Label>Veb-sayt</Label><Input value={draft.website || ""} onChange={e => setDraft({ ...draft, website: e.target.value })} /></div>
              <div><Label>Kirish narxi</Label><Input value={draft.entry_fee || ""} onChange={e => setDraft({ ...draft, entry_fee: e.target.value })} /></div>
              <div><Label>Narx darajasi</Label>
                <Select value={draft.price_range || ""} onValueChange={v => setDraft({ ...draft, price_range: v || null })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="midrange">Midrange</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div><Label>Ish vaqti (JSON, masalan {`{"all":"10:00-22:00"}`} yoki {`{"mon":"...", ...}`})</Label>
              <Textarea value={draft.opening_hours ? JSON.stringify(draft.opening_hours) : ""}
                onChange={e => { try { setDraft({ ...draft, opening_hours: e.target.value ? JSON.parse(e.target.value) : null }); } catch {} }} />
            </div>

            <div><Label>Transport (JSON: {`{"metro":"...","bus":"...","taxi_friendly":true}`})</Label>
              <Textarea value={draft.transport_info ? JSON.stringify(draft.transport_info) : ""}
                onChange={e => { try { setDraft({ ...draft, transport_info: e.target.value ? JSON.parse(e.target.value) : null }); } catch {} }} />
            </div>

            {/* Contact / verification fields */}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Telefon (qo'shimcha)</Label>
                <Input value={draft.phone_secondary || ""} onChange={e => setDraft({ ...draft, phone_secondary: e.target.value })} placeholder="+86-..." />
              </div>
              <div><Label>Email</Label>
                <Input type="email" value={draft.email || ""} onChange={e => setDraft({ ...draft, email: e.target.value })} />
              </div>
              <div><Label>Tuman / District</Label>
                <Input value={draft.district || ""} onChange={e => setDraft({ ...draft, district: e.target.value })} placeholder="Choucheng" />
              </div>
              <div><Label>Tuman (中文)</Label>
                <Input value={draft.district_zh || ""} onChange={e => setDraft({ ...draft, district_zh: e.target.value })} placeholder="稠城街道" />
              </div>
              <div><Label>Ish vaqti (matn)</Label>
                <Input value={(draft as any).working_hours || ""} onChange={e => setDraft({ ...draft, working_hours: e.target.value } as PlaceRow)} placeholder="08:30-17:00" />
              </div>
              <div><Label>Ish vaqti (UZ)</Label>
                <Input value={draft.working_hours_uz || ""} onChange={e => setDraft({ ...draft, working_hours_uz: e.target.value })} placeholder="08:30-17:00 (har kuni)" />
              </div>
              <div><Label>Ish vaqti (EN)</Label>
                <Input value={draft.working_hours_en || ""} onChange={e => setDraft({ ...draft, working_hours_en: e.target.value })} placeholder="08:30-17:00 (Daily)" />
              </div>
              <div><Label>Tasdiqlash holati</Label>
                <Select value={draft.verification_status || "unverified"} onValueChange={v => setDraft({ ...draft, verification_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unverified">Tasdiqlanmagan</SelectItem>
                    <SelectItem value="admin_verified">Admin tasdiqlagan</SelectItem>
                    <SelectItem value="community_verified">Hamjamiyat tasdiqlagan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Manbalar (JSON: {`[{"url":"...","type":"wikipedia"}]`})</Label>
              <Textarea
                value={draft.data_sources ? JSON.stringify(draft.data_sources) : ""}
                onChange={e => { try { setDraft({ ...draft, data_sources: e.target.value ? JSON.parse(e.target.value) : null }); } catch {} }}
                placeholder='[{"url":"https://...","type":"wikipedia"}]'
              />
            </div>

            {type === "mall" && (
              <div><Label>Brendlar (vergul bilan)</Label>
                <Textarea value={(draft.mall_brands || []).join(", ")} onChange={e => setDraft({ ...draft, mall_brands: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              </div>
            )}

            <div><Label>Xizmatlar</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => {
                  const on = (draft.amenities || []).includes(a);
                  return <button key={a} type="button" onClick={() => toggleArr("amenities", a)}
                    className={cn("px-2 py-1 rounded-full text-xs", on ? "bg-primary text-primary-foreground" : "bg-secondary")}>{a}</button>;
                })}
              </div>
            </div>

            {FEATURE_OPTIONS[type].length > 0 && (
              <div><Label>Xususiyatlar</Label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_OPTIONS[type].map(f => {
                    const on = (draft.features || []).includes(f);
                    return <button key={f} type="button" onClick={() => toggleArr("features", f)}
                      className={cn("px-2 py-1 rounded-full text-xs", on ? "bg-primary text-primary-foreground" : "bg-secondary")}>{f}</button>;
                  })}
                </div>
              </div>
            )}

            <div><Label>Mizwad tavsiyasi (UZ)</Label><Textarea value={draft.buraq_recommendation_uz || draft.buraq_recommendation || ""} onChange={e => setDraft({ ...draft, buraq_recommendation_uz: e.target.value, buraq_recommendation: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              {(["ru", "en", "ar", "fr", "zh"] as const).map(l => (
                <div key={l}><Label>Mizwad ({l.toUpperCase()})</Label>
                  <Textarea value={(draft as any)[`buraq_recommendation_${l}`] || ""} onChange={e => setDraft({ ...draft, [`buraq_recommendation_${l}`]: e.target.value } as PlaceRow)} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2"><Switch checked={!!draft.has_prayer_room} onCheckedChange={v => setDraft({ ...draft, has_prayer_room: v })} /><Label>Namoz xonasi</Label></div>
              <div className="flex items-center gap-2"><Switch checked={!!draft.has_halal_food} onCheckedChange={v => setDraft({ ...draft, has_halal_food: v })} /><Label>Halol oziq-ovqat</Label></div>
              <div className="flex items-center gap-2"><Switch checked={draft.is_active !== false} onCheckedChange={v => setDraft({ ...draft, is_active: v })} /><Label>Faol</Label></div>
            </div>

            <div className="flex gap-2 pt-3">
              <Button onClick={save} className="flex-1">Saqlash</Button>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Bekor qilish</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
