import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, BarChart3 } from "lucide-react";

const abcData = [
  { item: "Rasnasaptakam Kashayam", category: "A", ved: "V", fsn: "F", value: 185000, pct: 18, consumption: "High" },
  { item: "Simhanada Guggulu", category: "A", ved: "V", fsn: "F", value: 142000, pct: 14, consumption: "High" },
  { item: "Kottamchukkadi Taila", category: "A", ved: "E", fsn: "F", value: 98000, pct: 10, consumption: "High" },
  { item: "Dashamoolarishtam", category: "B", ved: "V", fsn: "F", value: 65000, pct: 6, consumption: "Medium" },
  { item: "Ashwagandha Churna", category: "B", ved: "E", fsn: "F", value: 52000, pct: 5, consumption: "Medium" },
  { item: "Triphala Churna", category: "B", ved: "D", fsn: "S", value: 38000, pct: 4, consumption: "Medium" },
  { item: "Chandraprabha Vati", category: "B", ved: "V", fsn: "S", value: 32000, pct: 3, consumption: "Medium" },
  { item: "Mahanarayan Taila", category: "C", ved: "E", fsn: "S", value: 18000, pct: 2, consumption: "Low" },
  { item: "Punarnavadi Mandoor", category: "C", ved: "D", fsn: "N", value: 8000, pct: 1, consumption: "Low" },
  { item: "Kumaryasava", category: "C", ved: "D", fsn: "N", value: 5000, pct: 0.5, consumption: "Low" },
];

const AbcAnalysis = () => {
  const aItems = abcData.filter(d => d.category === "A");
  const bItems = abcData.filter(d => d.category === "B");
  const cItems = abcData.filter(d => d.category === "C");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" /> ABC / VED / FSN Inventory Analysis (AI)</h1><p className="text-muted-foreground mt-1">Classify inventory for optimal purchasing and stock management</p></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-red-600">A — High Value</p><p className="text-xs text-muted-foreground">{aItems.length} items ({aItems.reduce((s,d) => s + d.pct, 0)}% of total value)</p><p className="text-[10px]">Tight control, frequent reorder, never stock-out</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-amber-600">B — Medium Value</p><p className="text-xs text-muted-foreground">{bItems.length} items ({bItems.reduce((s,d) => s + d.pct, 0)}% of total value)</p><p className="text-[10px]">Moderate control, periodic review</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">C — Low Value</p><p className="text-xs text-muted-foreground">{cItems.length} items ({cItems.reduce((s,d) => s + d.pct, 0)}% of total value)</p><p className="text-[10px]">Basic control, bulk ordering OK</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Inventory Classification</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">ABC</th><th className="px-3 py-2 text-center">VED</th><th className="px-3 py-2 text-center">FSN</th><th className="px-3 py-2 text-right">Annual Value</th><th className="px-3 py-2 text-center">% of Total</th><th className="px-3 py-2 text-center">Consumption</th></tr></thead><tbody>
          {abcData.map((d, i) => (<tr key={i} className="border-b hover:bg-muted/30"><td className="px-3 py-2 font-medium text-xs">{d.item}</td><td className="px-3 py-2 text-center"><Badge variant={d.category === "A" ? "destructive" : d.category === "B" ? "default" : "secondary"} className="text-[10px]">{d.category}</Badge></td><td className="px-3 py-2 text-center"><Badge variant="outline" className={`text-[10px] ${d.ved === "V" ? "text-red-600" : d.ved === "E" ? "text-amber-600" : "text-green-600"}`}>{d.ved}</Badge></td><td className="px-3 py-2 text-center"><Badge variant="outline" className={`text-[10px] ${d.fsn === "F" ? "text-blue-600" : d.fsn === "S" ? "text-amber-600" : "text-red-600"}`}>{d.fsn}</Badge></td><td className="px-3 py-2 text-right font-bold">₹{d.value.toLocaleString()}</td><td className="px-3 py-2 text-center">{d.pct}%</td><td className="px-3 py-2 text-center text-xs">{d.consumption}</td></tr>))}
        </tbody></table></div></CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/30"><CardContent className="p-4 text-xs text-blue-700 space-y-1"><p><strong>ABC:</strong> A=top 20% items contributing 70% value | B=next 30% items contributing 20% value | C=bottom 50% items contributing 10% value</p><p><strong>VED:</strong> V=Vital (never stock out) | E=Essential (minimal stock-out) | D=Desirable (can stock-out occasionally)</p><p><strong>FSN:</strong> F=Fast moving (sold frequently) | S=Slow moving (occasional demand) | N=Non-moving (no demand 90+ days)</p></CardContent></Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Recommendation</p><p className="text-sm text-purple-700">Category A+V+F items (Rasnasaptakam, Simhanada): NEVER let stock fall below 7-day buffer. Auto-PO at 70% consumption. Category C+D+N items: Consider discontinuing or converting to order-on-demand basis — saves ₹31,000 in holding cost annually.</p></div></CardContent></Card>
    </div>
  );
};

export default AbcAnalysis;
