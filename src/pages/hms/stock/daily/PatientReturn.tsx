import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, RotateCcw, CheckCircle, AlertTriangle, CreditCard, Package } from "lucide-react";

const returns = [
  { id: "PR-1045", patient: "Rajesh Kumar", date: "22 Jul 2026", item: "Ashwagandha Churna 100g", qty: 1, mrp: 160, bill: "SB-8840", reason: "Doctor changed prescription", daysFromPurchase: 2, condition: "Unopened, sealed", eligible: true, credit: 160, action: "Full credit to wallet" },
  { id: "PR-1044", patient: "Meera Nair", date: "21 Jul 2026", item: "Chandraprabha Vati 60t", qty: 1, mrp: 180, bill: "SB-8835", reason: "Allergic reaction reported", daysFromPurchase: 5, condition: "Opened (20 tabs used)", eligible: true, credit: 120, action: "Partial credit (unused portion)" },
  { id: "PR-1043", patient: "Suresh Menon", date: "20 Jul 2026", item: "Dasamoolarishtam 450ml", qty: 1, mrp: 185, bill: "SB-8828", reason: "Duplicate purchase (already had at home)", daysFromPurchase: 1, condition: "Unopened, sealed", eligible: true, credit: 185, action: "Full credit + restock" },
  { id: "PR-1042", patient: "Anand Patel", date: "18 Jul 2026", item: "Rasnasaptakam Kashayam 200ml", qty: 1, mrp: 210, bill: "SB-8820", reason: "Wants to return — taste issue", daysFromPurchase: 12, condition: "Opened (half used)", eligible: false, credit: 0, action: "Rejected — opened + >7 days" },
  { id: "PR-1041", patient: "Priya Sharma", date: "15 Jul 2026", item: "Kottamchukkadi Taila 200ml", qty: 1, mrp: 280, bill: "SB-8812", reason: "Wrong medicine dispensed by pharmacy", daysFromPurchase: 0, condition: "Unopened", eligible: true, credit: 280, action: "Full refund (pharmacy error) + replacement" },
];

const policy = [
  { condition: "Within 7 days, unopened, with bill", credit: "100% credit to patient wallet", restock: "Yes — put back in stock" },
  { condition: "Within 7 days, opened but partially used", credit: "Pro-rata credit (unused portion value)", restock: "No — mark as wastage" },
  { condition: "After 7 days, any condition", credit: "No credit (unless pharmacy error)", restock: "No" },
  { condition: "Pharmacy dispensing error (any time)", credit: "100% refund + free replacement", restock: "Yes if unopened" },
  { condition: "Expired / near-expiry at time of sale", credit: "100% refund + report to QC", restock: "No — destroy" },
];

export default function PatientReturn() {
  const totalCredit = returns.filter(r => r.eligible).reduce((s, r) => s + r.credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><RotateCcw className="h-6 w-6 text-amber-600" /> Patient Return / Exchange</h1>
          <p className="text-muted-foreground mt-1">Accept returns, issue credit to patient wallet, restock if eligible. Policy-driven.</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New return initiated")}>+ Process Return</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{returns.length}</p><p className="text-xs text-muted-foreground">Returns (This Week)</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{returns.filter(r => r.eligible).length}</p><p className="text-xs text-muted-foreground">Accepted</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{returns.filter(r => !r.eligible).length}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CreditCard className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">₹{totalCredit}</p><p className="text-xs text-muted-foreground">Credits Issued</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Returns</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Days</th><th className="px-3 py-2 text-left">Condition</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-right">Credit</th><th className="px-3 py-2 text-left">Action</th></tr></thead><tbody>
            {returns.map((r, i) => (
              <tr key={i} className={`border-b ${!r.eligible ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-mono">{r.id}</td>
                <td className="px-3 py-2 text-xs">{r.patient}<br/><span className="text-[10px] text-muted-foreground">{r.bill}</span></td>
                <td className="px-3 py-2 text-xs font-medium">{r.item}</td>
                <td className="px-3 py-2 text-center text-xs">{r.daysFromPurchase}d</td>
                <td className="px-3 py-2 text-[10px]">{r.condition}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[120px]">{r.reason}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">{r.eligible ? <span className="text-green-600">₹{r.credit}</span> : <span className="text-red-600">₹0</span>}</td>
                <td className="px-3 py-2 text-[10px]"><Badge variant={r.eligible ? "outline" : "destructive"} className={`text-[10px] ${r.eligible ? "text-green-600" : ""}`}>{r.eligible ? "Approved" : "Rejected"}</Badge><br/><span className="text-muted-foreground">{r.action}</span></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Return Policy Rules (Auto-enforced)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b"><tr><th className="px-3 py-1 text-left">Condition</th><th className="px-3 py-1 text-left">Credit</th><th className="px-3 py-1 text-center">Restock?</th></tr></thead><tbody>
            {policy.map((p, i) => <tr key={i} className="border-b"><td className="px-3 py-1.5">{p.condition}</td><td className="px-3 py-1.5 font-medium">{p.credit}</td><td className="px-3 py-1.5 text-center">{p.restock}</td></tr>)}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-3 flex items-start gap-2"><Brain className="h-4 w-4 text-purple-600 mt-0.5" /><div><p className="font-semibold text-xs text-purple-800">AI Return Intelligence</p><p className="text-[10px] text-purple-700">PR-1042 rejected correctly (opened + 12 days old). PR-1041: Pharmacy error detected — Kottamchukkadi dispensed instead of Mahanarayan. Pharmacist flagged for retraining. Return rate: 2.3% (industry avg 4%) — healthy. Credit wallet balance: Rajesh ₹160, Suresh ₹185 — usable on next purchase.</p></div></CardContent></Card>
    </div>
  );
}
