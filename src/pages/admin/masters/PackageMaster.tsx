import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Package as PackageIcon } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Item = { name: string; qty: number; unit_price: number; total: number };
type Pkg = {
  id: string;
  package_name: string;
  package_code: string;
  ayush_system: string | null;
  description: string | null;
  validity_days: number | null;
  total_sessions: number | null;
  package_items: Item[];
  package_price: number;
  regular_price: number;
  savings_amount: number;
  is_active: boolean;
};

const empty = {
  id: "", package_name: "", package_code: "", ayush_system: "Ayurveda", description: "",
  validity_days: 30, total_sessions: 1, package_items: [] as Item[],
  package_price: 0, regular_price: 0,
};

const fmt = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

const PackageMaster = () => {
  const [rows, setRows] = useState<Pkg[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await supabase.from("hms_packages").select("*").order("created_at", { ascending: false });
    setRows(((data as any) ?? []) as Pkg[]);
  };
  useEffect(() => { load(); }, []);

  const addItem = () => setForm({ ...form, package_items: [...form.package_items, { name: "", qty: 1, unit_price: 0, total: 0 }] });
  const setItem = (i: number, patch: Partial<Item>) => {
    const items = [...form.package_items];
    items[i] = { ...items[i], ...patch };
    items[i].total = (Number(items[i].qty) || 0) * (Number(items[i].unit_price) || 0);
    setForm({ ...form, package_items: items });
  };
  const rmItem = (i: number) => setForm({ ...form, package_items: form.package_items.filter((_, idx) => idx !== i) });

  const save = async () => {
    if (!form.package_name || !form.package_code) { toast.error("Name & code required"); return; }
    const payload: any = {
      package_name: form.package_name, package_code: form.package_code,
      ayush_system: form.ayush_system, description: form.description || null,
      validity_days: form.validity_days, total_sessions: form.total_sessions,
      package_items: form.package_items as any,
      package_price: Number(form.package_price), regular_price: Number(form.regular_price),
    };
    const q = form.id
      ? supabase.from("hms_packages").update(payload).eq("id", form.id)
      : supabase.from("hms_packages").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false);
    setForm(empty);
    load();
  };

  const toggle = async (id: string, v: boolean) => {
    await supabase.from("hms_packages").update({ is_active: v }).eq("id", id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    await supabase.from("hms_packages").delete().eq("id", id);
    load();
  };
  const edit = (p: Pkg) => {
    setForm({
      id: p.id, package_name: p.package_name, package_code: p.package_code,
      ayush_system: p.ayush_system || "Ayurveda", description: p.description || "",
      validity_days: p.validity_days || 30, total_sessions: p.total_sessions || 1,
      package_items: (p.package_items as any) || [],
      package_price: p.package_price, regular_price: p.regular_price,
    });
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="📦 Package Master"
        description="Health packages — Panchakarma, Spine Care, Wellness."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Package</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} package</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Name</Label><Input value={form.package_name} onChange={(e) => setForm({ ...form, package_name: e.target.value })} /></div>
                <div><Label>Code</Label><Input value={form.package_code} onChange={(e) => setForm({ ...form, package_code: e.target.value })} placeholder="PKG-XX-00" /></div>
                <div><Label>AYUSH system</Label><Input value={form.ayush_system} onChange={(e) => setForm({ ...form, ayush_system: e.target.value })} /></div>
                <div><Label>Validity (days)</Label><Input type="number" value={form.validity_days} onChange={(e) => setForm({ ...form, validity_days: Number(e.target.value) })} /></div>
                <div><Label>Total sessions</Label><Input type="number" value={form.total_sessions} onChange={(e) => setForm({ ...form, total_sessions: Number(e.target.value) })} /></div>
                <div><Label>Regular price (₹)</Label><Input type="number" value={form.regular_price} onChange={(e) => setForm({ ...form, regular_price: Number(e.target.value) })} /></div>
                <div><Label>Package price (₹)</Label><Input type="number" value={form.package_price} onChange={(e) => setForm({ ...form, package_price: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>

              <div className="mt-2">
                <div className="mb-2 flex items-center justify-between">
                  <Label>Line items</Label>
                  <Button size="sm" variant="outline" onClick={addItem}><Plus className="mr-1 h-3 w-3" />Add Item</Button>
                </div>
                <div className="space-y-2">
                  {form.package_items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <Input className="col-span-5" placeholder="Item name" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} />
                      <Input className="col-span-2" type="number" placeholder="Qty" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                      <Input className="col-span-2" type="number" placeholder="Unit ₹" value={it.unit_price} onChange={(e) => setItem(i, { unit_price: Number(e.target.value) })} />
                      <div className="col-span-2 flex items-center text-sm font-medium">{fmt(it.total)}</div>
                      <Button size="icon" variant="ghost" className="col-span-1" onClick={() => rmItem(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => {
          const save_amt = (p.regular_price ?? 0) - (p.package_price ?? 0);
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold leading-tight">{p.package_name}</h3>
                </div>
                <Badge variant="outline" className="text-xs">{p.package_code}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{p.ayush_system} · {p.total_sessions} sessions · {p.validity_days} days</p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground line-through">{fmt(p.regular_price)}</p>
                  <p className="font-display text-xl font-bold">{fmt(p.package_price)}</p>
                </div>
                {save_amt > 0 && <Badge className="bg-emerald-500 text-white">Save {fmt(save_amt)}</Badge>}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <Switch checked={p.is_active} onCheckedChange={(v) => toggle(p.id, v)} />
                <div>
                  <Button size="icon" variant="ghost" onClick={() => edit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
        {rows.length === 0 && <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No packages.</p>}
      </div>
    </div>
  );
};

export default PackageMaster;
