import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, TrendingDown } from "lucide-react";

const historyData = [
  { date: "2026-03-10", phq9: 15, gad7: 12, manas: "Rajasic", stress: 85 },
  { date: "2026-04-15", phq9: 12, gad7: 10, manas: "Rajasic", stress: 75 },
  { date: "2026-05-18", phq9: 10, gad7: 8, manas: "Rajo-Sattvic", stress: 65 },
  { date: "2026-06-20", phq9: 8, gad7: 6, manas: "Sattvic", stress: 55 },
  { date: "2026-07-24", phq9: 6, gad7: 5, manas: "Sattvic", stress: 45 },
];

const MentalHealthScreening = () => {
  const phq9 = 6; const gad7 = 5;
  const getSev = (s: number, t: string) => { const thresholds = t === "phq9" ? [4,9,14,19] : [4,9,14]; if (s <= thresholds[0]) return { l: "Minimal", c: "bg-green-100 text-green-700" }; if (s <= thresholds[1]) return { l: "Mild", c: "bg-blue-100 text-blue-700" }; if (s <= thresholds[2]) return { l: "Moderate", c: "bg-amber-100 text-amber-700" }; return { l: "Severe", c: "bg-red-100 text-red-700" }; };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Brain className="h-5 w-5" /> Mental Health Screening</h2>
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("New screening")}>New Screening</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-blue-600">{phq9}</p><p className="text-[10px] text-muted-foreground">PHQ-9</p><Badge className={`text-[9px] mt-1 ${getSev(phq9,"phq9").c}`}>{getSev(phq9,"phq9").l}</Badge></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">{gad7}</p><p className="text-[10px] text-muted-foreground">GAD-7</p><Badge className={`text-[9px] mt-1 ${getSev(gad7,"gad7").c}`}>{getSev(gad7,"gad7").l}</Badge></CardContent></Card>
        <Card className="border-purple-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-purple-600">Sattvic</p><p className="text-[10px] text-muted-foreground">Manas Prakriti</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-600">45%</p><p className="text-[10px] text-muted-foreground">Nadi Stress</p><Badge className="text-[9px] mt-1 bg-green-100 text-green-700"><TrendingDown className="h-3 w-3 mr-0.5" />Down</Badge></CardContent></Card>
      </div>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Score Trend</CardTitle></CardHeader><CardContent><div className="space-y-2">{historyData.map((h) => (
        <div key={h.date} className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground w-[80px]">{h.date}</span>
          <span className="w-20">PHQ-9: <strong className={h.phq9 <= 9 ? "text-green-600" : "text-amber-600"}>{h.phq9}</strong></span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${h.phq9 <= 9 ? "bg-green-500" : "bg-amber-500"}`} style={{width: `${(h.phq9/27)*100}%`}} /></div>
          <Badge variant="outline" className="text-[8px]">{h.manas}</Badge>
          <span className="text-[10px]">Stress: {h.stress}%</span>
        </div>
      ))}</div><div className="mt-3 p-2 bg-green-50 rounded text-[10px] text-green-700"><strong>Improvement:</strong> PHQ-9: 15 to 6 over 4 months. Shirodhara + Meditation effective.</div></CardContent></Card>
      <Card className="border-purple-100"><CardContent className="p-3"><p className="text-xs font-medium text-purple-700 mb-1"><Brain className="h-3 w-3 inline mr-1" />AYUSH Correlation:</p><p className="text-xs text-muted-foreground">Manas shifted from Rajasic to Sattvic. Continue Shirodhara weekly + Brahmi Vati + Meditation.</p></CardContent></Card>
    </div>
  );
};
export default MentalHealthScreening;
