import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, ArrowRight, CheckCircle, Clock, AlertTriangle, Building2 } from "lucide-react";

const requests = [
  { id: "BTR-301", from: "Branch - HSR Layout", to: "Branch - Koramangala", item: "Rasnasaptakam Kashayam 200ml", qty: 10, reason: "Stock-out imminent (2 days left)", status: "pending", date: "22 Jul 2026", urgency: "urgent" },
  { id: "BTR-300", from: "Branch - Indiranagar", to: "Branch - HSR Layout", item: "Kottamchukkadi Taila 200ml", qty: 5, reason: "PK room demand spike", status: "approved", date: "22 Jul 2026", urgency: "normal" },
  { id: "BTR-299", from: "Branch - Koramangala", to: "Branch - Indiranagar", item: "Simhanada Guggulu 60t", qty: 20, reason: "Excess stock (167 days) — redistribute", status: "in_transit", date: "21 Jul 2026", urgency: "normal" },
  { id: "BTR-298", from: "Branch - HSR Layout", to: "Branch - Koramangala", item: "Ashwagandha Churna 100g", qty: 8, reason: "Near-expiry batch — move to high-demand branch", status: "received", date: "20 Jul 2026", urgency: "normal" },
  { id: "BTR-297", from: "Branch - Koramangala", to: "Branch - HSR Layout", item: "Dashamoolarishtam 450ml", qty: 6, reason: "Monsoon demand higher at HSR", status: "received", date: "19 Jul 2026", urgency: "normal" },
];

const statusColors: Record<string, string> = { pending: "bg-amber-100 text-amber-700", approved: "bg-blue-100 text-blue-700", in_transit: "bg-purple-100 text-purple-700", received: "bg-green-100 text-green-700" };

const stockComparison = [
  { item: "Rasnasaptakam 200ml", koramangala: 85, hsr: 12, indiranagar: 45, suggestion: "Move 20 from Koramangala → HSR" },
  { item: "Kottamchukkadi Taila 200ml", koramangala: 18, hsr: 5, indiranagar: 32, suggestion: "Move 10 from Indiranagar → HSR" },
  { item: "Simhanada Guggulu 60t", koramangala: 180, hsr: 35, indiranagar: 22, suggestion: "Koramangala overstocked — distribute 50 each to HSR & Indiranagar" },
];

export default function BranchTransferRequest() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-blue-600" /> Branch-to-Branch Transfer</h1>
          <p className="text-muted-foreground mt-1">Direct stock request between branches — no central store needed. Balance inventory across locations.</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New transfer request created")}>+ New Request</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold text-amber-600">{requests.filter(r => r.status === "pending").length}</p><p className="text-[10px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold text-blue-600">{requests.filter(r => r.status === "approved").length}</p><p className="text-[10px] text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ArrowRight className="h-4 w-4 mx-auto text-purple-600" /><p className="text-lg font-bold text-purple-600">{requests.filter(r => r.status === "in_transit").length}</p><p className="text-[10px] text-muted-foreground">In Transit</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-lg font-bold text-green-600">{requests.filter(r => r.status === "received").length}</p><p className="text-[10px] text-muted-foreground">Received</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Transfer Requests</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">From → To</th><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Action</th></tr></thead><tbody>
            {requests.map((r, i) => (
              <tr key={i} className={`border-b ${r.urgency === "urgent" ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-mono">{r.id}{r.urgency === "urgent" && <Badge variant="destructive" className="text-[8px] ml-1">Urgent</Badge>}</td>
                <td className="px-3 py-2 text-[10px]">{r.from}<br/><ArrowRight className="h-2.5 w-2.5 inline" /> {r.to}</td>
                <td className="px-3 py-2 text-xs font-medium">{r.item}</td>
                <td className="px-3 py-2 text-center text-xs font-bold">{r.qty}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[150px]">{r.reason}</td>
                <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${statusColors[r.status]}`}>{r.status.replace("_", " ")}</Badge></td>
                <td className="px-3 py-2 text-center">
                  {r.status === "pending" && <Button size="sm" className="h-6 text-[10px]" onClick={() => toast.success(`${r.id} approved`)}>Approve</Button>}
                  {r.status === "approved" && <Button size="sm" className="h-6 text-[10px]" onClick={() => toast.success(`${r.id} dispatched`)}>Dispatch</Button>}
                </td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">AI Stock Balance — Branch Comparison</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-1 text-left">Item</th><th className="px-3 py-1 text-center">Koramangala</th><th className="px-3 py-1 text-center">HSR</th><th className="px-3 py-1 text-center">Indiranagar</th><th className="px-3 py-1 text-left">AI Suggestion</th></tr></thead><tbody>
            {stockComparison.map((s, i) => (
              <tr key={i} className="border-b"><td className="px-3 py-1.5 font-medium">{s.item}</td><td className="px-3 py-1.5 text-center font-bold">{s.koramangala}</td><td className="px-3 py-1.5 text-center font-bold text-red-600">{s.hsr}</td><td className="px-3 py-1.5 text-center">{s.indiranagar}</td><td className="px-3 py-1.5 text-purple-700">{s.suggestion}</td></tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-3 flex items-start gap-2"><Brain className="h-4 w-4 text-purple-600 mt-0.5" /><div><p className="font-semibold text-xs text-purple-800">AI Redistribution</p><p className="text-[10px] text-purple-700">HSR branch has 3 items critically low. Koramangala has excess on same items. AI auto-generated BTR-301 (urgent). Estimated savings from redistribution vs new PO: ₹8,500/month (avoids emergency purchase at higher rates). Transfer via own driver: ₹0 shipping cost within city.</p></div></CardContent></Card>
    </div>
  );
}
