import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, FileText, CheckCircle, Download, Calendar, BarChart3 } from "lucide-react";

const summary = {
  branch: "Branch - Koramangala", date: "22 Jul 2026", status: "open",
  opening: { items: 892, value: 485000 },
  received: { grn: 2, items: 65, value: 28500 },
  sold: { bills: 34, items: 82, value: 42800 },
  returned: { fromPatient: 2, items: 2, value: 345 },
  transferred: { out: 1, in: 0, netItems: -20, netValue: -8500 },
  wastage: { items: 1, value: 148 },
  adjustment: { plus: 3, minus: 0, netValue: 285 },
  closing: { items: 856, value: 462892 },
};

const weeklyTrend = [
  { date: "16 Jul", opening: 478000, received: 22000, sold: 38000, closing: 462000 },
  { date: "17 Jul", opening: 462000, received: 0, sold: 35000, closing: 427000 },
  { date: "18 Jul", opening: 427000, received: 45000, sold: 41000, closing: 431000 },
  { date: "19 Jul", opening: 431000, received: 18000, sold: 32000, closing: 417000 },
  { date: "20 Jul", opening: 417000, received: 55000, sold: 44000, closing: 428000 },
  { date: "21 Jul", opening: 428000, received: 32000, sold: 39000, closing: 421000 },
  { date: "22 Jul", opening: 485000, received: 28500, sold: 42800, closing: 462892 },
];

const branchComparison = [
  { branch: "Koramangala", sales: 42800, items: 82, margin: "38%", wastage: 148, returns: 345, status: "closed" },
  { branch: "HSR Layout", sales: 35200, items: 68, margin: "35%", wastage: 0, returns: 180, status: "closed" },
  { branch: "Indiranagar", sales: 28500, items: 52, margin: "36%", wastage: 270, returns: 0, status: "open" },
  { branch: "Central Store", sales: 0, items: 0, margin: "—", wastage: 0, returns: 0, status: "closed" },
];

export default function DailyStockSummary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-blue-600" /> Daily Stock Summary</h1>
          <p className="text-muted-foreground mt-1">End-of-day: Opening + Received - Sold - Wastage = Closing. Auto-generated per branch.</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="koramangala">
            <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="koramangala">Koramangala</SelectItem>
              <SelectItem value="hsr">HSR Layout</SelectItem>
              <SelectItem value="indiranagar">Indiranagar</SelectItem>
              <SelectItem value="central">Central Store</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => toast.success("Summary exported as PDF")}><Download className="h-3 w-3 mr-1" /> Export</Button>
        </div>
      </div>

      <Card className="border-blue-200">
        <CardHeader className="pb-2 bg-blue-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{summary.branch} — {summary.date}</CardTitle>
            <Badge variant={summary.status === "open" ? "default" : "outline"} className={`text-[10px] ${summary.status === "closed" ? "text-green-600" : ""}`}>{summary.status === "open" ? "Day Open" : "Day Closed"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-muted/30"><span>Opening Stock</span><span className="font-bold">{summary.opening.items} items | ₹{(summary.opening.value/1000).toFixed(1)}K</span></div>
            <div className="flex justify-between p-2 rounded bg-green-50"><span className="text-green-700">+ Received (GRN × {summary.received.grn})</span><span className="font-bold text-green-700">+{summary.received.items} items | +₹{(summary.received.value/1000).toFixed(1)}K</span></div>
            <div className="flex justify-between p-2 rounded bg-red-50"><span className="text-red-700">− Sold ({summary.sold.bills} bills)</span><span className="font-bold text-red-700">−{summary.sold.items} items | −₹{(summary.sold.value/1000).toFixed(1)}K</span></div>
            <div className="flex justify-between p-2 rounded bg-amber-50"><span className="text-amber-700">− Wastage / Breakage</span><span className="font-bold text-amber-700">−{summary.wastage.items} items | −₹{summary.wastage.value}</span></div>
            <div className="flex justify-between p-2 rounded bg-purple-50"><span className="text-purple-700">± Transfer (Out: {summary.transferred.out} | In: {summary.transferred.in})</span><span className="font-bold text-purple-700">{summary.transferred.netItems} items | ₹{(summary.transferred.netValue/1000).toFixed(1)}K</span></div>
            <div className="flex justify-between p-2 rounded bg-blue-50"><span className="text-blue-700">+ Patient Returns</span><span className="font-bold text-blue-700">+{summary.returned.items} items | +₹{summary.returned.value}</span></div>
            <div className="flex justify-between p-2 rounded bg-muted/30"><span className="text-muted-foreground">± Adjustments</span><span className="font-bold">+{summary.adjustment.plus} items | +₹{summary.adjustment.netValue}</span></div>
            <Separator />
            <div className="flex justify-between p-3 rounded bg-blue-100 text-lg"><span className="font-bold">Closing Stock</span><span className="font-bold">{summary.closing.items} items | ₹{(summary.closing.value/1000).toFixed(1)}K</span></div>
          </div>
          <Button className="w-full mt-4" onClick={() => toast.success("Day closed. Summary locked.")}><CheckCircle className="h-4 w-4 mr-1" /> Close Day &amp; Lock Summary</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Branch Comparison — Today</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Branch</th><th className="px-3 py-2 text-right">Sales</th><th className="px-3 py-2 text-center">Items</th><th className="px-3 py-2 text-center">Margin</th><th className="px-3 py-2 text-right">Wastage</th><th className="px-3 py-2 text-right">Returns</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {branchComparison.map((b, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-medium">{b.branch}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{(b.sales/1000).toFixed(1)}K</td>
                <td className="px-3 py-2 text-center text-xs">{b.items}</td>
                <td className="px-3 py-2 text-center text-xs text-green-600 font-bold">{b.margin}</td>
                <td className="px-3 py-2 text-right text-xs text-red-600">{b.wastage > 0 ? `₹${b.wastage}` : "—"}</td>
                <td className="px-3 py-2 text-right text-xs">{b.returns > 0 ? `₹${b.returns}` : "—"}</td>
                <td className="px-3 py-2 text-center"><Badge variant={b.status === "closed" ? "outline" : "default"} className={`text-[10px] ${b.status === "closed" ? "text-green-600" : ""}`}>{b.status}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-3 flex items-start gap-2"><Brain className="h-4 w-4 text-purple-600 mt-0.5" /><div><p className="font-semibold text-xs text-purple-800">AI Daily Insights</p><p className="text-[10px] text-purple-700">Koramangala: Best sales day this week (₹42.8K). Stock value dropped ₹22K (healthy turnover). Indiranagar day still open — remind branch manager to close before 9 PM. Wastage at Koramangala (₹148 — 1 broken Kashayam bottle) within acceptable range (0.03% of stock value). Weekly avg margin: 36.3% across all branches — target 38%.</p></div></CardContent></Card>
    </div>
  );
}

function Separator() {
  return <div className="border-t my-2" />;
}
