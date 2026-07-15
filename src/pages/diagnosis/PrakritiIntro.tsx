import { Link } from "react-router-dom";
import { SiteNav } from "@/components/site/SiteNav";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";

const PrakritiIntro = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container py-12 md:py-16">
            <Link to="/diagnosis" className="text-xs font-semibold uppercase tracking-[0.25em] text-primary hover:underline">
              ← Diagnosis
            </Link>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Prakriti Pareeksha
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Ayurveda Constitution Assessment — based on the CCRAS, Ministry of AYUSH SOP
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Validated multi-centre clinical protocol
            </div>
          </div>
        </section>

        <section className="container py-12">
          <h2 className="font-display text-2xl font-semibold">Choose how you'd like to take the assessment</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All three modes use the same validated questionnaire (35 traits across physical, physiological, and psychological domains).
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col p-6 hover:shadow-lg transition-shadow">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">Self-assessment</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Answer at your own pace. Get an instant Vata–Pitta–Kapha breakdown with diet & lifestyle guidance. Saved to your dashboard.
              </p>
              <Button asChild variant="hero" className="mt-5">
                <Link to="/diagnosis/prakriti/run?mode=self">
                  Start now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="flex flex-col p-6 hover:shadow-lg transition-shadow">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">With a Doctor</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                A qualified Ayurveda Vaidya guides you through each trait observation during consultation. Most accurate.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/doctors">
                  Find a doctor <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="flex flex-col p-6 hover:shadow-lg transition-shadow">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold">With a Therapist</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Trained Panchakarma therapists at partner centres can record your assessment in person.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/partner">
                  Find a centre <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>

          <div className="mt-12 rounded-xl border bg-muted/30 p-6">
            <h3 className="font-display text-lg font-semibold">What is Prakriti?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              In Ayurveda, <em>Prakriti</em> is your unique bio-identity — the natural balance of three doshas
              (<strong>Vata</strong>, <strong>Pitta</strong>, <strong>Kapha</strong>) determined at conception. Knowing your Prakriti helps you choose the right diet, daily routine, exercise and therapies to stay healthy and prevent disease.
              This assessment follows the standard operative procedure published by the Central Council for Research in Ayurvedic Sciences (CCRAS), Ministry of AYUSH, Government of India.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrakritiIntro;
