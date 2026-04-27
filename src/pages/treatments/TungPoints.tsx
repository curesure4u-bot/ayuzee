import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, ExternalLink, Sparkles } from "lucide-react";
import { setSEO } from "@/lib/seo";

const PDF_URL = "/tung-acupuncture-points.pdf";

const TungPoints = () => {
  useEffect(() => {
    setSEO(
      "Tung's Acupuncture Points — Integrated Reference | Ayuzee",
      "Master Tung Ching-Chang's classical extraordinary acupuncture points. Curated reference integrated into Ayuzee for practitioners and students."
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          to="/treatments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to treatments
        </Link>

        <div className="mb-6 rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/15 p-3 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Tung's Acupuncture Points
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-3xl">
                A curated, integrated reference of Master Tung Ching-Chang's classical
                extraordinary points — location, indications and clinical pearls — for
                AYUSH practitioners, integrative pain specialists and students.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a href={PDF_URL} download>
                    <Download className="h-4 w-4 mr-2" /> Download reference
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={PDF_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Open in new tab
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="aspect-[4/5] md:aspect-[16/10] w-full bg-muted">
            <object
              data={PDF_URL}
              type="application/pdf"
              className="h-full w-full"
              aria-label="Tung's Acupuncture Points reference PDF"
            >
              <iframe
                src={PDF_URL}
                title="Tung's Acupuncture Points"
                className="h-full w-full border-0"
              />
            </object>
          </div>
        </Card>

        <p className="mt-6 text-xs text-muted-foreground">
          Curated reference integrated into the Ayuzee AYUSH platform for educational
          use. For clinical application please consult a qualified practitioner.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default TungPoints;
