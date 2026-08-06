import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Pill, Apple, Leaf, Shield, Plus, Bell } from "lucide-react";
import { toast } from "sonner";

const drugAllergies = [
  { drug: "Sulfonamides (Sulfa drugs)", reaction: "Skin rash, urticaria", severity: "moderate", reportedDate: "2020-03-15" },
  { drug: "Ibuprofen (NSAIDs)", reaction: "Gastric bleeding", severity: "severe", reportedDate: "2022-01-10" },
  { drug: "Penicillin", reaction: "Anaphylaxis (reported by patient)", severity: "severe", reportedDate: "2018-06-20" },
];

const foodAllergies = [
  { food: "Shellfish (Prawns, Crab)", reaction: "Angioedema, breathing difficulty", severity: "severe" },
  { food: "Peanuts", reaction: "Oral itching, mild swelling", severity: "mild" },
  { food: "Dairy (Lactose)", reaction: "Bloating, diarrhea", severity: "mild" },
];

const viruddhaAhara = [
  { combination: "Milk + Fish (Matsya-Kshira)", effect: "Skin disorders (Kushtha), blocks Srotas" },
  { combination: "Honey + Ghee (equal quantity)", effect: "Produces Ama, toxic combination per Charaka Samhita" },
  { combination: "Milk + Sour fruits (Amla Rasa)", effect: "Curdling in stomach, Kapha vitiation" },
  { combination: "Cold water after oily food", effect: "Impairs Agni, produces Ama" },
];

const drugInteractions = [
  { drug1: "Ashwagandha", drug2: "Thyroid medication (Levothyroxine)", risk: "moderate", note: "May potentiate thyroid-stimulating effect" },
  { drug1: "Guggulu", drug2: "Blood thinners (Warfarin)", risk: "high", note: "May increase bleeding risk" },
  { drug1: "Triphala", drug2: "Diabetes medication (Metformin)", risk: "low", note: "May slightly enhance hypoglycemic effect" },
];

const criticalConditions = [
  { condition: "Previous Appendectomy (2024-01)", note: "Uneventful recovery, no complications" },
  { condition: "Vitamin D Deficiency (Severe)", note: "18 ng/mL – Active supplementation needed" },
  { condition: "Active Inflammation (ESR/CRP elevated)", note: "Monitor – possible autoimmune involvement" },
];

export default function AllergiesAlerts() {
  const handleAddAllergy = () => toast.info("Add allergy dialog opened");
  const handleDismissAlert = () => toast.success("Alert acknowledged");

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Critical Banner */}
      <Card className="border-red-300 bg-red-50 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
            <div className="flex-1">
              <p className="font-bold text-red-800 text-lg">Critical Patient Alerts</p>
              <p className="text-sm text-red-700">Mr. Rajesh Kumar (AYZ-2024-001285) – 3 drug allergies, 1 severe food allergy</p>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-700" onClick={handleDismissAlert}>
              <Bell className="h-4 w-4 mr-1" /> Acknowledged
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Allergies & Alerts</h1>
        <Button size="sm" onClick={handleAddAllergy}><Plus className="h-4 w-4 mr-1" /> Add Allergy</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4 text-red-600" /> Drug Allergies</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drugAllergies.map((a, i) => (
                <div key={i} className="p-2 border border-red-100 rounded-lg bg-red-50/50">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{a.drug}</p>
                    <Badge variant={a.severity === "severe" ? "destructive" : "secondary"} className="text-xs">{a.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Reaction: {a.reaction}</p>
                  <p className="text-xs text-muted-foreground">Reported: {a.reportedDate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Apple className="h-4 w-4 text-orange-600" /> Food Allergies</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {foodAllergies.map((a, i) => (
                <div key={i} className="p-2 border border-orange-100 rounded-lg bg-orange-50/50">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{a.food}</p>
                    <Badge variant={a.severity === "severe" ? "destructive" : "secondary"} className="text-xs">{a.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Reaction: {a.reaction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" /> Viruddha Ahara (Incompatible Foods)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {viruddhaAhara.map((v, i) => (
                <div key={i} className="p-2 border rounded-lg">
                  <p className="font-medium text-sm">{v.combination}</p>
                  <p className="text-xs text-muted-foreground mt-1">{v.effect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-purple-600" /> Drug Interactions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drugInteractions.map((d, i) => (
                <div key={i} className="p-2 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{d.drug1} + {d.drug2}</p>
                    <Badge variant={d.risk === "high" ? "destructive" : d.risk === "moderate" ? "default" : "secondary"} className="text-xs">{d.risk}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{d.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Critical Conditions / History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {criticalConditions.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-2 border-b last:border-0">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">{c.condition}</p>
                  <p className="text-xs text-muted-foreground">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
