import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, TrendingDown, Search, IndianRupee, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PurchaseRecord = {
  product_name: string;
  suppliers: { supplier: string; date: string; qty: number }[];
  avgCost: number;
};

export default function PurchaseRateCompare() {
  const [products, setProducts] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch transfers that are POs (supplier-related)
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("product_name, quantity, transfer_reason, created_at, status")
        .ilike("transfer_reason", "%supplier%")
        .eq("status", "received")
        .order("product_name");

      if (error) throw error;

      // Also fetch cost_per_unit from stock items
      const { data: stockItems } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("product_name, cost_per_unit");

      const costMap: Record<string, number> = {};
      (stockItems || []).forEach((s: any) => { costMap[s.product_name] = s.cost_per_unit; });

      // Group by product
      const productMap: Record<string, { suppliers: { supplier: string; date: string; qty: number }[] }> = {};
      (data || []).forEach((t: any) => {
        const name = t.product_name;
        const match = (t.transfer_reason || "").match(/supplier:\s*(\w+)/i);
        const supplier = match ? match[1].toUpperCase() : "UNKNOWN";

        if (!productMap[name]) productMap[name] = { suppliers: [] };
        productMap[name].suppliers.push({
          supplier,
          date: new Date(t.created_at).toLocaleDateString(),
          qty: t.quantity,
        });
      });

      setProducts(Object.entries(productMap).map(([name, d]) => ({
        product_name: name,
        suppliers: d.suppliers,
        avgCost: costMap[name] || 0,
      })));
    } catch (err: any) {
      toast.error("Failed to load purchase data");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = products.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingDown className="h-6 w-6 text-green-600" /> Purchase Rate Comparison</h1>
          <p className="text-muted-foreground mt-1">Compare supplier pricing per product from live PO history in Supabase.</p>
        </div>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2.5 text-muted-foreground" />
        <Input placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{products.length}</p><p className="text-xs text-muted-foreground">Products with PO History</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{new Set(products.flatMap(p => p.suppliers.map(s => s.supplier))).size}</p><p className="text-xs text-muted-foreground">Suppliers</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{products.reduce((s, p) => s + p.suppliers.length, 0)}</p><p className="text-xs text-muted-foreground">Total POs Received</p></CardContent></Card>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No purchase rate data. Run seed SQL and process some POs to see comparisons.</CardContent></Card>
      ) : (
        filtered.map((product) => (
          <Card key={product.product_name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{product.product_name}</CardTitle>
                <Badge variant="outline" className="text-[10px]">Avg: ₹{product.avgCost}/unit</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-3 py-1 text-left">Supplier</th>
                      <th className="px-3 py-1 text-center">Qty</th>
                      <th className="px-3 py-1 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.suppliers.map((s, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-1.5 font-medium">{s.supplier}</td>
                        <td className="px-3 py-1.5 text-center">{s.qty}</td>
                        <td className="px-3 py-1.5">{s.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-xs text-purple-800">AI Rate Intelligence</p>
            <p className="text-[10px] text-purple-700">Shows all received POs per product with supplier. Compare rates to identify best-value supplier for each product category.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
