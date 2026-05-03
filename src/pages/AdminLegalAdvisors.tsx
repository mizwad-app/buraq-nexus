import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit2, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import type { LegalAdvisor } from "@/components/business/LegalAdvisorsList";

const SPECIALIZATIONS = ["contracts", "intellectual_property", "tax", "disputes", "immigration", "corporate"];
const LANGUAGES = ["zh", "en", "ru", "ar", "uz"];

type FormState = Partial<LegalAdvisor>;

const empty: FormState = {
  name: "",
  firm_name: "",
  city: "",
  specializations: [],
  languages: [],
  phone: "",
  wechat_id: "",
  email: "",
  office_address: "",
  bio: "",
  avatar_url: "",
  years_experience: 0,
  buraq_verified: false,
  is_active: true,
  display_order: 0,
};

const AdminLegalAdvisors = () => {
  const [items, setItems] = useState<LegalAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("legal_advisors")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    else setItems((data || []) as LegalAdvisor[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleArr = (arr: string[] = [], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.firm_name || !editing.city || !editing.specializations?.length || !editing.languages?.length) {
      toast.error("Name, firm, city, specializations and languages are required.");
      return;
    }
    setSaving(true);
    const payload = {
      name: editing.name,
      firm_name: editing.firm_name,
      city: editing.city,
      specializations: editing.specializations || [],
      languages: editing.languages || [],
      phone: editing.phone || null,
      wechat_id: editing.wechat_id || null,
      email: editing.email || null,
      office_address: editing.office_address || null,
      bio: editing.bio || null,
      avatar_url: editing.avatar_url || null,
      years_experience: Number(editing.years_experience) || 0,
      buraq_verified: !!editing.buraq_verified,
      is_active: editing.is_active !== false,
      display_order: Number(editing.display_order) || 0,
    };
    const { error } = editing.id
      ? await supabase.from("legal_advisors").update(payload).eq("id", editing.id)
      : await supabase.from("legal_advisors").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Saqlandi");
    setEditing(null);
    fetchItems();
  };

  const toggleActive = async (a: LegalAdvisor) => {
    const { error } = await supabase
      .from("legal_advisors")
      .update({ is_active: !a.is_active })
      .eq("id", a.id);
    if (error) toast.error(error.message);
    else fetchItems();
  };

  const doDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("legal_advisors").delete().eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("O'chirildi");
      fetchItems();
    }
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Huquqshunoslar</h1>
          <p className="text-sm text-muted-foreground">Legal advisors directory</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="gap-2">
          <Plus className="w-4 h-4" /> Yangi advokat
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Firm</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Langs</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell>{a.firm_name}</TableCell>
                  <TableCell>{a.city}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.specializations.map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary">{s}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.languages.map((l) => (
                        <span key={l} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary">{l}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {a.buraq_verified && <ShieldCheck className="w-4 h-4 text-primary" />}
                  </TableCell>
                  <TableCell>
                    <Switch checked={a.is_active} onCheckedChange={() => toggleActive(a)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(a.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Sheet open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Tahrirlash" : "Yangi advokat"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="mt-4 space-y-3">
              <div>
                <Label>Name *</Label>
                <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Firm *</Label>
                <Input value={editing.firm_name || ""} onChange={(e) => setEditing({ ...editing, firm_name: e.target.value })} />
              </div>
              <div>
                <Label>City *</Label>
                <Input value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              </div>
              <div>
                <Label>Specializations *</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {SPECIALIZATIONS.map((s) => {
                    const active = editing.specializations?.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setEditing({ ...editing, specializations: toggleArr(editing.specializations, s) })}
                        className={`px-2.5 py-1 rounded-full text-xs border ${active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Languages *</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {LANGUAGES.map((l) => {
                    const active = editing.languages?.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setEditing({ ...editing, languages: toggleArr(editing.languages, l) })}
                        className={`px-2.5 py-1 rounded-full text-xs border ${active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editing.phone || ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div>
                <Label>WeChat ID</Label>
                <Input value={editing.wechat_id || ""} onChange={(e) => setEditing({ ...editing, wechat_id: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div>
                <Label>Office address</Label>
                <Input value={editing.office_address || ""} onChange={(e) => setEditing({ ...editing, office_address: e.target.value })} />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input value={editing.avatar_url || ""} onChange={(e) => setEditing({ ...editing, avatar_url: e.target.value })} />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Years experience</Label>
                  <Input type="number" value={editing.years_experience ?? 0} onChange={(e) => setEditing({ ...editing, years_experience: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Display order</Label>
                  <Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex items-center justify-between bg-secondary/40 rounded-lg p-3">
                <Label>Mizwad verified</Label>
                <Switch checked={!!editing.buraq_verified} onCheckedChange={(v) => setEditing({ ...editing, buraq_verified: v })} />
              </div>
              <div className="flex items-center justify-between bg-secondary/40 rounded-lg p-3">
                <Label>Active</Label>
                <Switch checked={editing.is_active !== false} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">Bekor qilish</Button>
                <Button onClick={save} disabled={saving} className="flex-1">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Saqlash"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O'chirishni tasdiqlang</AlertDialogTitle>
            <AlertDialogDescription>Bu advokatni butunlay o'chirasiz. Bu amalni qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminLegalAdvisors;
