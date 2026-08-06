import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, Settings, CheckCircle, AlertTriangle, Shield } from "lucide-react";

const policies = [
  { id: "POL-01", condition: "Within 3 days, unopened, with bill", credit: "100% refund (cash/wallet)", restock: "Yes", active: true },
  { id: "POL-02", condition: "4-7 days, unopened, with bill", credit: "100% credit to wallet", restock: "Yes", active: true },
  { id: "POL-03", condition: "4-7 days, opened (partially used)", credit: "50% credit to wallet", restock: "No (wastage)", active: true },
  { id: "POL-04", condition: "8-15 days, unopened, with bill", credit: "50% credit to wallet", restock: "Yes", active: true },
  { id: "POL-05", condition: "8-15 days, opened", credit: "No credit", restock: "No", active: true },
  { id: "POL-06", condition: "After 15 days (any condition)", credit: "No credit", restock: "No", active: true },
  { id: "POL-07", condition: "Pharmacy dispensing error (any time)", credit: "100% refund + free replacement", restock: "Yes if sealed", active: true },
  { id: "POL-08", condition: "Expired at time of sale (detected later)", credit: "100% refund + ₹100 compensation", restock: "No (destroy + report)", active: true },
  { id: "POL-09", condition: "Allergic reaction (doctor confirmed)", credit: "100% credit for unused portion", restock: "No (patient-specific)", active: true },
  { id: "POL-10", condition: "Doctor changed Rx (before opening)", credit: "100% credit if within 7 days", restock: "Yes", active: true },
];

const recentApplied = [
  { date: "22 Jul", patient: "Rajesh K.", item: "Ashwagandha Churna 100g", policyApplied: "POL-10", result: "100% credit (₹160)", reason: "Doctor changed Rx" },
  { date: "21 Jul", patient: "Meera N.", item: "Chandraprabha Vati 60t", policyApplied: "POL-03", result: "50% credit (₹90)", reason: "Opened, 5 days old" },
  { date: "20 Jul", patient: "Suresh M.", item: "Dashamoolarishtam 450ml", policyApplied: "POL-01", result: "Full refund (₹185)", reason: "Same day, sealed" },
  { date: "18 Jul", patient: "Anand P.", item: "Rasnasaptakam 200ml", policyApplied: "POL-06", result: "Rejected (₹0)", reason: "12 days, opened" },
  { date: "15 Jul", patient: "Priya S.", item: "Kottamchukkadi Taila", policyApplied: "POL-07", result: "Full refund + replacement", reason: "Wrong medicine dispensed" },
];

export default function ReturnPolicyEngine() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6 text-indigo-600" /> Return / Exchange Policy Engine</h1>
          <p className="text-muted-foreground mt-1">Configurable rules auto-applied at return — no manual decisions, no disputes, consistent experience</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("Policy editor opened")}>Edit Policies</Button>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Active Return Policies</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-center">ID</th><th className="px-3 py-2 text-left">Condition</th><th className="px-3 py-2 text-left">Credit / Refund</th><th className="px-3 py-2 text-center">Restock?</th><th className="px-3 py-2 text-center">Active</th></tr></thead><tbody>
            {policies.map((p, i) => (
              <tr key={i} className={`border-b ${p.condition.includes("error") || p.condition.includes("Expired") ? "bg-red-50/30" : ""}`}>
                <td className="px-3 py-2 text-center text-xs font-mono">{p.id}</td>
                <td className="px-3 py-2 text-xs">{p.condition}</td>
                <td className="px-3 py-2 text-xs font-medium">{p.credit}</td>
                <td className="px-3 py-2 text-center text-xs">{p.restock}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px] text-green-600">{p.active ? "Active" : "Disabled"}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Policy Applications</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-center">Date</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Policy</th><th className="px-3 py-2 text-left">Result</th><th className="px-3 py-2 text-left">Reason</th></tr></thead><tbody>
            {recentApplied.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-center text-xs">{r.date}</td>
                <td className="px-3 py-2 text-xs">{r.patient}</td>
                <td className="px-3 py-2 text-xs font-medium">{r.item}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{r.policyApplied}</Badge></td>
                <td className="px-3 py-2 text-xs font-medium">{r.result}</td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground">{r.reason}</td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Policy Intelligence</p><p className="text-sm text-purple-700">Auto-applies correct policy based on: days since purchase (from bill date), condition (pharmacist selects sealed/opened), and reason category. Zero disputes since implementation (previously 3-4/month). Pharmacy error rate dropped from 2% to 0.3% after POL-07 introduced accountability. Suggestion: Add POL-11 for "subscription patients — exchange for alternative anytime within cycle."</p></div></CardContent></Card>
    </div>
  );
}
