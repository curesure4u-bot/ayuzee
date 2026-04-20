import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["planned", "ongoing", "completed", "cancelled"];

const TherapyPlans = () => {
  const { userId } = useDoctor();
  const [params] = useSearchParams();
  const preselect = params.get("partner") || "";
  const [items, setItems] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [open, setOpen] = useState(!!preselect);
  const [form, setForm] = useState({
    patient_name: "", patient_phone: "", partner_id: preselect, therapy_name: "",
    planned_date: "", duration_days: "1", notes: "",
  });

  const load = async () => {
    if (!userId) return;
    const [{ data: plans }, { data: parts }] = await Promise.all([
      supabase.from("therapy_plans").select("*").eq("doctor_user_id", userId).order("created_at", { ascending: false }),
      supabase.from("network_partners").select("id, name, partner_type, city").eq("is_approved", true),
    ]);
    setItems(plans ?? []);
    setPartners(parts ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const submit = async () => {
    if (!userId) return;
    if (!form.patient_name.trim()) return toast.error("Patient required");
    if (!form.therapy_name.trim()) return toast.error("Therapy required");
    const { error } = await supabase.from("therapy_plans").insert({
      doctor_user_id: userId,
      patient_name: form.patient_name.trim(),
      patient_phone: form.patient_phone || null,
      partner_id: form.partner_id || null,
      therapy_name: form.therapy_name.trim(),
      planned_date: form.planned_date || null,
      duration_days: Number(form.duration_days || 1),
      notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Therapy plan created");
    setOpen(false);
    setForm({ patient_name: "", patient_phone: "", partner_id: "", therapy_name: "", planned_date: "", duration_days: "1", notes: "" });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("therapy_plans").update({ status }).eq("id", id);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">Therapy Plans</h1>
            <p className="text-xs text-muted-foreground">Plan therapies with nearby therapists & Panchakarma theaters.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New Therapy Plan</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Plan a therapy</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Patient name *</Label><Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={form.patient_phone} onChange={(e) => setForm({ ...form, patient_phone: e.target.value })} /></div>
                </div>
                <div><Label>Therapy *</Label><Input placeholder="e.g. Shirodhara, Abhyanga" value={form.therapy_name} onChange={(e) => setForm({ ...form, therapy_name: e.target.value })} /></div>
                <div>
                  <Label>Partner</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
                    <option value="">— Optional, pick from network —</option>
                    {partners.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.partner_type.replace("_", " ")} · {p.city})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Planned date</Label><Input type="date" value={form.planned_date} onChange={(e) => setForm({ ...form, planned_date: e.target.value })} /></div>
                  <div><Label>Duration (days)</Label><Input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} /></div>
                </div>
                <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submit}>Save plan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No therapy plans yet.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => {
            const partner = partners.find((x) => x.id === p.partner_id);
            return (
              <Card key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.therapy_name}</p>
                    <p className="text-xs text-muted-foreground">{p.patient_name} · {p.duration_days}d</p>
                  </div>
                  <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {p.planned_date && <p>📅 {p.planned_date}</p>}
                  {partner && <p>🏥 {partner.name} · {partner.city}</p>}
                  {p.notes && <p>📝 {p.notes}</p>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TherapyPlans;
