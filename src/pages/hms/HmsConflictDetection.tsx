import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertTriangle, Shield, CheckCircle, XCircle, ArrowRight, Pill, Activity } from "lucide-react";

type Conflict = {
  id: string; patient: string; type: "duplicate" | "cross_system" | "interaction" | "contraindication";
  severity: "high" | "medium" | "low";
  system1: string; treatment1: string; provider1: string;
  system2: string; treatment2: string; provider2: string;
  description: string; recommendation: string;
  status: "active" | "acknowledged" | "resolved";
  detectedAt: string;
};

const mockConflicts: Conflict[] = [
  { id: "1", patient: "Ramesh Kumar", type: "cross_system", severity: "high", system1: "Ayurveda", treatment1: "Yogaraja Guggulu (Guggulu preparation)", provider1: "Dr. Arun Sharma (Ayuzee)", system2: "Allopathy", treatment2: "Warfarin 5mg", provider2: "Dr. Ravi (External - from ABDM)", description: "Guggulu preparations may enhance anticoagulant effect of Warfarin, increasing bleeding risk", recommendation: "Consider alternative like Simhanada Guggulu or reduce Warfarin dose. Monitor INR closely.", status: "active", detectedAt: "2026-07-15 09:35" },
  { id: "2", patient: "Lakshmi Devi", type: "duplicate", severity: "medium", system1: "Ayurveda", treatment1: "Abhyanga (Oil massage) - Daily", provider1: "Dr. Meena (Ayuzee Panchakarma)", system2: "Ayurveda", treatment2: "Abhyanga (Oil massage) - Daily", provider2: "External Ayurveda Clinic (from ABDM)", description: "Same therapy (Abhyanga) prescribed by two different providers. Patient may be receiving duplicate sessions.", recommendation: "Verify with patient. Coordinate care — one provider should manage Abhyanga schedule.", status: "acknowledged", detectedAt: "2026-07-14 14:20" },
  { id: "3", patient: "Sunil Menon", type: "interaction", severity: "medium", system1: "Ayurveda", treatment1: "Triphala Churnam (laxative)", provider1: "Dr. Arun Sharma", system2: "Allopathy", treatment2: "Amlodipine 5mg (Antihypertensive)", provider2: "Dr. Mohan (PHC - from ABDM)", description: "Triphala may enhance hypotensive effect of Amlodipine. Patient reported dizziness.", recommendation: "Reduce Triphala dose or take at different time. Monitor BP. Inform allopathy doctor.", status: "resolved", detectedAt: "2026-07-10 11:00" },
  { id: "4", patient: "Meera Nair", type: "contraindication", severity: "high", system1: "Ayurveda", treatment1: "Virechana (Therapeutic purgation)", provider1: "Dr. Meena Patel", system2: "Patient Condition", treatment2: "Pregnancy (First trimester)", provider2: "Self-reported in PROM", description: "Virechana is absolutely contraindicated during pregnancy. Patient reported possible pregnancy in daily PROM log.", recommendation: "STOP Virechana immediately. Confirm pregnancy with test. Switch to safe Shamana therapy only.", status: "active", detectedAt: "2026-07-15 08:00" },
  { id: "5", patient: "Anand Sharma", type: "cross_system", severity: "low", system1: "Homeopathy", treatment1: "Rhus Tox 200C", provider1: "Dr. Priya Das (Homeopathy)", system2: "Ayurveda", treatment2: "Eranda Tailam (Castor oil - purgative)", provider1: "Dr. Arun Sharma", provider2: "Dr. Arun Sharma", description: "Homeopathic remedies may be antidoted by strong-smelling substances. Eranda Tailam has strong odor.", recommendation: "Maintain 30-minute gap between Homeopathy dose and Ayurveda medicine. Inform patient.", status: "acknowledged", detectedAt: "2026-07-13 10:00" },
];

const HmsConflictDetection = () => {
  const [conflicts] = useState<Conflict[]>(mockConflicts);
  const active = conflicts.filter(c => c.status === "active").length;
  const high = conflicts.filter(c => c.severity === "high").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" /> Therapy Conflict Detection
          </h1>
          <p className="text-sm text-muted-foreground">Duplicate therapy alerts, cross-system conflicts (AYUSH↔Allopathy), interaction checks & contraindications</p>
        </div>
        <Badge variant="destructive" className={active > 0 ? "animate-pulse" : ""}>{active} Active Alerts</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><XCircle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{high}</p><p className="text-xs text-muted-foreground">High Severity</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1">{conflicts.filter(c => c.severity === "medium").length}</p><p className="text-xs text-muted-foreground">Medium</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Activity className="h-5 w-5 mx-auto text-blue-600" /><p className="text-xl font-bold mt-1">{conflicts.filter(c => c.type === "cross_system").length}</p><p className="text-xs text-muted-foreground">Cross-System</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1">{conflicts.filter(c => c.status === "resolved").length}</p><p className="text-xs text-muted-foreground">Resolved</p></CardContent></Card>
      </div>

      {/* Conflict List */}
      <div className="space-y-4">
        {conflicts.map((c) => (
          <Card key={c.id} className={c.severity === "high" ? "border-red-300 bg-red-50/30" : c.severity === "medium" ? "border-amber-200 bg-amber-50/20" : "border-border"}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {c.severity === "high" ? <XCircle className="h-5 w-5 text-red-600" /> : c.severity === "medium" ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <Activity className="h-5 w-5 text-blue-600" />}
                  <div>
                    <p className="font-medium">{c.patient}</p>
                    <p className="text-[10px] text-muted-foreground">{c.detectedAt}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={c.type === "duplicate" ? "secondary" : c.type === "cross_system" ? "default" : c.type === "contraindication" ? "destructive" : "outline"} className="text-xs capitalize">{c.type.replace("_", " ")}</Badge>
                  <Badge variant={c.status === "active" ? "destructive" : c.status === "acknowledged" ? "secondary" : "outline"} className={`text-xs capitalize ${c.status === "resolved" ? "text-green-600" : ""}`}>{c.status}</Badge>
                </div>
              </div>

              {/* The conflict visual */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-3">
                <div className="p-2 rounded-lg bg-card border">
                  <Badge variant="outline" className="text-[9px] mb-1">{c.system1}</Badge>
                  <p className="text-xs font-medium">{c.treatment1}</p>
                  <p className="text-[10px] text-muted-foreground">{c.provider1}</p>
                </div>
                <div className="text-center">
                  <AlertTriangle className={`h-5 w-5 mx-auto ${c.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
                  <p className="text-[9px] text-muted-foreground mt-0.5">CONFLICT</p>
                </div>
                <div className="p-2 rounded-lg bg-card border">
                  <Badge variant="outline" className="text-[9px] mb-1">{c.system2}</Badge>
                  <p className="text-xs font-medium">{c.treatment2}</p>
                  <p className="text-[10px] text-muted-foreground">{c.provider2}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-2 p-2 rounded bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700"><strong>Recommendation:</strong> {c.recommendation}</p>
              </div>

              {c.status === "active" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Alert acknowledged")}>Acknowledge</Button>
                  <Button size="sm" onClick={() => toast.success("Alert resolved")}>Resolve</Button>
                  <Button size="sm" variant="ghost" className="text-xs">Override (with reason)</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium">How Conflict Detection Works</p>
            <p className="text-blue-600 mt-0.5">Ayuzee continuously monitors prescriptions, ABDM records from other providers, patient-reported data (PROMs), and known AYUSH-Allopathy interactions. Alerts are generated automatically when conflicts are detected between treatments across any system.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsConflictDetection;
