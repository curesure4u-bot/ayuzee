import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Search,
  Plus,
  X,
  Brain,
  CircleAlert,
  Info,
  CheckCircle2,
  Pill,
  Activity,
} from "lucide-react";

interface DrugInput {
  id: number;
  value: string;
}

interface Alert {
  id: string;
  medicine: string;
  interactingWith: string;
  severity: "high" | "moderate" | "low";
  recommendation: string;
  mechanism: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    medicine: "Guggulu (Commiphora mukul)",
    interactingWith: "Warfarin",
    severity: "high",
    recommendation: "AVOID combination. Guggulu may enhance anticoagulant effect, increasing bleeding risk. Switch to alternative anti-inflammatory or reduce Warfarin with INR monitoring.",
    mechanism: "Guggulu inhibits platelet aggregation and may potentiate the anticoagulant effect via CYP2C9 interaction.",
  },
  {
    id: "2",
    medicine: "Ashwagandha",
    interactingWith: "Methotrexate",
    severity: "moderate",
    recommendation: "Monitor LFT closely. Both are hepatically metabolized. Consider reducing Ashwagandha dose or monitoring every 2 weeks.",
    mechanism: "Additive hepatotoxicity risk. Both undergo hepatic metabolism via CYP3A4.",
  },
  {
    id: "3",
    medicine: "Triphala Churna",
    interactingWith: "Metformin",
    severity: "low",
    recommendation: "Safe with monitoring. Triphala may enhance hypoglycemic effect. Monitor blood glucose for first 2 weeks.",
    mechanism: "Triphala has mild hypoglycemic properties that may add to Metformin's effect.",
  },
  {
    id: "4",
    medicine: "Shilajatu",
    interactingWith: "Methotrexate",
    severity: "moderate",
    recommendation: "Monitor renal function. Shilajatu contains fulvic acid which may alter renal clearance of Methotrexate. Space doses by 4 hours.",
    mechanism: "Fulvic acid in Shilajatu may chelate with Methotrexate affecting renal tubular secretion.",
  },
];

const severityConfig = {
  high: { color: "bg-red-100 text-red-800 border-red-200", icon: ShieldAlert, label: "HIGH RISK" },
  moderate: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle, label: "MODERATE" },
  low: { color: "bg-green-100 text-green-800 border-green-200", icon: ShieldCheck, label: "LOW RISK" },
};

const DoctorDrugAlert = () => {
  const [drugInputs, setDrugInputs] = useState<DrugInput[]>([
    { id: 1, value: "Guggulu" },
    { id: 2, value: "Warfarin" },
  ]);
  const [showResult, setShowResult] = useState(true);
  const [nextId, setNextId] = useState(3);

  const addDrugInput = () => {
    setDrugInputs([...drugInputs, { id: nextId, value: "" }]);
    setNextId(nextId + 1);
  };

  const removeDrugInput = (id: number) => {
    if (drugInputs.length > 2) {
      setDrugInputs(drugInputs.filter((d) => d.id !== id));
    }
  };

  const updateDrugInput = (id: number, value: string) => {
    setDrugInputs(drugInputs.map((d) => (d.id === id ? { ...d, value } : d)));
  };

  const handleCheck = () => {
    setShowResult(true);
    toast.warning("Interaction detected!", {
      description: "HIGH RISK interaction found between Guggulu and Warfarin.",
    });
  };

  const handleCheckAll = () => {
    toast.info("Checking all current medicines...", {
      description: "Scanning 6 active medications for interactions.",
    });
    setTimeout(() => {
      toast.warning("4 interactions found", {
        description: "1 High, 2 Moderate, 1 Low risk interactions detected.",
      });
    }, 1500);
  };

  const handleDismiss = (alertId: string) => {
    toast.info("Alert dismissed", {
      description: "Please document the reason for dismissal in the notes.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Drug Interaction & Safety Alerts (AI)
          </h1>
          <p className="text-muted-foreground mt-1">
            Cross-system interaction checking — Ayurveda + Allopathy + Homeopathy
          </p>
        </div>
        <Button onClick={handleCheckAll}>
          <Activity className="h-4 w-4 mr-2" />
          Check All Current Medicines
        </Button>
      </div>

      {/* Section 1: Check Interaction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Check Interaction
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Enter 2 or more medicines to check for potential interactions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {drugInputs.map((drug, index) => (
              <div key={drug.id} className="flex items-center gap-2">
                <Label className="text-xs w-20 shrink-0">Medicine {index + 1}</Label>
                <Input
                  placeholder="Enter medicine name..."
                  value={drug.value}
                  onChange={(e) => updateDrugInput(drug.id, e.target.value)}
                />
                {drugInputs.length > 2 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDrugInput(drug.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addDrugInput}>
              <Plus className="h-3 w-3 mr-1" />
              Add Medicine
            </Button>
            <Button size="sm" onClick={handleCheck}>
              <Search className="h-3 w-3 mr-1" />
              Check Interactions
            </Button>
          </div>

          {/* Interaction Result */}
          {showResult && (
            <>
              <Separator />
              <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                  <span className="font-bold text-red-800">HIGH RISK INTERACTION DETECTED</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Drug A</p>
                    <p className="font-medium">Guggulu (Commiphora mukul)</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Drug B</p>
                    <p className="font-medium">Warfarin (Anticoagulant)</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mechanism</p>
                  <p className="text-sm">
                    Guggulu inhibits platelet aggregation and may potentiate anticoagulant effect via CYP2C9 interaction.
                    Risk of increased INR and bleeding.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recommendation</p>
                  <p className="text-sm font-medium text-red-700">
                    AVOID combination. Switch to alternative anti-inflammatory or monitor INR weekly if unavoidable.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Current Patient's Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CircleAlert className="h-4 w-4 text-amber-500" />
            Current Patient's Active Alerts
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Patient on Methotrexate + Ayurvedic medicines — 4 interactions detected
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Medicine</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Interacting With</th>
                  <th className="text-center p-3 text-xs font-medium text-muted-foreground">Severity</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Recommendation</th>
                  <th className="text-right p-3 text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockAlerts.map((alert) => {
                  const config = severityConfig[alert.severity];
                  const Icon = config.icon;
                  return (
                    <tr key={alert.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Pill className="h-3 w-3 text-primary" />
                          <span className="text-sm font-medium">{alert.medicine}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{alert.interactingWith}</td>
                      <td className="p-3 text-center">
                        <Badge className={`${config.color} text-xs`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-xs">
                        {alert.recommendation}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          Dismiss
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Color Code Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6 flex-wrap">
            <p className="text-xs font-medium text-muted-foreground">Severity Legend:</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs">Red — Avoid combination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs">Amber — Monitor closely</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">Green — Safe / Low risk</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Note */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="py-4 flex items-center gap-3">
          <Brain className="h-5 w-5 text-purple-600" />
          <div className="text-sm text-purple-800">
            <strong>AI Auto-Check:</strong> Interactions are automatically checked when a new medicine is
            added to any prescription. Cross-system checking covers Ayurveda, Allopathy, and Homeopathy
            simultaneously using integrated pharmacology databases.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDrugAlert;
