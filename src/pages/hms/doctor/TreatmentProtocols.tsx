import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Clock, Pill, Salad, Target, Search, UserPlus } from "lucide-react";

type Protocol = {
  id: string;
  name: string;
  condition: string;
  duration: string;
  therapies: string[];
  medicines: string[];
  diet: string;
  expectedOutcome: string;
};

const protocols: Protocol[] = [
  {
    id: "1", name: "Gridhrasi 14-Day Protocol", condition: "Gridhrasi (Sciatica)",
    duration: "14 days", therapies: ["Kati Basti x 7 days", "Niruha Basti x 8", "Anuvasana Basti x 6", "Nadi Sweda daily"],
    medicines: ["Yogaraja Guggulu 2 BD", "Rasna Saptak Kwath 20ml BD", "Maharasnadi Kwath 15ml BD"],
    diet: "Warm, unctuous foods. Avoid Vata-aggravating: cold, dry, raw items. Include sesame oil, ghee.",
    expectedOutcome: "70-80% pain reduction. Improved SLR by 20-30°. Resume daily activities.",
  },
  {
    id: "2", name: "Prameha Management", condition: "Prameha (Diabetes)",
    duration: "90 days", therapies: ["Udwarthana x 14 days", "Vamana (if Kapha dominant)", "Virechana day 21"],
    medicines: ["Chandraprabha Vati 2 BD", "Nishamalaki Churna 3g BD", "Shilajatu 250mg BD"],
    diet: "Yava (barley), Mudga (green gram), bitter vegetables. Avoid sweets, dairy, heavy meals.",
    expectedOutcome: "HbA1c reduction 0.5-1.5%. Fasting glucose <130 mg/dL. Reduced polyuria.",
  },
  {
    id: "3", name: "Amavata Protocol", condition: "Amavata (Rheumatoid Arthritis)",
    duration: "30 days", therapies: ["Ruksha Sweda x 7", "Valuka Sweda x 7", "Virechana day 14", "Kshara Basti x 8"],
    medicines: ["Simhanada Guggulu 2 TDS", "Amavatari Rasa 1 BD", "Rasnadi Kwath 20ml BD"],
    diet: "Langhana first 3 days. Then light, warm food. No curd, fish, incompatible combinations.",
    expectedOutcome: "Reduced joint swelling 50%. ESR/CRP normalization. Improved grip strength.",
  },
  {
    id: "4", name: "Cervical Spondylosis", condition: "Greeva Stambha (Cervical Spondylosis)",
    duration: "21 days", therapies: ["Greeva Basti x 7", "Nasya (Anu Taila) x 7", "Pinda Sweda x 7"],
    medicines: ["Trayodashanga Guggulu 2 BD", "Ashwagandha Churna 3g BD", "Sahacharadi Taila external"],
    diet: "Warm soups, milk with turmeric. Avoid excessive screen time, cold exposure.",
    expectedOutcome: "Pain relief 60-70%. Improved neck ROM. Reduced tingling in upper limbs.",
  },
  {
    id: "5", name: "Kushtha (Skin) Protocol", condition: "Kushtha (Chronic Skin Diseases)",
    duration: "45 days", therapies: ["Vamana day 1", "Virechana day 15", "Takra Dhara x 7", "Lepam daily"],
    medicines: ["Khadirarishta 20ml BD", "Gandhaka Rasayana 2 BD", "Mahamanjisthadi Kwath 20ml BD"],
    diet: "Bitter, astringent foods. No fermented, sour, seafood. Avoid Viruddha Ahara.",
    expectedOutcome: "Lesion area reduction 40-60%. Reduced itching. Improved skin texture.",
  },
];

const TreatmentProtocols = () => {
  const [filter, setFilter] = useState("");

  const filtered = protocols.filter(
    (p) => p.name.toLowerCase().includes(filter.toLowerCase()) || p.condition.toLowerCase().includes(filter.toLowerCase())
  );

  const handleApply = (name: string) => toast.success(`"${name}" applied to current patient`);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6" /> Treatment Protocols</h1>
        <Badge variant="outline">{filtered.length} protocols</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter by condition..." className="pl-9" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((protocol) => (
          <Card key={protocol.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{protocol.name}</CardTitle>
              <Badge variant="secondary" className="w-fit">{protocol.condition}</Badge>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" />{protocol.duration}</div>
              <div><span className="font-medium flex items-center gap-1"><Target className="h-3 w-3" /> Therapies:</span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">{protocol.therapies.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
              <div><span className="font-medium flex items-center gap-1"><Pill className="h-3 w-3" /> Medicines:</span>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">{protocol.medicines.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
              <div><span className="font-medium flex items-center gap-1"><Salad className="h-3 w-3" /> Diet:</span>
                <p className="text-muted-foreground mt-1">{protocol.diet}</p>
              </div>
              <div className="rounded bg-green-50 dark:bg-green-950/30 p-2 text-xs text-green-700 dark:text-green-400">
                <strong>Expected:</strong> {protocol.expectedOutcome}
              </div>
              <Button className="w-full gap-2 mt-2" onClick={() => handleApply(protocol.name)}><UserPlus className="h-4 w-4" /> Apply to Patient</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TreatmentProtocols;
