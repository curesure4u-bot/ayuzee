import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Sparkles, Stethoscope, ArrowRight } from "lucide-react";

const tools = [
  {
    slug: "prakriti",
    title: "Prakriti Pareeksha",
    subtitle: "Ayurveda Constitution Assessment",
    desc: "Discover your unique mind-body constitution (Vata-Pitta-Kapha) using the validated CCRAS / Ministry of AYUSH protocol. Take it yourself, with a doctor, or with a certified therapist.",
    icon: Sparkles,
    available: true,
  },
  {
    slug: "vikriti",
    title: "Vikriti Assessment",
    subtitle: "Current Imbalance Check",
    desc: "Identify the present dosha imbalance — coming soon.",
    icon: Activity,
    available: false,
  },
  {
    slug: "nadi",
    title: "Nadi Pareeksha",
    subtitle: "Pulse Diagnosis",
    desc: "Doctor-led traditional pulse examination — coming soon.",
    icon: Stethoscope,
    available: false,
  },
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
              Validated assessments based on classical Ayurveda texts and the
              Ministry of AYUSH (CCRAS) standard operating procedures —
              guided by qualified Vaidyas and therapists, or self-administered.
            </p>
          </div>
        </section>

        <section className="container py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {tools.map((t) => (
              <Card key={t.slug} className="flex flex-col p-6">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <t.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{t.title}</h3>
                <p className="text-sm text-primary/80">{t.subtitle}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.desc}</p>
                {t.available ? (
                  <Button asChild className="mt-5 w-fit" variant="hero">
                    <Link to={`/diagnosis/${t.slug}`}>
                      Begin <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="mt-5 w-fit" variant="outline">Coming soon</Button>
                )}
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Diagnosis;
