import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Store = {
  id: string;
  store_name: string;
  store_code: string;
  store_type: string;
  branch_id: string | null;
  incharge_name: string | null;
  phone: string | null;
  address_in_hospital: string | null;
  is_active: boolean;
};

type Branch = { id: string; name: string };

const TYPES = [
  { value: "main_pharmacy", label: "Main Pharmacy", color: "bg-emerald-100 text-emerald-700" },
  { value: "branch_pharmacy", label: "Branch Pharmacy", color: "bg-sky-100 text-sky-700" },
  { value: "dispensary", label: "Dispensary", color: "bg-amber-100 text-amber-700" },
  { value: "raw_materials", label: "Raw Materials", color: "bg-purple-100 text-purple-700" },
];

const typeMeta = (v: string) => TYPES.find((t) => t.value === v) || TYPES[0];

const empty = {
  id: "", store_name: "", store_code: "", store_type: "main_pharmacy",
  branch_id: "all", incharge_name: "", phone: "", address_in_hospital: "",
};

const StoreMaster = () => {
  const [rows, setRows] = useState<Store[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [s, b] = await Promise.all([
      supabase.from("hms_stores").select("*").order("store_name"),
      supabase.from("hms_branches").select("id,name").order("name"),
    ]);
    setRows((s.data as Store[]) || []);
    setBranches((b.data as Branch[]) || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.store_name || !form.store_code) { toast.error("Name & code required"); return; }
    const payload = {
      store_name: form.store_name, store_code: form.store_code,
      store_type: form.store_type,
      branch_id: form.branch_id === "all" ? null : form.branch_id,
      incharge_name: form.incharge_name || null,
      phone: form.phone || null,
      address_in_hospital: form.address_in_hospital || null,
    };
    const q = form.id
      ? supabase.from("hms_stores").update(payload).eq("id", form.id)
      : supabase.from("hms_stores").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false); setForm(empty); load();
  };

  const updateField = async (id: string, field: string, val: any) => {
    await supabase.from("hms_stores").update({ [field]: val }).eq("id", id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("hms_stores").delete().eq("id", id);
    load();
  };

  const branchName = (id: string | null) => branches.find((b) => b.id === id)?.name ?? "All branches";

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="🏬 Store Master"
        description="Pharmacy stores, dispensaries, raw material stores."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Store</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} store</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Name</Label><Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} /></div>
                <div><Label>Code</Label><Input value={form.store_code} onChange={(e) => setForm({ ...form, store_code: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.store_type} onValueChange={(v) => setForm({ ...form, store_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Branch</Label>
                  <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All branches</SelectItem>
                      {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Incharge</Label><Input value={form.incharge_name} onChange={(e) => setForm({ ...form, incharge_name: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="col-span-2"><Label>Address in hospital</Label><Textarea value={form.address_in_hospital} onChange={(e) => setForm({ ...form, address_in_hospital: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead><TableHead>Type</TableHead>
              <TableHead>Branch</TableHead><TableHead>Incharge</TableHead>
              <TableHead>Phone</TableHead><TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => {
              const meta = typeMeta(s.store_type);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.store_name}<div className="text-xs text-muted-foreground">{s.store_code}</div></TableCell>
                  <TableCell><Badge className={meta.color} variant="outline">{meta.label}</Badge></TableCell>
                  <TableCell className="text-xs">{branchName(s.branch_id)}</TableCell>
                  <TableCell>
                    <Input className="h-7 w-36" defaultValue={s.incharge_name || ""} onBlur={(e) => e.target.value !== (s.incharge_name || "") && updateField(s.id, "incharge_name", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Input className="h-7 w-32" defaultValue={s.phone || ""} onBlur={(e) => e.target.value !== (s.phone || "") && updateField(s.id, "phone", e.target.value)} />
                  </TableCell>
                  <TableCell><Switch checked={s.is_active} onCheckedChange={(v) => updateField(s.id, "is_active", v)} /></TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="icon" variant="ghost">
                      <Link to={`/vaidya/inventory?store_id=${s.id}`}><ExternalLink className="h-4 w-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setForm({ id: s.id, store_name: s.store_name, store_code: s.store_code, store_type: s.store_type, branch_id: s.branch_id || "all", incharge_name: s.incharge_name || "", phone: s.phone || "", address_in_hospital: s.address_in_hospital || "" }) || setOpen(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No stores.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default StoreMaster;
