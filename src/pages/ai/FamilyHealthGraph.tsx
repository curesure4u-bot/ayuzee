import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const familyTree = {
  grandparents: [
    { name: "Grandfather (Paternal)", dosha: "Vata-Pitta", conditions: ["Arthritis", "Anxiety"] },
    { name: "Grandmother (Paternal)", dosha: "Kapha", conditions: ["Diabetes", "Obesity"] },
    { name: "Grandfather (Maternal)", dosha: "Pitta", conditions: ["Hypertension", "Acid Reflux"] },
    { name: "Grandmother (Maternal)", dosha: "Pitta-Kapha", conditions: ["Thyroid", "Skin Issues"] },
  ],
  parents: [
    { name: "Father", dosha: "Vata-Pitta", conditions: ["Mild Hypertension", "Insomnia"] },
    { name: "Mother", dosha: "Pitta-Kapha", conditions: ["Thyroid (controlled)", "Joint Pain"] },
  ],
  self: { name: "You", dosha: "Pitta-Vata", conditions: ["Acid Reflux (mild)"] },
};

const inheritedRisks = [
  { risk: "Hypertension", source: "Paternal + Maternal grandfather", probability: "Moderate" },
  { risk: "Thyroid Dysfunction", source: "Maternal line (grandmother + mother)", probability: "Moderate-High" },
  { risk: "Diabetes Type 2", source: "Paternal grandmother (Kapha)", probability: "Low-Moderate" },
  { risk: "Joint Degeneration", source: "Both lines — Vata in old age", probability: "Moderate" },
];

const rasayanaRecommendations = [
  { herb: "Ashwagandha", target: "Hypertension + Anxiety (Vata-Pitta)", dosage: "500mg twice daily" },
  { herb: "Kanchanara Guggulu", target: "Thyroid support (maternal risk)", dosage: "2 tablets morning" },
  { herb: "Guduchi (Giloy)", target: "Immune + metabolic balance (Diabetes risk)", dosage: "Juice 20ml daily" },
  { herb: "Yogaraja Guggulu", target: "Joint degeneration prevention", dosage: "2 tablets after food" },
];

export default function FamilyHealthGraph() {
  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Family Health Graph</h1>
      <p className="text-muted-foreground">3-generation Ayurvedic health lineage and inherited risk analysis.</p>

      <Card>
        <CardHeader><CardTitle>Grandparents</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {familyTree.grandparents.map((p) => (
            <div key={p.name} className="border rounded-lg p-3">
              <p className="font-medium text-sm">{p.name}</p>
              <Badge variant="outline" className="my-1">{p.dosha}</Badge>
              <div className="flex flex-wrap gap-1 mt-1">
                {p.conditions.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Parents</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {familyTree.parents.map((p) => (
            <div key={p.name} className="border rounded-lg p-3">
              <p className="font-medium text-sm">{p.name}</p>
              <Badge variant="outline" className="my-1">{p.dosha}</Badge>
              <div className="flex flex-wrap gap-1 mt-1">
                {p.conditions.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="ring-2 ring-primary">
        <CardHeader><CardTitle>You</CardTitle></CardHeader>
        <CardContent>
          <Badge variant="default" className="mb-2">{familyTree.self.dosha}</Badge>
          <div className="flex gap-1">
            {familyTree.self.conditions.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Inherited Risk Patterns</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {inheritedRisks.map((r) => (
            <div key={r.risk} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <p className="font-medium text-sm">{r.risk}</p>
                <p className="text-xs text-muted-foreground">Source: {r.source}</p>
              </div>
              <Badge variant="secondary">{r.probability}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preventive Rasayana Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {rasayanaRecommendations.map((r) => (
            <div key={r.herb} className="border-b pb-2 last:border-0">
              <div className="flex justify-between">
                <span className="font-medium text-sm">{r.herb}</span>
                <Badge variant="outline">{r.dosage}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{r.target}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
