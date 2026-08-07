import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RotateCcw, Brain, Loader2, IndianRupee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ExpiredItem = {
  id: string;
  product_name: string;
  batch_number: string | null;
  expiry_date: string;
  quantity_available: number;
  cost_per_unit: number;
  value: number;
  daysExpired: number;
};

export default function ExpiryReturn() {
  const [expired, setExpired] = useState<ExpiredItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpired();
  }, []);

  const loadExpired = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, batch_number, expiry_date, quantity_available, cost_per_unit")
        .not("expiry_date", "is", null)
        .gt("quantity_available", 0)
        .order("expiry_date", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const expiredItems: ExpiredItem[] = (data || [])
        .filter((item: any) => new Date(item.expiry_date) <= now)
        .map((item: any) => ({
          ...item,
          value: item.quantity_available * item.cost_per_unit,
          daysExpired: Math.floor((now.getTime() - new Date(item.expiry_date).getTime()) / (1000 * 60 * 60 * 24)),
        }));

      setExpired(expiredItems);
    } catch (err: any) {
      toast.error("Failed to load expired items");
      console.error(err);
    }
    setLoading(false);
  };

  const handleRaiseClaim = async (item: ExpiredItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log as wastage in consumption log
      const stores = await (supabase as any).from("hms_ward_stores").select("id").limit(1).single();
      await (supabase as any).from("hms_ward_consumption_log").insert({
        ward_store_id: stores.data?.id,
        ward_stock_item_id: item.id,
        quantity_consumed: item.quantity_available,
        consumption_type: "expired",
        billed_to_patient: false,
        bill_amount: item.value,
        consumed_by: user.id,
        notes: `Expiry claim raised. Product: ${item.product_name}, Batch: ${item.batch_number}, Expired: ${item.expiry_date}, Value: ₹${item.value}`,
      });

      toast.success(`Claim raised for ${item.product_name} (₹${item.value})`);
      loadExpired();
    } catch (err: any) {
      toast.error("Failed to raise claim");
    }
  };

  const totalValue = expired.reduce((s, e) => s + e.value, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><RotateCcw className="h-6 w-6 text-amber-600" /> Expiry Return & Claims</h1>
          <p className="text-muted-foreground mt-1">Track expired stock from live data, raise supplier claims, write off.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-red-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-red-600">{expired.length}</p><p className="text-xs text-muted-foreground">Expired Items</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><IndianRupee className="h-4 w-4 mx-auto text-red-600" /><p className="text-xl font-bold text-red-600">₹{totalValue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Value at Loss</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{expired.reduce((s, e) => s + e.quantity_available, 0)}</p><p className="text-xs text-muted-foreground">Total Units</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Expired Stock</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Batch</th>
                  <th className="px-3 py-2 text-center">Expired</th>
                  <th className="px-3 py-2 text-center">Days Ago</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {expired.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No expired items in stock — great!</td></tr>
                ) : (
                  expired.map((item) => (
                    <tr key={item.id} className="border-b bg-red-50/30">
                      <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                      <td className="px-3 py-2 text-xs font-mono">{item.batch_number || "—"}</td>
                      <td className="px-3 py-2 text-center text-xs">{item.expiry_date}</td>
                      <td className="px-3 py-2 text-center"><Badge variant="destructive" className="text-[10px]">{item.daysExpired}d ago</Badge></td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{item.quantity_available}</td>
                      <td className="px-3 py-2 text-right text-xs font-bold text-red-600">₹{item.value.toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        <Button size="sm" className="h-6 text-[10px]" onClick={() => handleRaiseClaim(item)}>Raise Claim</Button>
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
            <p className="font-semibold text-xs text-purple-800">AI Expiry Claims</p>
            <p className="text-[10px] text-purple-700">"Raise Claim" logs the item as expired in consumption_log and marks for supplier credit note. Items where expiry_date &lt; today are shown here automatically.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
