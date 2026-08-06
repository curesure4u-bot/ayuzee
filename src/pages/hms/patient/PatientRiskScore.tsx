import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, Brain, Activity, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

const riskCategories = [
  { name: "Kidney Disease Progression", score: 78, trend: "worsening", factors: ["Creatinine 3.8", "Potassium 7.2 (Critical)", "Pitta Vikruti"] },
  { name: "Cardiovascular Risk", score: 52, trend: "stable", factors: ["Dyslipidemia", "Age 52", "Stress 70%"] },
  { name: "Medication Non-compliance", score: 45, trend: "improving", factors: ["Missed 3 follow-ups", "Partial intake"] },
  { name: "Mental Health", score: 38, trend: "improving", factors: ["PHQ-9: 8 (Mild)", "Nadi stress improving"] },
  { name: "Re-admission Risk", score: 62, trend: "worsening", factors: ["Acute on chronic", "Hyperkalemia hx"] },
  { name: "Fall Risk", score: 22, trend: "stable", factors: ["No history", "Mobile"] },
];

const PatientRiskScore = () => {
  const overallScore = 58;
  const getColor = (s: number) => s >= 70 ? "text-red-600" : s >= 50 ? "text-amber-600" : "text-green-600";
  const getBarColor = (s: number) => s >= 70 ? "bg-red-500" : s >= 50 ? "bg-amber-500" : "bg-green-500";
  const getTrend = (t: string) => t === "worsening" ? <TrendingUp className="h-3 w-3 text-red-500" /> : t === "improving" ? <TrendingDown className="h-3 w-3 text-green-500" /> : <Activity className="h-3 w-3 text-gray-400" />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> AI Patient Risk Score</h2>
        <Button size="sm" variant="outline" onClick={() => toast.success("Recalculated")}><RefreshCw className="mr-1 h-3 w-3" /> Recalculate</Button>
      </div>
      <Card className="border-orange-200 bg-orange-50"><CardContent className="p-4 flex items-center gap-6">
        <div className="relative w-20 h-20"><svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" /><circle cx="50" cy="50" r="42" fill="none" stroke="#f97316" strokeWidth="8" strokeDasharray={`${(overallScore/100)*264} 264`} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className={`text-xl font-bold ${getColor(overallScore)}`}>{overallScore}</span></div></div>
        <div><p className="font-bold text-sm">Mr. Rajesh Kumar — Moderate-High Risk</p><p className="text-xs text-muted-foreground">Primary: Kidney disease + hyperkalemia</p><p className="text-xs text-orange-700 mt-1 font-medium">Requires close monitoring</p></div>
      </CardContent></Card>
      <div className="grid sm:grid-cols-2 gap-3">{riskCategories.map((cat) => (
        <Card key={cat.name} className={cat.score >= 70 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium">{cat.name}</span><div className="flex items-center gap-1">{getTrend(cat.trend)}<span className={`text-sm font-bold ${getColor(cat.score)}`}>{cat.score}</span></div></div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2"><div className={`h-full rounded-full ${getBarColor(cat.score)}`} style={{ width: `${cat.score}%` }} /></div>
            <div className="flex flex-wrap gap-1">{cat.factors.map((f, i) => <Badge key={i} variant="outline" className="text-[8px]">{f}</Badge>)}</div>
          </CardContent>
        </Card>
      ))}</div>
      <Card className="border-purple-200"><CardContent className="p-3"><p className="text-xs font-medium text-purple-700 flex items-center gap-1 mb-1"><Brain className="h-3 w-3" /> AI Recommendations:</p><ul className="text-xs space-y-1"><li>• Nephrology follow-up within 1 week</li><li>• Pitta-pacifying Rasayana (Guduchi, Punarnava)</li><li>• Daily BP/weight remote monitoring</li><li>• Potassium restriction in Pathya</li><li>• Re-assess Nadi in 2 weeks</li></ul></CardContent></Card>
    </div>
  );
};
export default PatientRiskScore;
