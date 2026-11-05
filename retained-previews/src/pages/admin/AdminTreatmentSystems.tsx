import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Stethoscope } from "lucide-react";

interface System {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_published: boolean;
}
interface Condition {
  id: string;
  name: string;
  slug: string;
  system_id: string | null;
}

const empty: Partial<System> = { slug: "", name: "", description: "", icon: "", sort_order: 0, is_published: true };

const AdminTreatmentSystems = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<System> | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from("treatment_systems").select("*").order("sort_order"),
      supabase.from("health_conditions").select("id,name,slug,system_id").order("name"),
    ]);
    setSystems((s as System[]) ?? []);
    setConditions((c as Condition[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.name) { toast.error("Slug and name required"); return; }
    const payload = { ...editing };
    delete (payload as any).id;
    if (editing.id) {
      const { error } = await supabase.from("treatment_systems").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("treatment_systems").insert(payload as any);
      if (error) return toast.error(error.message);
    }
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this system? Conditions will become unassigned.")) return;
    const { error } = await supabase.from("treatment_systems").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const assignCondition = async (conditionId: string, systemId: string | null) => {
    const { error } = await supabase
      .from("health_conditions")
      .update({ system_id: systemId })
      .eq("id", conditionId);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const condsBySystem = (sid: string | null) =>
    conditions.filter((c) => c.system_id === sid);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Treatment Systems</h1>
          <p className="text-sm text-muted-foreground">Group conditions by body system for the Treatments mega-menu.</p>
        </div>
        <Button variant="hero" onClick={() => setEditing({ ...empty })}>
          <Plus className="mr-2 h-4 w-4" /> Add System
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-4">
          {systems.map((s) => {
            const items = condsBySystem(s.id);
            return (
              <div key={s.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">{s.name}</h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{s.slug}</span>
                      {!s.is_published && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Hidden</span>}
                      <span className="text-xs text-muted-foreground">#{s.sort_order}</span>
                    </div>
                    {s.description && <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.length === 0 && (
                    <span className="text-xs text-muted-foreground">No conditions assigned.</span>
                  )}
                  {items.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs">
                      {c.name}
                      <button
                        onClick={() => assignCondition(c.id, null)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Unassign"
                      >×</button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-dashed border-border bg-background p-4">
            <h3 className="font-semibold">Assign Condition to System</h3>
            <p className="text-xs text-muted-foreground">Pick a condition and choose its system.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {conditions.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
                  <div className="text-sm">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.slug}</div>
                  </div>
                  <Select
                    value={c.system_id ?? "none"}
                    onValueChange={(v) => assignCondition(c.id, v === "none" ? null : v)}
                  >
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Unassigned —</SelectItem>
                      {systems.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit System" : "Add System"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Slug *</Label><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="respiratory-problems" /></div>
              <div><Label>Name *</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Respiratory Problems" /></div>
              <div><Label>Description</Label><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Icon (lucide name)</Label><Input value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="Stethoscope" /></div>
                <div><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
                <Label>Published</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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

export default AdminTreatmentSystems;
