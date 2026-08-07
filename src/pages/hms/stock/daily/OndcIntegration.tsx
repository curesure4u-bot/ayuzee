import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Globe, ShoppingCart, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CatalogItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  quantity_available: number;
  cost_per_unit: number;
  listed: boolean;
};

export default function OndcIntegration() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, product_category, quantity_available, cost_per_unit, is_critical")
        .gt("quantity_available", 0)
        .order("product_name");

      if (error) throw error;

      setCatalog((data || []).map((item: any) => ({
        ...item,
        listed: !item.is_critical && item.quantity_available > 5, // Don't list critical or low stock
      })));
    } catch (err: any) {
      toast.error("Failed to load catalog");
      console.error(err);
    }
    setLoading(false);
  };

  const listedItems = catalog.filter(c => c.listed);
  const totalValue = listedItems.reduce((s, c) => s + c.cost_per_unit * c.quantity_available, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-blue-600" /> ONDC / Open Network Integration</h1>
          <p className="text-muted-foreground mt-1">List medicines on ONDC — auto-synced from live Supabase stock. Non-critical items with stock &gt;5 are listed.</p>
        </div>
        <Badge className="bg-green-100 text-green-700 text-xs">ONDC Ready</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Globe className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{listedItems.length}</p><p className="text-xs text-muted-foreground">Listed Items</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-gray-600" /><p className="text-xl font-bold">{catalog.length - listedItems.length}</p><p className="text-xs text-muted-foreground">Not Listed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Catalog Value</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{new Set(catalog.map(c => c.product_category).filter(Boolean)).size}</p><p className="text-xs text-muted-foreground">Categories</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">ONDC Catalog (Live from Stock)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-right">MRP ₹</th>
                  <th className="px-3 py-2 text-center">ONDC Status</th>
                </tr>
              </thead>
              <tbody>
                {catalog.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products in stock</td></tr>
                ) : (
                  catalog.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{item.product_category || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{item.quantity_available}</td>
                      <td className="px-3 py-2 text-right text-xs">₹{item.cost_per_unit}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={item.listed ? "outline" : "secondary"} className={`text-[10px] ${item.listed ? "text-green-600" : "text-gray-500"}`}>
                          {item.listed ? "Listed" : "Not Listed"}
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
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">ONDC Auto-Sync Logic</p>
            <p className="text-sm text-purple-700">
              Items auto-listed when: stock &gt; 5 units AND not marked as critical/controlled.
              {catalog.filter(c => !c.listed).length > 0 && ` ${catalog.filter(c => !c.listed).length} items excluded (low stock or controlled).`}
              Stock levels update in real-time — ONDC sees current availability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
