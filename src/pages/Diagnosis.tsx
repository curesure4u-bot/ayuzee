import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Stethoscope, ArrowRight } from "lucide-react";
import { ASSESSMENT_LIST } from "@/data/assessmentModules";
import { ClinicalDisclaimer } from "@/components/legal/ClinicalDisclaimer";

const featured = {
  slug: "prakriti",
  title: "Prakriti Pareeksha",
  subtitle: "Ayurveda Constitution Assessment",
  desc: "Discover your unique mind-body constitution (Vata-Pitta-Kapha) using the validated CCRAS / Ministry of AYUSH protocol. Take it yourself, with a doctor, or with a certified therapist.",
  emoji: "✨",
};

const upcoming = [
  { slug: "nadi", title: "Nadi Pareeksha", subtitle: "Pulse Diagnosis", desc: "Doctor-led traditional pulse examination — coming soon.", emoji: "🩺" },
];

const Diagnosis = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container py-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ayush Diagnosis</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Know your body. The Ayurveda way.
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Validated assessments based on classical Ayurveda texts and the Ministry of AYUSH (CCRAS) standard
              operating procedures — guided by qualified Vaidyas and therapists, or self-administered.
            </p>
          </div>
        </section>

        <section className="container max-w-3xl pt-8">
          <ClinicalDisclaimer variant="wellness" />
        </section>

        {/* Featured: Prakriti */}
        <section className="container pt-12">
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr,auto] md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Featured</p>
                </div>
                <h2 className="mt-3 font-display text-2xl md:text-3xl font-semibold">{featured.title}</h2>
                <p className="text-sm text-primary/80">{featured.subtitle}</p>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground">{featured.desc}</p>
              </div>
              <Button asChild size="lg" variant="hero">
                <Link to="/diagnosis/prakriti">Begin <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </Card>
        </section>

        {/* 6 new modules */}
        <section className="container py-12 md:py-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">Wellness self-assessments</h2>
              <p className="mt-1 text-sm text-muted-foreground">Quick, structured checks across body, digestion and mind.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ASSESSMENT_LIST.map((m) => (
              <Card key={m.slug} className="flex flex-col p-6 transition-shadow hover:shadow-md">
                <div className="text-3xl" aria-hidden>{m.emoji}</div>
                <h3 className="mt-3 font-display text-xl font-semibold">{m.title}</h3>
                <p className="text-sm text-primary/80">{m.subtitle}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{m.purpose}</p>
                <p className="mt-3 text-xs text-muted-foreground">{m.questions.length} questions · ~5 min</p>
                <Button asChild className="mt-4 w-fit" variant="hero">
                  <Link to={`/diagnosis/${m.slug}`}>Begin <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </Card>
            ))}

            {upcoming.map((t) => (
              <Card key={t.slug} className="flex flex-col p-6 opacity-80">
                <div className="text-3xl" aria-hidden>{t.emoji}</div>
                <h3 className="mt-3 font-display text-xl font-semibold">{t.title}</h3>
                <p className="text-sm text-primary/80">{t.subtitle}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.desc}</p>
                <Button disabled className="mt-4 w-fit" variant="outline">Coming soon</Button>
              </Card>
            ))}
          </div>
        </section>

        <section className="container pb-16">
          <Card className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Stethoscope className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Need expert guidance?</p>
                <p className="text-sm text-muted-foreground">Consult a qualified Ayurveda doctor for a personalised plan.</p>
              </div>
            </div>
            <Button asChild variant="hero"><Link to="/doctors">Find a Doctor</Link></Button>
          </Card>
          <p className="mt-4 text-xs text-muted-foreground">
            Complete assessments at your own pace. Signed-in users may save results to their account.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Diagnosis;
