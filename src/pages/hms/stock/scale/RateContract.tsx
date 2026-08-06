import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, FileText, CheckCircle, AlertTriangle, Calendar } from "lucide-react";

const contracts = [
  { id: "RC-2026-01", supplier: "AVN Kottakkal", items: 45, startDate: "01 Apr 2026", endDate: "31 Mar 2027", totalValue: "₹18L (est.)", discount: "12% on MRP", status: "active", daysLeft: 252, compliance: 94 },
  { id: "RC-2026-02", supplier: "X Ayush Agency", items: 62, startDate: "01 Jan 2026", endDate: "31 Dec 2026", totalValue: "₹22L (est.)", discount: "At cost + 5%", status: "active", daysLeft: 162, compliance: 98 },
  { id: "RC-2026-03", supplier: "X Pharmaceuticals", items: 38, startDate: "01 Jan 2026", endDate: "31 Dec 2026", totalValue: "₹14L (est.)", discount: "At cost", status: "active", daysLeft: 162, compliance: 100 },
  { id: "RC-2026-04", supplier: "Nagarjuna Herbal", items: 25, startDate: "01 Jul 2026", endDate: "30 Jun 2027", totalValue: "₹8L (est.)", discount: "15% on MRP", status: "active", daysLeft: 343, compliance: 88 },
  { id: "RC-2025-08", supplier: "Dabur Ayurvedics", items: 30, startDate: "01 Oct 2025", endDate: "30 Sep 2026", totalValue: "₹6L (est.)", discount: "10% on MRP", status: "expiring_soon", daysLeft: 69, compliance: 82 },
];

const rateItems = [
  { item: "Rasnasaptakam Kashayam 450ml", supplier: "AVN Kottakkal", contractRate: 145, mrp: 210, discount: "31%", locked: true },
  { item: "Simhanada Guggulu 60t", supplier: "X Pharmaceuticals", contractRate: 80, mrp: 150, discount: "47%", locked: true },
  { item: "Kottamchukkadi Taila 200ml", supplier: "X Ayush Agency", contractRate: 160, mrp: 280, discount: "43%", locked: true },
  { item: "Ashwagandha Churna 100g", supplier: "Nagarjuna Herbal", contractRate: 88, mrp: 160, discount: "45%", locked: true },
  { item: "Dashamoolarishtam 450ml", supplier: "AVN Kottakkal", contractRate: 132, mrp: 195, discount: "32%", locked: true },
  { item: "Chandraprabha Vati 60t", supplier: "Dabur Ayurvedics", contractRate: 98, mrp: 180, discount: "46%", locked: false },
];

export default function RateContract() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-green-600" /> Price List / Rate Contract</h1>
          <p className="text-muted-foreground mt-1">Lock supplier rates for 6-12 months — auto-apply on PO generation. Prevent ad-hoc pricing.</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New rate contract draft created")}>+ New Contract</Button>
      </div>

      <div className="space-y-3">
        {contracts.map((c) => (
          <Card key={c.id} className={c.status === "expiring_soon" ? "border-amber-300" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{c.supplier}</p>
                  <Badge variant="outline" className="text-[10px]">{c.id}</Badge>
                  <Badge variant={c.status === "active" ? "outline" : "destructive"} className={`text-[10px] ${c.status === "active" ? "text-green-600" : ""}`}>{c.status === "expiring_soon" ? "Expiring Soon" : "Active"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.items} items • {c.startDate} to {c.endDate} • {c.totalValue} • Discount: {c.discount}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Compliance</span>
                  <Progress value={c.compliance} className="w-16 h-1.5" />
                  <span className="text-xs font-bold">{c.compliance}%</span>
                </div>
                <p className={`text-xs mt-1 ${c.daysLeft < 90 ? "text-amber-600 font-bold" : "text-muted-foreground"}`}>{c.daysLeft} days remaining</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Locked Rate Items (Sample)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-left">Supplier</th><th className="px-3 py-2 text-center">Contract Rate</th><th className="px-3 py-2 text-center">MRP</th><th className="px-3 py-2 text-center">Discount</th><th className="px-3 py-2 text-center">Locked</th></tr></thead><tbody>
            {rateItems.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-medium">{r.item}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.supplier}</td>
                <td className="px-3 py-2 text-center text-xs font-bold text-green-600">₹{r.contractRate}</td>
                <td className="px-3 py-2 text-center text-xs text-muted-foreground">₹{r.mrp}</td>
                <td className="px-3 py-2 text-center text-xs">{r.discount}</td>
                <td className="px-3 py-2 text-center">{r.locked ? <CheckCircle className="h-3.5 w-3.5 mx-auto text-green-600" /> : <AlertTriangle className="h-3.5 w-3.5 mx-auto text-amber-600" />}</td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Contract Intelligence</p><p className="text-sm text-purple-700">Dabur contract expiring in 69 days (compliance only 82%). AI recommends: Renegotiate with 15% discount (currently 10%) or shift volume to SNA Oushadhasala. AVN compliance at 94% — 3 instances of rate deviation (charged ₹148 vs contracted ₹145). Auto-flag deviations on GRN entry. Total savings from rate contracts vs spot buying: <strong>₹4.2L annually</strong>.</p></div></CardContent></Card>
    </div>
  );
}
