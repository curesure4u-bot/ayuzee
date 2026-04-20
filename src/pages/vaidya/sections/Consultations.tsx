import { useEffect, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, ClipboardList } from "lucide-react";
import { toast } from "sonner";

const Consultations = () => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    visit_date: new Date().toISOString().slice(0, 10),
    diagnosis: "",
    prescription: "",
    follow_up_date: "",
    fee: "",
    notes: "",
  });

  const load = async () => {
    if (!userId) return;
    const [{ data: cons }, { data: pts }] = await Promise.all([
      supabase.from("vaidya_consultations").select("*").eq("doctor_user_id", userId).order("visit_date", { ascending: false }),
      supabase.from("vaidya_patients").select("id, full_name").eq("doctor_user_id", userId),
    ]);
    setItems(cons ?? []);
    setPatients(pts ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const submit = async () => {
    if (!userId) return;
    if (!form.patient_id) return toast.error("Select a patient");
    const { error } = await supabase.from("vaidya_consultations").insert({
      doctor_user_id: userId,
      patient_id: form.patient_id,
      visit_date: form.visit_date,
      diagnosis: form.diagnosis || null,
      prescription: form.prescription || null,
      follow_up_date: form.follow_up_date || null,
      fee: form.fee ? Number(form.fee) : 0,
      notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Consultation added");
    setOpen(false);
    setForm({ patient_id: "", visit_date: new Date().toISOString().slice(0, 10), diagnosis: "", prescription: "", follow_up_date: "", fee: "", notes: "" });
    load();
  };

  const filtered = items.filter((i) => {
    if (!q.trim()) return true;
    const name = patients.find((p) => p.id === i.patient_id)?.full_name?.toLowerCase() ?? "";
    return name.includes(q.toLowerCase()) || i.diagnosis?.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-xl">Consultation List</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1 h-4 w-4" /> Add First Patient</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New consultation</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>Patient *</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                    <option value="">— Select patient —</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">Add walk-in patients in the All Patients tab first.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Visit date</Label><Input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} /></div>
                  <div><Label>Fee (₹)</Label><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
                </div>
                <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
                <div><Label>Prescription</Label><Textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} /></div>
                <div><Label>Follow-up date</Label><Input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} /></div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={submit}>Save</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ID, name or diagnosis" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No consultations yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const name = patients.find((p) => p.id === c.patient_id)?.full_name ?? "Patient";
            return (
              <Card key={c.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-primary">{name}</p>
                    <p className="text-xs text-muted-foreground">{c.visit_date} · {c.diagnosis || "—"}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {c.follow_up_date && <p>Follow-up: {c.follow_up_date}</p>}
                    {c.fee > 0 && <p>Fee: ₹{c.fee}</p>}
                  </div>
                </div>
                {c.prescription && <p className="mt-2 text-sm text-muted-foreground">Rx: {c.prescription}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Consultations;
