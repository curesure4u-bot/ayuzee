import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Award, Truck, CheckCircle, AlertTriangle, Clock, Package } from "lucide-react";

const suppliers = [
  { name: "X Ayush Agency", orders: 45, onTime: 43, avgDays: 2.8, fillRate: 98, qualityReject: 1.2, returnHandling: 3, slaScore: 95, trend: "stable", tier: "Platinum" },
  { name: "X Pharmaceuticals", orders: 28, onTime: 24, avgDays: 4.8, fillRate: 95, qualityReject: 0.5, returnHandling: 5, slaScore: 88, trend: "improving", tier: "Gold" },
  { name: "AVN Kottakkal", orders: 38, onTime: 30, avgDays: 6.5, fillRate: 92, qualityReject: 0.8, returnHandling: 4, slaScore: 82, trend: "declining", tier: "Silver" },
  { name: "Arya Vaidya Pharmacy", orders: 22, onTime: 15, avgDays: 7.8, fillRate: 85, qualityReject: 1.5, returnHandling: 8, slaScore: 72, trend: "declining", tier: "Bronze" },
  { name: "SNA Oushadhasala", orders: 20, onTime: 18, avgDays: 4.5, fillRate: 96, qualityReject: 1.0, returnHandling: 4, slaScore: 86, trend: "improving", tier: "Gold" },
  { name: "Nagarjuna Herbal", orders: 18, onTime: 14, avgDays: 5.8, fillRate: 88, qualityReject: 2.1, returnHandling: 6, slaScore: 74, trend: "declining", tier: "Bronze" },
  { name: "Dabur Ayurvedics", orders: 15, onTime: 12, avgDays: 5.2, fillRate: 90, qualityReject: 1.8, returnHandling: 5, slaScore: 78, trend: "stable", tier: "Silver" },
];

const slaTargets = [
  { metric: "Delivery Time", target: "Within 5 days of PO", penalty: "₹500/day delay after 5 days", reward: "2% extra discount if delivered in 3 days" },
  { metric: "Fill Rate", target: "95%+ of PO items fulfilled", penalty: "Flagged for review if below 90%", reward: "Priority supplier status if consistently 98%+" },
  { metric: "Quality Rejection", target: "Below 1.5%", penalty: "Debit note + supplier warning at 2%+", reward: "Extended credit terms at below 0.5%" },
  { metric: "Return Handling", target: "Within 5 days", penalty: "Auto-deduction from next payment if >7 days", reward: "N/A" },
];

const tierColors: Record<string, string> = { Platinum: "bg-purple-100 text-purple-700", Gold: "bg-amber-100 text-amber-700", Silver: "bg-gray-100 text-gray-700", Bronze: "bg-orange-100 text-orange-700" };

export default function SupplierSLA() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-amber-600" /> Supplier Performance SLA</h1>
          <p className="text-muted-foreground mt-1">Track delivery time, fill rate, quality rejection, return handling — auto-penalize or reward</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{suppliers.length}</p><p className="text-xs text-muted-foreground">Suppliers Tracked</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{suppliers.filter(s => s.slaScore >= 85).length}</p><p className="text-xs text-muted-foreground">Meeting SLA</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{suppliers.filter(s => s.slaScore < 75).length}</p><p className="text-xs text-muted-foreground">Below SLA</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{(suppliers.reduce((s, sup) => s + sup.fillRate, 0) / suppliers.length).toFixed(0)}%</p><p className="text-xs text-muted-foreground">Avg Fill Rate</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Supplier SLA Scorecard</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Supplier</th><th className="px-3 py-2 text-center">Orders</th><th className="px-3 py-2 text-center">On-Time %</th><th className="px-3 py-2 text-center">Avg Days</th><th className="px-3 py-2 text-center">Fill Rate</th><th className="px-3 py-2 text-center">Reject %</th><th className="px-3 py-2 text-center">Return (days)</th><th className="px-3 py-2 text-center">SLA Score</th><th className="px-3 py-2 text-center">Tier</th><th className="px-3 py-2 text-center">Trend</th></tr></thead><tbody>
            {suppliers.map((s, i) => (
              <tr key={i} className={`border-b ${s.slaScore < 75 ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-medium">{s.name}</td>
                <td className="px-3 py-2 text-center text-xs">{s.orders}</td>
                <td className="px-3 py-2 text-center text-xs">{Math.round(s.onTime / s.orders * 100)}%</td>
                <td className="px-3 py-2 text-center text-xs"><span className={s.avgDays <= 5 ? "text-green-600" : "text-red-600"}>{s.avgDays}d</span></td>
                <td className="px-3 py-2 text-center text-xs"><span className={s.fillRate >= 95 ? "text-green-600 font-bold" : s.fillRate >= 90 ? "" : "text-red-600"}>{s.fillRate}%</span></td>
                <td className="px-3 py-2 text-center text-xs"><span className={s.qualityReject <= 1 ? "text-green-600" : s.qualityReject <= 1.5 ? "text-amber-600" : "text-red-600"}>{s.qualityReject}%</span></td>
                <td className="px-3 py-2 text-center text-xs"><span className={s.returnHandling <= 5 ? "text-green-600" : "text-red-600"}>{s.returnHandling}d</span></td>
                <td className="px-3 py-2 text-center">
                  <div className="flex items-center gap-1 justify-center"><Progress value={s.slaScore} className="w-12 h-1.5" /><span className="text-xs font-bold">{s.slaScore}</span></div>
                </td>
                <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${tierColors[s.tier]}`}>{s.tier}</Badge></td>
                <td className="px-3 py-2 text-center text-[10px]">{s.trend === "improving" ? <span className="text-green-600">↑</span> : s.trend === "declining" ? <span className="text-red-600">↓</span> : <span>→</span>} {s.trend}</td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">SLA Targets & Consequences</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-1 text-left">Metric</th><th className="px-3 py-1 text-left">Target</th><th className="px-3 py-1 text-left">Penalty</th><th className="px-3 py-1 text-left">Reward</th></tr></thead><tbody>
            {slaTargets.map((t, i) => (
              <tr key={i} className="border-b"><td className="px-3 py-1.5 font-medium">{t.metric}</td><td className="px-3 py-1.5">{t.target}</td><td className="px-3 py-1.5 text-red-600">{t.penalty}</td><td className="px-3 py-1.5 text-green-600">{t.reward}</td></tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI SLA Intelligence</p><p className="text-sm text-purple-700">Arya Vaidya Pharmacy declining (72 score, 7.8 day avg delivery, 85% fill rate). AI recommends: Issue formal SLA warning. If no improvement in 30 days, shift 50% volume to SNA Oushadhasala (improving, 86 score). Nagarjuna quality issue (2.1% reject) — highest among all. Auto-debit notes generated for 3 rejected batches this month. X Ayush Agency (95 score) qualifies for Platinum benefits: 2% extra discount + priority payment cycle.</p></div></CardContent></Card>
    </div>
  );
}
