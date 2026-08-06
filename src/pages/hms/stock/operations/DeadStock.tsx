import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Brain, AlertTriangle, TrendingDown, IndianRupee, Truck, Tag } from "lucide-react";

const deadItems = [
  { item: "Punarnavadi Mandoor 60t", category: "Vati", lastSold: "98 days ago", days: 98, value: 4200, qty: 28, suggestion: "Transfer to Chennai (high demand there)" },
  { item: "Maha Yogaraj Guggulu 60t", category: "Guggulu", lastSold: "112 days ago", days: 112, value: 6800, qty: 40, suggestion: "Offer 15% discount to clear" },
  { item: "Kumaryasava 450ml", category: "Asava", lastSold: "145 days ago", days: 145, value: 3600, qty: 15, suggestion: "Return to supplier (within return window)" },
  { item: "Saptamrit Lauh 60t", category: "Lauha", lastSold: "180 days ago", days: 180, value: 5200, qty: 32, suggestion: "Write off — near expiry + no demand" },
  { item: "Draksharishtam 450ml", category: "Arishtam", lastSold: "95 days ago", days: 95, value: 8400, qty: 35, suggestion: "Run health camp with free tasting samples" },
  { item: "Chandanasava 450ml", category: "Asava", lastSold: "130 days ago", days: 130, value: 7200, qty: 30, suggestion: "Bundle with fast-moving Dashamoolarishtam" },
  { item: "Sarivadyasava 450ml", category: "Asava", lastSold: "160 days ago", days: 160, value: 5400, qty: 22, suggestion: "Transfer to Rajapalayam (skin patients there)" },
  { item: "Vidangadi Churna 100g", category: "Churna", lastSold: "200 days ago", days: 200, value: 4200, qty: 35, suggestion: "Write off — expired batch" },
];

const DeadStock = () => {
  const totalValue = deadItems.reduce((s, d) => s + d.value, 0);
  const recoverableValue = deadItems.filter(d => d.days < 180).reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-2"><TrendingDown className="h-6 w-6 text-red-600" /> Dead Stock & Slow Moving (AI)</h1><p className="text-muted-foreground mt-1">Items not sold in 90+ days — AI suggests actions to recover value</p></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-red-600" /><p className="text-lg font-bold mt-1 text-red-600">₹{totalValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Dead Stock Value</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{deadItems.length}</p><p className="text-xs text-muted-foreground">Items &gt;90 days</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{deadItems.filter(d => d.days > 180).length}</p><p className="text-xs text-muted-foreground">Items &gt;180 days</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">₹{recoverableValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Recoverable Value</p></CardContent></Card>
      </div>
      <Card>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-center">Days</th><th className="px-3 py-2 text-right">Value</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-left">AI Suggestion</th><th className="px-3 py-2 text-right">Action</th></tr></thead><tbody>
          {deadItems.map((d, i) => (<tr key={i} className={`border-b ${d.days > 180 ? "bg-red-50" : d.days > 120 ? "bg-amber-50/50" : ""}`}><td className="px-3 py-2 font-medium text-xs">{d.item}</td><td className="px-3 py-2 text-xs">{d.category}</td><td className="px-3 py-2 text-center"><Badge variant={d.days > 180 ? "destructive" : d.days > 120 ? "default" : "secondary"} className="text-[10px]">{d.days}d</Badge></td><td className="px-3 py-2 text-right font-bold">₹{d.value.toLocaleString()}</td><td className="px-3 py-2 text-center">{d.qty}</td><td className="px-3 py-2 text-xs text-purple-700">{d.suggestion}</td><td className="px-3 py-2 text-right"><Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success("Action initiated")}>Act</Button></td></tr>))}
        </tbody></table></div></CardContent>
      </Card>
      <div className="flex gap-2">
        <Button onClick={() => toast.success("Discount sale created for 5 items")}><Tag className="h-4 w-4 mr-1" /> Create Discount Sale</Button>
        <Button variant="outline" onClick={() => toast.success("Transfer list generated")}><Truck className="h-4 w-4 mr-1" /> Transfer to Other Branch</Button>
        <Button variant="outline" onClick={() => toast.success("Supplier return initiated")}><AlertTriangle className="h-4 w-4 mr-1" /> Return to Supplier</Button>
      </div>
    </div>
  );
};

export default DeadStock;
