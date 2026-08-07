import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, Search, Package, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BatchItem = {
  id: string;
  product_name: string;
  batch_number: string | null;
  expiry_date: string | null;
  quantity_available: number;
  cost_per_unit: number;
  ward_store_name?: string;
  status: "Active" | "Near Expiry" | "Expired";
};

const BatchTracking = () => {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("*, hms_ward_stores(ward_name)")
        .order("product_name", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      setBatches((data || []).map((item: any) => {
        let status: "Active" | "Near Expiry" | "Expired" = "Active";
        if (item.expiry_date) {
          const exp = new Date(item.expiry_date);
          if (exp <= now) status = "Expired";
          else if (exp <= in90) status = "Near Expiry";
        }
        return {
          ...item,
          ward_store_name: item.hms_ward_stores?.ward_name || "Main Store",
          status,
        };
      }));
    } catch (err: any) {
      toast.error("Failed to load batch data");
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = batches.filter((b) =>
    b.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.batch_number || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = filtered.reduce((s, b) => s + b.quantity_available, 0);
  const activeStock = filtered.filter(b => b.status === "Active").reduce((s, b) => s + b.quantity_available, 0);
  const nearExpiryValue = filtered.filter(b => b.status === "Near Expiry").reduce((s, b) => s + (b.quantity_available * b.cost_per_unit), 0);
  const expiredValue = filtered.filter(b => b.status === "Expired").reduce((s, b) => s + (b.quantity_available * b.cost_per_unit), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-blue-600" /> Batch-wise Stock Tracking</h1>
          <p className="text-muted-foreground mt-1">Track each batch: expiry, purchase price, FIFO dispensing order</p>
        </div>
      </div>

      <div className="flex gap-2 max-w-md">
        <Search className="h-4 w-4 mt-2 text-muted-foreground" />
        <Input placeholder="Search product or batch..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
        <Button size="sm" onClick={loadBatches}>Refresh</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{totalStock}</p><p className="text-xs text-muted-foreground">Total Stock Units</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{activeStock}</p><p className="text-xs text-muted-foreground">Active Stock</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">₹{nearExpiryValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Near-Expiry Value</p></CardContent></Card>
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">₹{expiredValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Expired (Write-off)</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All Batches ({filtered.length} items)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Batch</th>
                  <th className="px-3 py-2 text-left">Expiry</th>
                  <th className="px-3 py-2 text-right">Cost ₹</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">FIFO</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No batch data found</td></tr>
                ) : (
                  filtered.map((b, i) => (
                    <tr key={b.id} className={`border-b ${b.status === "Expired" ? "bg-red-50" : b.status === "Near Expiry" ? "bg-amber-50" : ""}`}>
                      <td className="px-3 py-2 font-medium text-xs">{b.product_name}</td>
                      <td className="px-3 py-2 font-mono text-xs">{b.batch_number || "—"}</td>
                      <td className="px-3 py-2 text-xs">{b.expiry_date || "—"}</td>
                      <td className="px-3 py-2 text-right">₹{b.cost_per_unit}</td>
                      <td className="px-3 py-2 text-center font-bold">{b.quantity_available}</td>
                      <td className="px-3 py-2 text-xs">{b.ward_store_name}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={b.status === "Active" ? "outline" : b.status === "Expired" ? "destructive" : "default"} className={`text-[10px] ${b.status === "Active" ? "text-green-600" : ""}`}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {b.status === "Near Expiry" ? (
                          <Badge className="bg-blue-600 text-[9px]">Dispense First</Badge>
                        ) : b.status === "Expired" ? (
                          <span className="text-[10px] text-red-600">Remove</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Queue</span>
                        )}
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
            <p className="font-semibold text-purple-800">AI Batch Management</p>
            <p className="text-sm text-purple-700">
              {filtered.filter(b => b.status === "Near Expiry").length > 0
                ? `${filtered.filter(b => b.status === "Near Expiry").length} items near expiry (₹${nearExpiryValue.toLocaleString()} value). Consider discounted sale or branch transfer to high-consumption locations.`
                : "All batches are in good standing. No immediate action needed."
              }
              {filtered.filter(b => b.status === "Expired").length > 0 &&
                ` ${filtered.filter(b => b.status === "Expired").length} expired items (₹${expiredValue.toLocaleString()}) — schedule write-off.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchTracking;
