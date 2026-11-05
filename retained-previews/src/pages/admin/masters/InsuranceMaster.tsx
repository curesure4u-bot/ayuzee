import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import HmsMasterHeader from "@/components/hms/HmsMasterHeader";

const TYPE_COLORS: Record<string, string> = {
  insurance: "bg-purple-100 text-purple-800 border-purple-300",
  tpa: "bg-indigo-100 text-indigo-800 border-indigo-300",
  corporate: "bg-blue-100 text-blue-800 border-blue-300",
  ngo: "bg-green-100 text-green-800 border-green-300",
};
const empty = { id: "", partner_name: "", partner_type: "insurance", contact_person: "", phone: "", email: "", address: "", empanelment_date: "", empanelment_no: "", rate_plan_id: "", credit_limit: 0, credit_days: 30 };

const InsuranceMaster = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const load = async () => {
    const [p, r] = await Promise.all([
      supabase.from("hms_rate_plans").select("id, plan_name").order("plan_name"),
      supabase.from("hms_insurance_partners").select("*").order("partner_name"),
    ]);
    setPlans(p.data ?? []); setRows(r.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.partner_name) return toast.error("Partner name required");
    const p: any = { ...form, rate_plan_id: form.rate_plan_id || null, empanelment_date: form.empanelment_date || null };
    delete p.id;
    const { error } = form.id ? await supabase.from("hms_insurance_partners").update(p).eq("id", form.id) : await supabase.from("hms_insurance_partners").insert(p);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); setForm(empty); load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <HmsMasterHeader
        title="🏢 B2B & Insurance Master"
        description="Empanelled insurance, TPA, corporate, and NGO partners."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(empty); }}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Partner</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Add"} partner</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Partner name</Label><Input value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.partner_type} onValueChange={(v) => setForm({ ...form, partner_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="tpa">TPA</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rate plan</Label>
                  <Select value={form.rate_plan_id || "none"} onValueChange={(v) => setForm({ ...form, rate_plan_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="— Default —" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.plan_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Contact person</Label><Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="col-span-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="col-span-2"><Label>Address</Label><Textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div><Label>Empanelment date</Label><Input type="date" value={form.empanelment_date} onChange={(e) => setForm({ ...form, empanelment_date: e.target.value })} /></div>
                <div><Label>Empanelment #</Label><Input value={form.empanelment_no} onChange={(e) => setForm({ ...form, empanelment_no: e.target.value })} /></div>
                <div><Label>Credit limit (₹)</Label><Input type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })} /></div>
                <div><Label>Credit days</Label><Input type="number" value={form.credit_days} onChange={(e) => setForm({ ...form, credit_days: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-3">
        {rows.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{r.partner_name}</h3>
                  <Badge variant="outline" className={TYPE_COLORS[r.partner_type] || ""}>{r.partner_type.toUpperCase()}</Badge>
                  {r.empanelment_no && <Badge variant="secondary">#{r.empanelment_no}</Badge>}
                  <Badge>₹{Number(r.credit_limit).toLocaleString()} limit · {r.credit_days}d</Badge>
                </div>
                {r.contact_person && <p className="mt-1 text-sm">{r.contact_person} · {r.phone} · {r.email}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={r.is_active} onCheckedChange={async (v) => { await supabase.from("hms_insurance_partners").update({ is_active: v }).eq("id", r.id); load(); }} />
                <Button size="icon" variant="ghost" onClick={() => { setForm({ ...r, empanelment_date: r.empanelment_date ?? "", rate_plan_id: r.rate_plan_id ?? "", address: r.address ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await supabase.from("hms_insurance_partners").delete().eq("id", r.id); load(); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No partners.</p>}
      </div>
    </div>
  );
};

export default InsuranceMaster;
