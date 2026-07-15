import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

export function PanchakarmaFeedbackDialog({
  sessionId,
  patientId,
  onSubmitted,
}: {
  sessionId: string;
  patientId: string;
  onSubmitted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const { error } = await supabase.from("panchakarma_session_feedback").insert({
      session_id: sessionId,
      patient_id: patientId,
      symptom_severity: severity,
      improvement_notes: notes || null,
      side_effects: sideEffects || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Feedback shared with your Vaidya");
    setOpen(false);
    onSubmitted?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full">
          <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" /> Share how you're feeling
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Session feedback</DialogTitle></DialogHeader>
        <div className="space-y-5 py-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Symptom severity right now</Label>
              <span className="text-lg font-semibold text-primary">{severity} / 10</span>
            </div>
            <Slider value={[severity]} min={1} max={10} step={1} onValueChange={(v) => setSeverity(v[0])} />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Much better</span><span>Same</span><span>Much worse</span>
            </div>
          </div>
          <div>
            <Label>How do you feel? (any improvement you noticed)</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. slept better, less bloating, more energy…" />
          </div>
          <div>
            <Label>Any side effects or discomfort?</Label>
            <Textarea rows={2} value={sideEffects} onChange={(e) => setSideEffects(e.target.value)}
              placeholder="Leave blank if none. Your Vaidya will be alerted if you mention anything here." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Sending…" : "Submit feedback"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
