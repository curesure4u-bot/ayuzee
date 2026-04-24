import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

type Therapy = {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  description: string | null;
  price: number;
  duration_minutes: number;
  benefits: string[];
  image_url: string | null;
  is_active: boolean;
  is_published: boolean;
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const empty = {
  id: "", name: "", slug: "", category: "Ayurveda",
  short_description: "", description: "", price: "0", duration_minutes: "60",
  benefits: "", image_url: "", is_active: true, is_published: true,
};

const AdminTherapies = () => {
  const [items, setItems] = useState<Therapy[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Therapy | null>(null);

  useEffect(() => {
    document.title = "Admin · Therapies — Ayuzee";
    load();
  }, []);

  const load = async () => {
    const { data, error } = await supabase.from("therapies").select("*").order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setItems((data ?? []) as Therapy[]);
  };

  const startEdit = (t: Therapy) => {
    setEditing(t);
    setForm({
      id: t.id, name: t.name, slug: t.slug, category: t.category,
      short_description: t.short_description ?? "", description: t.description ?? "",
      price: String(t.price), duration_minutes: String(t.duration_minutes),
      benefits: (t.benefits ?? []).join(", "), image_url: t.image_url ?? "",
      is_active: t.is_active, is_published: t.is_published,
    });
    setOpen(true);
  };

  const startNew = () => { setEditing(null); setForm(empty); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const payload = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      category: form.category.trim() || "Ayurveda",
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      price: Number(form.price) || 0,
      duration_minutes: Number(form.duration_minutes) || 60,
      benefits: form.benefits.split(",").map((s) => s.trim()).filter(Boolean),
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
      is_published: form.is_published,
    };
    const { error } = editing
      ? await supabase.from("therapies").update(payload).eq("id", editing.id)
      : await supabase.from("therapies").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Therapy updated" : "Therapy added");
    setOpen(false);
    load();
  };

  const togglePublished = async (t: Therapy) => {
    const { error } = await supabase.from("therapies").update({ is_published: !t.is_published }).eq("id", t.id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this therapy?")) return;
    const { error } = await supabase.from("therapies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Therapies Catalog</h1>
          <p className="text-sm text-muted-foreground">Manage public wellness therapies.</p>
        </div>
        <Button onClick={startNew}><Plus className="mr-1 h-4 w-4" /> New Therapy</Button>
      </div>
        <Card className="p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="font-display text-xl">Public Therapy Catalog</h1>
              <p className="text-xs text-muted-foreground">
                Patients see only <strong>published &amp; active</strong> therapies. Use this for general wellness therapies (Abhyanga, Shirodhara, etc.) with prices.
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No therapies yet. Click <strong>New Therapy</strong> to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-2">Name</th>
                    <th className="py-2 pr-2">Category</th>
                    <th className="py-2 pr-2 text-right">Price</th>
                    <th className="py-2 pr-2 text-center">Published</th>
                    <th className="py-2 pr-2 text-right w-32">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2.5 pr-2">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">/{t.slug}</div>
                      </td>
                      <td className="py-2.5 pr-2"><Badge variant="secondary">{t.category}</Badge></td>
                      <td className="py-2.5 pr-2 text-right font-semibold text-primary">₹{t.price.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 pr-2 text-center">
                        <button onClick={() => togglePublished(t)} className="inline-flex items-center gap-1 text-xs">
                          {t.is_published ? <><Eye className="h-3.5 w-3.5 text-primary" /> Live</> : <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> Hidden</>}
                        </button>
                      </td>
                      <td className="py-2.5 pr-2 text-right">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="mt-4 p-4 border-dashed">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              <strong>Note:</strong> If you don't see this admin panel, your account needs the <code>admin</code> role assigned in <code>user_roles</code>. The full Ayush 2026 benchmark catalog (236 therapies) remains private and doctor-only inside Ayush HMS Tool — patients only see therapies you publish here.
            </div>
          </div>
        </Card>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} therapy</DialogTitle></DialogHeader>
          <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} placeholder="Abhyanga" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="abhyanga" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ayurveda" /></div>
              <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} /></div>
            </div>
            <div><Label>Short description</Label><Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Full-body warm oil massage" /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Benefits (comma-separated)</Label><Input value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="Stress relief, Better sleep, Joint mobility" /></div>
            <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /> Published (visible to patients)</label>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? "Save changes" : "Add therapy"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTherapies;
