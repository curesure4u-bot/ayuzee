import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Lbl = {
  id: string;
  label_name: string;
  label_type: string;
  color_hex: string;
  description: string | null;
  is_active: boolean;
};

const TYPES = [
  { value: "all", label: "All" },
  { value: "patient_tag", label: "Patient Tags" },
  { value: "document_tag", label: "Document Tags" },
  { value: "order_tag", label: "Order Tags" },
  { value: "user_tag", label: "User Tags" },
];

const empty = { id: "", label_name: "", label_type: "patient_tag", color_hex: "#6B7280", description: "" };

const LabelMaster = () => {
  const [rows, setRows] = useState<Lbl[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("hms_labels").select("*").order("label_type").order("label_name");
    setRows(((data as any) ?? []) as Lbl[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => filter === "all" ? rows : rows.filter((r) => r.label_type === filter), [rows, filter]);

  const save = async () => {
    if (!form.label_name) { toast.error("Name required"); return; }
    const payload: any = {
      label_name: form.label_name, label_type: form.label_type,
      color_hex: form.color_hex, description: form.description || null,
    };
    const q = form.id
      ? supabase.from("hms_labels").update(payload).eq("id", form.id)
      : supabase.from("hms_labels").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false);
    setForm(empty);
    load();
  };

  const toggle = async (id: string, v: boolean) => {
    await supabase.from("hms_labels").update({ is_active: v }).eq("id", id);
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this label?")) return;
    await supabase.from("hms_labels").delete().eq("id", id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="🏷️ Label Master"
        description="Color-coded tags for patients, documents, and orders."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Label</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} label</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.label_name} onChange={(e) => setForm({ ...form, label_name: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.label_type} onValueChange={(v) => setForm({ ...form, label_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TYPES.filter((t) => t.value !== "all").map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} className="h-9 w-12 rounded border" />
                    <Input value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} className="font-mono" />
                  </div>
                </div>
                <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList>
          {TYPES.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid gap-2">
        {filtered.map((l) => (
          <Card key={l.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: l.color_hex }}>
                {l.label_name}
              </span>
              <span className="text-xs uppercase text-muted-foreground">{l.label_type.replace("_", " ")}</span>
              {l.description && <span className="text-xs text-muted-foreground">· {l.description}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={l.is_active} onCheckedChange={(v) => toggle(l.id, v)} />
              <Button size="icon" variant="ghost" onClick={() => { setForm({ id: l.id, label_name: l.label_name, label_type: l.label_type, color_hex: l.color_hex, description: l.description || "" }); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => del(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No labels.</p>}
      </div>
    </div>
  );
};

export default LabelMaster;
