import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, CheckCircle, Clock, XCircle, Users, ArrowRight } from "lucide-react";

const indents = [
  { id: "IND-2088", branch: "Branch - HSR Layout", raisedBy: "Pharmacist B", role: "pharmacist", date: "22 Jul 2026", items: 8, value: 12500, approver: "Branch Manager", status: "pending_approval", level: 1 },
  { id: "IND-2087", branch: "Branch - Koramangala", raisedBy: "Pharmacist A", role: "pharmacist", date: "22 Jul 2026", items: 15, value: 48000, approver: "Central Store Head", status: "pending_approval", level: 2 },
  { id: "IND-2086", branch: "Franchise - Chennai", raisedBy: "Dr. Partner A", role: "franchise_owner", date: "21 Jul 2026", items: 20, value: 65000, approver: "Central Store Head", status: "approved", level: 2 },
  { id: "IND-2085", branch: "Branch - Indiranagar", raisedBy: "Store Keeper", role: "store_keeper", date: "21 Jul 2026", items: 5, value: 8200, approver: "Branch Manager", status: "approved", level: 1 },
  { id: "IND-2084", branch: "Franchise - Hyderabad", raisedBy: "Dr. Partner B", role: "franchise_owner", date: "20 Jul 2026", items: 12, value: 38000, approver: "Central Store Head", status: "dispatched", level: 2 },
  { id: "IND-2083", branch: "Branch - HSR Layout", raisedBy: "Pharmacist B", role: "pharmacist", date: "19 Jul 2026", items: 3, value: 4500, approver: "Auto-approved", status: "dispatched", level: 0 },
];

const approvalRules = [
  { role: "Pharmacist / Store Keeper", limit: "₹10,000", approver: "Auto-approved (within limit)", level: "Level 0" },
  { role: "Pharmacist / Store Keeper", limit: "₹10,001 - ₹25,000", approver: "Branch Manager", level: "Level 1" },
  { role: "Branch Manager / Franchise", limit: "₹25,001 - ₹1,00,000", approver: "Central Store Head", level: "Level 2" },
  { role: "Central Store Head", limit: "> ₹1,00,000", approver: "Director / Owner", level: "Level 3" },
];

export default function IndentApproval() {
  const pending = indents.filter(i => i.status === "pending_approval").length;
  const approved = indents.filter(i => i.status === "approved").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-blue-600" /> Indent Approval Workflow</h1>
          <p className="text-muted-foreground mt-1">Multi-level approval: Pharmacist → Branch Manager → Central Head. Role-based limits.</p>
        </div>
        <Badge variant="destructive" className="text-sm px-3 py-1">{pending} Pending Approval</Badge>
      </div>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Approval Rules (Role-Based Limits)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Role</th><th className="px-3 py-2 text-center">Indent Limit</th><th className="px-3 py-2 text-left">Approved By</th><th className="px-3 py-2 text-center">Level</th></tr></thead><tbody>
            {approvalRules.map((r, i) => (
              <tr key={i} className="border-b"><td className="px-3 py-2 text-xs">{r.role}</td><td className="px-3 py-2 text-center text-xs font-bold">{r.limit}</td><td className="px-3 py-2 text-xs">{r.approver}</td><td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{r.level}</Badge></td></tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Indent Queue</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Indent</th><th className="px-3 py-2 text-left">Branch</th><th className="px-3 py-2 text-left">Raised By</th><th className="px-3 py-2 text-center">Items</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Level</th><th className="px-3 py-2 text-left">Approver</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Action</th></tr></thead><tbody>
            {indents.map((ind, i) => (
              <tr key={i} className={`border-b ${ind.status === "pending_approval" ? "bg-amber-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-mono font-bold">{ind.id}</td>
                <td className="px-3 py-2 text-xs">{ind.branch}</td>
                <td className="px-3 py-2 text-xs">{ind.raisedBy}<br/><span className="text-[10px] text-muted-foreground">{ind.role}</span></td>
                <td className="px-3 py-2 text-center text-xs">{ind.items}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{ind.value.toLocaleString()}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">L{ind.level}</Badge></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{ind.approver}</td>
                <td className="px-3 py-2 text-center"><Badge variant={ind.status === "pending_approval" ? "destructive" : ind.status === "approved" ? "default" : "outline"} className={`text-[10px] ${ind.status === "dispatched" ? "text-green-600" : ""}`}>{ind.status.replace("_", " ")}</Badge></td>
                <td className="px-3 py-2 text-center">
                  {ind.status === "pending_approval" && <div className="flex gap-1"><Button size="sm" className="h-6 text-[10px]" onClick={() => toast.success(`${ind.id} approved`)}>✓</Button><Button size="sm" variant="destructive" className="h-6 text-[10px]" onClick={() => toast.error(`${ind.id} rejected`)}>✗</Button></div>}
                </td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Approval Intelligence</p><p className="text-sm text-purple-700">IND-2087 (₹48K from Koramangala): Unusually high — 3x their normal monthly indent. AI flags for review. Contains 15 items including Guggulu (₹2,800/kg) — verify if manufacturing batch planned. IND-2083 (₹4,500): Auto-approved within pharmacist limit — no delay. Average approval turnaround: 4.2 hours (target: &lt;6 hours).</p></div></CardContent></Card>
    </div>
  );
}
