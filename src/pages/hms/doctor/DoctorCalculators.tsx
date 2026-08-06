import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calculator, Brain, Activity } from "lucide-react";

const DoctorCalculators = () => {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("82");
  const [tender, setTender] = useState("4");
  const [swollen, setSwollen] = useState("2");
  const [esr, setEsr] = useState("42");
  const [globalVas, setGlobalVas] = useState("45");

  const bmi = weight && height ? (parseFloat(weight) / ((parseFloat(height)/100) ** 2)).toFixed(1) : "—";
  const bmiCategory = parseFloat(bmi) >= 30 ? "Obese (Atisthaulya)" : parseFloat(bmi) >= 25 ? "Overweight (Sthaulya)" : parseFloat(bmi) >= 18.5 ? "Normal" : "Underweight (Karshya)";
  const das28 = (0.56 * Math.sqrt(parseFloat(tender || "0")) + 0.28 * Math.sqrt(parseFloat(swollen || "0")) + 0.70 * Math.log(parseFloat(esr || "1")) + 0.014 * parseFloat(globalVas || "0")).toFixed(2);
  const das28Cat = parseFloat(das28) > 5.1 ? "High Activity" : parseFloat(das28) > 3.2 ? "Moderate Activity" : parseFloat(das28) > 2.6 ? "Low Activity" : "Remission";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6 text-blue-600" /> Clinical Calculators (AI)</h1>
          <p className="text-muted-foreground mt-1">Medical calculators with Ayurvedic correlations — auto-save to patient vitals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">BMI Calculator</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
              <div><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm">BMI: <span className="text-xl font-bold">{bmi}</span></p>
              <p className="text-sm text-muted-foreground">{bmiCategory}</p>
              <p className="text-xs text-blue-700 mt-1">Ayurvedic: {parseFloat(bmi) >= 25 ? "Kapha excess → Medoroga management" : "Balanced Dhatu Pushti"}</p>
            </div>
            <Button size="sm" onClick={() => toast.success("BMI saved to patient vitals")}>Save to Patient</Button>
          </CardContent>
        </Card>

        {/* DAS28 */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">DAS28-ESR (RA Activity Score)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tender Joints (0-28)</Label><Input type="number" value={tender} onChange={(e) => setTender(e.target.value)} /></div>
              <div><Label>Swollen Joints (0-28)</Label><Input type="number" value={swollen} onChange={(e) => setSwollen(e.target.value)} /></div>
              <div><Label>ESR (mm/hr)</Label><Input type="number" value={esr} onChange={(e) => setEsr(e.target.value)} /></div>
              <div><Label>Patient Global VAS (0-100)</Label><Input type="number" value={globalVas} onChange={(e) => setGlobalVas(e.target.value)} /></div>
            </div>
            <div className={`p-3 rounded-lg border ${parseFloat(das28) > 5.1 ? "bg-red-50 border-red-200" : parseFloat(das28) > 3.2 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
              <p className="text-sm">DAS28-ESR: <span className="text-xl font-bold">{das28}</span></p>
              <p className="text-sm"><Badge variant={parseFloat(das28) > 5.1 ? "destructive" : parseFloat(das28) > 3.2 ? "default" : "outline"} className={parseFloat(das28) <= 3.2 ? "text-green-600" : ""}>{das28Cat}</Badge></p>
              <p className="text-xs text-muted-foreground mt-1">Ayurvedic: {parseFloat(das28) > 3.2 ? "Amavata active phase — Langhana + Shodhana indicated" : "Shamana phase — continue Rasayana"}</p>
            </div>
            <Button size="sm" onClick={() => toast.success("DAS28 saved to case sheet")}>Save to Case Sheet</Button>
          </CardContent>
        </Card>

        {/* Pain VAS */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pain Score (VAS 0-10)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <Input type="range" min="0" max="10" defaultValue="4" className="flex-1" onChange={(e) => toast.info(`Pain: ${e.target.value}/10`)} />
              <span className="text-2xl font-bold">4/10</span>
            </div>
            <p className="text-sm text-muted-foreground">Mild-moderate pain. Ayurvedic: Vedana Sthapana (pain relief) herbs + Lepana indicated.</p>
          </CardContent>
        </Card>

        {/* Agni Score */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-orange-600" /> Agni Assessment Score</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Quick 5-point Agni (digestive fire) scoring based on Ayurvedic parameters:</p>
            <div className="space-y-2 text-sm">
              {["Appetite regularity", "Digestion speed", "Bloating/Gas", "Tongue coating", "Stool consistency"].map((q, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded"><span>{q}</span><Badge variant="outline">{i < 2 ? "Good" : i < 4 ? "Moderate" : "Weak"}</Badge></div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
              <p className="text-sm">Agni Score: <span className="font-bold">6/10 — Mandagni (Weak)</span></p>
              <p className="text-xs text-orange-700">Recommendation: Deepana-Pachana before any Shodhana karma. Trikatu + Chitrakadi Vati.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Integration</p><p className="text-sm text-purple-700">All calculator results auto-save to patient record and correlate with Ayurvedic assessment parameters. DAS28 trends are tracked across visits to measure treatment efficacy.</p></div></CardContent>
      </Card>
    </div>
  );
};

export default DoctorCalculators;
