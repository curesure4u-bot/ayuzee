import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RotateCcw, Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ReturnRecord = {
  id: string;
  product_name: string;
  quantity: number;
  transfer_reason: string | null;
  status: string;
  created_at: string;
  to_store_name?: string;
};

export default function PurchaseReturn() {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReturns(); }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name)")
        .ilike("transfer_reason", "%Return%")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReturns((data || []).map((row: any) => ({ ...row, to_store_name: row.to_store?.ward_name || "—" })));
    } catch (err: any) {
      toast.error("Failed to load returns");
      console.error(err);
    }
    setLoading(false);
  };

  const totalValue = returns.length; // simplified
  const pending = returns.filter(r => r.status === "pending").length;
  const completed = returns.filter(r => r.status === "received").length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><RotateCcw className="h-6 w-6 text-red-600" /> Purchase Return (to Supplier)</h1>
        <p className="text-muted-foreground mt-1">Return damaged/wrong items to supplier — tracked via hms_ward_stock_transfers.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{returns.length}</p><p className="text-xs text-muted-foreground">Total Returns</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{completed}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Return Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {returns.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No purchase returns found</td></tr>
                ) : (
                  returns.map(r => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{r.product_name}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{r.quantity}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[200px] truncate">{r.transfer_reason || "—"}</td>
                      <td className="px-3 py-2 text-center"><Badge variant={r.status === "received" ? "outline" : "default"} className={`text-[10px] ${r.status === "received" ? "text-green-600" : ""}`}>{r.status}</Badge></td>
                      <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
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
}
