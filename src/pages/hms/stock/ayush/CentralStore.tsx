import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Warehouse, Brain, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type StoreInfo = {
  id: string;
  ward_name: string;
  department: string | null;
  store_code: string | null;
  store_type: string;
  is_active: boolean;
  item_count: number;
  total_value: number;
};

export default function CentralStore() {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStores(); }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const { data: storeData, error } = await (supabase as any)
        .from("hms_ward_stores")
        .select("id, ward_name, department, store_code, store_type, is_active")
        .order("ward_name");

      if (error) throw error;

      // For each store, get item count and value
      const enriched: StoreInfo[] = [];
      for (const store of (storeData || [])) {
        const { data: items } = await (supabase as any)
          .from("hms_ward_stock_items")
          .select("quantity_available, cost_per_unit")
          .eq("ward_store_id", store.id);

        const itemCount = (items || []).length;
        const totalValue = (items || []).reduce((s: number, i: any) => s + (i.quantity_available * i.cost_per_unit), 0);
        enriched.push({ ...store, item_count: itemCount, total_value: totalValue });
      }

      setStores(enriched);
    } catch (err: any) {
      toast.error("Failed to load stores");
      console.error(err);
    }
    setLoading(false);
  };

  const totalItems = stores.reduce((s, st) => s + st.item_count, 0);
  const totalValue = stores.reduce((s, st) => s + st.total_value, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Warehouse className="h-6 w-6 text-blue-600" /> Central Store Management</h1>
        <p className="text-muted-foreground mt-1">All ward stores with live stock counts and values from Supabase.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Warehouse className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{stores.length}</p><p className="text-xs text-muted-foreground">Total Stores</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{stores.filter(s => s.is_active).length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">₹{(totalValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Value</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Store Directory</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Store Name</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-center">Code</th>
                  <th className="px-3 py-2 text-center">Type</th>
                  <th className="px-3 py-2 text-center">Items</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 text-xs font-medium">{s.ward_name}</td>
                    <td className="px-3 py-2 text-xs">{s.department || "—"}</td>
                    <td className="px-3 py-2 text-center text-xs font-mono">{s.store_code || "—"}</td>
                    <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{s.store_type}</Badge></td>
                    <td className="px-3 py-2 text-center text-xs font-bold">{s.item_count}</td>
                    <td className="px-3 py-2 text-right text-xs font-bold text-green-600">₹{s.total_value.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={s.is_active ? "outline" : "secondary"} className={`text-[10px] ${s.is_active ? "text-green-600" : ""}`}>{s.is_active ? "Active" : "Inactive"}</Badge>
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
            <p className="font-semibold text-xs text-purple-800">Central Store Intelligence</p>
            <p className="text-[10px] text-purple-700">Shows all hms_ward_stores with live item counts and stock values. Each store's inventory is independently tracked in hms_ward_stock_items.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
