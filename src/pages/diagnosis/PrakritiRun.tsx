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
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import {
  PRAKRITI_QUESTIONS,
  SECTION_INTROS,
  scorePrakriti,
  type Dosha,
} from "@/data/prakritiQuestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PrakritiResultView } from "@/components/diagnosis/PrakritiResultView";

type Mode = "self" | "doctor" | "therapist";

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
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1 container py-12 max-w-4xl">
          <PrakritiResultView
            result={{
              id: savedId || undefined,
              dominant: done.dominant,
              vata: done.vata,
              pitta: done.pitta,
              kapha: done.kapha,
              vataPct: done.vataPct,
              pittaPct: done.pittaPct,
              kaphaPct: done.kaphaPct,
              total: done.total,
            }}
          />
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
  const allAnswered = Object.keys(responses).length >= total - 1; // menstrual is optional
  const sectionMeta = currentQ.section ? SECTION_INTROS[currentQ.section] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 container py-8 max-w-3xl">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {step + 1} of {total}</span>
          <span className="capitalize">{mode} mode</span>
        </div>
        <Progress value={progress} className="h-1.5" />

        {sectionStart && sectionMeta && (
          <div className="mt-6 rounded-xl border-l-4 border-primary bg-gradient-to-r from-primary/10 to-transparent p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              {sectionMeta.sanskrit}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">{sectionMeta.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{sectionMeta.intro}</p>
          </div>
        )}

        <Card className="mt-6 overflow-hidden">
          {currentQ.image && (
            <div className="relative aspect-square sm:aspect-[16/10] w-full bg-muted">
              <img
                src={currentQ.image}
                alt={`Reference: ${currentQ.trait}`}
                className="h-full w-full object-contain"
                loading="lazy"
                onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
              />
              <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
                <span className="bg-blue-600/80 py-1">Vata</span>
                <span className="bg-red-600/80 py-1">Pitta</span>
                <span className="bg-emerald-600/80 py-1">Kapha</span>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{currentQ.trait}</p>
              {currentQ.sanskritTrait && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {currentQ.sanskritTrait}
                </span>
              )}
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold">{currentQ.question}</h2>
            {currentQ.reference && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <BookOpen className="h-3 w-3" /> Ref: {currentQ.reference}
              </p>
            )}

            {(mode === "doctor" || mode === "therapist") && currentQ.examinerNote && (
              <div className="mt-3 rounded-lg border-l-2 border-primary bg-primary/5 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Examiner instruction</p>
                <p className="mt-1 text-xs text-foreground">{currentQ.examinerNote}</p>
              </div>
            )}

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
                  <div className="flex-1">
                    <p className="text-sm">{opt.label}</p>
                    {opt.sanskrit && (
                      <p className="mt-0.5 text-[11px] italic text-muted-foreground">{opt.sanskrit}</p>
                    )}
                  </div>
                  <span className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    opt.dosha === "vata" ? "bg-blue-100 text-blue-700" :
                    opt.dosha === "pitta" ? "bg-red-100 text-red-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>{opt.dosha}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
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
            <Button variant="hero" onClick={next}>
              {responses[currentQ.id] ? "Next" : "Skip"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrakritiRun;
