import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, Pill, FlaskConical, Leaf, Activity, RefreshCw, Printer } from "lucide-react";
import { toast } from "sonner";

const patientBrief = {
  patient: "Mr. Rajesh Kumar",
  uhid: "AYZ-2024-001285",
  age: 42,
  gender: "Male",
  generatedAt: "2024-12-28 10:15 AM",
  nextVisitDoctor: "Dr. Anand Sharma",

  keyDiagnoses: [
    { diagnosis: "Kati Shoola (Chronic Low Back Pain)", icd: "M54.5", system: "Ayurveda", since: "2024-06" },
    { diagnosis: "Vata Vyadhi (Degenerative Spinal)", icd: "M47.8", system: "Ayurveda", since: "2024-06" },
    { diagnosis: "Vishama Agni (Irregular Digestion)", icd: "K30", system: "Ayurveda", since: "2024-09" },
  ],

  currentMedications: [
    { name: "Yogaraja Guggulu", dose: "2 tabs BD after food", since: "2024-12-15" },
    { name: "Maharasnadi Kashayam", dose: "15ml BD before food with warm water", since: "2024-12-15" },
    { name: "Dhanwantharam Tailam", dose: "External application to lumbar region", since: "2024-12-15" },
    { name: "Ashwagandha Churna", dose: "3g HS with milk", since: "2024-09-15" },
  ],

  allergies: ["Sulfa drugs", "Shellfish", "Dust mites"],

  recentLabs: [
    { test: "ESR", value: "28 mm/hr", status: "high", date: "2024-12-17" },
    { test: "CRP", value: "12 mg/L", status: "high", date: "2024-12-17" },
    { test: "RA Factor", value: "Negative", status: "normal", date: "2024-12-17" },
    { test: "Vitamin D", value: "18 ng/mL", status: "low", date: "2024-12-17" },
  ],

  ayushFindings: {
    prakriti: "Vata-Pitta (V:45, P:30, K:25)",
    vikruti: "Vata aggravated (V:65, P:25, K:10)",
    lastNadi: "Vata-predominant Nadi, Kapha kshaya noted",
    agni: "Vishama Agni",
  },

  treatmentResponse: "60% improvement in back pain after 7 days of Kati Basti. Morning stiffness reduced from 45 min to 15 min.",

  suggestedFocusAreas: [
    "Review Vitamin D supplementation (currently deficient)",
    "Assess response to Kati Basti – consider extending",
    "Monitor ESR/CRP trend for inflammation",
    "Evaluate Agni correction – patient reports irregular appetite",
    "Discuss lifestyle modifications and Yoga protocol",
  ],
};

export default function AIPatientBrief() {
  const handleRegenerate = () => toast.info("Regenerating AI brief with latest data...");
  const handlePrint = () => toast.success("Printing patient brief");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-600" /> AI Patient Brief</h1>
          <p className="text-muted-foreground">{patientBrief.patient} • Before consultation with {patientBrief.nextVisitDoctor}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRegenerate}><RefreshCw className="h-4 w-4 mr-1" /> Regenerate</Button>
          <Button size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Generated: {patientBrief.generatedAt} • AI-synthesized from all records</p>

      {patientBrief.allergies.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-sm text-red-800">Allergies</p>
              <div className="flex gap-1 mt-1">{patientBrief.allergies.map((a, i) => <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Key Diagnoses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patientBrief.keyDiagnoses.map((d, i) => (
                <div key={i} className="text-sm border-b last:border-0 pb-2">
                  <p className="font-medium">{d.diagnosis}</p>
                  <p className="text-xs text-muted-foreground">ICD: {d.icd} • Since: {d.since}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Pill className="h-4 w-4" /> Current Medications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patientBrief.currentMedications.map((m, i) => (
                <div key={i} className="text-sm border-b last:border-0 pb-2">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.dose}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Recent Labs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patientBrief.recentLabs.map((l, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                  <span>{l.test}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{l.value}</span>
                    <Badge variant={l.status === "normal" ? "secondary" : "destructive"} className="text-xs">{l.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Leaf className="h-4 w-4" /> AYUSH Findings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Prakriti:</span><span>{patientBrief.ayushFindings.prakriti}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vikruti:</span><span>{patientBrief.ayushFindings.vikruti}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Nadi:</span><span>{patientBrief.ayushFindings.lastNadi}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Agni:</span><span>{patientBrief.ayushFindings.agni}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Treatment Response</CardTitle></CardHeader>
        <CardContent><p className="text-sm">{patientBrief.treatmentResponse}</p></CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> Suggested Focus Areas for Today</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {patientBrief.suggestedFocusAreas.map((area, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-purple-600 font-bold">{i + 1}.</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
