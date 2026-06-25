import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTray, trayStore, TrayItem } from "@/lib/formulary-tray";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function FormularyTray() {
  const items = useTray();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [pathya, setPathya] = useState("");
  const [apathya, setApathya] = useState("");
  const [saving, setSaving] = useState(false);

  const generate = async () => {
    if (items.length === 0) { toast.error("Tray is empty"); return; }
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id;
    if (!uid) { toast.error("Please sign in"); return; }
    setSaving(true);
    const { data, error } = await supabase.from("formulary_prescriptions").insert({
      doctor_user_id: uid,
      patient_name: patientName || null,
      patient_phone: patientPhone || null,
      diagnosis: diagnosis || null,
      pathya: pathya || null,
      apathya: apathya || null,
      items: items as unknown as never,
    }).select("id").single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    trayStore.clear();
    setOpen(false);
    if (data?.id) navigate(`/doctor/formulary/prescription/${data.id}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open prescription tray"
          className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition"
        >
          <ShoppingBag className="h-6 w-6" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {items.length}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Prescription Tray ({items.length})</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground">Add formulas from the formulary to build a multi-formula prescription.</p>}
          {items.map((it: TrayItem) => (
            <div key={it.formula_id} className="rounded border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.type} · {it.sanskrit}</div>
                </div>
                <button onClick={() => trayStore.remove(it.formula_id)} aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input value={it.dose} onChange={(e) => trayStore.update(it.formula_id, { dose: e.target.value })} placeholder="Dose" />
                <Input value={it.frequency} onChange={(e) => trayStore.update(it.formula_id, { frequency: e.target.value })} placeholder="Freq" />
                <Input value={it.duration} onChange={(e) => trayStore.update(it.formula_id, { duration: e.target.value })} placeholder="Duration" />
                <Input value={it.anupana} onChange={(e) => trayStore.update(it.formula_id, { anupana: e.target.value })} placeholder="Anupana" />
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Patient name</Label><Input value={patientName} onChange={(e) => setPatientName(e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} /></div>
            </div>
            <div><Label>Diagnosis</Label><Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} /></div>
            <div><Label>Pathya (Do's)</Label><Textarea rows={2} value={pathya} onChange={(e) => setPathya(e.target.value)} /></div>
            <div><Label>Apathya (Don'ts)</Label><Textarea rows={2} value={apathya} onChange={(e) => setApathya(e.target.value)} /></div>
            <Button className="w-full" onClick={generate} disabled={saving}>
              <FileText className="h-4 w-4 mr-2" /> {saving ? "Generating…" : "Generate Prescription PDF"}
            </Button>
            <Button className="w-full" variant="ghost" onClick={() => trayStore.clear()}>Clear tray</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
