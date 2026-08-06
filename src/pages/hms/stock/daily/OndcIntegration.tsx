import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Globe, CheckCircle, Clock, Package, ShoppingCart, AlertTriangle } from "lucide-react";

const ondcOrders = [
  { id: "ONDC-9021", source: "Paytm", patient: "Vikram S.", city: "Bangalore", items: 2, value: 395, status: "confirmed", time: "10:30 AM" },
  { id: "ONDC-9020", source: "PhonePe", patient: "Ananya R.", city: "Bangalore", items: 3, value: 620, status: "packing", time: "10:15 AM" },
  { id: "ONDC-9019", source: "Paytm", patient: "Karthik M.", city: "Mysore", items: 1, value: 210, status: "shipped", time: "09:45 AM" },
  { id: "ONDC-9018", source: "Google Pay", patient: "Deepa L.", city: "Bangalore", items: 4, value: 890, status: "delivered", time: "Yesterday" },
  { id: "ONDC-9017", source: "PhonePe", patient: "Rahul T.", city: "Chennai", items: 2, value: 470, status: "delivered", time: "Yesterday" },
];

const catalog = [
  { item: "Rasnasaptakam Kashayam 200ml", listed: true, mrp: 210, ondcPrice: 199, category: "Kashayam", orders: 45 },
  { item: "Simhanada Guggulu 60t", listed: true, mrp: 150, ondcPrice: 142, category: "Guggulu", orders: 38 },
  { item: "Ashwagandha Churna 100g", listed: true, mrp: 160, ondcPrice: 149, category: "Churna", orders: 52 },
  { item: "Kottamchukkadi Taila 200ml", listed: true, mrp: 280, ondcPrice: 265, category: "Taila", orders: 28 },
  { item: "Dashamoolarishtam 450ml", listed: true, mrp: 185, ondcPrice: 175, category: "Arishtam", orders: 35 },
  { item: "Triphala Churna 100g", listed: true, mrp: 120, ondcPrice: 110, category: "Churna", orders: 62 },
  { item: "Chandraprabha Vati 60t", listed: true, mrp: 180, ondcPrice: 170, category: "Vati", orders: 30 },
  { item: "Swarna Bhasma 2g", listed: false, mrp: 3000, ondcPrice: 0, category: "Bhasma", orders: 0 },
];

const statusColors: Record<string, string> = { confirmed: "bg-amber-100 text-amber-700", packing: "bg-blue-100 text-blue-700", shipped: "bg-purple-100 text-purple-700", delivered: "bg-green-100 text-green-700" };

export default function OndcIntegration() {
  const monthlyRevenue = ondcOrders.reduce((s, o) => s + o.value, 0) * 6;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-blue-600" /> ONDC / Open Network Integration</h1>
          <p className="text-muted-foreground mt-1">List medicines on ONDC — get orders from Paytm, PhonePe, Google Pay, and 100+ ONDC-connected apps</p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-xs">ONDC Connected ✓</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Globe className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{catalog.filter(c => c.listed).length}</p><p className="text-xs text-muted-foreground">Listed Items</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ShoppingCart className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{ondcOrders.length}</p><p className="text-xs text-muted-foreground">Orders Today</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(monthlyRevenue/1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Monthly (est.)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">3</p><p className="text-xs text-muted-foreground">Source Apps</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Live ONDC Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Order</th><th className="px-3 py-2 text-center">Source</th><th className="px-3 py-2 text-left">Customer</th><th className="px-3 py-2 text-center">City</th><th className="px-3 py-2 text-center">Items</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {ondcOrders.map((o, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-mono">{o.id}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{o.source}</Badge></td>
                <td className="px-3 py-2 text-xs">{o.patient}</td>
                <td className="px-3 py-2 text-center text-xs">{o.city}</td>
                <td className="px-3 py-2 text-center text-xs">{o.items}</td>
                <td className="px-3 py-2 text-right text-xs font-bold">₹{o.value}</td>
                <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${statusColors[o.status]}`}>{o.status}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">ONDC Catalog (Listed Products)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-1 text-left">Item</th><th className="px-3 py-1 text-center">MRP</th><th className="px-3 py-1 text-center">ONDC Price</th><th className="px-3 py-1 text-center">Orders (Jul)</th><th className="px-3 py-1 text-center">Listed</th></tr></thead><tbody>
            {catalog.map((c, i) => (
              <tr key={i} className="border-b"><td className="px-3 py-1.5 font-medium">{c.item}</td><td className="px-3 py-1.5 text-center">₹{c.mrp}</td><td className="px-3 py-1.5 text-center font-bold text-green-600">{c.ondcPrice > 0 ? `₹${c.ondcPrice}` : "—"}</td><td className="px-3 py-1.5 text-center">{c.orders || "—"}</td><td className="px-3 py-1.5 text-center">{c.listed ? <CheckCircle className="h-3 w-3 mx-auto text-green-600" /> : <span className="text-muted-foreground">No</span>}</td></tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI ONDC Intelligence</p><p className="text-sm text-purple-700">ONDC brings orders from customers who never heard of Ayuzee — pure new patient acquisition channel. Top performer: Triphala Churna (62 orders) — commodity item drives discovery. Suggestion: List "Spine Ayush 5-Day Kit" as bundle on ONDC at ₹4,200 (discount from ₹4,500). Don't list Swarna Bhasma (high-value, needs doctor supervision). ONDC commission: 3-5% — still better than marketplace 15-20%.</p></div></CardContent></Card>
    </div>
  );
}
