import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Globe, Brain, RefreshCw, Package, CheckCircle, AlertTriangle } from "lucide-react";

const syncItems = [
  { item: "Rasnasaptakam 450ml", hmsStock: 75, onlineStock: 75, status: "Synced" },
  { item: "Simhanada Guggulu 60t", hmsStock: 120, onlineStock: 120, status: "Synced" },
  { item: "Ashwagandha Churna 100g", hmsStock: 45, onlineStock: 52, status: "Out of Sync" },
  { item: "Kottamchukkadi Taila 200ml", hmsStock: 0, onlineStock: 5, status: "Out of Stock" },
  { item: "Triphala Churna 100g", hmsStock: 200, onlineStock: 200, status: "Synced" },
  { item: "Chyawanprash 500g", hmsStock: 30, onlineStock: 28, status: "Out of Sync" },
];

const onlineOrders = [
  { id: "AYZ-10234", patient: "Priya S.", items: "Rasnasaptakam × 2, Ashwagandha × 1", date: "22/07/2026", status: "Pending", value: "₹735" },
  { id: "AYZ-10235", patient: "Rahul K.", items: "Simhanada Guggulu × 3", date: "22/07/2026", status: "Packed", value: "₹540" },
  { id: "AYZ-10236", patient: "Mohammed F.", items: "Chyawanprash × 1, Triphala × 2", date: "21/07/2026", status: "Shipped", value: "₹680" },
];

const EcommerceSync = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-green-600" /> E-Commerce Stock Sync (Ayuzee Shop)</h1><p className="text-muted-foreground mt-1">Real-time sync between HMS pharmacy and ayuzee.com online shop</p></div>
        <Button onClick={() => toast.success("Force sync completed — 12 items updated")}><RefreshCw className="h-4 w-4 mr-1" /> Force Sync Now</Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-600" /><p className="text-sm font-bold mt-1">Last Synced: 2 min ago</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">450/462</p><p className="text-xs text-muted-foreground">Items Synced</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-amber-600" /><p className="text-xl font-bold mt-1 text-amber-600">12</p><p className="text-xs text-muted-foreground">Out of Sync</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">3</p><p className="text-xs text-muted-foreground">Pending Online Orders</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Stock Level Comparison (HMS vs Online)</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">HMS Stock</th><th className="px-3 py-2 text-center">Online Stock</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
          {syncItems.map((s, i) => (<tr key={i} className={`border-b ${s.status !== "Synced" ? "bg-amber-50/50" : ""}`}><td className="px-3 py-2 font-medium">{s.item}</td><td className="px-3 py-2 text-center">{s.hmsStock}</td><td className="px-3 py-2 text-center">{s.onlineStock}</td><td className="px-3 py-2 text-center"><Badge variant={s.status === "Synced" ? "outline" : s.status === "Out of Stock" ? "destructive" : "default"} className={`text-[10px] ${s.status === "Synced" ? "text-green-600" : ""}`}>{s.status}</Badge></td></tr>))}
        </tbody></table></div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Online Orders (Pending Fulfillment)</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Order ID</th><th className="px-3 py-2 text-left">Patient</th><th className="px-3 py-2 text-left">Items</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-right">Action</th></tr></thead><tbody>
          {onlineOrders.map((o, i) => (<tr key={i} className="border-b"><td className="px-3 py-2 font-mono text-xs">{o.id}</td><td className="px-3 py-2">{o.patient}</td><td className="px-3 py-2 text-xs">{o.items}</td><td className="px-3 py-2 text-right font-bold">{o.value}</td><td className="px-3 py-2 text-center"><Badge variant={o.status === "Shipped" ? "outline" : o.status === "Packed" ? "default" : "secondary"} className={`text-[10px] ${o.status === "Shipped" ? "text-green-600" : ""}`}>{o.status}</Badge></td><td className="px-3 py-2 text-right"><Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success(`Order ${o.id} updated`)}>{o.status === "Pending" ? "Pack" : o.status === "Packed" ? "Ship" : "Track"}</Button></td></tr>))}
        </tbody></table></div></CardContent>
      </Card>
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4"><p className="text-xs text-blue-700"><strong>Prescription → Shop Link:</strong> When doctor prescribes, patient automatically gets WhatsApp: "Your medicines are ready to order! Buy here → ayuzee.com/shop/rx/AL-8472" — medicines pre-selected from Rx, delivered to doorstep.</p></CardContent>
      </Card>
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="p-4"><p className="text-sm font-semibold text-green-800 mb-2">🏥 Branch Pickup Orders (from Platform)</p><div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-white rounded border"><span><strong>ORD-4521</strong> — Mrs. Kalpana — Rasnasaptakam + Guggulu (₹480)</span><Badge className="bg-amber-100 text-amber-800">Pickup: Kadayanallur</Badge><Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success("Marked as Ready for Pickup — SMS sent to patient")}>Mark Ready</Button></div>
          <div className="flex items-center justify-between p-2 bg-white rounded border"><span><strong>ORD-4518</strong> — Mr. Kubbusamy — Kottamchukkadi Taila (₹280)</span><Badge className="bg-green-100 text-green-800">Ready ✓</Badge><span className="text-muted-foreground">Patient notified</span></div>
        </div><p className="text-xs text-muted-foreground mt-2">When patient selects "Branch Pickup" on ayuzee.com → HMS pharmacy gets notification → keeps medicines ready → patient collects at counter.</p></CardContent>
      </Card>
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Sync Intelligence</p><p className="text-sm text-purple-700">12 items out of sync — 8 because pharmacy sold walk-in but online wasn't updated. Auto-sync triggered. Kottamchukkadi showing 5 online but 0 in HMS — suggest: mark as "Out of Stock" online immediately to prevent orders.</p></div></CardContent>
      </Card>
    </div>
  );
};

export default EcommerceSync;
