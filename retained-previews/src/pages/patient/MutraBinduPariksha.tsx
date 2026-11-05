import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Upload, Droplet } from "lucide-react";
import { PageSEO } from "@/components/common/PageSEO";

const INSTRUCTIONS = [
  "Collect a fresh mid-stream urine sample in a clean, dry, transparent container in the early morning.",
  "Take a clean glass slide, white ceramic plate, or a sheet of white paper and place it on a flat, well-lit surface.",
  "Using a dropper (or the container lip), place a single drop of urine at the centre of the surface.",
  "Wait 30–60 seconds without disturbing it — let the drop spread naturally.",
  "Photograph the drop from directly above with good, even lighting. Keep the entire spread pattern in frame.",
  "Upload the photo below, add the sample time, and (optionally) any notes for your Vaidya.",
];

type AshtavidhaVisit = { id: string; exam_date: string };

export default function MutraBinduPariksha() {
  const [userId, setUserId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sampleTime, setSampleTime] = useState<string>(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState("");
  const [visits, setVisits] = useState<AshtavidhaVisit[]>([]);
  const [linkedVisit, setLinkedVisit] = useState<string>("none");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data: v } = await supabase
        .from("vaidya_ashtavidha_exams")
        .select("id, exam_date")
        .eq("patient_user_id", uid)
        .order("exam_date", { ascending: false })
        .limit(20);
      setVisits(v ?? []);
    })();
  }, []);

  const onFile = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (!userId) { toast.error("Please sign in to submit."); return; }
    if (!file) { toast.error("Please upload a photo of the urine drop."); return; }
    if (!sampleTime) { toast.error("Sample time is required."); return; }
    setSubmitting(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("mutra-bindu-photos")
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (up.error) throw up.error;

      const { error: insErr } = await supabase.from("mutra_bindu_observations").insert({
        patient_id: userId,
        ashtavidha_assessment_id: linkedVisit === "none" ? null : linkedVisit,
        sample_time: new Date(sampleTime).toISOString(),
        photo_url: path, // storage object path — signed URL generated on read
        patient_notes: notes.trim() || null,
        status: "submitted" as const,
      });
      if (insErr) throw insErr;

      toast.success("Submitted for Vaidya review.");
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setNotes("");
      setLinkedVisit("none");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to submit observation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <PageSEO
        title="Mutra Bindu Pariksha | Ayuzee"
        description="Traditional Ayurvedic urine-drop self-assessment. Upload a photo of the drop pattern for Vaidya review."
      />

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Droplet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Mutra Bindu Pariksha</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          A traditional urine-drop observation to help your Vaidya understand dosha patterns.
          Self-assessment — final interpretation is done by your Vaidya.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-base">How to collect the sample</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {INSTRUCTIONS.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This result will be reviewed by your Vaidya before being added to your health record.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle className="text-base">Submit your observation</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="photo">Photo of urine drop *</Label>
            <div className="flex items-center gap-3">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
              {file && <Upload className="h-4 w-4 text-primary" />}
            </div>
            {preview && (
              <img
                src={preview}
                alt="Selected urine drop preview"
                className="mt-2 max-h-64 rounded-md border border-border object-contain"
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sample-time">Sample time *</Label>
              <Input
                id="sample-time"
                type="datetime-local"
                value={sampleTime}
                onChange={(e) => setSampleTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Link to a previous Ashtavidha Pareeksha visit (optional)</Label>
              <Select value={linkedVisit} onValueChange={setLinkedVisit}>
                <SelectTrigger id="link"><SelectValue placeholder="None (standalone)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (standalone)</SelectItem>
                  {visits.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      Visit on {new Date(v.exam_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for your Vaidya (optional)</Label>
            <Textarea
              id="notes"
              rows={4}
              placeholder="Anything unusual — colour, odour, timing, recent food or medicines…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submit} disabled={submitting || !file}>
              {submitting ? "Submitting…" : "Submit for Vaidya review"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
