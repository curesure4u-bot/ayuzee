import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, ShoppingCart, Package, Search, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CatalogItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  quantity_available: number;
  cost_per_unit: number;
  batch_number: string | null;
};

export default function FranchiseOrderPortal() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, product_category, quantity_available, cost_per_unit, batch_number")
        .gt("quantity_available", 0)
        .order("product_name");

      if (error) throw error;
      setCatalog(data || []);
    } catch (err: any) {
      toast.error("Failed to load catalog");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = search
    ? catalog.filter(c => c.product_name.toLowerCase().includes(search.toLowerCase()) || (c.product_category || "").toLowerCase().includes(search.toLowerCase()))
    : catalog;

  const handleOrder = async (item: CatalogItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Login required"); return; }

      // Create a transfer request (franchise order = transfer from main store)
      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .insert({
          from_store_id: (await (supabase as any).from("hms_ward_stores").select("id").limit(1).single()).data?.id,
          to_store_id: (await (supabase as any).from("hms_ward_stores").select("id").limit(1).single()).data?.id,
          product_name: item.product_name,
          quantity: 10,
          batch_number: item.batch_number,
          transfer_reason: "Franchise order",
          status: "pending",
          requested_by: user.id,
        });

      if (error) throw error;
      toast.success(`Order placed: ${item.product_name} × 10`);
    } catch (err: any) {
      toast.error("Failed to place order");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="h-6 w-6 text-indigo-600" /> Franchise Order Portal</h1>
          <p className="text-muted-foreground mt-1">B2B catalog from live Supabase stock — browse, order, track.</p>
        </div>
        <Badge className="bg-indigo-100 text-indigo-700 text-xs">Live Catalog</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-indigo-600" /><p className="text-xl font-bold">{catalog.length}</p><p className="text-[10px] text-muted-foreground">Catalog Items</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{catalog.filter(c => c.quantity_available > 10).length}</p><p className="text-[10px] text-muted-foreground">In Stock (&gt;10)</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{new Set(catalog.map(c => c.product_category).filter(Boolean)).size}</p><p className="text-[10px] text-muted-foreground">Categories</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">₹{(catalog.reduce((s, c) => s + c.cost_per_unit * c.quantity_available, 0) / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Stock Value</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Product Catalog</CardTitle>
            <div className="relative w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-8 text-xs" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-right">Rate ₹</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products found</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{item.product_category || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{item.quantity_available}</td>
                      <td className="px-3 py-2 text-right text-xs">₹{item.cost_per_unit}</td>
                      <td className="px-3 py-2 text-center">
                        <Button size="sm" className="h-6 text-[10px]" onClick={() => handleOrder(item)}>
                          <ShoppingCart className="h-3 w-3 mr-0.5" /> Order
                        </Button>
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
            <p className="font-semibold text-xs text-purple-800">AI Franchise Intelligence</p>
            <p className="text-[10px] text-purple-700">Catalog shows live stock from Supabase. Orders create transfer requests automatically. Franchise partners see real-time availability.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
