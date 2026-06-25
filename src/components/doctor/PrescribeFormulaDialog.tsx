import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { trayStore } from "@/lib/formulary-tray";
import { toast } from "sonner";

type Patient = { user_id: string; full_name: string | null; phone: string | null; appointment_id: string };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formula: {
    id: string;
    name: string;
    sanskrit?: string;
    type: string;
    dose: string;
    anupana: string;
    duration: string;
    manufacturers: Array<{ manufacturer: string; pack: string; mrp: number; available: boolean }>;
  };
}

const FREQS = ["OD", "BD", "TDS", "QID", "HS", "SOS"];

export function PrescribeFormulaDialog({ open, onOpenChange, formula }: Props) {
  const navigate = useNavigate();
  const [dose, setDose] = useState(formula.dose);
  const [frequency, setFrequency] = useState("BD");
  const [duration, setDuration] = useState(formula.duration || "4 weeks");
  const [anupana, setAnupana] = useState(formula.anupana);
  const [diagnosis, setDiagnosis] = useState("");
  const [alsoOrder, setAlsoOrder] = useState(false);
  const [patientId, setPatientId] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);

  const firstMfr = formula.manufacturers.find((m) => m.available) || formula.manufacturers[0];

  useEffect(() => {
    if (!open) return;
    setDose(formula.dose); setAnupana(formula.anupana); setDuration(formula.duration || "4 weeks");
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      if (!uid) return;
      const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", uid).maybeSingle();
      if (!doc) return;
      const { data: appts } = await supabase
        .from("appointments")
        .select("id, user_id, appointment_date")
        .eq("doctor_id", doc.id)
        .order("appointment_date", { ascending: false })
        .limit(20);
      const ids = [...new Set((appts || []).map((a) => a.user_id))];
      if (!ids.length) { setPatients([]); return; }
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", ids);
      const map = new Map((profs || []).map((p) => [p.user_id, p]));
      const list: Patient[] = (appts || []).slice(0, 10).map((a) => ({
        appointment_id: a.id,
        user_id: a.user_id,
        full_name: map.get(a.user_id)?.full_name ?? "Patient",
        phone: map.get(a.user_id)?.phone ?? null,
      }));
      // de-dup by user_id
      const seen = new Set<string>();
      setPatients(list.filter((p) => (seen.has(p.user_id) ? false : (seen.add(p.user_id), true))));
    })();
  }, [open, formula]);

  const rxLine = `Rx: ${formula.name} ${dose} ${frequency} × ${duration} with ${anupana}${diagnosis ? ` (${diagnosis})` : ""}`;

  const save = async () => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) { toast.error("Please sign in"); return; }
    const patient = patients.find((p) => p.user_id === patientId);
    setSaving(true);
    const { data, error } = await supabase.from("formulary_prescriptions").insert({
      doctor_user_id: uid,
      patient_user_id: patient?.user_id ?? null,
      appointment_id: patient?.appointment_id ?? null,
      patient_name: patient?.full_name ?? null,
      patient_phone: patient?.phone ?? null,
      diagnosis: diagnosis || null,
      items: [{
        formula_id: formula.id,
        name: formula.name,
        sanskrit: formula.sanskrit,
        type: formula.type,
        dose, frequency, duration, anupana,
        manufacturer: alsoOrder ? firstMfr?.manufacturer : undefined,
        manufacturer_pack: alsoOrder ? firstMfr?.pack : undefined,
        manufacturer_mrp: alsoOrder ? firstMfr?.mrp : undefined,
        also_order: alsoOrder,
      }],
    }).select("id").single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }

    // Append to appointment notes
    if (patient?.appointment_id) {
      const { data: appt } = await supabase.from("appointments").select("notes").eq("id", patient.appointment_id).maybeSingle();
      const merged = `${appt?.notes ? appt.notes + "\n" : ""}${rxLine}`;
      await supabase.from("appointments").update({ notes: merged }).eq("id", patient.appointment_id);
    }

    if (alsoOrder && patient?.phone) {
      await supabase.functions.invoke("send-whatsapp", {
        body: {
          to: patient.phone,
          message: `Dr. has prescribed ${formula.name} for you. Order here: ${window.location.origin}/shop?search=${encodeURIComponent(formula.name)}`,
        },
      }).catch(() => {});
    }

    toast.success("Prescription saved");
    onOpenChange(false);
    if (data?.id) navigate(`/doctor/formulary/prescription/${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prescribe — {formula.name}</DialogTitle>
          <DialogDescription>{formula.sanskrit} · {formula.type}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dose</Label><Input value={dose} onChange={(e) => setDose(e.target.value)} /></div>
            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FREQS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Duration</Label><Input value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
            <div><Label>Anupana</Label><Input value={anupana} onChange={(e) => setAnupana(e.target.value)} /></div>
          </div>
          <div>
            <Label>Diagnosis (optional)</Label>
            <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Ashmari" />
          </div>
          <div>
            <Label>Patient (from recent appointments)</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder={patients.length ? "Select patient" : "No recent appointments"} /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.user_id} value={p.user_id}>
                    {p.full_name} {p.phone ? `· ${p.phone}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded border bg-muted/40 p-3 text-sm">
            <div className="font-medium mb-1">Preview</div>
            <div className="font-mono text-xs">{rxLine}</div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={alsoOrder} onCheckedChange={(v) => setAlsoOrder(!!v)} />
            Also order for patient {firstMfr ? `(${firstMfr.manufacturer} · ₹${firstMfr.mrp})` : ""}
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            variant="secondary"
            onClick={() => {
              trayStore.add({
                formula_id: formula.id, name: formula.name, sanskrit: formula.sanskrit, type: formula.type,
                dose, frequency, duration, anupana,
                manufacturer: firstMfr?.manufacturer, manufacturer_pack: firstMfr?.pack, manufacturer_mrp: firstMfr?.mrp,
                also_order: alsoOrder,
              });
              toast.success("Added to prescription tray");
              onOpenChange(false);
            }}
          >Add to tray</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save prescription"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
