import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, XCircle, Info, Send } from "lucide-react";

type MedCheck = {
  name: string; status: "compatible" | "caution" | "contraindicated";
  reasoning: string; suggestion?: string;
};

const patientPrakriti = "Pitta-Vata";

const prescriptionChecks: MedCheck[] = [
  {
    name: "Shatavari (Asparagus racemosus)",
    status: "compatible",
    reasoning: "Shatavari has Sheeta Virya and Madhura Rasa. It pacifies Pitta effectively. Snigdha Guna also balances Vata. Excellent choice for Pitta-Vata Prakriti.",
  },
  {
    name: "Guduchi (Tinospora cordifolia)",
    status: "compatible",
    reasoning: "Guduchi is Tridosha Shamaka but especially Pitta Shamaka due to its Tikta Rasa. Ushna Virya is mild and balanced by Madhura Vipaka. Safe for long-term Rasayana use in Pitta-Vata.",
  },
  {
    name: "Guggulu (Commiphora mukul)",
    status: "caution",
    reasoning: "Guggulu has Ushna Virya and Tikshna Guna. Patient has Pitta dominance. Risk of Pitta aggravation (Amlapitta, skin eruptions). Use with caution.",
    suggestion: "Add Guduchi as co-prescription to buffer Pitta aggravation. Use Sheeta Anupana (milk) when administering. Limit duration to 4 weeks, then reassess.",
  },
  {
    name: "Ashwagandha (Withania somnifera)",
    status: "compatible",
    reasoning: "Despite Ushna Virya, Ashwagandha has Madhura Rasa and Vipaka which balance its heat. Excellent Vata Shamaka for the Vata component. Snigdha Guna nourishes Dhatus. Administer with milk (Sheeta Anupana) for Pitta safety.",
  },
  {
    name: "Pippali (Piper longum) — long-term",
    status: "contraindicated",
    reasoning: "Pippali has Katu Rasa and Tikshna Guna. Long-term use (>2 weeks) will significantly aggravate Pitta Dosha in this patient. Risk of hyperacidity, bleeding disorders, and inflammatory conditions.",
    suggestion: "Alternative: Replace with Ela (Cardamom) for Deepana action — it has Sheeta Virya and is Pitta-safe. If Pippali is essential, use Vardhamana protocol (ascending-descending dose) for max 10 days only.",
  },
];

const statusIcon = (s: MedCheck["status"]) => {
  if (s === "compatible") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  if (s === "caution") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-600" />;
};

const statusBadge = (s: MedCheck["status"]) => {
  if (s === "compatible") return <Badge className="bg-green-100 text-green-700">Compatible</Badge>;
  if (s === "caution") return <Badge className="bg-amber-100 text-amber-700">Caution</Badge>;
  return <Badge className="bg-red-100 text-red-700">Contraindicated</Badge>;
};

const PrakritiAwarePrescription = () => {
  const handleFinalize = () => toast.success("Prakriti-checked prescription finalized and saved");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" /> Prakriti-Aware Prescription
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Compatibility checker for current prescription</p>
        </div>
        <Button onClick={handleFinalize}><Send className="h-4 w-4 mr-1" /> Finalize Rx</Button>
      </div>

      {/* Patient Prakriti Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
        <CardContent className="pt-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-blue-400 grid place-items-center text-white font-bold text-sm">PV</div>
          <div>
            <p className="font-semibold text-lg">Patient Prakriti: {patientPrakriti}</p>
            <p className="text-sm text-muted-foreground">Pitta dominant (60%) + Vata secondary (30%) + Kapha minor (10%)</p>
            <p className="text-xs text-muted-foreground mt-0.5">Key sensitivities: Ushna Virya, Tikshna Guna, Katu/Amla Rasa excess</p>
          </div>
        </CardContent>
      </Card>

      {/* Medicine Checks */}
      <div className="space-y-4">
        {prescriptionChecks.map((med, i) => (
          <Card key={i} className={med.status === "contraindicated" ? "border-red-200 bg-red-50/30" : med.status === "caution" ? "border-amber-200 bg-amber-50/30" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {statusIcon(med.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{med.name}</h3>
                    {statusBadge(med.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{med.reasoning}</p>
                  {med.suggestion && (
                    <div className="mt-2 flex items-start gap-2 bg-white/80 border rounded p-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-blue-800">{med.suggestion}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader><CardTitle className="text-base">Prescription Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> 3 Compatible</span>
            <span className="flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-amber-500" /> 1 Caution</span>
            <span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-red-600" /> 1 Contraindicated</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Review contraindicated items and consider alternatives before finalizing.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrakritiAwarePrescription;
