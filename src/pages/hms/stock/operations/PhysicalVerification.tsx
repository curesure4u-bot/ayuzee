import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ClipboardList, CheckCircle, AlertTriangle, Brain, Download } from "lucide-react";

const verificationItems = [
  { item: "Rasnasaptakam 450ml", systemQty: 75, physicalQty: 73, difference: -2, status: "Shortage" },
  { item: "Simhanada Guggulu 60t", systemQty: 120, physicalQty: 120, difference: 0, status: "Match" },
  { item: "Ashwagandha Churna 100g", systemQty: 45, physicalQty: 45, difference: 0, status: "Match" },
  { item: "Kottamchukkadi Taila 200ml", systemQty: 30, physicalQty: 28, difference: -2, status: "Shortage" },
  { item: "Triphala Churna 100g", systemQty: 200, physicalQty: 203, difference: 3, status: "Excess" },
  { item: "Dashamoolarishtam 450ml", systemQty: 55, physicalQty: 55, difference: 0, status: "Match" },
  { item: "Mahanarayan Taila 200ml", systemQty: 22, physicalQty: 20, difference: -2, status: "Shortage" },
  { item: "Chandraprabha Vati 60t", systemQty: 90, physicalQty: 90, difference: 0, status: "Match" },
];

const PhysicalVerification = () => {
  const matches = verificationItems.filter(v => v.status === "Match").length;
  const mismatches = verificationItems.filter(v => v.status !== "Match").length;
  const accuracy = Math.round((matches / verificationItems.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-blue-600" /> Physical Stock Verification</h1><p className="text-muted-foreground mt-1">Periodic physical count vs system — find discrepancies and adjust</p></div>
        <Button variant="outline" onClick={() => toast.success("Verification sheet exported")}><Download className="h-4 w-4 mr-1" /> Export Sheet</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{verificationItems.length}</p><p className="text-xs text-muted-foreground">Items Verified</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-xl font-bold mt-1 text-green-600">{matches}</p><p className="text-xs text-muted-foreground">Match</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-red-600" /><p className="text-xl font-bold mt-1 text-red-600">{mismatches}</p><p className="text-xs text-muted-foreground">Mismatch</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{accuracy}%</p><p className="text-xs text-muted-foreground">Accuracy</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Verification Results — July 2026</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">System Qty</th><th className="px-3 py-2 text-center">Physical Qty</th><th className="px-3 py-2 text-center">Difference</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
          {verificationItems.map((v, i) => (<tr key={i} className={`border-b ${v.status !== "Match" ? "bg-red-50/50" : ""}`}><td className="px-3 py-2 font-medium text-xs">{v.item}</td><td className="px-3 py-2 text-center">{v.systemQty}</td><td className="px-3 py-2 text-center"><Input type="number" defaultValue={v.physicalQty} className="h-7 w-16 text-center mx-auto text-xs" /></td><td className="px-3 py-2 text-center font-bold"><span className={v.difference < 0 ? "text-red-600" : v.difference > 0 ? "text-blue-600" : "text-green-600"}>{v.difference > 0 ? "+" : ""}{v.difference}</span></td><td className="px-3 py-2 text-center"><Badge variant={v.status === "Match" ? "outline" : "destructive"} className={`text-[10px] ${v.status === "Match" ? "text-green-600" : ""}`}>{v.status}</Badge></td></tr>))}
        </tbody></table></div></CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => toast.success("Differences adjusted in system")}>Adjust Stock (Apply Differences)</Button>
        <Button variant="outline" onClick={() => toast.success("Report saved")}>Save Verification Report</Button>
      </div>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Discrepancy Analysis</p><p className="text-sm text-purple-700">3 shortages detected in liquid medicines (Rasnasaptakam, Kottamchukkadi, Mahanarayan). Pattern: All are oils/kashayams — likely evaporation loss during dispensing. Suggest: Implement "dispensing wastage allowance" of 2% for liquid formulations. Triphala excess (+3): Possible GRN entry without PO — investigate.</p></div></CardContent></Card>
    </div>
  );
};

export default PhysicalVerification;
