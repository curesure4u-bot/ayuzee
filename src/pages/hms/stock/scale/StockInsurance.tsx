import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, Shield, FileText, AlertTriangle, CheckCircle } from "lucide-react";

const policies = [
  { id: "INS-2026-01", type: "Fire & Burglary", provider: "New India Assurance", coverage: 2500000, premium: 18500, startDate: "01 Apr 2026", endDate: "31 Mar 2027", branch: "Central Store", status: "active", daysLeft: 252 },
  { id: "INS-2026-02", type: "Transit (Marine Inland)", provider: "ICICI Lombard", coverage: 500000, premium: 8200, startDate: "01 Jan 2026", endDate: "31 Dec 2026", branch: "All Inter-branch", status: "active", daysLeft: 162 },
  { id: "INS-2026-03", type: "Fire & Burglary", provider: "United India", coverage: 1500000, premium: 12000, startDate: "01 Apr 2026", endDate: "31 Mar 2027", branch: "Branch - Koramangala", status: "active", daysLeft: 252 },
  { id: "INS-2025-04", type: "Fire & Burglary", provider: "Oriental Insurance", coverage: 800000, premium: 6500, startDate: "01 Oct 2025", endDate: "30 Sep 2026", branch: "Branch - HSR Layout", status: "expiring_soon", daysLeft: 69 },
];

const claims = [
  { id: "CLM-2026-03", policy: "INS-2026-02", type: "Transit Damage", date: "18 Jul 2026", items: "2 bottles Dashamoolarishtam", value: 270, status: "filed", settlement: 0 },
  { id: "CLM-2026-02", policy: "INS-2026-01", type: "Water Damage (monsoon)", date: "05 Jul 2026", items: "15 Churna packets (moisture)", value: 1850, status: "under_review", settlement: 0 },
  { id: "CLM-2026-01", policy: "INS-2026-02", type: "Transit Damage", date: "12 Jun 2026", items: "Breakage - Kottamchukkadi Taila x4", value: 640, status: "settled", settlement: 580 },
];

export default function StockInsurance() {
  const totalCoverage = policies.reduce((s, p) => s + p.coverage, 0);
  const totalPremium = policies.reduce((s, p) => s + p.premium, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-green-600" /> Stock Insurance & Claims</h1>
          <p className="text-muted-foreground mt-1">Track insurance coverage, fire/theft/transit claims — protect inventory investment</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("New claim form opened")}>+ File Claim</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalCoverage/100000).toFixed(0)}L</p><p className="text-xs text-muted-foreground">Total Coverage</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalPremium/1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Annual Premium</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{policies.length}</p><p className="text-xs text-muted-foreground">Active Policies</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{claims.length}</p><p className="text-xs text-muted-foreground">Claims (YTD)</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Insurance Policies</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Policy</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Provider</th><th className="px-3 py-2 text-right">Coverage</th><th className="px-3 py-2 text-left">Branch</th><th className="px-3 py-2 text-center">Validity</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {policies.map((p, i) => (
              <tr key={i} className={`border-b ${p.status === "expiring_soon" ? "bg-amber-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-mono">{p.id}</td>
                <td className="px-3 py-2 text-xs font-medium">{p.type}</td>
                <td className="px-3 py-2 text-xs">{p.provider}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{(p.coverage/100000).toFixed(1)}L</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{p.branch}</td>
                <td className="px-3 py-2 text-center text-xs">{p.daysLeft}d left</td>
                <td className="px-3 py-2 text-center"><Badge variant={p.status === "active" ? "outline" : "destructive"} className={`text-[10px] ${p.status === "active" ? "text-green-600" : ""}`}>{p.status === "expiring_soon" ? "Expiring" : "Active"}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Claims History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Claim ID</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-center">Date</th><th className="px-3 py-2 text-left">Items</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-right">Settled</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {claims.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-mono">{c.id}</td>
                <td className="px-3 py-2 text-xs">{c.type}</td>
                <td className="px-3 py-2 text-center text-xs">{c.date}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{c.items}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{c.value.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-xs text-green-600">{c.settlement > 0 ? `₹${c.settlement}` : "—"}</td>
                <td className="px-3 py-2 text-center"><Badge variant={c.status === "settled" ? "outline" : "default"} className={`text-[10px] ${c.status === "settled" ? "text-green-600" : ""}`}>{c.status.replace("_", " ")}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Insurance Advisory</p><p className="text-sm text-purple-700">HSR Layout policy expiring in 69 days — renew by Aug 30 to avoid coverage gap. Current stock value at HSR: ₹12L (policy covers ₹8L only — under-insured by ₹4L). Recommend increasing coverage. Transit claims: 2 in 6 months (₹910 total) vs premium ₹8,200 — claim ratio healthy. Monsoon season: Ensure all ground-floor stock elevated 6 inches (previous water damage claim).</p></div></CardContent></Card>
    </div>
  );
}
