import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Truck, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const ewayBills = [
  { id: "EWB-3210987654", dispatch: "DSP-3021", from: "Central Store, Bangalore", to: "Franchise - Chennai", value: 65000, vehicle: "KA-01-AB-1234", validUntil: "24 Jul 2026", distance: "350 km", status: "active" },
  { id: "EWB-3210987653", dispatch: "DSP-3019", from: "Central Store, Bangalore", to: "Franchise - Hyderabad", value: 52000, vehicle: "KA-05-CD-5678", validUntil: "22 Jul 2026", distance: "570 km", status: "expired" },
  { id: "EWB-3210987652", dispatch: "DSP-3018", from: "Central Store, Bangalore", to: "Franchise - Mumbai", value: 88000, vehicle: "KA-01-EF-9012", validUntil: "25 Jul 2026", distance: "980 km", status: "active" },
  { id: "EWB-3210987651", dispatch: "DSP-3017", from: "Central Store, Bangalore", to: "Branch - Chennai (own)", value: 35000, vehicle: "KA-01-GH-3456", validUntil: "20 Jul 2026", distance: "350 km", status: "delivered" },
];

const rules = [
  { condition: "Same state, same owner (stock transfer)", threshold: "No e-way bill needed", document: "Delivery Challan only" },
  { condition: "Inter-state, same owner", threshold: "> ₹50,000", document: "E-way Bill + Tax Invoice (IGST)" },
  { condition: "Inter-state, different entity (franchise)", threshold: "> ₹50,000", document: "E-way Bill + Tax Invoice" },
  { condition: "Intra-state, different entity", threshold: "> ₹1,00,000 (some states ₹50K)", document: "E-way Bill + Tax Invoice" },
];

export default function EwayBill() {
  const active = ewayBills.filter(e => e.status === "active").length;
  const expiring = ewayBills.filter(e => e.status === "active" && new Date(e.validUntil) <= new Date("2026-07-23")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-6 w-6 text-blue-600" /> E-way Bill Management</h1>
          <p className="text-muted-foreground mt-1">Generate &amp; track e-way bills for inter-state stock transfers (&gt;₹50K mandatory)</p>
        </div>
        <Button size="sm" onClick={() => toast.success("E-way bill generation started via GST portal")}>+ Generate E-way Bill</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{ewayBills.length}</p><p className="text-xs text-muted-foreground">Total (This Month)</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{active}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{expiring}</p><p className="text-xs text-muted-foreground">Expiring Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{ewayBills.filter(e => e.status === "delivered").length}</p><p className="text-xs text-muted-foreground">Delivered</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">E-way Bill No.</th><th className="px-3 py-2 text-left">From → To</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Vehicle</th><th className="px-3 py-2 text-center">Distance</th><th className="px-3 py-2 text-center">Valid Until</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {ewayBills.map((e, i) => (
              <tr key={i} className={`border-b ${e.status === "expired" ? "bg-red-50/50" : ""}`}>
                <td className="px-3 py-2 text-xs font-mono">{e.id}</td>
                <td className="px-3 py-2 text-[10px]">{e.from}<br/>→ {e.to}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{e.value.toLocaleString()}</td>
                <td className="px-3 py-2 text-center text-xs">{e.vehicle}</td>
                <td className="px-3 py-2 text-center text-xs">{e.distance}</td>
                <td className="px-3 py-2 text-center text-xs">{e.validUntil}</td>
                <td className="px-3 py-2 text-center"><Badge variant={e.status === "active" ? "outline" : e.status === "expired" ? "destructive" : "secondary"} className={`text-[10px] ${e.status === "active" ? "text-green-600" : e.status === "delivered" ? "text-blue-600" : ""}`}>{e.status}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-1"><CardTitle className="text-sm">When is E-way Bill Required?</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b"><tr><th className="px-3 py-1 text-left">Condition</th><th className="px-3 py-1 text-center">Threshold</th><th className="px-3 py-1 text-left">Document Needed</th></tr></thead><tbody>
            {rules.map((r, i) => <tr key={i} className="border-b"><td className="px-3 py-1.5">{r.condition}</td><td className="px-3 py-1.5 text-center font-bold">{r.threshold}</td><td className="px-3 py-1.5 text-muted-foreground">{r.document}</td></tr>)}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI E-way Bill Automation</p><p className="text-sm text-purple-700">Auto-generates e-way bill when dispatch value exceeds ₹50K for inter-state transfers. EWB-3210987653 (Hyderabad) expired — goods delivered, auto-close on branch confirmation. Mumbai dispatch (980km): AI selected Part-B update for multi-vehicle (transshipment at Pune). Integration: E-way bill number auto-printed on delivery challan.</p></div></CardContent></Card>
    </div>
  );
}
