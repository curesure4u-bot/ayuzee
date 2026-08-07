import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type WastageEntry = {
  id: string;
  product_name: string;
  quantity_consumed: number;
  bill_amount: number | null;
  consumption_type: string;
  notes: string | null;
  created_at: string;
  store_name?: string;
};

export default function StockWastage() {
  const [entries, setEntries] = useState<WastageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadWastage(); }, []);

  const loadWastage = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_consumption_log")
        .select("*, hms_ward_stores(ward_name), hms_ward_stock_items(product_name)")
        .in("consumption_type", ["wastage", "expired"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries((data || []).map((row: any) => ({
        ...row,
        product_name: row.hms_ward_stock_items?.product_name || "—",
        store_name: row.hms_ward_stores?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load wastage data");
      console.error(err);
    }
    setLoading(false);
  };

  const totalValue = entries.reduce((s, e) => s + (e.bill_amount || 0), 0);
  const wastageCount = entries.filter(e => e.consumption_type === "wastage").length;
  const expiredCount = entries.filter(e => e.consumption_type === "expired").length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trash2 className="h-6 w-6 text-red-600" /> Stock Wastage Register</h1>
        <p className="text-muted-foreground mt-1">All wastage and expiry write-offs from live consumption log.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{entries.length}</p><p className="text-xs text-muted-foreground">Total Entries</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{wastageCount}</p><p className="text-xs text-muted-foreground">Wastage</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{expiredCount}</p><p className="text-xs text-muted-foreground">Expired</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">₹{totalValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Loss</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Wastage Log</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-center">Type</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-left">Store</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No wastage recorded — excellent!</td></tr>
                ) : (
                  entries.map(e => (
                    <tr key={e.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-xs font-medium">{e.product_name}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{e.quantity_consumed}</td>
                      <td className="px-3 py-2 text-center"><Badge variant="destructive" className="text-[10px]">{e.consumption_type}</Badge></td>
                      <td className="px-3 py-2 text-right text-xs text-red-600 font-bold">₹{(e.bill_amount || 0).toFixed(0)}</td>
                      <td className="px-3 py-2 text-xs">{e.store_name}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[180px] truncate">{e.notes || "—"}</td>
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
            <p className="font-semibold text-xs text-purple-800">Wastage Intelligence</p>
            <p className="text-[10px] text-purple-700">Tracks all consumption_type='wastage' and 'expired' entries. Total loss this period: ₹{totalValue.toLocaleString()}. Target: below 1% of stock value.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
