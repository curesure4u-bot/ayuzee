import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Patient = { id: string; full_name: string; phone: string | null };
type Product = { id: string; name: string; price: number | null };

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  medicineName: string;
  product?: Product | null;
  defaults: { dose?: string; anupana?: string; duration?: string };
};

export default function PrescribeOrderDialog({ open, onOpenChange, medicineName, product, defaults }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [dose, setDose] = useState(defaults.dose ?? "");
  const [anupana, setAnupana] = useState(defaults.anupana ?? "");
  const [duration, setDuration] = useState(defaults.duration ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDose(defaults.dose ?? "");
    setAnupana(defaults.anupana ?? "");
    setDuration(defaults.duration ?? "");
    (async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) return;
      const { data } = await supabase
        .from("vaidya_patients")
        .select("id,full_name,phone")
        .eq("doctor_user_id", sess.user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setPatients((data as Patient[]) ?? []);
    })();
  }, [open, defaults.dose, defaults.anupana, defaults.duration]);

  async function submit() {
    if (!patientId) return toast.error("Select a patient");
    setSubmitting(true);
    try {
      const patient = patients.find((p) => p.id === patientId);
      const { data: sess } = await supabase.auth.getUser();
      const payload = {
        user_id: sess.user?.id,
        guest_name: patient?.full_name ?? null,
        guest_phone: patient?.phone ?? null,
        status: "pending",
        notes: JSON.stringify({
          source: "astg",
          medicine: medicineName,
          product_id: product?.id ?? null,
          dose,
          anupana,
          duration,
          quantity: qty,
          vaidya_patient_id: patientId,
        }),
      };
      const { error } = await supabase.from("prescription_orders").insert(payload as any);
      if (error) throw error;
      toast.success(`Prescribed ${medicineName} for ${patient?.full_name}`);
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Prescribe & Order: {medicineName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Patient</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name} {p.phone ? `· ${p.phone}` : ""}</SelectItem>
                ))}
                {patients.length === 0 && <div className="px-3 py-2 text-xs text-muted-foreground">No patients yet</div>}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Dose</Label>
              <Input value={dose} onChange={(e) => setDose(e.target.value)} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <Label>Anupana</Label>
              <Input value={anupana} onChange={(e) => setAnupana(e.target.value)} />
            </div>
            <div>
              <Label>Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          {product ? (
            <div className="rounded bg-muted/40 p-2 text-xs">
              Pharma Exchange: <span className="font-medium">{product.name}</span>
              {product.price ? ` · ₹${product.price}` : ""}
            </div>
          ) : (
            <div className="rounded border border-dashed p-2 text-xs text-muted-foreground">
              No Pharma Exchange product linked. Order will be created as an open prescription.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
