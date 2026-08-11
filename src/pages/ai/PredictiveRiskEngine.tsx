import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const risks = [
  {
    disease: "Acid Reflux (Amlapitta)",
    percentage: 72,
    severity: "high",
    rationale: "Pitta aggravation from irregular meals and spicy food habits",
    tips: ["Avoid fermented foods", "Take Yashtimadhu before meals", "Eat cooling foods like cucumber"],
  },
  {
    disease: "Hypertension (Raktagata Vata)",
    percentage: 45,
    severity: "medium",
    rationale: "Vata pushing Pitta into blood vessels, stress-related",
    tips: ["Daily Arjuna bark tea", "Reduce salt intake", "Practice Sheetali pranayama"],
  },
  {
    disease: "Skin Disorders (Kushtha)",
    percentage: 58,
    severity: "medium",
    rationale: "Pitta-Kapha imbalance affecting Rasa and Rakta dhatu",
    tips: ["Neem and Turmeric paste topically", "Blood-purifying herbs", "Avoid dairy excess"],
  },
  {
    disease: "Joint Issues (Sandhivata)",
    percentage: 35,
    severity: "low",
    rationale: "Vata accumulation in joints, mild dryness observed",
    tips: ["Warm sesame oil massage", "Guggulu supplements", "Gentle yoga for joints"],
  },
  {
    disease: "Diabetes (Prameha)",
    percentage: 22,
    severity: "low",
    rationale: "Kapha-mediated but currently low due to active lifestyle",
    tips: ["Maintain exercise routine", "Fenugreek water morning", "Monitor with seasonal checks"],
  },
];

const severityColor = (s: string) => {
  if (s === "high") return "bg-red-500";
  if (s === "medium") return "bg-yellow-500";
  return "bg-green-500";
};

const severityBadge = (s: string) => {
  if (s === "high") return "destructive" as const;
  if (s === "medium") return "secondary" as const;
  return "outline" as const;
};

export default function PredictiveRiskEngine() {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Predictive Risk Engine</h1>
      <p className="text-muted-foreground">AI-powered disease risk analysis based on your Prakriti and lifestyle.</p>

      <div className="space-y-4">
        {risks.map((risk) => (
          <Card key={risk.disease}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{risk.disease}</CardTitle>
                <Badge variant={severityBadge(risk.severity)}>
                  {risk.severity.toUpperCase()} — {risk.percentage}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${severityColor(risk.severity)}`} style={{ width: `${risk.percentage}%` }} />
              </div>
              <p className="text-sm text-muted-foreground"><strong>Rationale:</strong> {risk.rationale}</p>
              <div>
                <p className="text-sm font-medium mb-1">Prevention Tips:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {risk.tips.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
