import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles, Stethoscope, ListChecks } from "lucide-react";
import { setSEO } from "@/lib/seo";

const AcupunctureHub = () => {
  useEffect(() => {
    setSEO(
      "Integrated Acupuncture Hub | Ayuzee",
      "One-tap access to Tung's Extraordinary Points and a 300-disease acupuncture point reference, integrated into the Ayuzee AYUSH platform."
    );
  }, []);

  const tiles = [
    {
      to: "/treatments/tung-points",
      title: "Tung's Acupuncture Points",
      desc: "Master Tung Ching-Chang's classical extraordinary points — locations, indications and clinical pearls.",
      icon: Sparkles,
      tag: "Classical reference",
    },
    {
      to: "/treatments/acupuncture-50-diseases",
      title: "50 Diseases — Quick Protocols",
      desc: "Clinic-ready protocols for 50 common conditions — fast, applicable, point-by-point.",
      icon: Stethoscope,
      tag: "Quick protocols",
    },
    {
      to: "/treatments/acupuncture-300-diseases",
      title: "300 Diseases with Points",
      desc: "Comprehensive lookup: 300 conditions mapped to acupuncture point prescriptions.",
      icon: ListChecks,
      tag: "Clinical lookup",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-10">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/15 p-3 text-primary">
              <Stethoscope className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Ayuzee · Integrated Acupuncture
              </p>
              <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold">
                Acupuncture, made instantly applicable.
              </h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-muted-foreground">
                A unified workspace for AYUSH practitioners and students — Tung's
                extraordinary points and a 300-disease point prescription guide,
                always one tap away inside Ayuzee.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <Card
                key={t.to}
                className="group relative overflow-hidden p-6 transition-smooth hover:shadow-elegant"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {t.tag}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold">{t.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                <div className="mt-5 flex gap-2">
                  <Button asChild size="sm">
                    <Link to={t.to}>
                      Open <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={t.to}>
                      <BookOpen className="mr-1 h-4 w-4" /> Browse
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Curated educational reference integrated into Ayuzee. For clinical
          application please consult a qualified practitioner.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default AcupunctureHub;
