import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink, ListChecks } from "lucide-react";
import { setSEO } from "@/lib/seo";
import { PdfViewer } from "@/components/library/PdfViewer";

const PDF_URL = "/acupuncture-300-diseases.pdf";

const Acupuncture300Diseases = () => {
  useEffect(() => {
    setSEO(
      "300 Diseases with Acupuncture Points — Clinical Reference | Ayuzee",
      "Quick clinical lookup of 300 common diseases mapped to acupuncture point prescriptions, integrated into the Ayuzee AYUSH platform."
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
              <ListChecks className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                300 Diseases with Acupuncture Points
              </h1>
              <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
                A practical, integrated lookup of 300 common conditions mapped to
                acupuncture point prescriptions — for fast, applicable use in clinic.
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

        <PdfViewer src={PDF_URL} title="300 Diseases with Acupuncture Points" />

        <p className="mt-6 text-xs text-muted-foreground">
          Curated educational reference integrated into Ayuzee. For clinical
          application please consult a qualified practitioner.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Acupuncture300Diseases;
