import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, TrendingDown, Search, IndianRupee, BarChart3 } from "lucide-react";

const comparisons = [
  {
    item: "Rasnasaptakam Kashayam 450ml",
    purchases: [
      { supplier: "AVN Kottakkal", date: "18 Jul 2026", rate: 148, qty: 50, total: 7400 },
      { supplier: "AVN Kottakkal", date: "02 Jul 2026", rate: 145, qty: 80, total: 11600 },
      { supplier: "Arya Vaidya Pharmacy", date: "15 Jun 2026", rate: 155, qty: 40, total: 6200 },
      { supplier: "X Ayush Agency", date: "28 May 2026", rate: 140, qty: 100, total: 14000 },
      { supplier: "AVN Kottakkal", date: "10 May 2026", rate: 145, qty: 60, total: 8700 },
    ],
    bestRate: 140, bestSupplier: "X Ayush Agency", avgRate: 146.6, savingPotential: 2200,
  },
  {
    item: "Simhanada Guggulu 60 tablets",
    purchases: [
      { supplier: "X Pharmaceuticals", date: "20 Jul 2026", rate: 82, qty: 100, total: 8200 },
      { supplier: "Dabur Ayurvedics", date: "05 Jul 2026", rate: 88, qty: 60, total: 5280 },
      { supplier: "X Pharmaceuticals", date: "18 Jun 2026", rate: 80, qty: 120, total: 9600 },
      { supplier: "Nagarjuna Herbal", date: "01 Jun 2026", rate: 92, qty: 50, total: 4600 },
      { supplier: "X Pharmaceuticals", date: "15 May 2026", rate: 80, qty: 100, total: 8000 },
    ],
    bestRate: 80, bestSupplier: "X Pharmaceuticals", avgRate: 84.4, savingPotential: 1896,
  },
  {
    item: "Kottamchukkadi Taila 200ml",
    purchases: [
      { supplier: "X Ayush Agency", date: "19 Jul 2026", rate: 162, qty: 30, total: 4860 },
      { supplier: "Arya Vaidya Pharmacy", date: "30 Jun 2026", rate: 170, qty: 25, total: 4250 },
      { supplier: "SNA Oushadhasala", date: "12 Jun 2026", rate: 158, qty: 40, total: 6320 },
      { supplier: "X Ayush Agency", date: "25 May 2026", rate: 160, qty: 35, total: 5600 },
      { supplier: "Arya Vaidya Pharmacy", date: "08 May 2026", rate: 168, qty: 30, total: 5040 },
    ],
    bestRate: 158, bestSupplier: "SNA Oushadhasala", avgRate: 163.6, savingPotential: 896,
  },
];

export default function PurchaseRateCompare() {
  const totalSaving = comparisons.reduce((s, c) => s + c.savingPotential, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" /> Purchase Rate Comparison
          </h1>
          <p className="text-muted-foreground mt-1">Compare same item across suppliers (last 5 purchases) — negotiate better rates</p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">Potential Saving: ₹{totalSaving.toLocaleString()}/month</Badge>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
        <Input placeholder="Search medicine to compare rates..." />
        <Button size="sm">Compare</Button>
      </div>

      {comparisons.map((comp, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{comp.item}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-green-600">Best: ₹{comp.bestRate} ({comp.bestSupplier})</Badge>
                <Badge variant="outline" className="text-[10px]">Avg: ₹{comp.avgRate}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Supplier</th>
                    <th className="px-3 py-2 text-center">Date</th>
                    <th className="px-3 py-2 text-center">Rate/Unit</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-center">vs Best</th>
                  </tr>
                </thead>
                <tbody>
                  {comp.purchases.map((p, i) => {
                    const diff = p.rate - comp.bestRate;
                    return (
                      <tr key={i} className={`border-b ${p.rate === comp.bestRate ? "bg-green-50/50" : ""}`}>
                        <td className="px-3 py-2 text-xs font-medium">{p.supplier}</td>
                        <td className="px-3 py-2 text-center text-xs text-muted-foreground">{p.date}</td>
                        <td className="px-3 py-2 text-center text-xs font-bold">₹{p.rate}</td>
                        <td className="px-3 py-2 text-center text-xs">{p.qty}</td>
                        <td className="px-3 py-2 text-right text-xs">₹{p.total.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center text-xs">
                          {diff === 0 ? <span className="text-green-600 font-bold">Best ✓</span> : <span className="text-red-600">+₹{diff}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Negotiation Insights</p>
            <p className="text-sm text-purple-700">
              If you consolidate Rasnasaptakam purchases with X Ayush Agency (best rate ₹140) instead of splitting across suppliers,
              you save ₹2,200/month. SNA Oushadhasala offers best Kottamchukkadi rate (₹158) but has 7-day lead time vs X Ayush Agency's 3-day.
              AI recommends: Use X Ayush Agency as primary (faster), SNA as backup for bulk orders.
              Annual savings potential at current volumes: <strong>₹59,500</strong> by optimizing supplier selection.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
