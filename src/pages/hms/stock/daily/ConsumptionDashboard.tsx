import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type StoreConsumption = {
  store_id: string;
  store_name: string;
  total_consumed: number;
  total_billed: number;
  item_count: number;
};

type TopItem = {
  product_name: string;
  total_qty: number;
  total_amount: number;
};

export default function ConsumptionDashboard() {
  const [storeData, setStoreData] = useState<StoreConsumption[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch consumption log with store info
      const { data: consumption, error: cErr } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(id, ward_name), hms_ward_stock_items(product_name)")
        .eq("consumption_type", "patient_use")
        .order("created_at", { ascending: false });

      if (cErr) throw cErr;

      // Group by store
      const storeMap: Record<string, StoreConsumption> = {};
      const itemMap: Record<string, TopItem> = {};

      (consumption || []).forEach((row: any) => {
        const storeId = row.ward_store_id;
        const storeName = row.hms_ward_stores?.ward_name || "Unknown Store";
        const productName = row.hms_ward_stock_items?.product_name || "Unknown";

        if (!storeMap[storeId]) {
          storeMap[storeId] = { store_id: storeId, store_name: storeName, total_consumed: 0, total_billed: 0, item_count: 0 };
        }
        storeMap[storeId].total_consumed += row.quantity_consumed || 0;
        storeMap[storeId].total_billed += row.bill_amount || 0;
        storeMap[storeId].item_count += 1;

        if (!itemMap[productName]) {
          itemMap[productName] = { product_name: productName, total_qty: 0, total_amount: 0 };
        }
        itemMap[productName].total_qty += row.quantity_consumed || 0;
        itemMap[productName].total_amount += row.bill_amount || 0;
      });

      setStoreData(Object.values(storeMap));
      setTopItems(Object.values(itemMap).sort((a, b) => b.total_amount - a.total_amount).slice(0, 10));
    } catch (err: any) {
      toast.error("Failed to load consumption data");
      console.error(err);
    }
    setLoading(false);
  };

  const totalSales = storeData.reduce((s, d) => s + d.total_billed, 0);
  const totalItems = storeData.reduce((s, d) => s + d.item_count, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" /> Consumption Dashboard</h1>
          <p className="text-muted-foreground mt-1">Compare stores: sales, items dispensed, consumption patterns from live Supabase data.</p>
        </div>
        <Select defaultValue="all"><SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Time</SelectItem><SelectItem value="today">Today</SelectItem><SelectItem value="week">This Week</SelectItem></SelectContent></Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(totalSales / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Total Sales</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{storeData.length}</p><p className="text-xs text-muted-foreground">Active Stores</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Items Dispensed</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{topItems.length}</p><p className="text-xs text-muted-foreground">Unique Products</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Store Performance</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-right">Sales Amount</th>
                  <th className="px-3 py-2 text-center">Items Dispensed</th>
                  <th className="px-3 py-2 text-center">Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {storeData.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No consumption data yet</td></tr>
                ) : (
                  storeData.map((s) => (
                    <tr key={s.store_id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{s.store_name}</td>
                      <td className="px-3 py-2 text-right text-xs font-bold">₹{s.total_billed.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center text-xs">{s.item_count}</td>
                      <td className="px-3 py-2 text-center text-xs">{s.total_consumed}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Top Selling Items</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-1 text-left">Item</th>
                  <th className="px-3 py-1 text-center">Units Sold</th>
                  <th className="px-3 py-1 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No items sold yet</td></tr>
                ) : (
                  topItems.map((t, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-3 py-1.5 font-medium">{t.product_name}</td>
                      <td className="px-3 py-1.5 text-center font-bold">{t.total_qty}</td>
                      <td className="px-3 py-1.5 text-right">₹{t.total_amount.toLocaleString()}</td>
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
            <p className="font-semibold text-purple-800">AI Consumption Intelligence</p>
            <p className="text-sm text-purple-700">
              {storeData.length > 0
                ? `${storeData.length} stores active. Top performer: ${storeData.sort((a, b) => b.total_billed - a.total_billed)[0]?.store_name || "N/A"} with ₹${storeData[0]?.total_billed.toLocaleString()} in sales.`
                : "Start dispensing products to see AI-powered consumption insights here."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
