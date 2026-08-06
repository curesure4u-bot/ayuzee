import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Brain, AlertTriangle, CheckCircle, Shield, Pill, ScanLine } from "lucide-react";

const recentScans = [
  {
    time: "10:42 AM", patient: "Rajesh Kumar", scanned: "Rasnasaptakam Kashayam 450ml",
    currentMeds: ["Simhanada Guggulu", "Kottamchukkadi Taila (ext)", "Amlodipine 5mg (allopathy)"],
    interactions: [{ pair: "Rasnasaptakam + Amlodipine", severity: "moderate", description: "Kashayam may enhance hypotensive effect. Monitor BP.", action: "Dispense with caution label" }],
    result: "warning", dispensed: true,
  },
  {
    time: "10:15 AM", patient: "Meera Nair", scanned: "Chandraprabha Vati 60t",
    currentMeds: ["Simhanada Guggulu", "Rasnasaptakam Kashayam", "Methotrexate 15mg (allopathy)"],
    interactions: [{ pair: "Chandraprabha Vati (contains Shilajit/metals) + Methotrexate", severity: "high", description: "Hepatotoxicity risk — both are liver-metabolized. Shilajit mineral load + MTX toxicity.", action: "BLOCK — consult doctor before dispensing" }],
    result: "blocked", dispensed: false,
  },
  {
    time: "09:55 AM", patient: "Suresh Menon", scanned: "Ashwagandha Churna 100g",
    currentMeds: ["Mahanarayan Taila (ext)", "Dashamoolarishtam"],
    interactions: [],
    result: "safe", dispensed: true,
  },
  {
    time: "09:30 AM", patient: "Priya Sharma", scanned: "Dashamoolarishtam 450ml",
    currentMeds: ["Chandraprabha Vati", "Ashwagandha Churna", "Thyronorm 50mcg (allopathy)"],
    interactions: [{ pair: "Ashwagandha + Thyronorm", severity: "moderate", description: "Ashwagandha may increase thyroid hormones, altering Thyronorm efficacy. Already on both — monitor TSH.", action: "Existing combo — flag for next review" }],
    result: "info", dispensed: true,
  },
  {
    time: "09:10 AM", patient: "Anand Patel", scanned: "Simhanada Guggulu 60t",
    currentMeds: ["Rasnasaptakam Kashayam", "Kottamchukkadi Taila (ext)"],
    interactions: [],
    result: "safe", dispensed: true,
  },
];

const resultConfig: Record<string, { color: string; icon: typeof CheckCircle; label: string }> = {
  safe: { color: "text-green-600", icon: CheckCircle, label: "Safe" },
  warning: { color: "text-amber-600", icon: AlertTriangle, label: "Warning" },
  blocked: { color: "text-red-600", icon: Shield, label: "Blocked" },
  info: { color: "text-blue-600", icon: Pill, label: "Info" },
};

export default function DrugInteractionDispensing() {
  const blocked = recentScans.filter(s => s.result === "blocked").length;
  const warnings = recentScans.filter(s => s.result === "warning").length;
  const safe = recentScans.filter(s => s.result === "safe").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-red-600" /> Drug Interaction Check (at Dispensing)</h1>
          <p className="text-muted-foreground mt-1">Barcode scan triggers interaction check against patient's current medications — auto-block dangerous combos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{safe}</p><p className="text-xs text-muted-foreground">Safe</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{warnings}</p><p className="text-xs text-muted-foreground">Warnings</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><Shield className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{blocked}</p><p className="text-xs text-muted-foreground">Blocked</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ScanLine className="h-4 w-4 mx-auto text-indigo-600" /><p className="text-xl font-bold">{recentScans.length}</p><p className="text-xs text-muted-foreground">Scans Today</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {recentScans.map((scan, i) => {
          const config = resultConfig[scan.result];
          const Icon = config.icon;
          return (
            <Card key={i} className={scan.result === "blocked" ? "border-red-300" : scan.result === "warning" ? "border-amber-200" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{scan.patient}</p>
                        <Badge variant={scan.result === "blocked" ? "destructive" : scan.result === "warning" ? "default" : "outline"} className={`text-[10px] ${scan.result === "safe" ? "text-green-600" : ""}`}>{config.label}</Badge>
                        <span className="text-[10px] text-muted-foreground">{scan.time}</span>
                      </div>
                      <p className="text-xs mt-0.5">Scanned: <strong>{scan.scanned}</strong></p>
                      <p className="text-[10px] text-muted-foreground">Current meds: {scan.currentMeds.join(" • ")}</p>
                      {scan.interactions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {scan.interactions.map((int, j) => (
                            <div key={j} className={`p-2 rounded text-[10px] ${int.severity === "high" ? "bg-red-50 border border-red-200" : int.severity === "moderate" ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"}`}>
                              <p className="font-bold">{int.pair} — <span className={int.severity === "high" ? "text-red-600" : "text-amber-600"}>{int.severity} severity</span></p>
                              <p className="text-muted-foreground">{int.description}</p>
                              <p className="font-medium mt-0.5">{int.action}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={scan.dispensed ? "outline" : "destructive"} className={`text-[10px] ${scan.dispensed ? "text-green-600" : ""}`}>{scan.dispensed ? "Dispensed" : "Not Dispensed"}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Interaction Database</p><p className="text-sm text-purple-700">Checks: AYUSH-AYUSH interactions (rare but exist — e.g., Guggulu + blood thinners), AYUSH-Allopathy (common — Ashwagandha + thyroid meds), and contraindications (pregnancy + Virechana drugs). Database: 2,400+ AYUSH interaction pairs + 8,000+ cross-system pairs. Today's block (Chandraprabha + Methotrexate) prevented potential hepatotoxicity — doctor notified, alternative suggested (Gokshuradi Guggulu instead).</p></div></CardContent></Card>
    </div>
  );
}
