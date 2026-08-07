import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Brain, AlertTriangle, CheckCircle, TrendingUp, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ReorderItem = {
  id: string;
  product_name: string;
  quantity_available: number;
  min_stock_level: number;
  max_stock_level: number;
  cost_per_unit: number;
  status: "critical" | "below_rol" | "ok";
  stockPercent: number;
};

export default function ReorderLevel() {
  const [items, setItems] = useState<ReorderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, quantity_available, min_stock_level, max_stock_level, cost_per_unit")
        .gt("max_stock_level", 0)
        .order("quantity_available", { ascending: true });

      if (error) throw error;

      setItems((data || []).map((item: any) => {
        const stockPercent = item.max_stock_level > 0 ? Math.round((item.quantity_available / item.max_stock_level) * 100) : 0;
        let status: "critical" | "below_rol" | "ok" = "ok";
        if (item.quantity_available <= item.min_stock_level) status = "critical";
        else if (stockPercent <= 30) status = "below_rol";
        return { ...item, status, stockPercent };
      }));
    } catch (err: any) {
      toast.error("Failed to load reorder data");
      console.error(err);
    }
    setLoading(false);
  };

  const handleAutoPO = async () => {
    const needsReorder = items.filter(i => i.status !== "ok");
    if (needsReorder.length === 0) { toast.info("All items are well-stocked"); return; }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); return; }

      const stores = await (supabase as any).from("hms_ward_stores").select("id").limit(1).single();
      const storeId = stores.data?.id;

      for (const item of needsReorder) {
        const reorderQty = item.max_stock_level - item.quantity_available;
        await (supabase as any).from("hms_ward_stock_transfers").insert({
          from_store_id: storeId,
          to_store_id: storeId,
          product_name: item.product_name,
          quantity: reorderQty,
          transfer_reason: `Auto-PO: Reorder level triggered (current: ${item.quantity_available}, min: ${item.min_stock_level})`,
          status: "pending",
          requested_by: user.id,
        });
      }
      toast.success(`Auto-PO generated for ${needsReorder.length} items`);
    } catch (err: any) {
      toast.error("Failed to generate PO");
    }
  };

  const critical = items.filter(i => i.status === "critical");
  const belowRol = items.filter(i => i.status === "below_rol");
  const ok = items.filter(i => i.status === "ok");

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-blue-600" /> Min / Max / Reorder Level</h1>
          <p className="text-muted-foreground mt-1">Live stock vs thresholds — auto-PO trigger when below reorder level.</p>
        </div>
        <Button onClick={handleAutoPO}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Generate Auto-PO ({critical.length + belowRol.length} items)
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">{critical.length}</p><p className="text-xs text-muted-foreground">Critical (≤ Min)</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{belowRol.length}</p><p className="text-xs text-muted-foreground">Below ROL</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{ok.length}</p><p className="text-xs text-muted-foreground">Healthy</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Stock vs Reorder Levels</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-center">Current</th>
                  <th className="px-3 py-2 text-center">Min</th>
                  <th className="px-3 py-2 text-center">Max</th>
                  <th className="px-3 py-2 text-center">Stock %</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={`border-b ${item.status === "critical" ? "bg-red-50" : item.status === "below_rol" ? "bg-amber-50/50" : ""}`}>
                    <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{item.quantity_available}</td>
                    <td className="px-3 py-2 text-center text-xs">{item.min_stock_level}</td>
                    <td className="px-3 py-2 text-center text-xs">{item.max_stock_level}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Progress value={item.stockPercent} className="w-12 h-1.5" />
                        <span className="text-[10px]">{item.stockPercent}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={item.status === "critical" ? "destructive" : item.status === "below_rol" ? "default" : "outline"} className={`text-[10px] ${item.status === "ok" ? "text-green-600" : ""}`}>
                        {item.status === "critical" ? "Critical" : item.status === "below_rol" ? "Below ROL" : "OK"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">AI Reorder Intelligence</p>
            <p className="text-[10px] text-purple-700">
              {critical.length > 0 ? `${critical.length} items at or below minimum level — reorder immediately. ` : ""}
              Auto-PO calculates: max_stock_level - current_quantity = order quantity. Click "Generate Auto-PO" to create transfer requests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
