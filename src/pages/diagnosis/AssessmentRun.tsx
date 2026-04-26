import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ANSWER_SCALE, ASSESSMENT_MODULES } from "@/data/assessmentModules";

const AssessmentRun = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const mod = ASSESSMENT_MODULES[slug];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!mod) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="container py-20 flex-1">
          <h1 className="font-display text-3xl">Assessment not found</h1>
          <Button asChild className="mt-4"><Link to="/diagnosis">Back to Diagnosis</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const total = mod.questions.length;
  const q = mod.questions[step];
  const current = answers[q.id];
  const progress = useMemo(() => Math.round((step / total) * 100), [step, total]);

  const choose = (val: number) => setAnswers((a) => ({ ...a, [q.id]: val }));

  const next = () => {
    if (current === undefined) return;
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      // store answers in sessionStorage and navigate to result
      sessionStorage.setItem(`assessment:${slug}`, JSON.stringify(answers));
      navigate(`/diagnosis/${slug}/result`);
    }
  };

  const prev = () => {
    if (step === 0) navigate(`/diagnosis/${slug}`);
    else setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container py-10">
            <Link to="/diagnosis" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> All assessments
            </Link>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">
              {mod.emoji} {mod.title}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">{mod.purpose}</p>
          </div>
        </section>

        <section className="container py-10 max-w-3xl">
          <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {step + 1} of {total}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="mb-8" />

          <Card className="p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Q{q.id}</p>
            <h2 className="mt-2 font-display text-xl md:text-2xl font-medium">{q.text}</h2>

            <RadioGroup
              key={q.id}
              value={current !== undefined ? String(current) : ""}
              onValueChange={(v) => choose(Number(v))}
              className="mt-6 space-y-3"
            >
              {ANSWER_SCALE.map((label, idx) => (
                <Label
                  key={idx}
                  htmlFor={`opt-${q.id}-${idx}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent ${
                    current === idx ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value={String(idx)} id={`opt-${q.id}-${idx}`} />
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">{idx}</span>
                </Label>
              ))}
            </RadioGroup>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={prev}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button variant="hero" onClick={next} disabled={current === undefined}>
                {step + 1 === total ? "See Result" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground">
            For wellness education only. Not a substitute for medical diagnosis or emergency care.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AssessmentRun;
