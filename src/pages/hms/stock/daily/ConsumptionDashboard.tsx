import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, BarChart3, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const branches = [
  { name: "Koramangala", sales: 485000, items: 2420, margin: 38.2, wastage: 4200, returns: 8500, turnover: 4.2, topItem: "Rasnasaptakam", growth: "+12%", rank: 1 },
  { name: "HSR Layout", sales: 362000, items: 1850, margin: 35.5, wastage: 2800, returns: 5200, turnover: 3.8, topItem: "Kottamchukkadi", growth: "+18%", rank: 2 },
  { name: "Indiranagar", sales: 298000, items: 1520, margin: 36.8, wastage: 6500, returns: 3800, turnover: 3.2, topItem: "Simhanada Gugg.", growth: "+5%", rank: 3 },
  { name: "Franchise - Chennai", sales: 420000, items: 2100, margin: 32.0, wastage: 1200, returns: 2500, turnover: 5.1, topItem: "Rasnasaptakam", growth: "+22%", rank: 4 },
  { name: "Franchise - Hyderabad", sales: 285000, items: 1380, margin: 31.5, wastage: 800, returns: 1800, turnover: 4.5, topItem: "Dashamoolarishtam", growth: "+15%", rank: 5 },
];

const topItems = [
  { item: "Rasnasaptakam Kashayam 200ml", totalSold: 850, revenue: 178500, branches: "All", trend: "+15%", share: "18%" },
  { item: "Simhanada Guggulu 60t", totalSold: 720, revenue: 108000, branches: "All", trend: "+8%", share: "11%" },
  { item: "Kottamchukkadi Taila 200ml", totalSold: 580, revenue: 162400, branches: "4/5", trend: "+25%", share: "16%" },
  { item: "Dashamoolarishtam 450ml", totalSold: 450, revenue: 83250, branches: "All", trend: "+12%", share: "8%" },
  { item: "Ashwagandha Churna 100g", totalSold: 420, revenue: 67200, branches: "All", trend: "+5%", share: "7%" },
];

const alerts = [
  { type: "wastage", branch: "Indiranagar", message: "Highest wastage (₹6,500/month) — 2.2% of stock value. Target: below 1%.", action: "Investigate: breakage during PK or dispensing?" },
  { type: "margin", branch: "Franchise - Hyderabad", message: "Lowest margin (31.5%) — below target 35%. Pricing review needed.", action: "Check: Are they offering unauthorized discounts?" },
  { type: "growth", branch: "Indiranagar", message: "Slowest growth (+5%) despite same marketing spend as others.", action: "Review: Doctor utilization, patient footfall, competitor presence." },
  { type: "turnover", branch: "Indiranagar", message: "Lowest stock turnover (3.2x/month) — money sitting idle in inventory.", action: "Reduce ROL levels by 20% at this branch." },
];

export default function ConsumptionDashboard() {
  const totalSales = branches.reduce((s, b) => s + b.sales, 0);
  const avgMargin = (branches.reduce((s, b) => s + b.margin, 0) / branches.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" /> Consumption Dashboard</h1>
          <p className="text-muted-foreground mt-1">Compare branches: sales, margins, wastage, turnover. Identify best and worst performers.</p>
        </div>
        <Select defaultValue="jul2026"><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="jul2026">July 2026</SelectItem><SelectItem value="jun2026">June 2026</SelectItem><SelectItem value="may2026">May 2026</SelectItem></SelectContent></Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalSales/100000).toFixed(1)}L</p><p className="text-xs text-muted-foreground">Total Sales (Jul)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{avgMargin}%</p><p className="text-xs text-muted-foreground">Avg Margin</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{branches.length}</p><p className="text-xs text-muted-foreground">Branches</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{branches.reduce((s, b) => s + b.items, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Items Dispensed</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Branch Performance Comparison</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Branch</th><th className="px-3 py-2 text-right">Sales</th><th className="px-3 py-2 text-center">Items</th><th className="px-3 py-2 text-center">Margin</th><th className="px-3 py-2 text-right">Wastage</th><th className="px-3 py-2 text-right">Returns</th><th className="px-3 py-2 text-center">Turnover</th><th className="px-3 py-2 text-center">Growth</th><th className="px-3 py-2 text-left">Top Item</th></tr></thead><tbody>
            {branches.map((b, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-medium">{b.name}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{(b.sales/1000).toFixed(0)}K</td>
                <td className="px-3 py-2 text-center text-xs">{b.items.toLocaleString()}</td>
                <td className="px-3 py-2 text-center text-xs"><span className={b.margin >= 36 ? "text-green-600 font-bold" : b.margin >= 33 ? "text-amber-600" : "text-red-600"}>{b.margin}%</span></td>
                <td className="px-3 py-2 text-right text-xs text-red-600">₹{b.wastage.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-xs">₹{b.returns.toLocaleString()}</td>
                <td className="px-3 py-2 text-center text-xs font-bold">{b.turnover}x</td>
                <td className="px-3 py-2 text-center text-xs"><Badge variant="outline" className={`text-[10px] ${parseInt(b.growth) > 15 ? "text-green-600" : ""}`}>{b.growth}</Badge></td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{b.topItem}</td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Top Selling Items (All Branches)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-1 text-left">Item</th><th className="px-3 py-1 text-center">Units Sold</th><th className="px-3 py-1 text-right">Revenue</th><th className="px-3 py-1 text-center">Branches</th><th className="px-3 py-1 text-center">Trend</th><th className="px-3 py-1 text-center">Share</th></tr></thead><tbody>
            {topItems.map((t, i) => (
              <tr key={i} className="border-b"><td className="px-3 py-1.5 font-medium">{t.item}</td><td className="px-3 py-1.5 text-center font-bold">{t.totalSold}</td><td className="px-3 py-1.5 text-right">₹{t.revenue.toLocaleString()}</td><td className="px-3 py-1.5 text-center">{t.branches}</td><td className="px-3 py-1.5 text-center text-green-600">{t.trend}</td><td className="px-3 py-1.5 text-center">{t.share}</td></tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-700 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Performance Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="p-2 rounded border border-amber-100 bg-amber-50/30 text-xs">
              <p><strong>{a.branch}:</strong> {a.message}</p>
              <p className="text-purple-700 mt-0.5">Action: {a.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Consumption Intelligence</p><p className="text-sm text-purple-700">Chennai franchise growing fastest (+22%) — likely new doctor referrals. HSR PK-heavy (Kottamchukkadi is #1 item) — consider stocking larger PK oil volumes there. Indiranagar underperforming on all metrics — needs management attention. Kottamchukkadi Taila (+25% trend) is the breakout item — increase central store procurement by 30% next month.</p></div></CardContent></Card>
    </div>
  );
}
