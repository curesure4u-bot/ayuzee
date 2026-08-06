import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertTriangle, Info, Shield, Pill, Heart, Brain, CheckCircle, XCircle,
} from "lucide-react";

type AlertCategory = "Drug-Drug" | "Herb-Drug" | "Allergy" | "Dose" | "Prakriti-based";
type Severity = "high" | "medium" | "info";

type CdssAlert = {
  id: string;
  category: AlertCategory;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  acknowledged: boolean;
};

const initialAlerts: CdssAlert[] = [
  {
    id: "1", category: "Herb-Drug", severity: "high",
    title: "Guggulu + Warfarin = Bleeding Risk",
    description: "Guggulu has antiplatelet properties that potentiate Warfarin's anticoagulant effect. Concurrent use increases bleeding risk significantly.",
    recommendation: "Consider dose reduction of Warfarin or substitute Guggulu with Triphala Guggulu (lower potency).",
    acknowledged: false,
  },
  {
    id: "2", category: "Allergy", severity: "high",
    title: "Patient Allergic to Shellfish — Avoid Shankha Bhasma",
    description: "Patient has documented shellfish allergy. Shankha Bhasma (conch shell calcium) may trigger anaphylactic reaction.",
    recommendation: "Use Praval Pishti (coral calcium) or Godanti Bhasma as calcium alternatives.",
    acknowledged: false,
  },
  {
    id: "3", category: "Prakriti-based", severity: "info",
    title: "Pitta Prakriti — Reduce Ushna Virya Herbs",
    description: "Patient's Prakriti assessment indicates Pitta dominance. Excess Ushna (hot potency) herbs may aggravate Pitta leading to hyperacidity, skin rashes.",
    recommendation: "Prefer Sheeta Virya alternatives: Shatavari over Ashwagandha, Guduchi over Pippali. Add cooling adjuvants.",
    acknowledged: false,
  },
  {
    id: "4", category: "Drug-Drug", severity: "medium",
    title: "Chandraprabha Vati + Metformin — Monitor Glucose",
    description: "Both agents have hypoglycemic action. Combined use may cause excessive blood sugar lowering.",
    recommendation: "Monitor fasting glucose weekly. Consider reducing Metformin by 250mg during Ayurvedic course.",
    acknowledged: false,
  },
  {
    id: "5", category: "Dose", severity: "medium",
    title: "Rasasindura Dose Exceeds Standard",
    description: "Prescribed 250mg BD exceeds standard therapeutic dose of 125mg BD for this formulation. Rasasindura contains processed mercury.",
    recommendation: "Reduce to 125mg BD or provide clinical justification for higher dose. Monitor renal function.",
    acknowledged: false,
  },
];

const severityConfig: Record<Severity, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  high: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900" },
  medium: { icon: Shield, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900" },
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900" },
};

const categoryIcons: Record<AlertCategory, typeof Pill> = {
  "Drug-Drug": Pill,
  "Herb-Drug": Brain,
  "Allergy": XCircle,
  "Dose": Shield,
  "Prakriti-based": Heart,
};

const CDSSAlerts = () => {
  const [alerts, setAlerts] = useState<CdssAlert[]>(initialAlerts);
  const [filterCategory, setFilterCategory] = useState<AlertCategory | "All">("All");

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success("Alert acknowledged");
  };

  const handleOverride = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.info("Alert overridden — documented in audit trail");
  };

  const filtered = filterCategory === "All" ? alerts : alerts.filter((a) => a.category === filterCategory);
  const categories: (AlertCategory | "All")[] = ["All", "Drug-Drug", "Herb-Drug", "Allergy", "Dose", "Prakriti-based"];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> CDSS Alerts</h1>
        <Badge variant="destructive">{alerts.filter((a) => !a.acknowledged).length} active alerts</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button key={cat} variant={filterCategory === cat ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          const CatIcon = categoryIcons[alert.category];
          return (
            <Card key={alert.id} className={`border ${config.bg}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className={`text-base flex items-center gap-2 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                    {alert.title}
                  </CardTitle>
                  <Badge variant="outline" className="gap-1"><CatIcon className="h-3 w-3" />{alert.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <div className="rounded bg-background/50 p-2 text-sm border">
                  <strong>Recommendation:</strong> {alert.recommendation}
                </div>
                <div className="flex gap-2">
                  {!alert.acknowledged ? (
                    <>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => handleAcknowledge(alert.id)}>
                        <CheckCircle className="h-4 w-4" /> Acknowledge
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground" onClick={() => handleOverride(alert.id)}>
                        <XCircle className="h-4 w-4" /> Override
                      </Button>
                    </>
                  ) : (
                    <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Acknowledged</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CDSSAlerts;
