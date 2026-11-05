import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, CheckCircle2, Eye, Loader2, Sparkles, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Interpretation = {
  color_tinge?: string;
  discharge?: string;
  discharge_type?: string;
  dryness_moisture?: string;
  swelling?: string;
  swelling_location?: string;
  sclera_color?: string;
  under_eye_discoloration?: string;
  dosha_suggestion?: string;
  confidence_note?: string;
};

type Observation = {
  id: string;
  patient_id: string;
  photo_url: string;
  patient_notes: string | null;
  ayurvedic_interpretation_ai: Interpretation | null;
  vaidya_reviewed: boolean;
  vaidya_notes: string | null;
  status: "submitted" | "ai_processed" | "vaidya_reviewed" | "completed";
  created_at: string;
};

const DOSHA_OPTIONS = [
  "Vata-predominant pattern",
  "Pitta-predominant pattern",
  "Kapha-predominant pattern",
  "Inconclusive",
];

const NetraReviewQueue = () => {
  usePageSEO({
    title: "Netra Pariksha Review Queue — Ayuzee Doctor",
    description: "Review patient eye photos and sign the Ayurvedic Netra Pariksha interpretation.",
  });

  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [rows, setRows] = useState<Observation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) { setLoading(false); return; }
    const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", uid).maybeSingle();
    setDoctorId(doc?.id ?? null);

    const { data, error } = await supabase
      .from("netra_pariksha_observations")
      .select("*")
      .in("status", ["submitted", "ai_processed"])
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as unknown as Observation[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  if (selected) {
    return (
      <ReviewDetail
        observation={selected}
        doctorId={doctorId}
        onBack={() => setSelectedId(null)}
        onDone={() => { setSelectedId(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Eye className="h-3.5 w-3.5" /> Vaidya review
        </div>
        <h1 className="mt-1 font-display text-3xl">Netra Pariksha review queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patient eye photos awaiting your review. AI drafts are shown for reference only — classical Ayurvedic parameters, not iridology.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading queue…
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-primary/60" />
          You're all caught up. No pending Netra Pariksha submissions.
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className="text-left rounded-xl border border-border p-4 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Observation · {r.id.slice(0, 8)}</span>
                    <Badge
                      variant={r.status === "ai_processed" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {r.status === "ai_processed" ? "AI draft ready" : "New submission"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Patient {r.patient_id.slice(0, 8)} · submitted{" "}
                    {format(new Date(r.created_at), "d MMM yyyy · h:mm a")}
                  </p>
                </div>
                {r.ayurvedic_interpretation_ai?.dosha_suggestion && (
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">AI suggestion</div>
                    <div className="text-sm font-medium">{r.ayurvedic_interpretation_ai.dosha_suggestion}</div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AiField = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex items-baseline justify-between gap-3 text-sm">
    <span className="text-amber-900/70 dark:text-amber-100/70">{label}</span>
    <span className="font-medium">{value?.trim() ? value : "—"}</span>
  </div>
);

const ReviewDetail = ({
  observation,
  doctorId,
  onBack,
  onDone,
}: {
  observation: Observation;
  doctorId: string | null;
  onBack: () => void;
  onDone: () => void;
}) => {
  const ai = observation.ayurvedic_interpretation_ai ?? {};
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState(observation.vaidya_notes ?? "");
  const [finalDosha, setFinalDosha] = useState<string>(
    ai.dosha_suggestion && DOSHA_OPTIONS.includes(ai.dosha_suggestion) ? ai.dosha_suggestion : "",
  );
  const [interpreting, setInterpreting] = useState(false);
  const [busy, setBusy] = useState<"none" | "approve" | "reject" | "save">("none");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.storage
        .from("netra-pariksha-photos")
        .createSignedUrl(observation.photo_url, 60 * 30);
      setSignedUrl(data?.signedUrl ?? null);
    })();
  }, [observation.photo_url]);

  const runAiInterpret = async () => {
    setInterpreting(true);
    try {
      const { error } = await supabase.functions.invoke("netra-pariksha-interpret", {
        body: { observation_id: observation.id },
      });
      if (error) throw error;
      toast.success("AI interpretation ready");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI interpretation failed");
    } finally {
      setInterpreting(false);
    }
  };

  const mergedInterpretation = (dosha: string) => ({
    ...ai,
    dosha_suggestion: dosha,
  });

  const saveEdits = async () => {
    setBusy("save");
    try {
      const { error } = await supabase
        .from("netra_pariksha_observations")
        .update({
          vaidya_notes: notes.trim() || null,
          ayurvedic_interpretation_ai: mergedInterpretation(finalDosha || ai.dosha_suggestion || ""),
        })
        .eq("id", observation.id);
      if (error) throw error;
      toast.success("Draft saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy("none");
    }
  };

  const approve = async () => {
    if (!doctorId) { toast.error("Doctor profile not found"); return; }
    if (!finalDosha) { toast.error("Select a final dosha assessment before approving"); return; }
    setBusy("approve");
    try {
      const { error } = await supabase
        .from("netra_pariksha_observations")
        .update({
          vaidya_reviewed: true,
          vaidya_notes: notes.trim() || null,
          ayurvedic_interpretation_ai: mergedInterpretation(finalDosha),
          status: "completed",
        })
        .eq("id", observation.id);
      if (error) throw error;
      toast.success("Approved & shared with patient");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not approve");
    } finally {
      setBusy("none");
    }
  };

  const reject = async () => {
    setBusy("reject");
    try {
      const rejectionNote = notes.trim()
        ? `[Rejected] ${notes.trim()}`
        : "[Rejected] Eye photo not suitable for interpretation. Please resubmit in bright natural light with both eyes open and clearly visible.";
      const { error } = await supabase
        .from("netra_pariksha_observations")
        .update({
          vaidya_reviewed: true,
          vaidya_notes: rejectionNote,
          ayurvedic_interpretation_ai: mergedInterpretation("Inconclusive"),
          status: "completed",
        })
        .eq("id", observation.id);
      if (error) throw error;
      toast.success("Rejected — patient notified");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reject");
    } finally {
      setBusy("none");
    }
  };

  const anyBusy = busy !== "none" || interpreting;
  const hasAi = !!(ai && Object.keys(ai).length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back to queue
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Patient {observation.patient_id.slice(0, 8)}</Badge>
          <Badge variant="outline">
            Submitted {format(new Date(observation.created_at), "d MMM, h:mm a")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Patient submission
            </p>
          </div>

          {signedUrl ? (
            <a href={signedUrl} target="_blank" rel="noreferrer" className="block">
              <img
                src={signedUrl}
                alt="Patient-submitted eye photo"
                className="max-h-[420px] w-full rounded-lg border border-border object-contain bg-muted/30"
              />
            </a>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Loading photo…
            </div>
          )}

          <Separator />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Patient notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {observation.patient_notes?.trim() || <span className="text-muted-foreground">— none —</span>}
            </p>
          </div>
        </Card>

        <div className="space-y-5">
          {hasAi ? (
            <Card className="border-amber-300 bg-amber-50 p-5 dark:border-amber-500/40 dark:bg-amber-500/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                  AI Draft — Unreviewed
                </p>
              </div>
              <div className="mt-3 grid gap-1.5 text-amber-950 dark:text-amber-100">
                <AiField label="Color tinge" value={ai.color_tinge} />
                <AiField
                  label="Discharge (Srava)"
                  value={
                    ai.discharge
                      ? ai.discharge !== "none" && ai.discharge_type
                        ? `${ai.discharge} · ${ai.discharge_type}`
                        : ai.discharge
                      : undefined
                  }
                />
                <AiField label="Dryness / moisture" value={ai.dryness_moisture} />
                <AiField
                  label="Swelling (Shopha)"
                  value={
                    ai.swelling
                      ? ai.swelling === "present" && ai.swelling_location
                        ? `present · ${ai.swelling_location}`
                        : ai.swelling
                      : undefined
                  }
                />
                <AiField label="Sclera color" value={ai.sclera_color} />
                <AiField label="Under-eye discoloration" value={ai.under_eye_discoloration} />
                <AiField label="Dosha suggestion" value={ai.dosha_suggestion} />
              </div>
              {ai.confidence_note && (
                <p className="mt-3 text-xs italic text-amber-900 dark:text-amber-200">
                  Confidence: {ai.confidence_note}
                </p>
              )}
              <p className="mt-3 text-[11px] italic">
                This is an AI-assisted pattern reading, not a diagnosis. Vaidya review required.
              </p>
            </Card>
          ) : (
            <Card className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                No AI interpretation yet. Run the assistant or write your reading below.
              </p>
              <Button variant="outline" size="sm" onClick={runAiInterpret} disabled={anyBusy}>
                {interpreting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running…</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" />Run AI interpretation</>
                )}
              </Button>
            </Card>
          )}

          <Card className="p-5 space-y-4">
            <div>
              <Label htmlFor="dosha" className="text-base font-medium">
                Final dosha assessment
              </Label>
              <p className="text-xs text-muted-foreground">
                This is what the patient will see once you approve.
              </p>
              <Select value={finalDosha} onValueChange={setFinalDosha}>
                <SelectTrigger id="dosha" className="mt-2">
                  <SelectValue placeholder="Select final assessment" />
                </SelectTrigger>
                <SelectContent>
                  {DOSHA_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-medium">Vaidya notes</Label>
              <p className="text-xs text-muted-foreground">
                Shared with the patient alongside the final dosha.
              </p>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Warm, plain-language notes for the patient…"
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button variant="outline" onClick={saveEdits} disabled={anyBusy}>
                {busy === "save" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                ) : "Save edits"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={reject} disabled={anyBusy}>
                  {busy === "reject" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rejecting…</>
                  ) : (
                    <><XCircle className="mr-2 h-4 w-4" />Reject</>
                  )}
                </Button>
                <Button variant="hero" onClick={approve} disabled={anyBusy || !finalDosha}>
                  {busy === "approve" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Approving…</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" />Approve & Send</>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Patient only sees the interpretation after you approve. Reject if the image is unusable — the patient can resubmit.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetraReviewQueue;
