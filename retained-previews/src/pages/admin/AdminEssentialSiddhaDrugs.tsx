import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const blank = {
  name: "", category: "Chooranam", indications_text: "",
  dose: "", precautions: "", mode_of_administration: "", pack_size: "",
  preferred_use: "Both", reference_text: "", description: "",
};

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const AdminEssentialSiddhaDrugs = () => {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...blank });

  const load = async () => {
    const { data } = await (supabase as any).from("essential_siddha_drugs").select("*").order("category").order("name");
    setDrugs(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (d: any) => {
    setEditing(d);
    setForm({
      name: d.name, category: d.category,
      indications_text: (d.indications ?? []).join(", "),
      dose: d.dose ?? "", precautions: d.precautions ?? "",
      mode_of_administration: d.mode_of_administration ?? "",
      pack_size: d.pack_size ?? "", preferred_use: d.preferred_use ?? "Both",
      reference_text: d.reference_text ?? "", description: d.description ?? "",
    });
    setOpen(true);
  };

  const startNew = () => { setEditing(null); setForm({ ...blank }); setOpen(true); };

  const save = async () => {
    const payload: any = {
      name: form.name, category: form.category,
      indications: form.indications_text.split(",").map((x) => x.trim()).filter(Boolean),
      dose: form.dose || null, precautions: form.precautions || null,
      mode_of_administration: form.mode_of_administration || null,
      pack_size: form.pack_size || null, preferred_use: form.preferred_use || null,
      reference_text: form.reference_text || null, description: form.description || null,
    };
    if (editing) {
      const { error } = await (supabase as any).from("essential_siddha_drugs").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    } else {
      payload.slug = `${slugify(form.name)}-${Date.now().toString(36)}`;
      const { error } = await (supabase as any).from("essential_siddha_drugs").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Created");
    }
    setOpen(false); load();
  };

  const remove = async (d: any) => {
    if (!confirm(`Delete "${d.name}"?`)) return;
    const { error } = await (supabase as any).from("essential_siddha_drugs").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const filtered = drugs.filter((d) => {
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return `${d.name} ${d.category} ${(d.indications ?? []).join(" ")}`.toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4 p-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">Essential Siddha Drugs</h1>
            <p className="text-xs text-muted-foreground">{drugs.length} formulations · AYUSH National List</p>
          </div>
          <Button onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add drug</Button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Indications</th>
              <th className="p-3">Dose</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-border last:border-0">
                <td className="p-3 font-medium">{d.name}</td>
                <td className="p-3"><Badge variant="secondary">{d.category}</Badge></td>
                <td className="p-3 text-xs text-muted-foreground line-clamp-1 max-w-xs">
                  {(d.indications ?? []).slice(0, 5).join(", ")}
                </td>
                <td className="p-3 text-xs">{d.dose ?? "—"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(d)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} drug</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Category *</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <div><Label>Indications (comma-separated)</Label>
              <Input value={form.indications_text} onChange={(e) => setForm({ ...form, indications_text: e.target.value })}
                placeholder="Suram, Vaandhi, Mega Noi" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Dose</Label><Input value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} /></div>
              <div><Label>Mode of administration</Label><Input value={form.mode_of_administration} onChange={(e) => setForm({ ...form, mode_of_administration: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Pack size</Label><Input value={form.pack_size} onChange={(e) => setForm({ ...form, pack_size: e.target.value })} /></div>
              <div><Label>Preferred use</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.preferred_use} onChange={(e) => setForm({ ...form, preferred_use: e.target.value })}>
                  <option>Both</option><option>OPD</option><option>IPD</option>
                </select>
              </div>
            </div>
            <div><Label>Precautions</Label><Textarea rows={2} value={form.precautions} onChange={(e) => setForm({ ...form, precautions: e.target.value })} /></div>
            <div><Label>Reference</Label><Input value={form.reference_text} onChange={(e) => setForm({ ...form, reference_text: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={save} disabled={!form.name || !form.category}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEssentialSiddhaDrugs;
