import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, ExternalLink, MapPin } from "lucide-react";
import { setSEO } from "@/lib/seo";

const PDF_URL = "/acupoints-and-uses.pdf";

const AcupointsAndUses = () => {
  useEffect(() => {
    setSEO(
      "Acupoints & Their Uses — Clinical Reference | Ayuzee",
      "Point-by-point clinical reference: location, indications and uses of key acupuncture points, integrated into the Ayuzee AYUSH platform."
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/treatments/acupuncture"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Acupuncture Hub
        </Link>

        <div className="mb-6 rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/15 p-3 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Acupoints &amp; Their Uses
              </h1>
              <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
                A point-by-point clinical reference — location, channel, key
                indications and clinical uses — built for instant applicability
                during consultation.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a href={PDF_URL} download>
                    <Download className="mr-2 h-4 w-4" /> Download reference
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={PDF_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open in new tab
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="aspect-[4/5] w-full bg-muted md:aspect-[16/10]">
            <object
              data={PDF_URL}
              type="application/pdf"
              className="h-full w-full"
              aria-label="Acupoints and Their Uses clinical reference PDF"
            >
              <iframe
                src={PDF_URL}
                title="Acupoints & Their Uses"
                className="h-full w-full border-0"
              />
            </object>
          </div>
        </Card>

        <p className="mt-6 text-xs text-muted-foreground">
          Curated educational reference integrated into Ayuzee. For clinical
          application please consult a qualified practitioner.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default AcupointsAndUses;
