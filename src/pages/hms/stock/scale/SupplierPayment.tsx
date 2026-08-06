import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Wallet, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const suppliers = [
  { name: "AVN Kottakkal", outstanding: 45000, current: 18000, days30: 15000, days60: 8000, days90: 4000, creditTerms: "30 days", lastPayment: "15 Jul 2026", earlyDiscount: "2% if paid in 15 days", status: "overdue" },
  { name: "X Ayush Agency", outstanding: 0, current: 0, days30: 0, days60: 0, days90: 0, creditTerms: "N/A (same owner)", lastPayment: "—", earlyDiscount: "N/A", status: "clear" },
  { name: "X Pharmaceuticals", outstanding: 0, current: 0, days30: 0, days60: 0, days90: 0, creditTerms: "N/A (same owner)", lastPayment: "—", earlyDiscount: "N/A", status: "clear" },
  { name: "Nagarjuna Herbal", outstanding: 22000, current: 12000, days30: 10000, days60: 0, days90: 0, creditTerms: "30 days", lastPayment: "10 Jul 2026", earlyDiscount: "1.5% if paid in 10 days", status: "on_time" },
  { name: "Arya Vaidya Pharmacy", outstanding: 38000, current: 20000, days30: 18000, days60: 0, days90: 0, creditTerms: "45 days", lastPayment: "05 Jul 2026", earlyDiscount: "None", status: "on_time" },
  { name: "Dabur Ayurvedics", outstanding: 15000, current: 8000, days30: 5000, days60: 2000, days90: 0, creditTerms: "30 days", lastPayment: "18 Jul 2026", earlyDiscount: "2% if paid in 7 days", status: "on_time" },
  { name: "SNA Oushadhasala", outstanding: 8500, current: 8500, days30: 0, days60: 0, days90: 0, creditTerms: "21 days", lastPayment: "20 Jul 2026", earlyDiscount: "None", status: "on_time" },
];

export default function SupplierPayment() {
  const totalOutstanding = suppliers.reduce((s, sup) => s + sup.outstanding, 0);
  const overdue = suppliers.filter(s => s.status === "overdue");
  const earlyDiscountPotential = 45000 * 0.02 + 22000 * 0.015 + 15000 * 0.02;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6 text-green-600" /> Supplier Payment Tracker</h1>
          <p className="text-muted-foreground mt-1">Outstanding per supplier, aging analysis (30/60/90), early payment discounts</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 text-sm px-3 py-1">Total Outstanding: ₹{(totalOutstanding/1000).toFixed(1)}K</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalOutstanding/1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Total Payable</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{overdue.length}</p><p className="text-xs text-muted-foreground">Overdue</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{suppliers.filter(s => s.status === "clear").length}</p><p className="text-xs text-muted-foreground">Clear</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">₹{Math.round(earlyDiscountPotential).toLocaleString()}</p><p className="text-xs text-muted-foreground">Early Pay Savings</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Aging Analysis</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Supplier</th><th className="px-3 py-2 text-right">Outstanding</th><th className="px-3 py-2 text-right">Current</th><th className="px-3 py-2 text-right">30 days</th><th className="px-3 py-2 text-right">60 days</th><th className="px-3 py-2 text-right">90+ days</th><th className="px-3 py-2 text-center">Terms</th><th className="px-3 py-2 text-left">Early Discount</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {suppliers.map((s, i) => (
              <tr key={i} className={`border-b ${s.status === "overdue" ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-medium">{s.name}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">{s.outstanding > 0 ? `₹${s.outstanding.toLocaleString()}` : "—"}</td>
                <td className="px-3 py-2 text-right text-xs">{s.current > 0 ? `₹${s.current.toLocaleString()}` : "—"}</td>
                <td className="px-3 py-2 text-right text-xs text-amber-600">{s.days30 > 0 ? `₹${s.days30.toLocaleString()}` : "—"}</td>
                <td className="px-3 py-2 text-right text-xs text-orange-600">{s.days60 > 0 ? `₹${s.days60.toLocaleString()}` : "—"}</td>
                <td className="px-3 py-2 text-right text-xs text-red-600 font-bold">{s.days90 > 0 ? `₹${s.days90.toLocaleString()}` : "—"}</td>
                <td className="px-3 py-2 text-center text-[10px]">{s.creditTerms}</td>
                <td className="px-3 py-2 text-[10px] text-green-700">{s.earlyDiscount}</td>
                <td className="px-3 py-2 text-center"><Badge variant={s.status === "overdue" ? "destructive" : s.status === "clear" ? "outline" : "secondary"} className={`text-[10px] ${s.status === "clear" ? "text-green-600" : s.status === "on_time" ? "text-blue-600" : ""}`}>{s.status.replace("_", " ")}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Payment Optimizer</p><p className="text-sm text-purple-700">AVN Kottakkal has ₹4,000 in 90+ days bucket — risk of supply hold. Prioritize payment. If you pay AVN within 15 days: save ₹900 (2% of ₹45K). Nagarjuna early payment saves ₹330. Total early-payment savings potential: <strong>₹1,530/month</strong> (₹18,360/year). Arya Vaidya 45-day terms are valuable for cash flow during monsoon stock-up — don't pay early there.</p></div></CardContent></Card>
    </div>
  );
}
