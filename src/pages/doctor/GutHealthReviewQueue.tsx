import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Sparkles, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Assessment = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  status: "submitted" | "ai_drafted" | "reviewed";
  ayurveda_responses: Record<string, unknown>;
  clinical_responses: Record<string, unknown>;
  has_red_flag: boolean;
  gut_health_score: number | null;
  created_at: string;
};

type Report = {
  id: string;
  assessment_id: string;
  ai_draft_summary: string | null;
  vaidya_notes: string | null;
  final_summary: string | null;
  signed_by: string | null;
  signed_at: string | null;
};

const LABELS: Record<string, string> = {
  strong: "Strong", irregular: "Irregular", weak: "Weak", heavy: "Sluggish / heavy",
  on_time: "At regular times", early: "Very quickly after meal", late: "Long after meal", rarely: "Rarely",
  light: "Light & energetic", bloated: "Bloated / gassy", burning: "Burning / acidic",
  gt_once_daily: "More than once daily", once_daily: "Once daily", every_2_3: "Every 2–3 days",
  none: "None", sometimes: "Sometimes", often: "Often", daily: "Daily", constant: "Almost always",
  relief_after: "Eases after stool", changes_form: "Changes with stool form", changes_freq: "Changes with frequency", no_link: "No link",
  rare: "Rarely", weekly: "Weekly", never: "Never", monthly: "Monthly", nightly: "Frequently at night",
  blood_stool: "Blood in stool", weight_loss: "Unexplained weight loss", swallow: "Difficulty swallowing",
  vomiting: "Persistent vomiting", night_pain: "Pain waking at night",
};
const pretty = (v: unknown): string => {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) return v.map(pretty).join(", ");
  const s = String(v);
  return LABELS[s] ?? s;
};

const GutHealthReviewQueue = () => {
  usePageSEO({ title: "Gut Health Review Queue — Ayuzee Doctor", description: "Review patient gut health assessments and sign summaries." });

  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [rows, setRows] = useState<Assessment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) { setLoading(false); return; }
    const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", uid).maybeSingle();
    setDoctorId(doc?.id ?? null);

    const { data, error } = await supabase
      .from("gut_health_assessments")
      .select("*")
      .in("status", ["submitted", "ai_drafted"])
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Assessment[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? null, [rows, selectedId]);

  if (selected) {
    return (
      <ReviewDetail
        assessment={selected}
        doctorId={doctorId}
        onBack={() => setSelectedId(null)}
        onSigned={() => { setSelectedId(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Stethoscope className="h-3.5 w-3.5" /> Vaidya review
        </div>
        <h1 className="mt-1 font-display text-3xl">Gut health review queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Patient submissions awaiting your review. Red-flagged cases show first colour.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading queue…</div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-primary/60" />
          You're all caught up. No pending gut health assessments.
        </Card>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`text-left rounded-xl border p-4 transition hover:shadow-sm ${
                r.has_red_flag
                  ? "border-destructive/50 bg-destructive/5 hover:border-destructive"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">Assessment · {r.id.slice(0, 8)}</span>
                    {r.has_red_flag && (
                      <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="mr-1 h-3 w-3" />Red flag</Badge>
                    )}
                    <Badge variant={r.status === "ai_drafted" ? "default" : "secondary"} className="text-[10px]">
                      {r.status === "ai_drafted" ? "AI draft ready" : "New submission"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Patient {r.patient_id.slice(0, 8)} · {format(new Date(r.created_at), "d MMM yyyy · h:mm a")}
                  </p>
                </div>
                {r.gut_health_score != null && (
                  <div className="text-right">
                    <div className="text-2xl font-semibold">{r.gut_health_score}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Wellness</div>
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

const ReviewDetail = ({
  assessment,
  doctorId,
  onBack,
  onSigned,
}: {
  assessment: Assessment;
  doctorId: string | null;
  onBack: () => void;
  onSigned: () => void;
}) => {
  const [report, setReport] = useState<Report | null>(null);
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [reviewedDraft, setReviewedDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gut_health_reports")
        .select("*")
        .eq("assessment_id", assessment.id)
        .maybeSingle();
      const r = (data ?? null) as Report | null;
      setReport(r);
      setSummary(r?.final_summary ?? r?.ai_draft_summary ?? "");
      setNotes(r?.vaidya_notes ?? "");
      setReviewedDraft(!r?.ai_draft_summary || !!r?.final_summary);
    })();
  }, [assessment.id]);

  const ayur = assessment.ayurveda_responses as { agni?: Record<string, unknown>; koshtha?: Record<string, unknown> };
  const clin = assessment.clinical_responses as {
    bristol?: number | null;
    ibs?: Record<string, unknown>;
    gerd?: Record<string, unknown>;
    food_triggers?: string;
    red_flags?: string[];
  };
  const redFlagsList = Array.isArray(clin.red_flags) ? clin.red_flags : [];

  const saveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        assessment_id: assessment.id,
        vaidya_notes: notes,
        final_summary: summary,
        ai_draft_summary: report?.ai_draft_summary ?? null,
      };
      const { error } = report
        ? await supabase.from("gut_health_reports").update(payload).eq("id", report.id)
        : await supabase.from("gut_health_reports").insert(payload);
      if (error) throw error;
      setReviewedDraft(true);
      toast.success("Draft saved");
      const { data } = await supabase.from("gut_health_reports").select("*").eq("assessment_id", assessment.id).maybeSingle();
      setReport((data ?? null) as Report | null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const signAndSend = async () => {
    if (!doctorId) { toast.error("Doctor profile not found"); return; }
    if (!summary.trim()) { toast.error("Please write a summary before signing"); return; }
    if (!reviewedDraft) { toast.error("Please save the draft at least once — this confirms you've reviewed the AI text"); return; }
    setSigning(true);
    try {
      const now = new Date().toISOString();
      const reportPayload = {
        assessment_id: assessment.id,
        ai_draft_summary: report?.ai_draft_summary ?? null,
        vaidya_notes: notes,
        final_summary: summary,
        signed_by: doctorId,
        signed_at: now,
      };
      const { error: rErr } = report
        ? await supabase.from("gut_health_reports").update(reportPayload).eq("id", report.id)
        : await supabase.from("gut_health_reports").insert(reportPayload);
      if (rErr) throw rErr;

      const { error: aErr } = await supabase
        .from("gut_health_assessments")
        .update({ status: "reviewed", doctor_id: doctorId, reviewed_at: now })
        .eq("id", assessment.id);
      if (aErr) throw aErr;

      toast.success("Signed & sent to patient");
      onSigned();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not sign");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Back to queue</Button>
        <div className="flex items-center gap-2">
          {assessment.has_red_flag && (
            <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Red flag</Badge>
          )}
          <Badge variant="outline">Patient {assessment.patient_id.slice(0, 8)}</Badge>
          <Badge variant="outline">Submitted {format(new Date(assessment.created_at), "d MMM, h:mm a")}</Badge>
        </div>
      </div>

      {assessment.has_red_flag && (
        <Card className="border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Priority review</p>
              <p className="text-muted-foreground">Patient reported one or more red-flag symptoms. Advise in-person consultation in your summary.</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 space-y-5">
          <Section title="Agni — digestion">
            <Row k="Appetite" v={pretty(ayur.agni?.appetite)} />
            <Row k="Hunger timing" v={pretty(ayur.agni?.hunger_timing)} />
            <Row k="After eating" v={pretty(ayur.agni?.post_meal)} />
          </Section>
          <Separator />
          <Section title="Koshtha — bowel">
            <Row k="Frequency" v={pretty(ayur.koshtha?.frequency)} />
            <Row k="Bristol stool type" v={clin.bristol != null ? `Type ${clin.bristol}` : "—"} />
          </Section>
          <Separator />
          <Section title="Symptoms">
            <Row k="Belly pain (freq)" v={pretty(clin.ibs?.pain)} />
            <Row k="Pain pattern" v={pretty(clin.ibs?.pattern)} />
            <Row k="Bloating" v={pretty(clin.ibs?.bloating)} />
            <Row k="Chest burning" v={pretty(clin.gerd?.burning)} />
            <Row k="Regurgitation" v={pretty(clin.gerd?.regurgitation)} />
            <Row k="Food triggers" v={clin.food_triggers && clin.food_triggers.trim() ? clin.food_triggers : "—"} />
          </Section>
          <Separator />
          <Section title="Red flags">
            {redFlagsList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Patient reported none.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {redFlagsList.filter((r) => r !== "none").map((r) => <li key={r}>{pretty(r)}</li>)}
              </ul>
            )}
            {assessment.gut_health_score != null && (
              <p className="mt-3 text-xs text-muted-foreground">Auto-computed wellness score: <span className="font-semibold text-foreground">{assessment.gut_health_score}/100</span></p>
            )}
          </Section>
        </Card>

        <div className="space-y-5">
          {report?.ai_draft_summary ? (
            <Card className="border-amber-300 bg-amber-50 p-5 dark:border-amber-500/40 dark:bg-amber-500/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                  AI Draft — Please Review Before Sharing
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-amber-950 dark:text-amber-100">
                {report.ai_draft_summary}
              </p>
              {!reviewedDraft && (
                <p className="mt-3 text-[11px] italic text-amber-800/80 dark:text-amber-200/80">
                  Copy into the summary below, edit, then Save draft before signing.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setSummary(report.ai_draft_summary ?? "")}
              >
                Copy draft into summary
              </Button>
            </Card>
          ) : (
            <Card className="p-5 text-sm text-muted-foreground">
              No AI draft available yet. Please write your summary from scratch.
            </Card>
          )}

          <Card className="p-5 space-y-4">
            <div>
              <Label htmlFor="summary" className="text-base font-medium">Final summary for the patient</Label>
              <p className="text-xs text-muted-foreground">This is what the patient will see. Warm, plain language works best.</p>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => { setSummary(e.target.value); if (report?.ai_draft_summary) setReviewedDraft(false); }}
                placeholder="e.g. Based on your answers, your digestion looks a bit variable. Try warm cooked meals…"
                className="mt-2 min-h-[180px]"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-base font-medium">Private Vaidya notes</Label>
              <p className="text-xs text-muted-foreground">Only visible to you and the clinical team.</p>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes, differentials, follow-up plans…"
                className="mt-2 min-h-[100px]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={saveDraft} disabled={saving || signing}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save draft"}
              </Button>
              <Button variant="hero" onClick={signAndSend} disabled={signing || saving || !summary.trim() || !reviewedDraft}>
                {signing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing…</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Sign & Send to Patient</>}
              </Button>
            </div>
            {!reviewedDraft && report?.ai_draft_summary && (
              <p className="text-[11px] text-muted-foreground">Save the draft at least once to confirm review before signing.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{title}</p>
    <div className="mt-2 space-y-1.5">{children}</div>
  </div>
);
const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-4 text-sm">
    <span className="text-muted-foreground">{k}</span>
    <span className="font-medium text-right">{v}</span>
  </div>
);

export default GutHealthReviewQueue;
