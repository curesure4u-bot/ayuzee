import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, ShoppingCart, Package, Search, CheckCircle, Clock, Building2 } from "lucide-react";

const catalog = [
  { id: 1, item: "Rasnasaptakam Kashayam 200ml", mrp: 210, franchisePrice: 147, discount: "30%", stock: 320, category: "Kashayam", moq: 10 },
  { id: 2, item: "Simhanada Guggulu 60t", mrp: 150, franchisePrice: 105, discount: "30%", stock: 580, category: "Guggulu", moq: 20 },
  { id: 3, item: "Kottamchukkadi Taila 200ml", mrp: 280, franchisePrice: 196, discount: "30%", stock: 210, category: "Taila", moq: 10 },
  { id: 4, item: "Ashwagandha Churna 100g", mrp: 160, franchisePrice: 112, discount: "30%", stock: 450, category: "Churna", moq: 15 },
  { id: 5, item: "Dashamoolarishtam 450ml", mrp: 185, franchisePrice: 130, discount: "30%", stock: 280, category: "Arishtam", moq: 10 },
  { id: 6, item: "Chandraprabha Vati 60t", mrp: 180, franchisePrice: 126, discount: "30%", stock: 340, category: "Vati", moq: 15 },
  { id: 7, item: "Mahanarayan Taila 200ml", mrp: 320, franchisePrice: 224, discount: "30%", stock: 175, category: "Taila", moq: 5 },
  { id: 8, item: "Triphala Churna 100g", mrp: 120, franchisePrice: 84, discount: "30%", stock: 620, category: "Churna", moq: 20 },
];

const recentOrders = [
  { id: "FO-2045", franchise: "Spine Ayush - Chennai", date: "20 Jul 2026", items: 12, value: 32000, status: "dispatched" },
  { id: "FO-2044", franchise: "Spine Ayush - Hyderabad", date: "18 Jul 2026", items: 8, value: 22000, status: "delivered" },
  { id: "FO-2043", franchise: "Spine Ayush - Mumbai", date: "15 Jul 2026", items: 15, value: 45000, status: "delivered" },
  { id: "FO-2042", franchise: "Spine Ayush - Delhi", date: "12 Jul 2026", items: 20, value: 55000, status: "delivered" },
];

export default function FranchiseOrderPortal() {
  const [search, setSearch] = useState("");
  const filtered = search ? catalog.filter(c => c.item.toLowerCase().includes(search.toLowerCase())) : catalog;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-indigo-600" /> Franchise Order Portal</h1>
          <p className="text-muted-foreground mt-1">B2B catalog for franchise partners — browse, order, track. No phone/WhatsApp chaos.</p>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 text-xs">Logged in as: Central Admin</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Building2 className="h-4 w-4 mx-auto text-indigo-600" /><p className="text-xl font-bold">4</p><p className="text-[10px] text-muted-foreground">Active Franchisees</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ShoppingCart className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{recentOrders.length}</p><p className="text-[10px] text-muted-foreground">Orders (Jul)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(recentOrders.reduce((s, o) => s + o.value, 0) / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Revenue (Jul)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{catalog.length}</p><p className="text-[10px] text-muted-foreground">Catalog Items</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Product Catalog (Franchise View)</CardTitle>
            <div className="flex gap-2"><Search className="h-4 w-4 mt-2 text-muted-foreground" /><Input placeholder="Search medicine..." className="h-8 w-48 text-xs" value={search} onChange={e => setSearch(e.target.value)} /></div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Medicine</th><th className="px-3 py-2 text-center">Category</th><th className="px-3 py-2 text-center">MRP</th><th className="px-3 py-2 text-center">Your Price</th><th className="px-3 py-2 text-center">Discount</th><th className="px-3 py-2 text-center">Stock</th><th className="px-3 py-2 text-center">MOQ</th><th className="px-3 py-2 text-center">Action</th></tr></thead><tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-medium">{c.item}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{c.category}</Badge></td>
                <td className="px-3 py-2 text-center text-xs text-muted-foreground line-through">₹{c.mrp}</td>
                <td className="px-3 py-2 text-center text-xs font-bold text-green-600">₹{c.franchisePrice}</td>
                <td className="px-3 py-2 text-center text-xs text-green-600">{c.discount}</td>
                <td className="px-3 py-2 text-center text-xs">{c.stock > 100 ? <span className="text-green-600">In Stock</span> : <span className="text-amber-600">Low</span>}</td>
                <td className="px-3 py-2 text-center text-xs">{c.moq}</td>
                <td className="px-3 py-2 text-center"><Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success(`${c.item} added to cart`)}><ShoppingCart className="h-3 w-3 mr-0.5" />Add</Button></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recent Franchise Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Order ID</th><th className="px-3 py-2 text-left">Franchise</th><th className="px-3 py-2 text-center">Date</th><th className="px-3 py-2 text-center">Items</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {recentOrders.map((o, i) => (
              <tr key={i} className="border-b"><td className="px-3 py-2 text-xs font-mono">{o.id}</td><td className="px-3 py-2 text-xs">{o.franchise}</td><td className="px-3 py-2 text-center text-xs">{o.date}</td><td className="px-3 py-2 text-center text-xs">{o.items}</td><td className="px-3 py-2 text-right text-xs font-bold">₹{o.value.toLocaleString()}</td><td className="px-3 py-2 text-center"><Badge variant={o.status === "delivered" ? "outline" : "default"} className={`text-[10px] ${o.status === "delivered" ? "text-green-600" : ""}`}>{o.status}</Badge></td></tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Franchise Intelligence</p><p className="text-sm text-purple-700">Chennai franchise ordering Rasnasaptakam 3x more than others — growing patient base. AI suggests increasing their discount to 32% (volume tier). Delhi franchise hasn't ordered in 10 days — auto-reminder sent. Popular combo detected: 80% of franchise orders include Rasnasaptakam + Simhanada + Kottamchukkadi — create "Spine Ayush Starter Bundle" at 35% discount.</p></div></CardContent></Card>
    </div>
  );
}
