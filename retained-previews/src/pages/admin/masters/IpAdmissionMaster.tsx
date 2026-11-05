import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

const CAT_COLORS: Record<string, string> = {
  elective: "bg-blue-100 text-blue-800 border-blue-300",
  emergency: "bg-red-100 text-red-800 border-red-300",
  day_care: "bg-green-100 text-green-800 border-green-300",
  observation: "bg-amber-100 text-amber-800 border-amber-300",
};

const IpAdmissionMaster = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <HmsMasterHeader title="🏥 IP Admission" description="Admission types, deposits, and active in-patients." />
      <Tabs defaultValue="types">
        <TabsList className="mb-4">
          <TabsTrigger value="types">Admission Types</TabsTrigger>
          <TabsTrigger value="active">Active Admissions</TabsTrigger>
        </TabsList>
        <TabsContent value="types"><TypesTab /></TabsContent>
        <TabsContent value="active"><ActiveTab /></TabsContent>
      </Tabs>
    </div>
  );
};

function TypesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const empty = { id: "", admission_type_name: "", category: "elective", default_ward_type: "general", default_duration_days: 1, requires_deposit: false, deposit_amount: 0, notes: "" };
  const [form, setForm] = useState<any>(empty);

  const load = async () => { const { data } = await supabase.from("hms_ip_admission_types").select("*").order("admission_type_name"); setRows(data ?? []); };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!form.admission_type_name) return toast.error("Name required");
    const p: any = { ...form, notes: form.notes || null }; delete p.id;
    const { error } = form.id ? await supabase.from("hms_ip_admission_types").update(p).eq("id", form.id) : await supabase.from("hms_ip_admission_types").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Admission Type</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} admission type</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.admission_type_name} onChange={(e) => setForm({ ...form, admission_type_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elective">Elective</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="day_care">Day Care</SelectItem>
                      <SelectItem value="observation">Observation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Default ward type</Label><Input value={form.default_ward_type} onChange={(e) => setForm({ ...form, default_ward_type: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Duration (days)</Label><Input type="number" value={form.default_duration_days} onChange={(e) => setForm({ ...form, default_duration_days: Number(e.target.value) })} /></div>
                <div className="flex items-end gap-2"><Switch checked={form.requires_deposit} onCheckedChange={(v) => setForm({ ...form, requires_deposit: v })} /><Label>Deposit required</Label></div>
                <div><Label>Deposit ₹</Label><Input type="number" value={form.deposit_amount} onChange={(e) => setForm({ ...form, deposit_amount: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-2">
        {rows.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{r.admission_type_name}</h4>
                <Badge variant="outline" className={CAT_COLORS[r.category] || ""}>{r.category}</Badge>
                <Badge variant="secondary">{r.default_duration_days}d</Badge>
                {r.requires_deposit && <Badge>₹{Number(r.deposit_amount).toLocaleString()} deposit</Badge>}
              </div>
              {r.notes && <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.is_active} onCheckedChange={async (v) => { await supabase.from("hms_ip_admission_types").update({ is_active: v }).eq("id", r.id); load(); }} />
              <Button size="icon" variant="ghost" onClick={() => { setForm({ ...r, notes: r.notes ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("hms_ip_admission_types").delete().eq("id", r.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ActiveTab() {
  const [rows, setRows] = useState<any[]>([]);
  const navigate = useNavigate();
  const load = async () => {
    const { data } = await supabase
      .from("hms_ip_admissions")
      .select("*, hms_wards(ward_name), hms_ward_beds(bed_number)")
      .eq("status", "admitted")
      .order("admission_date", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const discharge = async (row: any) => {
    if (!confirm(`Discharge ${row.patient_name}?`)) return;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("hms_ip_admissions").update({ status: "discharged", actual_discharge: today }).eq("id", row.id);
    if (row.bed_id) await supabase.from("hms_ward_beds").update({ status: "cleaning", current_patient_name: null, current_patient_id: null }).eq("id", row.bed_id);
    toast.success("Patient discharged · bed marked for cleaning"); load();
  };

  const daysAdmitted = (d: string) => Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000));

  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr><th className="p-3 text-left">Patient</th><th className="p-3 text-left">Ward / Bed</th><th className="p-3 text-left">Admitted</th><th className="p-3 text-left">Expected Discharge</th><th className="p-3 text-left">Days</th><th className="p-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3"><div className="font-medium">{r.patient_name}</div><div className="text-xs text-muted-foreground">{r.patient_phone}</div></td>
              <td className="p-3">{r.hms_wards?.ward_name ?? "—"} / <span className="font-mono">{r.hms_ward_beds?.bed_number ?? "—"}</span></td>
              <td className="p-3">{r.admission_date}</td>
              <td className="p-3">{r.expected_discharge ?? "—"}</td>
              <td className="p-3"><Badge variant="secondary">{daysAdmitted(r.admission_date)}d</Badge></td>
              <td className="p-3 text-right">
                <Button size="sm" variant="outline" className="mr-2" onClick={() => navigate(`/vaidya/bills?patient=${encodeURIComponent(r.patient_name)}`)}><FileText className="mr-2 h-3 w-3" />View Bill</Button>
                <Button size="sm" onClick={() => discharge(r)}>Discharge</Button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No active admissions.</td></tr>}
        </tbody>
      </table>
    </Card>
  );
}

export default IpAdmissionMaster;
