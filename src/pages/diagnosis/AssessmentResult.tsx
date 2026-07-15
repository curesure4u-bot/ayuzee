import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, RotateCcw, Sparkles, Stethoscope } from "lucide-react";
import { ASSESSMENT_MODULES, type ResultBlock } from "@/data/assessmentModules";

interface ComputedResult {
  totalScore: number;
  perCategory: Record<string, number>;
  dominant: string; // category key OR bucket label
  bucketLabel?: string;
  result: ResultBlock;
  redFlag?: string;
  scoreCategoryLabel?: string; // e.g. "Strong imbalance"
}

const VIKRITI_BUCKETS = [
  { max: 8, label: "Mild imbalance" },
  { max: 16, label: "Moderate imbalance" },
  { max: 999, label: "Strong imbalance" },
];

const compute = (slug: string, answers: Record<number, number>): ComputedResult | null => {
  const mod = ASSESSMENT_MODULES[slug];
  if (!mod) return null;
  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0);

  if (mod.scoring === "categorized") {
    const perCategory: Record<string, number> = {};
    for (const q of mod.questions) {
      const cat = q.category!;
      perCategory[cat] = (perCategory[cat] || 0) + (answers[q.id] ?? 0);
    }
    // dominant: highest score (positiveCategory does not change dominance — just interpretation)
    const dominant = Object.entries(perCategory).sort((a, b) => b[1] - a[1])[0][0];
    const result = mod.results[dominant];

    // Vikriti gets a severity label from highest score
    let scoreCategoryLabel: string | undefined;
    if (slug === "vikriti") {
      const top = perCategory[dominant];
      scoreCategoryLabel = VIKRITI_BUCKETS.find((b) => top <= b.max)!.label;
    }

    return { totalScore, perCategory, dominant, result, scoreCategoryLabel };
  }

  // total scoring
  const bucket = mod.totalBuckets!.find((b) => totalScore <= b.max) ?? mod.totalBuckets![mod.totalBuckets!.length - 1];
  const result = mod.results[bucket.label];

  let redFlag: string | undefined;
  if (mod.redFlag) {
    const triggered = mod.redFlag.questionIds.some((id) => (answers[id] ?? 0) >= mod.redFlag!.threshold);
    if (triggered) redFlag = mod.redFlag.message;
  }

  return { totalScore, perCategory: {}, dominant: bucket.label, bucketLabel: bucket.label, result, redFlag };
};

const AssessmentResult = () => {
  const { slug = "" } = useParams();
  const mod = ASSESSMENT_MODULES[slug];
  const [computed, setComputed] = useState<ComputedResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`assessment:${slug}`);
    if (!raw) return;
    try {
      const answers = JSON.parse(raw);
      setComputed(compute(slug, answers));
    } catch { /* ignore */ }
  }, [slug]);

  const maxPossible = useMemo(() => (mod ? mod.questions.length * 4 : 0), [mod]);

  if (!mod) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="container py-20 flex-1">
          <h1 className="font-display text-3xl">Assessment not found</h1>
        </main>
        <Footer />
      </div>
    );
  }

  if (!computed) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <main className="container py-20 flex-1 max-w-2xl">
          <h1 className="font-display text-3xl">No result available</h1>
          <p className="mt-2 text-muted-foreground">Please complete the assessment first.</p>
          <Button asChild className="mt-6" variant="hero">
            <Link to={`/diagnosis/${slug}`}>Take {mod.title}</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const { result, dominant, perCategory, totalScore, scoreCategoryLabel, redFlag } = computed;
  const dominantLabel = mod.categoryLabels?.[dominant] ?? dominant;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{mod.title}</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Your Assessment Result
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm py-1 px-3">
                Score: <span className="ml-1 font-semibold text-foreground">{totalScore}</span>
                <span className="mx-1 text-muted-foreground">/ {maxPossible}</span>
              </Badge>
              {scoreCategoryLabel && (
                <Badge variant="outline" className="text-sm py-1 px-3">Category: {scoreCategoryLabel}</Badge>
              )}
              <Badge className="text-sm py-1 px-3 bg-primary text-primary-foreground">
                Dominant: {dominantLabel}
              </Badge>
            </div>
          </div>
        </section>

        <section className="container py-10 max-w-4xl space-y-6">
          {redFlag && (
            <Card className="p-5 border-destructive/40 bg-destructive/5">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-destructive">Clinical attention recommended</p>
                  <p className="mt-1 text-sm">{redFlag}</p>
                </div>
              </div>
            </Card>
          )}

          {Object.keys(perCategory).length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold">Score breakdown</h3>
              <div className="mt-4 space-y-4">
                {Object.entries(perCategory).map(([k, v]) => {
                  const label = mod.categoryLabels?.[k] ?? k;
                  const max = mod.questions.filter((q) => q.category === k).length * 4;
                  const pct = Math.round((v / max) * 100);
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">{v} / {max}</span>
                      </div>
                      <Progress value={pct} className="mt-1" />
                    </div>
                  );
                })}
              </div>
              {mod.positiveCategory && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Note: a higher <span className="font-medium">{mod.categoryLabels?.[mod.positiveCategory]}</span> score indicates better balance.
                </p>
              )}
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Ayurvedic Insight</h3>
                <p className="mt-1 text-sm text-muted-foreground">{result.insight}</p>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <ResultRow title="Main Cause" body={result.cause} />
            <ResultRow title="Lifestyle Correction" body={result.lifestyle} />
            <ResultRow title="Food Advice" body={result.food} />
            <ResultRow title="Yoga / Breathing" body={result.yoga} />
            <ResultRow title="When to Consult a Doctor" body={result.consult} />
            <ResultRow title="Next Recommended Assessment" body={result.next} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="hero">
              <Link to="/doctors"><Stethoscope className="mr-2 h-4 w-4" /> Consult an Ayurveda Doctor</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/diagnosis/${slug}/run`}><RotateCcw className="mr-2 h-4 w-4" /> Retake</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/diagnosis">All Assessments</Link>
            </Button>
          </div>

          <Card className="p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Disclaimer:</span> This assessment is for wellness education only. It does not replace medical diagnosis, emergency care, or personal consultation with a qualified doctor.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const ResultRow = ({ title, body }: { title: string; body: string }) => (
  <Card className="p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</p>
    <p className="mt-2 text-sm text-foreground">{body}</p>
  </Card>
);

export default AssessmentResult;
