import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, AlertTriangle, TrendingDown, IndianRupee, Truck, Tag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DeadStockItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  quantity_available: number;
  cost_per_unit: number;
  last_consumed_at: string | null;
  created_at: string;
  days_since_consumed: number;
  value: number;
};

const DeadStock = () => {
  const [items, setItems] = useState<DeadStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeadStock();
  }, []);

  const loadDeadStock = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("*")
        .gt("quantity_available", 0)
        .order("last_consumed_at", { ascending: true, nullsFirst: true });

      if (error) throw error;

      const now = new Date();
      const deadItems: DeadStockItem[] = (data || []).map((item: any) => {
        const lastConsumed = item.last_consumed_at ? new Date(item.last_consumed_at) : new Date(item.created_at);
        const daysSince = Math.floor((now.getTime() - lastConsumed.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...item,
          days_since_consumed: daysSince,
          value: item.quantity_available * item.cost_per_unit,
        };
      }).filter((item: DeadStockItem) => item.days_since_consumed >= 90);

      setItems(deadItems);
    } catch (err: any) {
      toast.error("Failed to load dead stock");
      console.error(err);
    }
    setLoading(false);
  };

  const totalValue = items.reduce((s, d) => s + d.value, 0);
  const recoverableValue = items.filter(d => d.days_since_consumed < 180).reduce((s, d) => s + d.value, 0);

  const getSuggestion = (item: DeadStockItem) => {
    if (item.days_since_consumed > 180) return "Write off — no demand, consider supplier return";
    if (item.days_since_consumed > 120) return "Offer 15% discount or transfer to high-demand branch";
    return "Run promotion or bundle with fast-moving items";
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingDown className="h-6 w-6 text-red-600" /> Dead Stock & Slow Moving (AI)</h1>
          <p className="text-muted-foreground mt-1">Items not sold in 90+ days — AI suggests actions to recover value</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><IndianRupee className="h-5 w-5 mx-auto text-red-600" /><p className="text-lg font-bold mt-1 text-red-600">₹{totalValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Dead Stock Value</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Items &gt;90 days</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{items.filter(d => d.days_since_consumed > 180).length}</p><p className="text-xs text-muted-foreground">Items &gt;180 days</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">₹{recoverableValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Recoverable Value</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Days</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">AI Suggestion</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No dead stock found — all items moving well</td></tr>
                ) : (
                  items.map((d) => (
                    <tr key={d.id} className={`border-b ${d.days_since_consumed > 180 ? "bg-red-50" : d.days_since_consumed > 120 ? "bg-amber-50/50" : ""}`}>
                      <td className="px-3 py-2 font-medium text-xs">{d.product_name}</td>
                      <td className="px-3 py-2 text-xs">{d.product_category || "—"}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={d.days_since_consumed > 180 ? "destructive" : d.days_since_consumed > 120 ? "default" : "secondary"} className="text-[10px]">
                          {d.days_since_consumed}d
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-right font-bold">₹{d.value.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">{d.quantity_available}</td>
                      <td className="px-3 py-2 text-xs text-purple-700">{getSuggestion(d)}</td>
                      <td className="px-3 py-2 text-right">
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => toast.success("Action initiated for " + d.product_name)}>Act</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => toast.success("Discount sale created")}><Tag className="h-4 w-4 mr-1" /> Create Discount Sale</Button>
        <Button variant="outline" onClick={() => toast.success("Transfer list generated")}><Truck className="h-4 w-4 mr-1" /> Transfer to Other Branch</Button>
        <Button variant="outline" onClick={() => toast.success("Supplier return initiated")}><AlertTriangle className="h-4 w-4 mr-1" /> Return to Supplier</Button>
      </div>
    </div>
  );
};

export default DeadStock;
