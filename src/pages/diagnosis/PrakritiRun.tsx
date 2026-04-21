import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { PRAKRITI_QUESTIONS, scorePrakriti, getGuidance, type Dosha } from "@/data/prakritiQuestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Mode = "self" | "doctor" | "therapist";

const sectionTitles: Record<string, string> = {
  physical: "Physical Traits (Sharira Lakshana)",
  physiological: "Physiological Traits (Kriya Lakshana)",
  psychological: "Psychological Traits (Manasika Lakshana)",
};

const PrakritiRun = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = (params.get("mode") as Mode) || "self";
  const patientUserIdParam = params.get("patient_user_id") || undefined;

  const [step, setStep] = useState(-1); // -1 = patient details
  const [responses, setResponses] = useState<Record<string, Dosha>>({});
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [meta, setMeta] = useState({ name: "", age: "", gender: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | ReturnType<typeof scorePrakriti>>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null));
  }, []);

  const total = PRAKRITI_QUESTIONS.length;
  const progress = step < 0 ? 0 : Math.round(((step + 1) / total) * 100);
  const currentQ = step >= 0 ? PRAKRITI_QUESTIONS[step] : null;
  const currentSection = currentQ?.section;
  const sectionStart = useMemo(() => {
    if (!currentSection) return false;
    return step === 0 || PRAKRITI_QUESTIONS[step - 1]?.section !== currentSection;
  }, [step, currentSection]);

  const choose = (dosha: Dosha) => {
    if (!currentQ) return;
    setResponses((r) => ({ ...r, [currentQ.id]: dosha }));
  };

  const next = () => setStep((s) => s + 1);
  const prev = () => setStep((s) => Math.max(-1, s - 1));

  const submit = async () => {
    if (mode === "self" && !user) {
      toast.error("Please sign in to save your assessment");
      navigate(`/auth?redirect=/diagnosis/prakriti/run?mode=self`);
      return;
    }
    setSubmitting(true);
    const result = scorePrakriti(responses);
    const patient_user_id = patientUserIdParam || user?.id;
    if (!patient_user_id) {
      toast.error("Patient identity is required");
      setSubmitting(false);
      return;
    }
    const { data, error } = await supabase
      .from("prakriti_assessments")
      .insert({
        patient_user_id,
        assessor_user_id: user?.id ?? null,
        mode,
        patient_name: meta.name || null,
        patient_age: meta.age ? parseInt(meta.age, 10) : null,
        patient_gender: meta.gender || null,
        responses: responses as any,
        vata_score: result.vata,
        pitta_score: result.pitta,
        kapha_score: result.kapha,
        total_questions: result.total,
        dominant_dosha: result.dominant,
        status: "completed",
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSavedId(data.id);
    setDone(result);
  };

  // ---------- RESULT VIEW ----------
  if (done) {
    const guidance = getGuidance(done.dominant);
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1 container py-12 max-w-3xl">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-background p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">Your Prakriti</p>
            <h1 className="mt-2 font-display text-4xl font-semibold capitalize">{done.dominant.replace("-", " – ")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Based on the CCRAS / Ministry of AYUSH SOP</p>
          </div>

          <Card className="mt-6 p-6">
            <h2 className="font-display text-lg font-semibold">Dosha breakdown</h2>
            <div className="mt-4 space-y-3">
              {[
                { k: "Vata", v: done.vataPct, c: "bg-blue-500" },
                { k: "Pitta", v: done.pittaPct, c: "bg-red-500" },
                { k: "Kapha", v: done.kaphaPct, c: "bg-emerald-500" },
              ].map((d) => (
                <div key={d.k}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{d.k}</span>
                    <span className="text-muted-foreground">{d.v}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${d.c}`} style={{ width: `${d.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {guidance.map((g) => (
            <Card key={g.title} className="mt-6 p-6">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> {g.title}
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Traits</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.traits.map((t) => <li key={t}>• {t}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Diet</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.diet.map((t) => <li key={t}>• {t}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Lifestyle</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {g.lifestyle.map((t) => <li key={t}>• {t}</li>)}
                  </ul>
                </div>
              </div>
            </Card>
          ))}

          <div className="mt-6 rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
            <strong className="text-foreground">Disclaimer:</strong> This self-assessment provides a directional Prakriti analysis. For a clinically confirmed evaluation and personalised treatment plan, consult a qualified Ayurveda Vaidya.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="hero"><Link to="/doctors">Consult an Ayurveda doctor</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Go to my dashboard</Link></Button>
          </div>
          {savedId && <p className="mt-4 text-xs text-muted-foreground">Saved · #{savedId.slice(0, 8)}</p>}
        </main>
        <Footer />
      </div>
    );
  }

  // ---------- DETAILS STEP ----------
  if (step === -1) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1 container py-12 max-w-2xl">
          <Link to="/diagnosis/prakriti" className="text-xs font-semibold uppercase tracking-[0.25em] text-primary hover:underline">
            ← Prakriti Pareeksha
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            {mode === "self" ? "Tell us about yourself" : `Patient details (${mode} mode)`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This information is used to personalise your assessment. {mode === "self" && !user && "Sign in to save the result to your dashboard."}
          </p>

          <Card className="mt-6 p-6 space-y-4">
            <div>
              <Label>Full name</Label>
              <Input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} placeholder="Patient name" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <Input type="number" value={meta.age} onChange={(e) => setMeta({ ...meta, age: e.target.value })} placeholder="Years" className="mt-1" />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={meta.gender}
                  onChange={(e) => setMeta({ ...meta, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={next} disabled={!meta.name || !meta.age}>
              Begin assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentQ) return null;
  const isLast = step === total - 1;
  const allAnswered = Object.keys(responses).length === total;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 container py-8 max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {step + 1} of {total}</span>
          <span className="capitalize">{mode} mode</span>
        </div>
        <Progress value={progress} className="h-1.5" />

        {sectionStart && (
          <div className="mt-6 rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {sectionTitles[currentQ.section]}
            </p>
          </div>
        )}

        <Card className="mt-6 p-6">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{currentQ.trait}</p>
          <h2 className="mt-1 font-display text-xl font-semibold">{currentQ.question}</h2>
          <RadioGroup
            className="mt-5 space-y-2"
            value={responses[currentQ.id] || ""}
            onValueChange={(v) => choose(v as Dosha)}
          >
            {currentQ.options.map((opt, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  responses[currentQ.id] === opt.dosha ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                }`}
              >
                <RadioGroupItem value={opt.dosha} className="mt-0.5" />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </RadioGroup>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {isLast ? (
            <Button variant="hero" disabled={!allAnswered || submitting} onClick={submit}>
              {submitting ? "Saving…" : "View my Prakriti"} <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero" disabled={!responses[currentQ.id]} onClick={next}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrakritiRun;
