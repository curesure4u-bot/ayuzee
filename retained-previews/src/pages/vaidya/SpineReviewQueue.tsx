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
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ScanLine,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ASSESSMENT_MODULES } from "@/data/assessmentModules";

type SpineAssessment = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  status: "submitted" | "ai_drafted" | "reviewed";
  responses: {
    answers?: Record<string, number>;
    scale?: string[];
    module_slug?: string;
  } | null;
  spine_score: number | null;
  risk_label: string | null;
  has_red_flag: boolean;
  posture_assessment_id: string | null;
  created_at: string;
};

type SpineReport = {
  id: string;
  assessment_id: string;
  ai_draft_summary: string | null;
  likely_astg_pattern: string | null;
  dosha_note: string | null;
  recommended_action: string | null;
  vaidya_notes: string | null;
  final_summary: string | null;
  signed_by: string | null;
  signed_at: string | null;
  astg_disease_id: string | null;
  astg_red_flag_matched: string | null;
  astg_red_flag_source: string | null;
  interpretation_bypassed: boolean | null;
};

type PostureRow = {
  id: string;
  assessment_date: string | null;
  overall_index: number | null;
  risk_level: string | null;
  spine_score: number | null;
  findings: unknown;
  corrective_plan: unknown;
};

const SpineReviewQueue = () => {
  usePageSEO({
    title: "Spine Reports — Ayuzee Vaidya",
    description: "Review patient spine assessments and sign summaries.",
  });

  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [rows, setRows] = useState<SpineAssessment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setLoading(false);
      return;
    }
    const { data: doc } = await supabase
      .from("doctors")
      .select("id")
      .eq("user_id", uid)
      .maybeSingle();
    const docId = doc?.id ?? null;
    setDoctorId(docId);

    let query = supabase
      .from("spine_assessments")
      .select("*")
      .in("status", ["submitted", "ai_drafted"])
      .order("created_at", { ascending: false });

    // Assigned to me OR unassigned
    if (docId) {
      query = query.or(`doctor_id.eq.${docId},doctor_id.is.null`);
    } else {
      query = query.is("doctor_id", null);
    }

    const { data, error } = await query;
    if (error) toast.error(error.message);
    setRows((data ?? []) as SpineAssessment[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  if (selected) {
    return (
      <ReviewDetail
        assessment={selected}
        doctorId={doctorId}
        onBack={() => setSelectedId(null)}
        onSigned={() => {
          setSelectedId(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Stethoscope className="h-3.5 w-3.5" /> Vaidya review
        </div>
        <h1 className="mt-1 font-display text-3xl">Spine reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patient spine assessments awaiting your review. Red-flagged cases are highlighted.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading queue…
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-primary/60" />
          You're all caught up. No pending spine assessments.
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
                      <Badge variant="destructive" className="text-[10px]">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Red flag
                      </Badge>
                    )}
                    <Badge
                      variant={r.status === "ai_drafted" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {r.status === "ai_drafted" ? "AI draft ready" : "New submission"}
                    </Badge>
                    {!r.doctor_id && (
                      <Badge variant="outline" className="text-[10px]">
                        Unassigned
                      </Badge>
                    )}
                    {r.posture_assessment_id && (
                      <Badge variant="outline" className="text-[10px]">
                        <ScanLine className="mr-1 h-3 w-3" />
                        Posture linked
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Patient {r.patient_id.slice(0, 8)} ·{" "}
                    {format(new Date(r.created_at), "d MMM yyyy · h:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  {r.spine_score != null && (
                    <div className="text-2xl font-semibold">{r.spine_score}</div>
                  )}
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {r.risk_label ?? "Score"}
                  </div>
                </div>
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
  assessment: SpineAssessment;
  doctorId: string | null;
  onBack: () => void;
  onSigned: () => void;
}) => {
  const [report, setReport] = useState<SpineReport | null>(null);
  const [posture, setPosture] = useState<PostureRow | null>(null);
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [reviewedDraft, setReviewedDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);

  const mod = ASSESSMENT_MODULES["spine"];
  const answers = (assessment.responses?.answers ?? {}) as Record<string, number>;
  const scale = assessment.responses?.scale ?? [];

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("spine_reports")
        .select("*")
        .eq("assessment_id", assessment.id)
        .maybeSingle();
      const r = (data ?? null) as SpineReport | null;
      setReport(r);
      setSummary(r?.final_summary ?? r?.ai_draft_summary ?? "");
      setNotes(r?.vaidya_notes ?? "");
      setReviewedDraft(!r?.ai_draft_summary || !!r?.final_summary);

      if (assessment.posture_assessment_id) {
        const { data: p } = await supabase
          .from("vaidya_posture_assessments")
          .select("id, assessment_date, overall_index, risk_level, spine_score, findings, corrective_plan")
          .eq("id", assessment.posture_assessment_id)
          .maybeSingle();
        setPosture((p ?? null) as PostureRow | null);
      }
    })();
  }, [assessment.id, assessment.posture_assessment_id]);

  const saveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        assessment_id: assessment.id,
        vaidya_notes: notes,
        final_summary: summary,
        ai_draft_summary: report?.ai_draft_summary ?? null,
        likely_astg_pattern: report?.likely_astg_pattern ?? null,
        dosha_note: report?.dosha_note ?? null,
        recommended_action: report?.recommended_action ?? null,
      };
      const { error } = report
        ? await supabase.from("spine_reports").update(payload).eq("id", report.id)
        : await supabase.from("spine_reports").insert(payload);
      if (error) throw error;
      setReviewedDraft(true);
      toast.success("Draft saved");
      const { data } = await supabase
        .from("spine_reports")
        .select("*")
        .eq("assessment_id", assessment.id)
        .maybeSingle();
      setReport((data ?? null) as SpineReport | null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const signAndSend = async () => {
    if (!doctorId) {
      toast.error("Doctor profile not found");
      return;
    }
    if (!summary.trim()) {
      toast.error("Please write a summary before signing");
      return;
    }
    if (!reviewedDraft) {
      toast.error("Please save the draft at least once — this confirms you've reviewed the AI text");
      return;
    }
    setSigning(true);
    try {
      const now = new Date().toISOString();
      const reportPayload = {
        assessment_id: assessment.id,
        ai_draft_summary: report?.ai_draft_summary ?? null,
        likely_astg_pattern: report?.likely_astg_pattern ?? null,
        dosha_note: report?.dosha_note ?? null,
        recommended_action: report?.recommended_action ?? null,
        vaidya_notes: notes,
        final_summary: summary,
        signed_by: doctorId,
        signed_at: now,
      };
      const { error: rErr } = report
        ? await supabase.from("spine_reports").update(reportPayload).eq("id", report.id)
        : await supabase.from("spine_reports").insert(reportPayload);
      if (rErr) throw rErr;

      const { error: aErr } = await supabase
        .from("spine_assessments")
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

  const questions = mod?.questions ?? [];
  const postureFindings = Array.isArray(posture?.findings) ? (posture!.findings as unknown[]) : [];
  const posturePlan = Array.isArray(posture?.corrective_plan)
    ? (posture!.corrective_plan as unknown[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to queue
        </Button>
        <div className="flex items-center gap-2">
          {assessment.has_red_flag && (
            <Badge variant="destructive">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Red flag
            </Badge>
          )}
          <Badge variant="outline">Patient {assessment.patient_id.slice(0, 8)}</Badge>
          <Badge variant="outline">
            Submitted {format(new Date(assessment.created_at), "d MMM, h:mm a")}
          </Badge>
        </div>
      </div>

      {assessment.has_red_flag && (
        <Card className="border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Priority review</p>
              <p className="text-muted-foreground">
                Patient reported nerve, weakness or night-pain symptoms. Advise in-person consultation in your summary.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Patient answers · 20 spine questions
              </p>
              <div className="text-right">
                <div className="text-2xl font-semibold">{assessment.spine_score ?? "—"}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {assessment.risk_label ?? "Score"}
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
              {questions.map((q) => {
                const val = answers[q.id];
                const label = val != null ? scale[val] ?? String(val) : "—";
                return (
                  <div key={q.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Q{q.id}. {q.text}
                    </span>
                    <span className="font-medium text-right whitespace-nowrap">
                      {label} <span className="text-muted-foreground">({val ?? "—"})</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {assessment.posture_assessment_id && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Linked posture screening
                </p>
              </div>
              {!posture ? (
                <p className="text-sm text-muted-foreground">Loading posture data…</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <MiniStat label="Overall index" value={posture.overall_index} />
                    <MiniStat label="Spine score" value={posture.spine_score} />
                    <MiniStat
                      label="Risk"
                      value={posture.risk_level ?? "—"}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Findings
                    </p>
                    {postureFindings.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">No findings recorded.</p>
                    ) : (
                      <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
                        {postureFindings.map((f, i) => (
                          <li key={i}>{typeof f === "string" ? f : JSON.stringify(f)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Corrective plan
                    </p>
                    {posturePlan.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">No plan recorded.</p>
                    ) : (
                      <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
                        {posturePlan.map((f, i) => (
                          <li key={i}>{typeof f === "string" ? f : JSON.stringify(f)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Screening ID {posture.id.slice(0, 8)} ·{" "}
                    {posture.assessment_date
                      ? format(new Date(posture.assessment_date), "d MMM yyyy")
                      : "undated"}
                  </p>
                </>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {report?.interpretation_bypassed && (
            <Card className="border-destructive/50 bg-destructive/10 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-destructive">
                AI interpretation bypassed — red flag matched
              </p>
              <p className="mt-2 text-sm">
                <span className="font-semibold">Flagged:</span>{" "}
                {report.astg_red_flag_matched ?? "Nerve-related or night-pain symptoms"} — per{" "}
                {report.astg_red_flag_source ?? "DGHS Standard Treatment Guidelines on Musculoskeletal Disorders"}.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Per platform policy, the AI draft was skipped. Please evaluate the patient in
                person before authoring the summary.
              </p>
              {report.astg_disease_id && (
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <a href={`/astg/musculoskeletal/${report.astg_disease_id}`} target="_blank" rel="noreferrer">
                    Open ASTG reference
                  </a>
                </Button>
              )}
            </Card>
          )}

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
              <div className="mt-3 grid gap-2 text-xs text-amber-950 dark:text-amber-100">
                {report.likely_astg_pattern && (
                  <div>
                    <span className="font-semibold">Likely ASTG pattern: </span>
                    {report.likely_astg_pattern}
                  </div>
                )}
                {report.dosha_note && (
                  <div>
                    <span className="font-semibold">Dosha note: </span>
                    {report.dosha_note}
                  </div>
                )}
                {report.recommended_action && (
                  <div>
                    <span className="font-semibold">Recommended action: </span>
                    {report.recommended_action}
                  </div>
                )}
                {report.astg_disease_id && !report.interpretation_bypassed && (
                  <div>
                    <span className="font-semibold">ASTG reference: </span>
                    <a
                      href={`/astg/musculoskeletal/${report.astg_disease_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2 hover:no-underline"
                    >
                      Open Musculoskeletal Disorders page
                    </a>
                  </div>
                )}
              </div>
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
              No AI draft available yet. Please write your summary from scratch, or trigger the AI interpreter.
            </Card>
          )}

          <Card className="p-5 space-y-4">
            <div>
              <Label htmlFor="summary" className="text-base font-medium">
                Final summary for the patient
              </Label>
              <p className="text-xs text-muted-foreground">
                This is what the patient will see. Warm, plain language works best.
              </p>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  if (report?.ai_draft_summary) setReviewedDraft(false);
                }}
                placeholder="e.g. Based on your answers and posture screening, your lower back is under load…"
                className="mt-2 min-h-[180px]"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-base font-medium">
                Private Vaidya notes
              </Label>
              <p className="text-xs text-muted-foreground">
                Only visible to you and the clinical team.
              </p>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes, differentials (Katigraha / Gridhrasi), follow-up plans…"
                className="mt-2 min-h-[100px]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={saveDraft} disabled={saving || signing}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save draft"
                )}
              </Button>
              <Button
                variant="hero"
                onClick={signAndSend}
                disabled={signing || saving || !summary.trim() || !reviewedDraft}
              >
                {signing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve & Sign
                  </>
                )}
              </Button>
            </div>
            {!reviewedDraft && report?.ai_draft_summary && (
              <p className="text-[11px] text-muted-foreground">
                Save the draft at least once to confirm review before signing.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }: { label: string; value: number | string | null }) => (
  <div className="rounded-lg border p-3">
    <div className="text-lg font-semibold">{value ?? "—"}</div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);

export default SpineReviewQueue;
