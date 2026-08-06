import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Brain, Search, Package, AlertTriangle } from "lucide-react";

const batches = [
  { batch: "B001", mfg: "Jan 2026", expiry: "Dec 2027", purchasePrice: 185, mrp: 245, qty: 45, supplier: "AVN Arogya", status: "Active" },
  { batch: "B002", mfg: "Mar 2026", expiry: "Feb 2028", purchasePrice: 190, mrp: 245, qty: 30, supplier: "Kottakkal Arya Vaidya", status: "Active" },
  { batch: "B003", mfg: "Oct 2025", expiry: "Sep 2026", purchasePrice: 175, mrp: 230, qty: 8, supplier: "AVN Arogya", status: "Near Expiry" },
  { batch: "B004", mfg: "Jun 2025", expiry: "May 2026", purchasePrice: 170, mrp: 225, qty: 3, supplier: "SD Pharmacy", status: "Expired" },
];

const BatchTracking = () => {
  const totalStock = batches.reduce((s, b) => s + b.qty, 0);
  const activeStock = batches.filter(b => b.status === "Active").reduce((s, b) => s + b.qty, 0);
  const nearExpiryValue = batches.filter(b => b.status === "Near Expiry").reduce((s, b) => s + (b.qty * b.purchasePrice), 0);
  const expiredValue = batches.filter(b => b.status === "Expired").reduce((s, b) => s + (b.qty * b.purchasePrice), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-blue-600" /> Batch-wise Stock Tracking</h1><p className="text-muted-foreground mt-1">Track each batch: expiry, purchase price, FIFO dispensing order</p></div>
      </div>
      <div className="flex gap-2 max-w-md"><Search className="h-4 w-4 mt-2 text-muted-foreground" /><Input defaultValue="Rasnasaptakam Kashayam 450ml" className="flex-1" /><Button size="sm">Search</Button></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{totalStock}</p><p className="text-xs text-muted-foreground">Total Stock</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{activeStock}</p><p className="text-xs text-muted-foreground">Active Batches</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">₹{nearExpiryValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Near-Expiry Value</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">₹{expiredValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Expired (Write-off)</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Rasnasaptakam Kashayam 450ml — All Batches</CardTitle></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Batch No</th><th className="px-3 py-2 text-left">MFG</th><th className="px-3 py-2 text-left">Expiry</th><th className="px-3 py-2 text-right">Purchase ₹</th><th className="px-3 py-2 text-right">MRP ₹</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-left">Supplier</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">FIFO</th></tr></thead><tbody>
          {batches.map((b, i) => (<tr key={i} className={`border-b ${b.status === "Expired" ? "bg-red-50" : b.status === "Near Expiry" ? "bg-amber-50" : ""}`}><td className="px-3 py-2 font-mono">{b.batch}</td><td className="px-3 py-2 text-xs">{b.mfg}</td><td className="px-3 py-2 text-xs">{b.expiry}</td><td className="px-3 py-2 text-right">₹{b.purchasePrice}</td><td className="px-3 py-2 text-right font-bold">₹{b.mrp}</td><td className="px-3 py-2 text-center">{b.qty}</td><td className="px-3 py-2 text-xs">{b.supplier}</td><td className="px-3 py-2 text-center"><Badge variant={b.status === "Active" ? "outline" : b.status === "Expired" ? "destructive" : "default"} className={`text-[10px] ${b.status === "Active" ? "text-green-600" : ""}`}>{b.status}</Badge></td><td className="px-3 py-2 text-center">{i === 2 ? <Badge className="bg-blue-600 text-[9px]">Dispense First</Badge> : i === 0 || i === 1 ? <span className="text-[10px] text-muted-foreground">Queue</span> : <span className="text-[10px] text-red-600">Remove</span>}</td></tr>))}
        </tbody></table></div></CardContent>
      </Card>
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Batch Management</p><p className="text-sm text-purple-700">Batch B003 expires in 2 months (8 units, ₹1,400 value). Suggest: Push to sale via 10% discount OR transfer to Tirunelveli (high consumption branch). Batch B004 is expired — schedule write-off and supplier credit note.</p></div></CardContent>
      </Card>
    </div>
  );
};

export default BatchTracking;
