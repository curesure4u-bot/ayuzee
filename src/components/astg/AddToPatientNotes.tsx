import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Appt = { id: string; user_id: string | null; appointment_date: string };

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
      // doctor_id on appointments refers to a doctor row; we filter using the doctor's own appointments via RLS.
      const { data } = await supabase
        .from("appointments")
        .select("id, user_id, appointment_date")
        .order("appointment_date", { ascending: false })
        .limit(10);
      setAppts(((data ?? []) as unknown) as Appt[]);
    })();
  }, [open, diseaseName, summary]);

  async function save() {
    if (!selected) return toast.error("Select a patient appointment");
    setSaving(true);
    try {
      const { data: sess } = await supabase.auth.getUser();
      const { data: cur } = await supabase
        .from("consultation_assessments")
        .select("id, advice")
        .eq("appointment_id", selected)
        .maybeSingle();
      const existingAdvice = (cur as any)?.advice ?? "";
      const merged = `${existingAdvice}\n\n${text}`.trim();
      if ((cur as any)?.id) {
        await supabase.from("consultation_assessments").update({ advice: merged }).eq("id", (cur as any).id);
      } else {
        await supabase.from("consultation_assessments").insert({
          appointment_id: selected, doctor_user_id: sess.user?.id, advice: text,
        });
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
                  Appt · {new Date(a.appointment_date).toLocaleDateString()}
                </option>
              ))}
            </select>
            {!appts.length && <p className="text-xs text-muted-foreground">No recent appointments found.</p>}
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
