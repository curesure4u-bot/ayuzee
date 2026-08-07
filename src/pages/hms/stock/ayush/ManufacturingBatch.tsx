import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Factory, Brain, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BatchItem = {
  id: string;
  product_name: string;
  batch_number: string | null;
  quantity_available: number;
  cost_per_unit: number;
  expiry_date: string | null;
  created_at: string;
  store_name?: string;
};

export default function ManufacturingBatch() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBatches(); }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, batch_number, quantity_available, cost_per_unit, expiry_date, created_at, hms_ward_stores(ward_name)")
        .not("batch_number", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBatches((data || []).map((item: any) => ({
        ...item,
        store_name: item.hms_ward_stores?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load batches");
      console.error(err);
    }
    setLoading(false);
  };

  const totalBatches = batches.length;
  const totalValue = batches.reduce((s, b) => s + (b.quantity_available * b.cost_per_unit), 0);
  const uniqueProducts = new Set(batches.map(b => b.product_name)).size;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Factory className="h-6 w-6 text-indigo-600" /> Manufacturing Batch Tracker</h1>
        <p className="text-muted-foreground mt-1">Track all manufacturing batches from hms_ward_stock_items (batch_number not null).</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Factory className="h-4 w-4 mx-auto text-indigo-600" /><p className="text-xl font-bold">{totalBatches}</p><p className="text-xs text-muted-foreground">Total Batches</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Package className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold">{uniqueProducts}</p><p className="text-xs text-muted-foreground">Unique Products</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{batches.reduce((s, b) => s + b.quantity_available, 0)}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">₹{(totalValue / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Value</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Batch Registry</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Batch No</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-left">Expiry</th>
                  <th className="px-3 py-2 text-left">Store</th>
                </tr>
              </thead>
              <tbody>
                {batches.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No batches found</td></tr>
                ) : (
                  batches.map(b => (
                    <tr key={b.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{b.product_name}</td>
                      <td className="px-3 py-2 text-xs font-mono">{b.batch_number}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{b.quantity_available}</td>
                      <td className="px-3 py-2 text-right text-xs">₹{(b.quantity_available * b.cost_per_unit).toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs">{b.expiry_date || "—"}</td>
                      <td className="px-3 py-2 text-xs">{b.store_name}</td>
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
            <p className="font-semibold text-xs text-purple-800">Batch Intelligence</p>
            <p className="text-[10px] text-purple-700">All items with batch_number tracked here. Each batch has quantity, expiry, and store assignment. Full traceability from manufacture to dispensing.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
