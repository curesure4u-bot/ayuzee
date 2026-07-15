import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Leaf, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";

type Answers = Record<string, string | string[] | number | boolean | null>;

const STEPS = [
  { key: "agni", label: "Digestion", sanskrit: "Agni" },
  { key: "koshtha", label: "Bowel type", sanskrit: "Koshtha" },
  { key: "symptoms", label: "Symptom check", sanskrit: "Lakshana" },
  { key: "redflags", label: "Safety check", sanskrit: "Sucaka" },
];

const AGNI_Q = [
  {
    id: "appetite",
    q: "How would you describe your appetite most days?",
    hint: "Ayurveda calls this Agni — your digestive fire.",
    opts: [
      { v: "strong", label: "Strong — I feel hungry at regular times" },
      { v: "irregular", label: "Irregular — sometimes ravenous, sometimes nothing" },
      { v: "weak", label: "Weak — I rarely feel truly hungry" },
      { v: "heavy", label: "Sluggish — I feel heavy even before eating" },
    ],
  },
  {
    id: "hunger_timing",
    q: "When do you usually feel hungry?",
    hint: "This helps us understand your digestion rhythm.",
    opts: [
      { v: "on_time", label: "At regular meal times" },
      { v: "early", label: "Very quickly after a meal" },
      { v: "late", label: "Long after normal meal times" },
      { v: "rarely", label: "Rarely — I eat by the clock, not hunger" },
    ],
  },
  {
    id: "post_meal",
    q: "How do you feel about an hour after eating?",
    hint: "A settled feeling suggests balanced Agni.",
    opts: [
      { v: "light", label: "Light and energetic" },
      { v: "bloated", label: "Bloated or gassy" },
      { v: "heavy", label: "Very heavy or sleepy" },
      { v: "burning", label: "Burning or acidic" },
    ],
  },
];

const BRISTOL = [
  { n: 1, shape: "●●●●", label: "Hard lumps, like nuts" },
  { n: 2, shape: "🥔", label: "Lumpy, sausage-shaped" },
  { n: 3, shape: "🌽", label: "Sausage with cracks" },
  { n: 4, shape: "🥒", label: "Smooth, soft sausage" },
  { n: 5, shape: "🫘", label: "Soft blobs, clear edges" },
  { n: 6, shape: "☁️", label: "Mushy, ragged edges" },
  { n: 7, shape: "💧", label: "Fully liquid, no solids" },
];

const KOSHTHA_Q = [
  {
    id: "frequency",
    q: "How often do you pass stool?",
    hint: "Ayurveda calls this Koshtha — your bowel pattern.",
    opts: [
      { v: "gt_once_daily", label: "More than once a day" },
      { v: "once_daily", label: "Once a day, most days" },
      { v: "every_2_3", label: "Every 2–3 days" },
      { v: "irregular", label: "Irregular — hard to predict" },
    ],
  },
];

const IBS_Q = [
  {
    id: "ibs_pain",
    q: "In the past 3 months, how often have you had belly pain?",
    opts: [
      { v: "none", label: "Not really" },
      { v: "sometimes", label: "A few days a month" },
      { v: "often", label: "Most weeks" },
      { v: "daily", label: "Almost every day" },
    ],
  },
  {
    id: "ibs_pain_pattern",
    q: "When you get belly pain, is it linked to going to the toilet?",
    opts: [
      { v: "relief_after", label: "Yes, it eases after passing stool" },
      { v: "changes_form", label: "It changes with how my stool looks" },
      { v: "changes_freq", label: "It changes with how often I go" },
      { v: "no_link", label: "No clear link" },
    ],
  },
  {
    id: "bloating",
    q: "How often do you feel bloated or gassy?",
    opts: [
      { v: "rare", label: "Rarely" },
      { v: "weekly", label: "A few times a week" },
      { v: "daily", label: "Almost daily" },
      { v: "constant", label: "Almost all the time" },
    ],
  },
];

const GERD_Q = [
  {
    id: "burning",
    q: "How often do you feel burning behind the chest?",
    opts: [
      { v: "never", label: "Never" },
      { v: "monthly", label: "A few times a month" },
      { v: "weekly", label: "Weekly" },
      { v: "daily", label: "Daily or nightly" },
    ],
  },
  {
    id: "regurgitation",
    q: "Does food or sour liquid come back up into your throat?",
    opts: [
      { v: "never", label: "Never" },
      { v: "sometimes", label: "Sometimes" },
      { v: "often", label: "Often" },
      { v: "nightly", label: "Frequently at night" },
    ],
  },
];

const RED_FLAGS = [
  { id: "blood_stool", label: "Blood in stool" },
  { id: "weight_loss", label: "Unexplained weight loss" },
  { id: "swallow", label: "Difficulty swallowing" },
  { id: "vomiting", label: "Persistent vomiting" },
  { id: "night_pain", label: "Pain that wakes me at night" },
];

const GutHealthAssessment = () => {
  usePageSEO({
    title: "Gut Health Assessment — Ayuzee",
    description: "A gentle multi-step gut health check combining Ayurveda and modern symptom screening. Your Vaidya reviews and shares a summary.",
  });

  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [bristol, setBristol] = useState<number | null>(null);
  const [triggers, setTriggers] = useState("");
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

  const set = (id: string, v: string) => setAnswers((p) => ({ ...p, [id]: v }));

  const canNext = () => {
    if (step === 0) return AGNI_Q.every((q) => answers[q.id]);
    if (step === 1) return !!answers.frequency && bristol !== null;
    if (step === 2) return IBS_Q.every((q) => answers[q.id]) && GERD_Q.every((q) => answers[q.id]);
    return true;
  };

  const computeScore = () => {
    // Rough 0-100 wellness score: fewer symptoms = higher
    const symptomKeys = ["ibs_pain", "bloating", "burning", "regurgitation"];
    const weights: Record<string, number> = {
      none: 0, never: 0, rare: 0, sometimes: 1, monthly: 1,
      weekly: 2, often: 2, daily: 3, constant: 3, nightly: 3,
      relief_after: 2, changes_form: 2, changes_freq: 2, no_link: 0,
    };
    const sym = symptomKeys.reduce((s, k) => s + (weights[String(answers[k] ?? "")] ?? 0), 0);
    const agniPenalty = ["weak", "heavy", "irregular"].includes(String(answers.appetite ?? "")) ? 3 : 0;
    const stoolPenalty = bristol != null && (bristol <= 2 || bristol >= 6) ? 3 : 0;
    const raw = 100 - (sym * 5 + agniPenalty * 4 + stoolPenalty * 4);
    return Math.max(0, Math.min(100, raw));
  };

  const submit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const ayurveda_responses = {
        agni: { appetite: answers.appetite, hunger_timing: answers.hunger_timing, post_meal: answers.post_meal },
        koshtha: { frequency: answers.frequency, bristol },
      };
      const clinical_responses = {
        bristol,
        ibs: { pain: answers.ibs_pain, pattern: answers.ibs_pain_pattern, bloating: answers.bloating },
        gerd: { burning: answers.burning, regurgitation: answers.regurgitation },
        food_triggers: triggers.trim(),
      };
      const has_red_flag = redFlags.length > 0;
      const gut_health_score = computeScore();

      const { error } = await supabase.from("gut_health_assessments").insert({
        patient_id: userId,
        status: "submitted",
        ayurveda_responses,
        clinical_responses,
        has_red_flag,
        gut_health_score,
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
          <h1 className="mt-5 font-display text-3xl">Thank you 🌿</h1>
          <p className="mt-3 text-muted-foreground">
            Your Vaidya will review this and share a summary with you. You'll be notified when it's ready.
          </p>
          {redFlags.length > 0 && (
            <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-left text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <p>
                  Based on your answers, <strong>please book an appointment soon</strong> so a doctor can see you in person.
                </p>
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
          <Leaf className="h-3.5 w-3.5" /> Gut health check
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">A gentle look at your digestion</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          4 short steps. Your answers stay private and go to your Vaidya for review.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length} · {current.label}</span>
          <span className="italic">{current.sanskrit}</span>
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
        {step === 0 && (
          <div className="space-y-6">
            {AGNI_Q.map((q) => (
              <QuestionBlock key={q.id} q={q} value={answers[q.id] as string} onChange={(v) => set(q.id, v)} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            {KOSHTHA_Q.map((q) => (
              <QuestionBlock key={q.id} q={q} value={answers[q.id] as string} onChange={(v) => set(q.id, v)} />
            ))}
            <div>
              <Label className="text-base font-medium">Which of these looks closest to your usual stool?</Label>
              <p className="mt-1 text-xs text-muted-foreground">Bristol Stool Chart — pick the shape that matches most days.</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BRISTOL.map((b) => {
                  const active = bristol === b.n;
                  return (
                    <button
                      key={b.n}
                      type="button"
                      onClick={() => setBristol(b.n)}
                      className={`rounded-xl border p-3 text-left transition ${active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}
                    >
                      <div className="text-2xl">{b.shape}</div>
                      <div className="mt-1 text-xs font-semibold">Type {b.n}</div>
                      <div className="text-[11px] text-muted-foreground">{b.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <SectionHeading title="Belly patterns" subtitle="Common IBS-style questions." />
            {IBS_Q.map((q) => (
              <QuestionBlock key={q.id} q={q} value={answers[q.id] as string} onChange={(v) => set(q.id, v)} />
            ))}
            <SectionHeading title="Reflux & burning" subtitle="Common GERD-style questions." />
            {GERD_Q.map((q) => (
              <QuestionBlock key={q.id} q={q} value={answers[q.id] as string} onChange={(v) => set(q.id, v)} />
            ))}
            <div>
              <Label htmlFor="triggers" className="text-base font-medium">Any foods that upset your stomach?</Label>
              <p className="mt-1 text-xs text-muted-foreground">List anything you've noticed — dal, dairy, spicy, fried, coffee…</p>
              <Textarea
                id="triggers"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                placeholder="E.g. milk in the morning, deep-fried snacks, raw onion…"
                className="mt-2 min-h-[90px]"
                maxLength={800}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl">A quick safety check</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tick anything you've experienced recently. These help us decide if you should see a doctor soon.
              </p>
            </div>
            <div className="space-y-3">
              {RED_FLAGS.map((r) => (
                <label key={r.id} className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
                  <Checkbox
                    checked={redFlags.includes(r.id)}
                    onCheckedChange={(c) =>
                      setRedFlags((prev) => (c ? [...prev, r.id] : prev.filter((x) => x !== r.id)))
                    }
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
              <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40">
                <Checkbox
                  checked={redFlags.includes("none")}
                  onCheckedChange={(c) => setRedFlags(c ? ["none"] : [])}
                />
                <span className="text-sm">None of the above</span>
              </label>
            </div>
            {redFlags.filter((r) => r !== "none").length > 0 && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive">Please book an appointment soon</p>
                    <p className="mt-1 text-muted-foreground">
                      One or more of these can be important. We'll flag your submission so your Vaidya reviews it on priority.
                    </p>
                  </div>
                </div>
              </div>
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
          <Button variant="hero" onClick={submit} disabled={submitting || redFlags.length === 0}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : "Submit for review"}
          </Button>
        )}
      </div>

      {step === STEPS.length - 1 && redFlags.length === 0 && (
        <p className="mt-2 text-right text-xs text-muted-foreground">Please tick at least one option (or "None of the above") to continue.</p>
      )}
    </main>
  );
};

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="border-b pb-2">
    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{title}</p>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

const QuestionBlock = ({
  q,
  value,
  onChange,
}: {
  q: { id: string; q: string; hint?: string; opts: { v: string; label: string }[] };
  value: string | undefined;
  onChange: (v: string) => void;
}) => (
  <div>
    <Label className="text-base font-medium">{q.q}</Label>
    {q.hint && <p className="mt-1 text-xs text-muted-foreground">{q.hint}</p>}
    <RadioGroup value={value ?? ""} onValueChange={onChange} className="mt-3 space-y-2">
      {q.opts.map((o) => (
        <label key={o.v} htmlFor={`${q.id}-${o.v}`} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <RadioGroupItem id={`${q.id}-${o.v}`} value={o.v} />
          <span className="text-sm">{o.label}</span>
        </label>
      ))}
    </RadioGroup>
  </div>
);

export default GutHealthAssessment;
