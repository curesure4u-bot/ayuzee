import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

type Dept = {
  id: string;
  department_name: string;
  department_code: string;
  ayush_system: string | null;
  head_doctor_name: string | null;
  floor_or_room: string | null;
  phone_extension: string | null;
  branch_id: string | null;
  is_active: boolean;
  sort_order: number;
};

type Branch = { id: string; branch_name: string };

const SYSTEM_COLORS: Record<string, string> = {
  Ayurveda: "bg-emerald-100 text-emerald-700",
  Siddha: "bg-amber-100 text-amber-700",
  Unani: "bg-purple-100 text-purple-700",
  Yoga: "bg-sky-100 text-sky-700",
  Homeopathy: "bg-pink-100 text-pink-700",
  Multi: "bg-slate-100 text-slate-700",
};

const empty = {
  id: "", department_name: "", department_code: "",
  ayush_system: "Multi", head_doctor_name: "", floor_or_room: "",
  phone_extension: "", branch_id: "all", sort_order: 100,
};

const DepartmentMaster = () => {
  const [rows, setRows] = useState<Dept[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [d, b] = await Promise.all([
      supabase.from("hms_departments").select("*").order("sort_order"),
      supabase.from("hms_branches").select("id, branch_name").order("branch_name"),
    ]);
    setRows((d.data as Dept[]) || []);
    setBranches(((b.data as any) ?? []) as Branch[]);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => branchFilter === "all" ? rows : rows.filter((r) => r.branch_id === branchFilter), [rows, branchFilter]);

  const save = async () => {
    if (!form.department_name || !form.department_code) { toast.error("Name & code required"); return; }
    const payload: any = {
      department_name: form.department_name, department_code: form.department_code,
      ayush_system: form.ayush_system, head_doctor_name: form.head_doctor_name || null,
      floor_or_room: form.floor_or_room || null, phone_extension: form.phone_extension || null,
      branch_id: form.branch_id === "all" ? null : form.branch_id,
      sort_order: Number(form.sort_order),
    };
    const q = form.id
      ? supabase.from("hms_departments").update(payload).eq("id", form.id)
      : supabase.from("hms_departments").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false); setForm(empty); load();
  };

  const updateField = async (id: string, field: string, val: any) => {
    await supabase.from("hms_departments").update({ [field]: val }).eq("id", id);
    load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("hms_departments").delete().eq("id", id);
    load();
  };
  const reorder = async (d: Dept, dir: -1 | 1) => {
    await supabase.from("hms_departments").update({ sort_order: d.sort_order + dir * 10 }).eq("id", d.id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="🏢 Department Master"
        description="OPD, Panchakarma, Yoga, Pharmacy departments."
        actions={
          <>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter branch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.branch_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} department</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Name</Label><Input value={form.department_name} onChange={(e) => setForm({ ...form, department_name: e.target.value })} /></div>
                  <div><Label>Code</Label><Input value={form.department_code} onChange={(e) => setForm({ ...form, department_code: e.target.value })} /></div>
                  <div><Label>AYUSH system</Label><Input value={form.ayush_system} onChange={(e) => setForm({ ...form, ayush_system: e.target.value })} /></div>
                  <div><Label>Head doctor</Label><Input value={form.head_doctor_name} onChange={(e) => setForm({ ...form, head_doctor_name: e.target.value })} /></div>
                  <div><Label>Floor / Room</Label><Input value={form.floor_or_room} onChange={(e) => setForm({ ...form, floor_or_room: e.target.value })} /></div>
                  <div><Label>Extension</Label><Input value={form.phone_extension} onChange={(e) => setForm({ ...form, phone_extension: e.target.value })} /></div>
                  <div><Label>Sort order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
                  <div className="col-span-2">
                    <Label>Branch</Label>
                    <Select value={form.branch_id} onValueChange={(v) => setForm({ ...form, branch_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All branches</SelectItem>
                        {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.branch_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead><TableHead>Department</TableHead>
              <TableHead>System</TableHead><TableHead>Head Doctor</TableHead>
              <TableHead>Floor</TableHead><TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => reorder(d, -1)}><ArrowUp className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => reorder(d, 1)}><ArrowDown className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{d.department_name}<div className="text-xs text-muted-foreground">{d.department_code}</div></TableCell>
                <TableCell>
                  <Badge className={SYSTEM_COLORS[d.ayush_system || "Multi"] || SYSTEM_COLORS.Multi} variant="outline">
                    {d.ayush_system || "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Input className="h-7 w-40" defaultValue={d.head_doctor_name || ""} onBlur={(e) => e.target.value !== (d.head_doctor_name || "") && updateField(d.id, "head_doctor_name", e.target.value)} />
                </TableCell>
                <TableCell className="text-xs">{d.floor_or_room || "—"}</TableCell>
                <TableCell><Switch checked={d.is_active} onCheckedChange={(v) => updateField(d.id, "is_active", v)} /></TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => del(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No departments.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default DepartmentMaster;
