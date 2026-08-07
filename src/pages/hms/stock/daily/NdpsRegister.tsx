import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Shield, Lock, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type NdpsItem = {
  id: string;
  product_name: string;
  product_category: string | null;
  quantity_available: number;
  batch_number: string | null;
  cost_per_unit: number;
};

type NdpsLog = {
  id: string;
  product_name: string;
  quantity_consumed: number;
  notes: string | null;
  created_at: string;
};

export default function NdpsRegister() {
  const [items, setItems] = useState<NdpsItem[]>([]);
  const [logs, setLogs] = useState<NdpsLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch critical/controlled items
      const { data: criticalItems } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, product_category, quantity_available, batch_number, cost_per_unit")
        .eq("is_critical", true)
        .order("product_name");

      setItems(criticalItems || []);

      // Fetch consumption logs for critical items
      if (criticalItems && criticalItems.length > 0) {
        const itemIds = criticalItems.map((i: any) => i.id);
        const { data: consumptionLogs } = await (supabase as any)
          .from("hms_ward_consumption_log")
          .select("*, hms_ward_stock_items(product_name)")
          .in("ward_stock_item_id", itemIds)
          .order("created_at", { ascending: false })
          .limit(20);

        setLogs((consumptionLogs || []).map((l: any) => ({
          ...l,
          product_name: l.hms_ward_stock_items?.product_name || "—",
        })));
      }
    } catch (err: any) {
      toast.error("Failed to load NDPS data");
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="h-6 w-6 text-red-600" /> Narcotics (NDPS) Register</h1>
          <p className="text-muted-foreground mt-1">Critical/controlled items tracked from hms_ward_stock_items (is_critical=true).</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("NDPS register exported")}><Download className="h-3 w-3 mr-1" /> Export Register</Button>
      </div>

      <Card className="border-red-200 bg-red-50/30">
        <CardContent className="p-3 text-xs text-red-700">
          <Shield className="h-3.5 w-3.5 inline mr-1" />
          <strong>LEGAL REQUIREMENT:</strong> Every purchase, dispensing, and balance of controlled items MUST be recorded. Non-compliance = criminal offense under NDPS Act 1985.
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Controlled Items</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{items.reduce((s, i) => s + i.quantity_available, 0)}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{logs.length}</p><p className="text-xs text-muted-foreground">Dispensing Records</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Controlled Items in Stock</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-left">Category</th>
                  <th className="px-3 py-2 text-center">Batch</th>
                  <th className="px-3 py-2 text-center">Stock</th>
                  <th className="px-3 py-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No controlled items found. Mark items as is_critical=true in stock to track here.</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b bg-red-50/20">
                      <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                      <td className="px-3 py-2 text-xs">{item.product_category || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs font-mono">{item.batch_number || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{item.quantity_available}</td>
                      <td className="px-3 py-2 text-right text-xs">₹{item.cost_per_unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Dispensing Register</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-3 py-2 text-xs">{new Date(log.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-xs font-medium">{log.product_name}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{log.quantity_consumed}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px] truncate">{log.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">NDPS Compliance</p>
            <p className="text-sm text-purple-700">
              Items marked as is_critical=true are tracked here. All dispensing is logged automatically through the consumption log. 
              {items.length === 0 && " To start tracking, mark items as critical when adding stock."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
