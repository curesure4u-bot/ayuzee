import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Brain, AlertTriangle, CheckCircle, Info, Pill, Activity,
  Sparkles, Shield, Zap, BookOpen, TrendingUp, XCircle,
  Lightbulb, Heart,
} from "lucide-react";

type CdssAlert = {
  id: string;
  type: "interaction" | "contraindication" | "suggestion" | "investigation" | "allergy" | "dosage";
  severity: "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  source: string;
  action?: string;
};

type EvidenceEntry = {
  id: string;
  condition: string;
  treatment: string;
  evidence: string;
  reference: string;
  gradeOfEvidence: "A" | "B" | "C" | "D";
};

const mockAlerts: CdssAlert[] = [
  { id: "1", type: "interaction", severity: "high", title: "Drug Interaction: Guggulu + Anticoagulants", description: "Yogaraja Guggulu may enhance anticoagulant effect. Patient is on Warfarin (from ABDM records). Monitor INR closely or consider alternative.", source: "AFI Drug Interaction Database", action: "Consider Simhanada Guggulu instead or adjust Warfarin dose" },
  { id: "2", type: "contraindication", severity: "medium", title: "Virechana contraindicated in current state", description: "Patient's Agni is Manda (weak). Virechana (purgation) should not be performed until Agni is corrected with Deepana-Pachana.", source: "Charaka Samhita, Siddhisthana Ch.6", action: "Start Chitrakadi Vati for 5-7 days before Virechana" },
  { id: "3", type: "suggestion", severity: "info", title: "Consider Janu Basti for bilateral knee OA", description: "Based on diagnosis of Sandhivata (Grade 2 OA), Janu Basti with Kottamchukkadi Tailam has shown 78% improvement rate in your hospital's outcomes data.", source: "Ayuzee Clinical Analytics", action: "Add Janu Basti 7-day course to treatment plan" },
  { id: "4", type: "investigation", severity: "low", title: "Suggest: Vitamin D3 levels", description: "Patient has joint pain with no recent Vitamin D assessment. Low Vit D common in OA patients. Last lab: 6 months ago.", source: "Clinical Guidelines - AYUSH Research Council", action: "Order 25-OH Vitamin D3 test" },
  { id: "5", type: "allergy", severity: "high", title: "Sesame allergy documented", description: "Patient has documented sesame (Tila) allergy in ABDM records. Sesame oil-based Tailams are contraindicated for Abhyanga.", source: "Patient ABDM Record (Apollo, 2025)", action: "Use Coconut oil or Castor oil based alternatives" },
  { id: "6", type: "dosage", severity: "medium", title: "Dosage alert: Kashayam in elderly", description: "Patient is 68 years old. Standard Kashayam dose of 15ml BD may be too strong. Consider starting with 10ml BD.", source: "Geriatric Ayurveda Guidelines", action: "Reduce to 10ml BD for first week, then reassess" },
];

const mockEvidence: EvidenceEntry[] = [
  { id: "1", condition: "Sandhivata (Osteoarthritis)", treatment: "Janu Basti + Podikizhi (14 days)", evidence: "72% pain reduction (VAS), 65% ROM improvement in RCT (n=60)", reference: "J Ayurveda Integr Med, 2025", gradeOfEvidence: "B" },
  { id: "2", condition: "Sandhivata (Osteoarthritis)", treatment: "Yogaraja Guggulu + Rasnasaptakam", evidence: "Significant ESR reduction (p<0.01) in 30-day trial vs placebo", reference: "Ayu Journal, 2024", gradeOfEvidence: "B" },
  { id: "3", condition: "Gridhrasi (Sciatica)", treatment: "Kati Basti + Agnikarma", evidence: "85% improvement in SLR test, 70% pain relief in case series (n=25)", reference: "Anc Sci Life, 2025", gradeOfEvidence: "C" },
  { id: "4", condition: "Amavata (Rheumatoid Arthritis)", treatment: "Simhanada Guggulu + Eranda Tailam", evidence: "Reduction in joint swelling and morning stiffness in 45-day trial", reference: "Int J Ayurveda Res, 2024", gradeOfEvidence: "B" },
  { id: "5", condition: "Kushtha (Psoriasis)", treatment: "Panchatikta Ghrita + Virechana", evidence: "PASI score reduction by 62% in 21-day Panchakarma regimen", reference: "Indian J Dermatol, 2025", gradeOfEvidence: "C" },
];

const HmsCdss = () => {
  const [alerts] = useState<CdssAlert[]>(mockAlerts);
  const [evidence] = useState<EvidenceEntry[]>(mockEvidence);
  const [patientContext, setPatientContext] = useState("");

  const getSeverityIcon = (severity: CdssAlert["severity"]) => {
    switch (severity) {
      case "high": return <XCircle className="h-4 w-4 text-red-600" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "low": return <Info className="h-4 w-4 text-blue-600" />;
      case "info": return <Lightbulb className="h-4 w-4 text-green-600" />;
    }
  };

  const getSeverityBorder = (severity: CdssAlert["severity"]) => {
    switch (severity) {
      case "high": return "border-red-300 bg-red-50/50";
      case "medium": return "border-amber-300 bg-amber-50/50";
      case "low": return "border-blue-200 bg-blue-50/30";
      case "info": return "border-green-200 bg-green-50/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-emerald-600" /> Clinical Decision Support
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time AI guidance · Drug interactions · Evidence-based AYUSH protocols · Contraindication alerts
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
          <Zap className="h-3 w-3 mr-1" /> Active during consultation
        </Badge>
      </div>

      {/* Active Patient Context */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="sm:col-span-2">
              <Label>Patient Context (auto-populated from EMR)</Label>
              <Input placeholder="Ramesh Kumar · UHID: AYZ-2026-001 · Sandhivata · Vata-Kapha Prakruti" disabled value="Ramesh Kumar · Sandhivata (OA Knee) · Vata-Kapha · Manda Agni" />
            </div>
            <div>
              <Label>Current Medications</Label>
              <Input disabled value="Yogaraja Guggulu, Rasnasaptakam, Warfarin (ext)" />
            </div>
            <div>
              <Label>Allergies</Label>
              <Input disabled value="Sesame oil" className="border-red-200 text-red-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alerts">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="alerts">Live Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Base</TabsTrigger>
          <TabsTrigger value="interactions">Drug Checker</TabsTrigger>
          <TabsTrigger value="protocols">AYUSH Protocols</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Alert Summary */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="border-red-200"><CardContent className="p-2 text-center"><p className="text-lg font-bold text-red-600">{alerts.filter(a => a.severity === "high").length}</p><p className="text-[10px] text-muted-foreground">Critical</p></CardContent></Card>
            <Card className="border-amber-200"><CardContent className="p-2 text-center"><p className="text-lg font-bold text-amber-600">{alerts.filter(a => a.severity === "medium").length}</p><p className="text-[10px] text-muted-foreground">Warning</p></CardContent></Card>
            <Card className="border-blue-200"><CardContent className="p-2 text-center"><p className="text-lg font-bold text-blue-600">{alerts.filter(a => a.severity === "low").length}</p><p className="text-[10px] text-muted-foreground">Info</p></CardContent></Card>
            <Card className="border-green-200"><CardContent className="p-2 text-center"><p className="text-lg font-bold text-green-600">{alerts.filter(a => a.severity === "info").length}</p><p className="text-[10px] text-muted-foreground">Suggestions</p></CardContent></Card>
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={getSeverityBorder(alert.severity)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{alert.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">Source: {alert.source}</p>
                      {alert.action && (
                        <div className="mt-2 flex items-center gap-2">
                          <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success("Action applied")}>
                            <CheckCircle className="mr-1 h-3 w-3" /> {alert.action}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs">Dismiss</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Evidence-Based Treatment Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {evidence.map((e) => (
                  <div key={e.id} className="rounded-lg border p-3 hover:bg-muted/30 transition">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{e.condition}</p>
                      <Badge variant={e.gradeOfEvidence === "A" || e.gradeOfEvidence === "B" ? "default" : "secondary"} className="text-xs">
                        Grade {e.gradeOfEvidence}
                      </Badge>
                    </div>
                    <p className="text-sm text-primary font-medium">{e.treatment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{e.evidence}</p>
                    <p className="text-xs text-muted-foreground italic mt-1">Ref: {e.reference}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">AYUSH Drug Interaction Checker</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Check interactions between AYUSH medicines, and between AYUSH + allopathic medications.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Medicine 1</Label>
                  <Input placeholder="e.g., Yogaraja Guggulu" />
                </div>
                <div>
                  <Label>Medicine 2</Label>
                  <Input placeholder="e.g., Warfarin / Metformin" />
                </div>
              </div>
              <Button onClick={() => toast.info("Checking interactions...")}>
                <Shield className="mr-1 h-4 w-4" /> Check Interaction
              </Button>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium mb-2">Common AYUSH-Allopathy Interactions:</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2"><XCircle className="h-3 w-3 text-red-500" /><span>Guggulu preparations + Anticoagulants → Enhanced bleeding risk</span></div>
                  <div className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-amber-500" /><span>Ashwagandha + Thyroid medications → May alter thyroid levels</span></div>
                  <div className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-amber-500" /><span>Triphala + Antihypertensives → May enhance hypotensive effect</span></div>
                  <div className="flex items-center gap-2"><Info className="h-3 w-3 text-blue-500" /><span>Guduchi + Immunosuppressants → May reduce drug efficacy</span></div>
                  <div className="flex items-center gap-2"><Info className="h-3 w-3 text-blue-500" /><span>Haridra (Turmeric) + Antidiabetics → May enhance hypoglycemia</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Standard AYUSH Treatment Protocols</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { condition: "Sandhivata (OA)", protocol: "CCRAS Standard Protocol", phases: 3, duration: "60 days" },
                  { condition: "Amavata (RA)", protocol: "CCRAS + AIIA Protocol", phases: 4, duration: "90 days" },
                  { condition: "Gridhrasi (Sciatica)", protocol: "Panchakarma Protocol", phases: 2, duration: "21 days" },
                  { condition: "Madhumeha (DM-2)", protocol: "CCRAS Diabetes Protocol", phases: 3, duration: "90 days" },
                  { condition: "Kushtha (Psoriasis)", protocol: "Shodhana + Shamana", phases: 3, duration: "45 days" },
                  { condition: "Tamaka Shwasa (Asthma)", protocol: "CCRAS Respiratory Protocol", phases: 2, duration: "30 days" },
                  { condition: "Unmada (Anxiety/Depression)", protocol: "Yoga + Shamana Protocol", phases: 3, duration: "60 days" },
                  { condition: "Sthoulya (Obesity)", protocol: "Lekhana + Panchakarma", phases: 3, duration: "45 days" },
                ].map((p) => (
                  <Card key={p.condition} className="hover:border-primary/30 transition cursor-pointer">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{p.condition}</p>
                      <p className="text-xs text-muted-foreground">{p.protocol}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{p.phases} phases</span>
                        <span>{p.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CDSS Info */}
      <Card className="border-emerald-200 bg-emerald-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-xs text-emerald-700">
            <p className="font-medium">Ambient Intelligence</p>
            <p className="text-emerald-600 mt-0.5">CDSS runs silently during every consultation, analyzing patient context, medication history (including ABDM records), and provides real-time alerts without disrupting clinical workflow.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsCdss;
