import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Search, AlertTriangle, Package, Plus } from "lucide-react";

type InventoryItem = {
  id: string;
  medicine_name: string;
  batch_number: string | null;
  quantity: number;
  low_stock_threshold: number;
  expiry_date: string | null;
  unit_price: number | null;
  category: string | null;
};

const HmsPharmacy = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any)
        .from("vaidya_inventory")
        .select("*")
        .order("medicine_name");
      setItems(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const lowStock = items.filter((i) => i.quantity <= i.low_stock_threshold);
  const expiringSoon = items.filter((i) => {
    if (!i.expiry_date) return false;
    const diff = new Date(i.expiry_date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  });

  const filtered = items.filter((i) =>
    (i.medicine_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const displayList = tab === "low" ? lowStock : tab === "expiring" ? expiringSoon : filtered;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Pharmacy & Inventory</h1>
          <p className="text-sm text-muted-foreground">{items.length} items in stock</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Medicine</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div><p className="text-xs text-muted-foreground">Total Items</p><p className="text-xl font-bold">{items.length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-xl font-bold text-amber-600">{lowStock.length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div><p className="text-xs text-muted-foreground">Expiring (30 days)</p><p className="text-xl font-bold text-red-600">{expiringSoon.length}</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="low">Low Stock ({lowStock.length})</TabsTrigger>
          <TabsTrigger value="expiring">Expiring ({expiringSoon.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "all" && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading inventory...</p>
          ) : displayList.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No items found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Medicine</th>
                    <th className="px-4 py-3 text-left font-medium">Batch</th>
                    <th className="px-4 py-3 text-left font-medium">Stock</th>
                    <th className="px-4 py-3 text-left font-medium">Price</th>
                    <th className="px-4 py-3 text-left font-medium">Expiry</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayList.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{item.medicine_name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{item.batch_number ?? "—"}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{item.unit_price ? `₹${item.unit_price}` : "—"}</td>
                      <td className="px-4 py-3">{item.expiry_date ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={item.quantity <= item.low_stock_threshold ? "destructive" : "default"}>
                          {item.quantity <= item.low_stock_threshold ? "Low" : "OK"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsPharmacy;
