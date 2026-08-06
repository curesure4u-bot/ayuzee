import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Brain, Droplets, Package, AlertTriangle } from "lucide-react";

const wastageEntries = [
  { id: "WS-301", date: "22 Jul 2026", item: "Kottamchukkadi Taila 200ml", qty: "50ml", type: "Spillage", location: "PK Room", reason: "Spilled during Kati Vasti pour", value: 41, user: "Therapist A" },
  { id: "WS-300", date: "21 Jul 2026", item: "Rasnasaptakam Kashayam 450ml", qty: "1 bottle", type: "Breakage", location: "Central Store", reason: "Dropped during shelf stacking", value: 148, user: "Store Keeper" },
  { id: "WS-299", date: "20 Jul 2026", item: "Mahanarayan Taila 200ml", qty: "30ml", type: "Dispensing Wastage", location: "Pharmacy", reason: "Residual in measuring cup", value: 27, user: "Pharmacist A" },
  { id: "WS-298", date: "19 Jul 2026", item: "Triphala Churna 100g", qty: "15g", type: "Spillage", location: "Dispensing Counter", reason: "Powder spill during packing", value: 8, user: "Pharmacist B" },
  { id: "WS-297", date: "18 Jul 2026", item: "Dashamoolarishtam 450ml", qty: "2 bottles", type: "Transit Damage", location: "Inter-branch", reason: "Broken during HSR Layout delivery", value: 270, user: "Driver" },
  { id: "WS-296", date: "17 Jul 2026", item: "Bala Taila 200ml", qty: "200ml", type: "Contamination", location: "PK Room", reason: "Patient allergic reaction — oil discarded", value: 180, user: "Therapist B" },
  { id: "WS-295", date: "15 Jul 2026", item: "Chandraprabha Vati 60t", qty: "10 tablets", type: "Dispensing Error", location: "Pharmacy", reason: "Wrong count dispensed, returned loose tabs discarded", value: 18, user: "Pharmacist A" },
];

const summary = {
  totalThisMonth: wastageEntries.reduce((s, w) => s + w.value, 0),
  spillage: wastageEntries.filter(w => w.type === "Spillage").reduce((s, w) => s + w.value, 0),
  breakage: wastageEntries.filter(w => w.type === "Breakage" || w.type === "Transit Damage").reduce((s, w) => s + w.value, 0),
  dispensing: wastageEntries.filter(w => w.type.includes("Dispensing")).reduce((s, w) => s + w.value, 0),
};

export default function StockWastage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trash2 className="h-6 w-6 text-red-600" /> Stock Wastage Register</h1>
          <p className="text-muted-foreground mt-1">Track spillage, breakage, dispensing wastage, transit damage — identify loss patterns</p>
        </div>
        <Button size="sm" onClick={() => toast.success("New wastage entry added")}>+ Log Wastage</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">₹{summary.totalThisMonth}</p><p className="text-xs text-muted-foreground">Total Loss (Jul)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Droplets className="h-4 w-4 mx-auto text-amber-600" /><p className="text-lg font-bold">₹{summary.spillage}</p><p className="text-[10px] text-muted-foreground">Spillage</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-red-600" /><p className="text-lg font-bold">₹{summary.breakage}</p><p className="text-[10px] text-muted-foreground">Breakage/Transit</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-blue-600" /><p className="text-lg font-bold">₹{summary.dispensing}</p><p className="text-[10px] text-muted-foreground">Dispensing</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-center">Date</th><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-center">Type</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-left">User</th></tr></thead><tbody>
            {wastageEntries.map((w, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-mono">{w.id}</td>
                <td className="px-3 py-2 text-center text-xs">{w.date}</td>
                <td className="px-3 py-2 text-xs font-medium">{w.item}</td>
                <td className="px-3 py-2 text-center text-xs font-bold text-red-600">{w.qty}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{w.type}</Badge></td>
                <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[180px]">{w.reason}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{w.value}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{w.user}</td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Wastage Reduction</p><p className="text-sm text-purple-700">PK room spillage (₹41+₹27 = ₹68 this week): Recommend anti-drip pouring spouts for oil bottles — ₹200 investment saves ₹300/month. Transit breakage: 2 incidents in July — switch to bubble-wrap + rigid boxes for liquid items. Dispensing wastage: Pharmacist A has 2 entries — retrain on measuring technique. Monthly wastage target: keep below 0.5% of stock value (currently 0.3% — good).</p></div></CardContent></Card>
    </div>
  );
}
