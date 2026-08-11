import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const snpCorrelations = [
  { snp: "COMT (Val158Met)", dosha: "Pitta", explanation: "Fast COMT → excess dopamine metabolism → Pitta-type intensity and inflammation" },
  { snp: "MTHFR (C677T)", dosha: "Vata", explanation: "Reduced methylation → nervous system vulnerability → Vata aggravation patterns" },
  { snp: "CYP1A2 (Slow)", dosha: "Kapha", explanation: "Slow caffeine metabolism → Kapha-type sluggishness and accumulation" },
  { snp: "FTO (rs9939609)", dosha: "Kapha", explanation: "Fat mass gene variant → tendency for Kapha-mediated weight gain" },
  { snp: "APOE4", dosha: "Pitta-Vata", explanation: "Neuroinflammation risk → combined Pitta heat + Vata degeneration pattern" },
];

const rasayanaSuggestion = {
  primary: "Brahmi + Shankhpushpi complex",
  rationale: "Based on COMT/APOE4 variants — neuroprotective, Pitta-cooling, Vata-stabilizing",
  dosage: "500mg standardized extract, twice daily with ghee",
};

export default function GenomeDoshaAnalysis() {
  const [showDemo, setShowDemo] = useState(false);

  const handleUpload = () => {
    toast.info("Genome upload coming soon! View the demo to explore SNP-Dosha correlations.");
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Genome–Dosha Analysis</h1>
          <p className="text-muted-foreground">Connecting genetic variants (SNPs) with Ayurvedic constitution.</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">🧬 Coming Soon</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Upload Genetic Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-2">Drag & drop your 23andMe / AncestryDNA raw data file</p>
            <p className="text-xs text-muted-foreground">Supported: .txt, .csv (raw genotype data)</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleUpload} variant="outline">Upload File</Button>
            <Button onClick={() => setShowDemo(true)}>View Demo</Button>
          </div>
        </CardContent>
      </Card>

      {showDemo && (
        <>
          <Card>
            <CardHeader><CardTitle>SNP → Dosha Correlations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {snpCorrelations.map((item) => (
                <div key={item.snp} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm font-mono">{item.snp}</span>
                    <Badge>{item.dosha}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.explanation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Personalized Rasayana Suggestion</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold">{rasayanaSuggestion.primary}</p>
              <p className="text-sm text-muted-foreground">{rasayanaSuggestion.rationale}</p>
              <Badge variant="outline">{rasayanaSuggestion.dosage}</Badge>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
