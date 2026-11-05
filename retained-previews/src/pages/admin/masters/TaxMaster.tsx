import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Slab = {
  id: string; tax_name: string; tax_rate: number; tax_type: string;
  applicable_to: string; hsn_code_range: string | null;
  is_default_for_services: boolean; is_default_for_medicines: boolean; is_active: boolean;
};

const rateBadge = (rate: number) => {
  if (rate === 0) return "bg-green-100 text-green-800 border-green-300";
  if (rate <= 5) return "bg-blue-100 text-blue-800 border-blue-300";
  if (rate <= 12) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-red-100 text-red-800 border-red-300";
};

const empty = { id: "", tax_name: "", tax_rate: 0, tax_type: "gst", applicable_to: "services", hsn_code_range: "" };

const TaxMaster = () => {
  const [rows, setRows] = useState<Slab[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    const { data } = await supabase.from("hms_tax_slabs").select("*").order("tax_rate");
    setRows((data ?? []) as Slab[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.tax_name) { toast.error("Tax name required"); return; }
    const payload = { ...form, hsn_code_range: form.hsn_code_range || null };
    delete (payload as any).id;
    const q = form.id ? supabase.from("hms_tax_slabs").update(payload).eq("id", form.id) : supabase.from("hms_tax_slabs").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };

  const toggle = async (id: string, v: boolean) => {
    await supabase.from("hms_tax_slabs").update({ is_active: v }).eq("id", id); load();
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("hms_tax_slabs").delete().eq("id", id); load(); };

  const setDefault = async (id: string, field: "is_default_for_services" | "is_default_for_medicines") => {
    const clearPayload: any = { [field]: false };
    const setPayload: any = { [field]: true };
    await supabase.from("hms_tax_slabs").update(clearPayload).neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("hms_tax_slabs").update(setPayload).eq("id", id);
    toast.success("Default updated"); load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="🧾 Tax Master"
        description="GST/IGST/Cess slabs for consultations, medicines, devices, and wellness services."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Tax Slab</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} tax slab</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Tax name</Label><Input value={form.tax_name} onChange={(e) => setForm({ ...form, tax_name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Rate (%)</Label><Input type="number" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: Number(e.target.value) })} /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.tax_type} onValueChange={(v) => setForm({ ...form, tax_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gst">GST</SelectItem>
                        <SelectItem value="igst">IGST</SelectItem>
                        <SelectItem value="cess">Cess</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Applicable to</Label>
                  <Select value={form.applicable_to} onValueChange={(v) => setForm({ ...form, applicable_to: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="medicines">Medicines</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>HSN range (optional)</Label><Input value={form.hsn_code_range} onChange={(e) => setForm({ ...form, hsn_code_range: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-1 items-center gap-3">
              <Badge variant="outline" className={`text-base ${rateBadge(Number(r.tax_rate))}`}>{r.tax_rate}%</Badge>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.tax_name}</h3>
                  <Badge variant="secondary" className="uppercase">{r.tax_type}</Badge>
                  <Badge variant="outline">{r.applicable_to}</Badge>
                </div>
                {r.hsn_code_range && <p className="text-xs text-muted-foreground">HSN: {r.hsn_code_range}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={r.is_default_for_services} onCheckedChange={(v) => v && setDefault(r.id, "is_default_for_services")} />
                Default for Consultations
              </label>
              <label className="flex items-center gap-2 text-xs">
                <Switch checked={r.is_default_for_medicines} onCheckedChange={(v) => v && setDefault(r.id, "is_default_for_medicines")} />
                Default for Medicines
              </label>
              <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} />
              <Button size="icon" variant="ghost" onClick={() => { setForm({ ...r, hsn_code_range: r.hsn_code_range ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No tax slabs.</p>}
      </div>
    </div>
  );
};

export default TaxMaster;
