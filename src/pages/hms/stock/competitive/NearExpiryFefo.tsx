import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, AlertTriangle, Clock, CheckCircle, ArrowRight, Truck } from "lucide-react";

const expiryAlerts = [
  { item: "Dashamoolarishtam 450ml", batch: "DMA-0126", expiry: "31 Aug 2026", daysLeft: 39, qty: 8, value: 1080, zone: "red", action: "Discount sale / transfer to high-demand branch" },
  { item: "Kumaryasava 450ml", batch: "KMA-0226", expiry: "15 Sep 2026", daysLeft: 54, qty: 5, value: 675, zone: "red", action: "Push to dispensing priority / patient discount" },
  { item: "Ashwagandha Churna 100g", batch: "ASC-1225", expiry: "30 Sep 2026", daysLeft: 69, qty: 15, value: 1425, zone: "amber", action: "Transfer to Koramangala branch (high demand)" },
  { item: "Brahmi Vati 60t", batch: "BRV-0226", expiry: "15 Oct 2026", daysLeft: 84, qty: 12, value: 1320, zone: "amber", action: "Normal dispensing — monitor weekly" },
  { item: "Chandraprabha Vati 60t", batch: "CPV-0126", expiry: "31 Oct 2026", daysLeft: 100, qty: 22, value: 2420, zone: "yellow", action: "Normal FEFO dispensing" },
  { item: "Punarnavadi Mandoor 60t", batch: "PNM-1125", expiry: "30 Nov 2026", daysLeft: 130, qty: 18, value: 1530, zone: "yellow", action: "Normal FEFO dispensing" },
  { item: "Arogyavardhini Vati 60t", batch: "ARV-0126", expiry: "31 Dec 2026", daysLeft: 161, qty: 25, value: 1875, zone: "green", action: "Safe — no action needed" },
];

const fefoLog = [
  { time: "10:42 AM", item: "Rasnasaptakam 450ml", prescribed: "Batch RSK-0726-A (exp Jun 2028)", dispensed: "Batch RSK-0326-X (exp Mar 2027)", reason: "FEFO: Earlier expiry batch dispensed first", correct: true },
  { time: "10:15 AM", item: "Simhanada Guggulu 60t", prescribed: "Any", dispensed: "Batch SNG-0426-B (exp Apr 2027)", reason: "FEFO: This is the earliest expiry batch", correct: true },
  { time: "09:30 AM", item: "Triphala Churna 100g", prescribed: "Any", dispensed: "Batch TPC-0726-F (exp Nov 2027)", reason: "Only 1 batch in stock", correct: true },
  { time: "Yesterday", item: "Chandraprabha Vati 60t", prescribed: "Any", dispensed: "Batch CPV-0626-G (exp Aug 2027)", reason: "FEFO override: Older batch CPV-0126 (exp Oct 2026) should have been dispensed", correct: false },
];

export default function NearExpiryFefo() {
  const red = expiryAlerts.filter(a => a.zone === "red");
  const amber = expiryAlerts.filter(a => a.zone === "amber");
  const yellow = expiryAlerts.filter(a => a.zone === "yellow");
  const totalAtRisk = expiryAlerts.filter(a => a.zone !== "green").reduce((s, a) => s + a.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-red-600" /> Near-Expiry Alert & FEFO
          </h1>
          <p className="text-muted-foreground mt-1">First Expiry First Out enforcement — 90/60/30 day color-coded alerts</p>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1">₹{totalAtRisk.toLocaleString()} at risk</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-300 bg-red-50/30"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{red.length}</p><p className="text-[10px] text-muted-foreground">Critical (&lt;60 days)</p></CardContent></Card>
        <Card className="border-amber-300 bg-amber-50/30"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{amber.length}</p><p className="text-[10px] text-muted-foreground">Warning (60-90 days)</p></CardContent></Card>
        <Card className="border-yellow-300 bg-yellow-50/30"><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-yellow-600" /><p className="text-xl font-bold text-yellow-600">{yellow.length}</p><p className="text-[10px] text-muted-foreground">Watch (90-120 days)</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{expiryAlerts.filter(a => a.zone === "green").length}</p><p className="text-[10px] text-muted-foreground">Safe (&gt;120 days)</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Expiry Alert Dashboard</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-center">Zone</th>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">Expiry</th>
                  <th className="px-3 py-2 text-center">Days Left</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-left">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {expiryAlerts.map((alert, i) => (
                  <tr key={i} className={`border-b ${alert.zone === "red" ? "bg-red-50/50" : alert.zone === "amber" ? "bg-amber-50/30" : ""}`}>
                    <td className="px-3 py-2 text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto ${alert.zone === "red" ? "bg-red-500" : alert.zone === "amber" ? "bg-amber-500" : alert.zone === "yellow" ? "bg-yellow-500" : "bg-green-500"}`} />
                    </td>
                    <td className="px-3 py-2 text-xs font-medium">{alert.item}</td>
                    <td className="px-3 py-2 text-center text-xs text-muted-foreground">{alert.batch}</td>
                    <td className="px-3 py-2 text-center text-xs">{alert.expiry}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">
                      <span className={alert.zone === "red" ? "text-red-600" : alert.zone === "amber" ? "text-amber-600" : ""}>{alert.daysLeft}d</span>
                    </td>
                    <td className="px-3 py-2 text-center text-xs">{alert.qty}</td>
                    <td className="px-3 py-2 text-right text-xs">₹{alert.value.toLocaleString()}</td>
                    <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[180px]">{alert.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">FEFO Dispensing Log (Today)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {fefoLog.map((log, i) => (
            <div key={i} className={`p-2 rounded border text-xs ${log.correct ? "border-green-200" : "border-red-200 bg-red-50/30"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {log.correct ? <CheckCircle className="h-3 w-3 text-green-600" /> : <AlertTriangle className="h-3 w-3 text-red-600" />}
                  <span className="font-medium">{log.item}</span>
                  <span className="text-muted-foreground">{log.time}</span>
                </div>
                <Badge variant={log.correct ? "outline" : "destructive"} className={`text-[10px] ${log.correct ? "text-green-600" : ""}`}>
                  {log.correct ? "FEFO Correct" : "FEFO Violation"}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 ml-5">{log.reason}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Expiry Prevention</p>
            <p className="text-sm text-purple-700">
              FEFO violation detected: Chandraprabha Vati — pharmacist dispensed newer batch instead of older.
              AI auto-alerts pharmacist and blocks incorrect batch at barcode scan. Red-zone items (₹1,755 value):
              Auto-transferred to high-footfall Koramangala branch where daily consumption is 3x higher.
              Result: 87% of near-expiry items consumed before expiry vs 62% before FEFO implementation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
