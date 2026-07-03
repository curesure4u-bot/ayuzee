import { Link, useParams } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, ListChecks, ShieldCheck } from "lucide-react";
import { ASSESSMENT_MODULES } from "@/data/assessmentModules";
import { ClinicalDisclaimer } from "@/components/legal/ClinicalDisclaimer";

const AssessmentIntro = () => {
  const { slug = "" } = useParams();
  const mod = ASSESSMENT_MODULES[slug];
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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container py-14 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ayush Diagnosis</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              {mod.emoji} {mod.title}
            </h1>
            <p className="mt-2 text-lg text-primary/80">{mod.subtitle}</p>
            <p className="mt-4 max-w-2xl text-muted-foreground">{mod.purpose}</p>
          </div>
        </section>

        <section className="container py-12 max-w-3xl">
          <ClinicalDisclaimer variant="wellness" className="mb-6" />
          <Card className="p-6 md:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <ListChecks className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{mod.questions.length} questions</p>
                  <p className="text-xs text-muted-foreground">Quick & guided</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">~5 minutes</p>
                  <p className="text-xs text-muted-foreground">No registration needed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Private</p>
                  <p className="text-xs text-muted-foreground">Stays in your browser</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">How to answer</p>
              <p className="mt-1 text-muted-foreground">
                Use the universal scale: <span className="font-medium">Never (0)</span> · Rarely (1) · Sometimes (2) · Often (3) · <span className="font-medium">Almost always (4)</span>.
                Answer based on the last 2–4 weeks.
              </p>
            </div>

            <Button asChild variant="hero" size="lg" className="mt-8">
              <Link to={`/diagnosis/${mod.slug}/run`}>
                Begin Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground">
            Answers stay in your browser unless you are signed in and choose to save results.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AssessmentIntro;
