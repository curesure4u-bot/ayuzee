import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Condition {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  product_name: string | null;
  product_image_url: string | null;
  price: number;
  discount_price: number | null;
  highlights: any;
  how_it_works: any;
  packages: any;
  doctor_feedback: any;
  patient_feedback: any;
  approach_title: string | null;
  approach_body: string | null;
  approach_image_url: string | null;
  plan_steps: any;
  ingredients: any;
  faqs: any;
  sort_order: number;
  is_published: boolean;
}

const empty: Partial<Condition> = {
  slug: "", name: "", tagline: "", hero_title: "", hero_subtitle: "", hero_image_url: "",
  product_name: "", product_image_url: "", price: 0, discount_price: null,
  highlights: [], how_it_works: [], packages: [], doctor_feedback: [], patient_feedback: [],
  approach_title: "", approach_body: "", approach_image_url: "",
  plan_steps: [], ingredients: [], faqs: [], sort_order: 0, is_published: true,
};

const JsonField = ({ label, value, onChange, hint }: { label: string; value: any; onChange: (v: any) => void; hint?: string }) => {
  const [text, setText] = useState(JSON.stringify(value ?? [], null, 2));
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setText(JSON.stringify(value ?? [], null, 2)); }, [value]);
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Textarea
        rows={6}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try { onChange(JSON.parse(e.target.value)); setErr(null); }
          catch (er: any) { setErr(er.message); }
        }}
        className="font-mono text-xs"
      />
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
};

const AdminHealthConditions = () => {
  const [items, setItems] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Condition> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("health_conditions").select("*").order("sort_order", { ascending: true });
    setItems((data as Condition[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.name) { toast.error("Slug and name required"); return; }
    const payload = { ...editing };
    delete (payload as any).id;
    if (editing.id) {
      const { error } = await supabase.from("health_conditions").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("health_conditions").insert(payload as any);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this condition?")) return;
    const { error } = await supabase.from("health_conditions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Health Conditions</h1>
          <p className="text-sm text-muted-foreground">Manage condition pages, packages, and content.</p>
        </div>
        <Button variant="hero" onClick={() => setEditing({ ...empty })}>
          <Plus className="mr-2 h-4 w-4" /> Add Condition
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-3">
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{c.slug}</span>
                  {!c.is_published && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Hidden</span>}
                </div>
                {c.tagline && <p className="text-sm text-muted-foreground">{c.tagline}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Condition" : "Add Condition"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Slug *</Label><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="diabetes-care" /></div>
                <div><Label>Name *</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="md:col-span-2"><Label>Tagline</Label><Input value={editing.tagline ?? ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} /></div>
                <div><Label>Hero Title</Label><Input value={editing.hero_title ?? ""} onChange={(e) => setEditing({ ...editing, hero_title: e.target.value })} /></div>
                <div><Label>Hero Subtitle</Label><Input value={editing.hero_subtitle ?? ""} onChange={(e) => setEditing({ ...editing, hero_subtitle: e.target.value })} /></div>
                <div><Label>Hero Image URL</Label><Input value={editing.hero_image_url ?? ""} onChange={(e) => setEditing({ ...editing, hero_image_url: e.target.value })} /></div>
                <div><Label>Product Image URL</Label><Input value={editing.product_image_url ?? ""} onChange={(e) => setEditing({ ...editing, product_image_url: e.target.value })} /></div>
                <div><Label>Product Name</Label><Input value={editing.product_name ?? ""} onChange={(e) => setEditing({ ...editing, product_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Price (₹)</Label><Input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
                  <div><Label>Discount Price</Label><Input type="number" value={editing.discount_price ?? ""} onChange={(e) => setEditing({ ...editing, discount_price: e.target.value ? Number(e.target.value) : null })} /></div>
                </div>
                <div><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={!!editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
                  <Label>Published</Label>
                </div>
              </div>

              <JsonField label="Highlights (string[])" value={editing.highlights} onChange={(v) => setEditing({ ...editing, highlights: v })}
                hint='e.g. ["Cuts down complications","Improves sleep"]' />

              <JsonField label="Packages" value={editing.packages} onChange={(v) => setEditing({ ...editing, packages: v })}
                hint='[{"label":"1 Month","units":"120 Tablets","price":1428,"discount_price":1356,"in_stock":true}]' />

              <JsonField label="How it works (steps)" value={editing.how_it_works} onChange={(v) => setEditing({ ...editing, how_it_works: v })}
                hint='[{"title":"Controls glucose","description":"…","image_url":"…"}]' />

              <JsonField label="Doctor Feedback" value={editing.doctor_feedback} onChange={(v) => setEditing({ ...editing, doctor_feedback: v })}
                hint='[{"doctor_name":"Dr. X","video_url":"…","thumbnail_url":"…","quote":"…"}]' />

              <JsonField label="Patient Feedback" value={editing.patient_feedback} onChange={(v) => setEditing({ ...editing, patient_feedback: v })}
                hint='[{"patient_name":"…","location":"…","video_url":"…","thumbnail_url":"…","quote":"…"}]' />

              <div className="grid gap-3 md:grid-cols-2">
                <div><Label>Approach Title</Label><Input value={editing.approach_title ?? ""} onChange={(e) => setEditing({ ...editing, approach_title: e.target.value })} /></div>
                <div><Label>Approach Image URL</Label><Input value={editing.approach_image_url ?? ""} onChange={(e) => setEditing({ ...editing, approach_image_url: e.target.value })} /></div>
              </div>
              <div><Label>Approach Body</Label><Textarea rows={3} value={editing.approach_body ?? ""} onChange={(e) => setEditing({ ...editing, approach_body: e.target.value })} /></div>

              <JsonField label="Plan Steps (months)" value={editing.plan_steps} onChange={(v) => setEditing({ ...editing, plan_steps: v })}
                hint='[{"month":"Month-1","items":[{"title":"…","description":"…"}]}]' />

              <JsonField label="Ingredients" value={editing.ingredients} onChange={(v) => setEditing({ ...editing, ingredients: v })}
                hint='[{"name":"Haritaki","image_url":"…"}]' />

              <JsonField label="FAQs" value={editing.faqs} onChange={(v) => setEditing({ ...editing, faqs: v })}
                hint='[{"q":"…","a":"…"}]' />

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="hero" onClick={save}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHealthConditions;
