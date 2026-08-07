import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Leaf, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type HerbItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  quantity_available: number;
  quantity_unit: string;
  cost_per_unit: number;
  batch_number: string | null;
  min_stock_level: number;
  low: boolean;
};

export default function HerbProcurement() {
  const [herbs, setHerbs] = useState<HerbItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHerbs(); }, []);

  const loadHerbs = async () => {
    setLoading(true);
    try {
      // Fetch items from stock that are raw materials (Churna, herbs, raw)
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, product_category, quantity_available, quantity_unit, cost_per_unit, batch_number, min_stock_level")
        .gt("quantity_available", 0)
        .order("product_name");

      if (error) throw error;

      // Filter to herb-like categories
      const herbCategories = ["churna", "powder", "taila", "raw"];
      setHerbs((data || []).filter((item: any) => {
        const cat = (item.product_category || "").toLowerCase();
        return herbCategories.some(h => cat.includes(h)) || item.product_name.toLowerCase().includes("churna");
      }).map((item: any) => ({
        ...item,
        low: item.quantity_available <= item.min_stock_level,
      })));
    } catch (err: any) {
      toast.error("Failed to load herb data");
      console.error(err);
    }
    setLoading(false);
  };

  const inStock = herbs.filter(h => !h.low).length;
  const lowStock = herbs.filter(h => h.low).length;
  const totalValue = herbs.reduce((s, h) => s + (h.quantity_available * h.cost_per_unit), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Leaf className="h-6 w-6 text-green-600" /> Herb Procurement & Raw Drug</h1>
        <p className="text-muted-foreground mt-1">Raw material stock from Supabase — Churna, Taila base, powders for in-house manufacturing.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Leaf className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold">{herbs.length}</p><p className="text-xs text-muted-foreground">Herb Items</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{inStock}</p><p className="text-xs text-muted-foreground">In Stock</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{lowStock}</p><p className="text-xs text-muted-foreground">Low Stock</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Value</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Raw Material Inventory</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Herb / Material</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-center">Unit</th>
                  <th className="px-3 py-2 text-right">Rate/Unit</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {herbs.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No herb/raw material items found. Add Churna/Taila items to stock.</td></tr>
                ) : (
                  herbs.map(h => (
                    <tr key={h.id} className={`border-b ${h.low ? "bg-amber-50/50" : ""}`}>
                      <td className="px-3 py-2 text-xs font-medium">{h.product_name}</td>
                      <td className="px-3 py-2 text-xs">{h.product_category || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{h.quantity_available}</td>
                      <td className="px-3 py-2 text-center text-xs">{h.quantity_unit}</td>
                      <td className="px-3 py-2 text-right text-xs">₹{h.cost_per_unit}</td>
                      <td className="px-3 py-2 text-center text-xs font-mono">{h.batch_number || "—"}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={h.low ? "destructive" : "outline"} className={`text-[10px] ${!h.low ? "text-green-600" : ""}`}>
                          {h.low ? "Low" : "OK"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">Herb Procurement Intelligence</p>
            <p className="text-[10px] text-purple-700">Filters stock items by herb-related categories (Churna, Taila, Powder). Shows raw material availability for in-house manufacturing. Low stock items need immediate procurement.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
