import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RotateCcw, Brain, Package, FileText, CheckCircle, Clock } from "lucide-react";

const returns = [
  { id: "PR-2026-045", supplier: "AVN Kottakkal", date: "20 Jul 2026", items: 3, reason: "Damaged in transit", value: 4250, debitNote: "DN-2026-018", status: "accepted" },
  { id: "PR-2026-044", supplier: "Nagarjuna Herbal", date: "18 Jul 2026", items: 2, reason: "Wrong item supplied (ordered Guggulu, received Vati)", value: 1800, debitNote: "DN-2026-017", status: "in_transit" },
  { id: "PR-2026-043", supplier: "X Ayush Agency", date: "15 Jul 2026", items: 1, reason: "Quality fail - TLC mismatch", value: 3200, debitNote: "DN-2026-016", status: "pending_pickup" },
  { id: "PR-2026-042", supplier: "Dabur Ayurvedics", date: "10 Jul 2026", items: 5, reason: "Short expiry (received <6 months)", value: 5600, debitNote: "DN-2026-015", status: "credit_received" },
  { id: "PR-2026-041", supplier: "SNA Oushadhasala", date: "05 Jul 2026", items: 2, reason: "Broken bottles during handling", value: 2100, debitNote: "DN-2026-014", status: "credit_received" },
];

const statusColors: Record<string, string> = { pending_pickup: "bg-amber-100 text-amber-700", in_transit: "bg-blue-100 text-blue-700", accepted: "bg-green-100 text-green-700", credit_received: "bg-green-100 text-green-700" };

export default function PurchaseReturn() {
  const totalValue = returns.reduce((s, r) => s + r.value, 0);
  const recovered = returns.filter(r => r.status === "credit_received").reduce((s, r) => s + r.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><RotateCcw className="h-6 w-6 text-red-600" /> Purchase Return (to Supplier)</h1>
          <p className="text-muted-foreground mt-1">Return damaged/wrong/quality-fail items to supplier — debit note & physical return tracking</p>
        </div>
        <Button onClick={() => toast.success("New purchase return initiated")}>+ New Return</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{returns.length}</p><p className="text-xs text-muted-foreground">Returns (This Month)</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">₹{totalValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Return Value</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">₹{recovered.toLocaleString()}</p><p className="text-xs text-muted-foreground">Credit Recovered</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{returns.filter(r => r.status === "pending_pickup").length}</p><p className="text-xs text-muted-foreground">Awaiting Pickup</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Return ID</th><th className="px-3 py-2 text-left">Supplier</th><th className="px-3 py-2 text-center">Date</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-center">Items</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Debit Note</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {returns.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-mono font-bold">{r.id}</td>
                <td className="px-3 py-2 text-xs">{r.supplier}</td>
                <td className="px-3 py-2 text-center text-xs">{r.date}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[180px]">{r.reason}</td>
                <td className="px-3 py-2 text-center text-xs">{r.items}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{r.value.toLocaleString()}</td>
                <td className="px-3 py-2 text-center text-xs text-blue-600">{r.debitNote}</td>
                <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${statusColors[r.status] || ""}`}>{r.status.replace("_", " ")}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Return Analytics</p><p className="text-sm text-purple-700">Nagarjuna Herbal has 3 wrong-item returns in 6 months — AI recommends adding PO line-item photo verification. AVN transit damage: Suggest insured shipping for orders &gt;₹3K. Quality-fail rate across suppliers: 1.2% (industry avg 2.5%) — your QC process is strong.</p></div></CardContent></Card>
    </div>
  );
}
