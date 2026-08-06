import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Brain, Sparkles, AlertTriangle, TrendingUp, TrendingDown,
  CheckCircle2, Lightbulb, Activity, Zap, Search, FlaskConical,
} from "lucide-react";

const AILabIntelligence = () => {
  const [activeTab, setActiveTab] = useState("interpret");
  const [patientSearch, setPatientSearch] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" /> AI Lab Intelligence
          </h2>
          <p className="text-xs text-muted-foreground">AI-powered result interpretation, critical alerts, trends, and smart test suggestions</p>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-300"><Sparkles className="h-3 w-3 mr-1" /> AI-Powered</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="interpret">AI Interpretation</TabsTrigger>
          <TabsTrigger value="critical">Critical Alerts</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="suggest">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="autovalidate">Auto-Validation</TabsTrigger>
        </TabsList>

        {/* AI Result Interpretation */}
        <TabsContent value="interpret" className="space-y-4">
          <Card className="border-purple-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm">AI Result Interpretation Engine</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">AI analyzes lab results in clinical context and provides interpretation, possible conditions, and follow-up suggestions.</p>
              <div className="flex gap-2"><Input placeholder="Search patient or order ID..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} /><Button className="bg-purple-600 hover:bg-purple-700"><Brain className="mr-1 h-4 w-4" /> Interpret</Button></div>

              {/* Sample interpretation */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /><span className="font-medium text-sm">AI Interpretation - Mr. Rajesh (AL-12543)</span><Badge className="bg-amber-500 text-xs">Abnormal</Badge></div>
                <div className="text-xs space-y-1">
                  <p><strong>Results:</strong> Potassium: 7.2 mEq/L (H), Creatinine: 3.8 mg/dL (H), BUN: 45 mg/dL (H)</p>
                  <p><strong>AI Interpretation:</strong> Significantly elevated potassium with impaired renal function markers. Pattern consistent with acute kidney injury or chronic kidney disease progression.</p>
                  <p><strong>Clinical Significance:</strong> <Badge className="bg-red-600 text-white text-xs">Critical</Badge></p>
                  <p><strong>Possible Conditions:</strong></p>
                  <ul className="list-disc ml-4">
                    <li>Hyperkalemia secondary to renal failure (85% confidence)</li>
                    <li>Acute Kidney Injury - AKIN Stage 3 (72% confidence)</li>
                    <li>Metabolic acidosis (likely concurrent)</li>
                  </ul>
                  <p><strong>Suggested Follow-up:</strong></p>
                  <ul className="list-disc ml-4">
                    <li>Urgent ECG to check for cardiac effects of hyperkalemia</li>
                    <li>Repeat K+ stat to confirm (consider hemolysis artifact)</li>
                    <li>Blood gas analysis for acid-base status</li>
                    <li>Renal ultrasound if not done recently</li>
                    <li>Nephrology consultation recommended</li>
                  </ul>
                  <p className="text-purple-600"><strong>AYUSH Correlation:</strong> In Ayurvedic terms, elevated waste products (Mala) indicate impaired Mutra Vaha Srotas. Consider Punarnava-based formulations as adjunct if patient is stable.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Critical Value Alerts */}
        <TabsContent value="critical" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Active Critical Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-red-700">Potassium: 7.2 mEq/L</span><Badge className="bg-red-600 text-white text-xs">Life Threatening</Badge></div>
                <p className="text-xs text-red-600 mt-1">Patient: Mr. Rajesh (AL-12543) | Normal: 3.5-5.5 mEq/L</p>
                <p className="text-xs mt-1">AI Action: Immediate notification sent to Dr. Mohamad Saleem. ECG recommended.</p>
                <div className="flex gap-2 mt-2"><Button size="sm" variant="outline" className="h-6 text-xs border-red-300 text-red-600">Acknowledge</Button><Button size="sm" variant="outline" className="h-6 text-xs">Call Doctor</Button></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-amber-700">Hemoglobin: 5.2 g/dL</span><Badge className="bg-amber-600 text-white text-xs">Critical</Badge></div>
                <p className="text-xs text-amber-600 mt-1">Patient: Mrs. Lakshmi (AL-14201) | Normal: 12-16 g/dL</p>
                <p className="text-xs mt-1">AI Action: Severe anemia. Cross-match and transfusion preparation suggested.</p>
                <div className="flex gap-2 mt-2"><Button size="sm" variant="outline" className="h-6 text-xs border-amber-300 text-amber-600">Acknowledge</Button><Button size="sm" variant="outline" className="h-6 text-xs">View History</Button></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trend Analysis */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-blue-600" /> Patient Result Trends</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2"><Input placeholder="Search patient..." /><Button className="bg-blue-600 hover:bg-blue-700">Analyze Trends</Button></div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm font-medium">HbA1c Trend - Mrs. Lakshmi (AL-14201)</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span>Jan 2026: <strong>9.8%</strong></span>
                  <span>→</span>
                  <span>Apr 2026: <strong>10.5%</strong></span>
                  <span>→</span>
                  <span>Jul 2026: <strong>11.2%</strong> <Badge className="bg-red-600 text-white text-[10px]">Worsening</Badge></span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">AI: Consistent upward trend over 6 months. Current treatment appears inadequate. Suggest medication review, insulin initiation consideration, and intensive diet counseling.</p>
                <p className="text-xs text-purple-600 mt-1">AYUSH: Consider Gudmar (Gymnema sylvestre), Jamun, and Karela-based formulations. Panchakarma Virechana may help as adjunct.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Test Suggestions */}
        <TabsContent value="suggest" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-600" /> AI-Suggested Tests</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">AI suggests additional tests based on patient symptoms, age, gender, medical history, and current results.</p>
              <div className="flex gap-2"><Input placeholder="Enter symptoms or patient ID..." /><Button className="bg-amber-600 hover:bg-amber-700"><Lightbulb className="mr-1 h-4 w-4" /> Get Suggestions</Button></div>
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between border rounded p-2"><div><p className="text-sm font-medium">Vitamin D (25-OH)</p><p className="text-xs text-muted-foreground">Based on: Joint pain + fatigue symptoms</p></div><Badge variant="outline" className="text-amber-600 text-xs">Recommended</Badge></div>
                <div className="flex items-center justify-between border rounded p-2"><div><p className="text-sm font-medium">Iron Studies (Serum Iron, TIBC, Ferritin)</p><p className="text-xs text-muted-foreground">Based on: Low Hb detected in CBC</p></div><Badge variant="outline" className="text-red-600 text-xs">Urgent</Badge></div>
                <div className="flex items-center justify-between border rounded p-2"><div><p className="text-sm font-medium">Peripheral Smear</p><p className="text-xs text-muted-foreground">Based on: Abnormal RBC indices in CBC</p></div><Badge variant="outline" className="text-amber-600 text-xs">Recommended</Badge></div>
                <div className="flex items-center justify-between border rounded p-2"><div><p className="text-sm font-medium">Prakriti Assessment (AYUSH)</p><p className="text-xs text-muted-foreground">Based on: New patient, chronic condition, holistic approach needed</p></div><Badge variant="outline" className="text-purple-600 text-xs">AYUSH</Badge></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auto-Validation */}
        <TabsContent value="autovalidate" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> AI Auto-Validation</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">AI automatically validates results that pass all quality checks: within normal range, delta check OK, QC passed, no interferences.</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-green-600">28</p><p className="text-xs text-muted-foreground">Auto-Validated Today</p></CardContent></Card>
                <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">5</p><p className="text-xs text-muted-foreground">Needs Manual Review</p></CardContent></Card>
                <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">2</p><p className="text-xs text-muted-foreground">Delta Check Failed</p></CardContent></Card>
              </div>
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold">Auto-Validation Criteria:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> All results within normal range</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Delta check passed (vs previous)</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> Daily QC status: Pass</div>
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-600" /> No hemolysis/lipemia/icterus flags</div>
                </div>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Auto-validation rules updated")}><Zap className="mr-1 h-3 w-3" /> Run Auto-Validation Now</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AILabIntelligence;
