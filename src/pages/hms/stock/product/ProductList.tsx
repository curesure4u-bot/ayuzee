import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Download, Printer, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type StockProduct = {
  id: string;
  product_name: string;
  product_category: string | null;
  batch_number: string | null;
  expiry_date: string | null;
  quantity_available: number;
  quantity_unit: string;
  min_stock_level: number;
  max_stock_level: number;
  cost_per_unit: number;
  is_critical: boolean;
  ward_store_name?: string;
  created_at: string;
};

const ProductList = () => {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [manageType, setManageType] = useState<"product" | "frame" | "lens" | "lab" | "kit" | "linen">("product");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("hms_ward_stock_items")
      .select("*, hms_ward_stores(ward_name)")
      .order("product_name", { ascending: true });

    if (error) {
      toast.error("Failed to load products");
      console.error(error);
    } else {
      setProducts((data || []).map((item: any) => ({
        ...item,
        ward_store_name: item.hms_ward_stores?.ward_name || "Main Store",
      })));
    }
    setLoading(false);
  };

  const filtered = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.product_category ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.batch_number ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Sub-nav tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/hms/stock/product/new">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </Link>
        <Select value={manageType} onValueChange={(v: any) => setManageType(v)}>
          <SelectTrigger className="w-[140px] h-8 text-sm bg-orange-100 border-orange-300">
            <SelectValue placeholder="Manage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="frame">Frame</SelectItem>
            <SelectItem value="lens">Lens</SelectItem>
            <SelectItem value="lab">Lab</SelectItem>
            <SelectItem value="kit">Kit</SelectItem>
            <SelectItem value="linen">Linen</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-300">
          Manage Inactive
        </Button>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-orange-600">Manage Product</h2>
      </div>

      {/* Export & Print */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" className="bg-green-600 text-white hover:bg-green-700">
          <Download className="mr-1 h-3 w-3" /> Export As CSV
        </Button>
        <Button variant="outline" size="sm">
          <Printer className="mr-1 h-3 w-3" /> Print
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Product Name</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Category</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Store</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Batch</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Expiry</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Qty Available</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Unit</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Min Level</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Cost/Unit</th>
                  <th className="px-2 py-2 text-left font-semibold text-green-600">Total Value</th>
                  <th className="px-2 py-2 text-left font-semibold text-orange-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                      No products found. Add stock items from ward stores.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="px-2 py-2 font-medium max-w-[200px] truncate">{p.product_name}</td>
                      <td className="px-2 py-2">{p.product_category || "—"}</td>
                      <td className="px-2 py-2">{p.ward_store_name}</td>
                      <td className="px-2 py-2 font-mono text-xs">{p.batch_number || "—"}</td>
                      <td className="px-2 py-2">{p.expiry_date || "—"}</td>
                      <td className="px-2 py-2 font-bold">
                        <span className={p.quantity_available <= p.min_stock_level ? "text-red-600" : "text-green-600"}>
                          {p.quantity_available}
                        </span>
                      </td>
                      <td className="px-2 py-2">{p.quantity_unit}</td>
                      <td className="px-2 py-2">{p.min_stock_level}</td>
                      <td className="px-2 py-2">Rs {p.cost_per_unit}</td>
                      <td className="px-2 py-2">Rs {(p.quantity_available * p.cost_per_unit).toFixed(0)}</td>
                      <td className="px-2 py-2">
                        <Badge variant={p.quantity_available > p.min_stock_level ? "default" : "destructive"} className="text-xs">
                          {p.quantity_available <= p.min_stock_level ? "Low Stock" : p.is_critical ? "Critical" : "In Stock"}
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
    </div>
  );
};

export default ProductList;
