import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Appt = { id: string; patient_name: string | null; patient_user_id: string | null; scheduled_at: string };

export default function AddToPatientNotes({ diseaseName, summary }: { diseaseName: string; summary: string }) {
  const [open, setOpen] = useState(false);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setText(`📋 ASTG Protocol — ${diseaseName}\n\n${summary}`);
    (async () => {
      const { data: sess } = await supabase.auth.getUser();
      if (!sess.user) return;
      const { data } = await supabase
        .from("appointments")
        .select("id, patient_name, patient_user_id, scheduled_at")
        .eq("doctor_user_id", sess.user.id)
        .order("scheduled_at", { ascending: false })
        .limit(10);
      setAppts((data as Appt[]) ?? []);
    })();
  }, [open, diseaseName, summary]);

  async function save() {
    if (!selected) return toast.error("Select a patient appointment");
    setSaving(true);
    try {
      const { data: cur } = await supabase.from("consultation_assessments").select("id, notes").eq("appointment_id", selected).maybeSingle();
      if (cur?.id) {
        const merged = `${cur.notes ?? ""}\n\n${text}`.trim();
        await supabase.from("consultation_assessments").update({ notes: merged }).eq("id", cur.id);
      } else {
        const { data: sess } = await supabase.auth.getUser();
        await supabase.from("consultation_assessments").insert({
          appointment_id: selected, doctor_user_id: sess.user?.id, notes: text,
        } as any);
      }
      toast.success("Added to patient notes");
      setOpen(false); setSelected("");
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally { setSaving(false); }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <ClipboardPlus className="h-4 w-4" /> Add to Patient Notes
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Attach protocol to patient</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select className="w-full border rounded p-2 bg-background" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">— Select recent appointment —</option>
              {appts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.patient_name ?? "Patient"} · {new Date(a.scheduled_at).toLocaleDateString()}
                </option>
              ))}
            </select>
            <Textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save to Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
