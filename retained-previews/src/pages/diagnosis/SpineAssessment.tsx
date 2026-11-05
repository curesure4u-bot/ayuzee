import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Stethoscope, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ANSWER_SCALE, ASSESSMENT_MODULES } from "@/data/assessmentModules";

type PostureRow = {
  id: string;
  assessment_date: string | null;
  overall_index: number | null;
  risk_level: string | null;
  spine_score: number | null;
};

const SpineAssessment = () => {
  usePageSEO({
    title: "Spine Health Assessment — Ayuzee",
    description: "A guided 20-question spine health check. Optionally link a recent posture screening. Your Vaidya reviews and shares a summary.",
  });

  const navigate = useNavigate();
  const mod = ASSESSMENT_MODULES["spine"];
  const questions = mod.questions;

  // Split 20 questions into 3 pages
  const pages = useMemo(() => {
    const per = Math.ceil(questions.length / 3);
    return [questions.slice(0, per), questions.slice(per, per * 2), questions.slice(per * 2)];
  }, [questions]);

  const STEPS = [
    { key: "q1", label: "Pain & posture" },
    { key: "q2", label: "Lifestyle load" },
    { key: "q3", label: "Function & impact" },
    { key: "posture", label: "Posture screening" },
    { key: "safety", label: "Safety check" },
  ];

  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [ackNoRedFlag, setAckNoRedFlag] = useState(false);

  // posture linking
  const [hasPosture, setHasPosture] = useState<"unknown" | "yes" | "no">("unknown");
  const [postureRows, setPostureRows] = useState<PostureRow[]>([]);
  const [postureLoading, setPostureLoading] = useState(false);
  const [postureFilter, setPostureFilter] = useState("");
  const [postureId, setPostureId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast.error("Please sign in to take the assessment");
        navigate("/auth");
        return;
      }
      setUserId(data.session.user.id);
    });
  }, [navigate]);

  // computed
  const totalScore = useMemo(
    () => questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0),
    [answers, questions]
  );
  const riskLabel = useMemo(() => {
    const buckets = mod.totalBuckets ?? [];
    return buckets.find((b) => totalScore <= b.max)?.label ?? buckets[buckets.length - 1]?.label ?? "";
  }, [mod.totalBuckets, totalScore]);
  const hasRedFlag = useMemo(() => {
    const rf = mod.redFlag;
    if (!rf) return false;
    return rf.questionIds.some((qid) => (answers[qid] ?? 0) >= rf.threshold);
  }, [answers, mod.redFlag]);

  const loadPosture = async () => {
    if (!userId) return;
    setPostureLoading(true);
    try {
      const { data, error } = await supabase
        .from("vaidya_posture_assessments")
        .select("id, assessment_date, overall_index, risk_level, spine_score")
        .eq("patient_id", userId)
        .order("assessment_date", { ascending: false })
        .limit(20);
      if (error) throw error;
      setPostureRows((data ?? []) as PostureRow[]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load posture screenings");
    } finally {
      setPostureLoading(false);
    }
  };

  const filteredPosture = postureRows.filter((r) => {
    if (!postureFilter.trim()) return true;
    const f = postureFilter.toLowerCase();
    return (
      r.id.toLowerCase().includes(f) ||
      (r.assessment_date ?? "").toLowerCase().includes(f) ||
      (r.risk_level ?? "").toLowerCase().includes(f)
    );
  });

  const canNext = () => {
    if (step < 3) {
      return pages[step].every((q) => answers[q.id] !== undefined);
    }
    if (step === 3) return hasPosture !== "unknown"; // must decide yes/no
    return true;
  };

  const canSubmit = () => {
    if (submitting) return false;
    if (questions.some((q) => answers[q.id] === undefined)) return false;
    if (hasRedFlag) return true; // red flag itself acknowledges risk
    return ackNoRedFlag;
  };

  const submit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const responses = {
        answers,
        scale: ANSWER_SCALE,
        module_slug: mod.slug,
      };
      const { error } = await supabase.from("spine_assessments").insert({
        patient_id: userId,
        status: "submitted",
        responses,
        spine_score: totalScore,
        risk_label: riskLabel,
        has_red_flag: hasRedFlag,
        posture_assessment_id: postureId,
      });
      if (error) throw error;
      setDone(true);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="container max-w-2xl py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-5 font-display text-3xl">Thank you 🦴</h1>
          <p className="mt-3 text-muted-foreground">
            Your Vaidya will review this and share a summary with you. You'll be notified when it's ready.
          </p>
          {hasRedFlag && (
            <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-left text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <p>{mod.redFlag?.message ?? "Please book an appointment soon so a doctor can evaluate you in person."}</p>
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero"><Link to="/doctors"><Stethoscope className="mr-2 h-4 w-4" />Book a Vaidya</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Go to my dashboard</Link></Button>
          </div>
        </Card>
      </main>
    );
  }

  const pct = ((step + 1) / STEPS.length) * 100;
  const current = STEPS[step];

  return (
    <main className="container max-w-2xl py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <span aria-hidden>🦴</span> Spine health check
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">A guided look at your spine</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {STEPS.length} short steps. Your answers stay private and go to your Vaidya for review.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length} · {current.label}</span>
          <span className="italic">{mod.subtitle}</span>
        </div>
        <Progress value={pct} className="mt-2" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <Badge key={s.key} variant={i === step ? "default" : i < step ? "secondary" : "outline"} className="text-[10px]">
              {i + 1}. {s.label}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="p-6 space-y-6">
        {step < 3 && (
          <div className="space-y-6">
            {pages[step].map((q) => (
              <ScaleQuestion
                key={q.id}
                q={q}
                value={answers[q.id]}
                onChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl">Do you have a recent posture screening on file?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If a Vaidya has done a posture assessment for you (via our posture tool), you can link it — it helps your reviewer see your alignment alongside these answers. Otherwise skip.
              </p>
            </div>

            <RadioGroup
              value={hasPosture}
              onValueChange={(v) => {
                const val = v as "yes" | "no";
                setHasPosture(val);
                if (val === "yes") loadPosture();
                if (val === "no") setPostureId(null);
              }}
              className="grid gap-2 sm:grid-cols-2"
            >
              {[
                { v: "yes", label: "Yes, link one" },
                { v: "no", label: "No / skip" },
              ].map((o) => (
                <label
                  key={o.v}
                  htmlFor={`posture-${o.v}`}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`posture-${o.v}`} value={o.v} />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
            </RadioGroup>

            {hasPosture === "yes" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your posture screenings</p>
                </div>
                <Input
                  placeholder="Filter by date, risk level, or ID"
                  value={postureFilter}
                  onChange={(e) => setPostureFilter(e.target.value)}
                />
                {postureLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading your screenings…
                  </div>
                ) : filteredPosture.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No posture screenings found on your account. You can skip this step.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {filteredPosture.map((r) => {
                      const active = postureId === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setPostureId(active ? null : r.id)}
                          className={`text-left rounded-lg border p-3 transition ${
                            active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">
                                {r.assessment_date
                                  ? format(new Date(r.assessment_date), "d MMM yyyy")
                                  : "Undated screening"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">ID {r.id.slice(0, 8)}</p>
                            </div>
                            <div className="text-right">
                              {r.risk_level && (
                                <Badge variant="outline" className="text-[10px]">{r.risk_level}</Badge>
                              )}
                              {r.overall_index != null && (
                                <p className="mt-1 text-xs text-muted-foreground">Index {r.overall_index}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {postureId && (
                  <p className="text-xs text-primary">Selected screening will be attached to your submission.</p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl">A quick safety check</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on your answers, we auto-flag nerve or sleep-disturbing symptoms so your Vaidya reviews you on priority.
              </p>
            </div>

            <div className="rounded-xl border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Spine load score</p>
                  <p className="text-xs text-muted-foreground">Total across 20 questions (0–80). Lower is better.</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">{totalScore}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{riskLabel}</div>
                </div>
              </div>
            </div>

            {hasRedFlag ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive">Priority review</p>
                    <p className="mt-1 text-muted-foreground">
                      {mod.redFlag?.message ?? "Please book an appointment soon for in-person evaluation."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
                <Checkbox
                  checked={ackNoRedFlag}
                  onCheckedChange={(c) => setAckNoRedFlag(!!c)}
                />
                <span className="text-sm">
                  I don't currently have severe neck/back pain radiating to a limb, numbness, weakness or pain that wakes me at night.
                </span>
              </label>
            )}
          </div>
        )}
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || submitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="hero" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="hero" onClick={submit} disabled={!canSubmit()}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : "Submit for review"}
          </Button>
        )}
      </div>

      {step === STEPS.length - 1 && !hasRedFlag && !ackNoRedFlag && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          Please confirm the safety statement to submit.
        </p>
      )}
    </main>
  );
};

const ScaleQuestion = ({
  q,
  value,
  onChange,
}: {
  q: { id: number; text: string };
  value: number | undefined;
  onChange: (v: number) => void;
}) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Q{q.id}</p>
    <Label className="mt-1 block text-base font-medium">{q.text}</Label>
    <RadioGroup
      value={value !== undefined ? String(value) : ""}
      onValueChange={(v) => onChange(Number(v))}
      className="mt-3 space-y-2"
    >
      {ANSWER_SCALE.map((label, idx) => (
        <label
          key={idx}
          htmlFor={`q${q.id}-opt-${idx}`}
          className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
        >
          <RadioGroupItem id={`q${q.id}-opt-${idx}`} value={String(idx)} />
          <span className="flex-1 text-sm">{label}</span>
          <span className="text-xs text-muted-foreground">{idx}</span>
        </label>
      ))}
    </RadioGroup>
  </div>
);

export default SpineAssessment;
