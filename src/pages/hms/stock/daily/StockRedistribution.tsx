import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Warehouse } from "lucide-react";

const suggestions = [
  { item: "Simhanada Guggulu 60t", from: "Koramangala", fromStock: 180, fromDays: 167, to: "HSR Layout", toStock: 12, toDays: 4, suggestQty: 60, savings: 5100, priority: "critical", reason: "HSR will stock-out in 4 days. Koramangala has 167 days excess." },
  { item: "Rasnasaptakam Kashayam 200ml", from: "Koramangala", fromStock: 85, fromDays: 56, to: "HSR Layout", toStock: 12, toDays: 6, suggestQty: 30, savings: 4350, priority: "critical", reason: "HSR critically low (6 days). Koramangala has 56 days — safe to share 30." },
  { item: "Kottamchukkadi Taila 200ml", from: "Indiranagar", fromStock: 32, fromDays: 42, to: "HSR Layout", toStock: 5, toDays: 3, suggestQty: 12, savings: 1980, priority: "critical", reason: "HSR PK room will halt in 3 days without transfer." },
  { item: "Ashwagandha Churna 100g", from: "Koramangala", fromStock: 65, fromDays: 95, to: "Indiranagar", toStock: 8, toDays: 12, suggestQty: 20, savings: 1900, priority: "high", reason: "Indiranagar running low. Koramangala overstock." },
  { item: "Dashamoolarishtam 450ml", from: "Indiranagar", fromStock: 45, fromDays: 75, to: "HSR Layout", toStock: 18, toDays: 18, suggestQty: 10, savings: 1350, priority: "medium", reason: "HSR adequate for 18 days but monsoon demand expected to spike." },
  { item: "Chandraprabha Vati 60t", from: "Koramangala", fromStock: 55, fromDays: 82, to: "Franchise Chennai", toStock: 5, toDays: 8, suggestQty: 15, savings: 1650, priority: "high", reason: "Chennai franchise low — next PO takes 7 days. Redistribute interim." },
];

const totalSavings = suggestions.reduce((s, sg) => s + sg.savings, 0);

export default function StockRedistribution() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-600" /> Stock Redistribution AI</h1>
          <p className="text-muted-foreground mt-1">AI detects imbalances across branches — auto-suggests transfers to prevent stock-outs and reduce dead stock</p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">Potential Savings: ₹{totalSavings.toLocaleString()}/month</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{suggestions.filter(s => s.priority === "critical").length}</p><p className="text-[10px] text-muted-foreground">Critical (Stock-out risk)</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{suggestions.filter(s => s.priority === "high").length}</p><p className="text-[10px] text-muted-foreground">High Priority</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{suggestions.length}</p><p className="text-[10px] text-muted-foreground">Total Suggestions</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><TrendingUp className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">₹{(totalSavings/1000).toFixed(1)}K</p><p className="text-[10px] text-muted-foreground">Monthly Savings</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <Card key={i} className={s.priority === "critical" ? "border-red-300" : s.priority === "high" ? "border-amber-200" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{s.item}</p>
                    <Badge variant={s.priority === "critical" ? "destructive" : s.priority === "high" ? "default" : "secondary"} className="text-[10px]">{s.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="text-center p-2 rounded bg-green-50 min-w-[100px]">
                      <p className="font-bold text-green-700">{s.from}</p>
                      <p className="text-[10px]">{s.fromStock} units ({s.fromDays}d)</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                      <Badge className="bg-purple-100 text-purple-700 text-[10px] mt-0.5">{s.suggestQty} units</Badge>
                    </div>
                    <div className="text-center p-2 rounded bg-red-50 min-w-[100px]">
                      <p className="font-bold text-red-700">{s.to}</p>
                      <p className="text-[10px]">{s.toStock} units ({s.toDays}d)</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">{s.reason}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-xs text-green-600 font-bold">Saves ₹{s.savings.toLocaleString()}</p>
                  <Button size="sm" className="h-7 text-xs mt-2" onClick={() => toast.success(`Transfer initiated: ${s.suggestQty} ${s.item} → ${s.to}`)}>Execute Transfer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full" onClick={() => toast.success(`All 6 redistributions executed. Estimated savings: ₹${totalSavings.toLocaleString()}`)}>
        <CheckCircle className="h-4 w-4 mr-2" /> Execute All Redistributions (₹{totalSavings.toLocaleString()} savings)
      </Button>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Redistribution Logic</p><p className="text-sm text-purple-700">Analyzes: Stock days remaining per branch, consumption velocity, upcoming appointments (spine patients need Kottamchukkadi), seasonal demand patterns. HSR Layout has 3 critical items because new doctor joined — patient load doubled but stock wasn't adjusted. Auto-redistribution prevents ₹16K emergency purchases this month. Annual impact across 10 branches: <strong>₹2.4L saved</strong> in reduced emergency POs + zero stock-out revenue loss.</p></div></CardContent></Card>
    </div>
  );
}
