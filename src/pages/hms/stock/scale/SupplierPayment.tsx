import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Wallet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SupplierPaymentInfo = {
  supplier: string;
  totalOrders: number;
  totalQty: number;
  status: "clear" | "pending" | "overdue";
};

export default function SupplierPayment() {
  const [suppliers, setSuppliers] = useState<SupplierPaymentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("transfer_reason, quantity, status")
        .ilike("transfer_reason", "%supplier%");

      if (error) throw error;

      const map: Record<string, { total: number; qty: number; pending: number }> = {};
      (data || []).forEach((t: any) => {
        const match = (t.transfer_reason || "").match(/supplier:\s*(\w+)/i);
        const name = match ? match[1].toUpperCase() : "UNKNOWN";
        if (!map[name]) map[name] = { total: 0, qty: 0, pending: 0 };
        map[name].total++;
        map[name].qty += t.quantity || 0;
        if (t.status === "pending" || t.status === "approved") map[name].pending++;
      });

      setSuppliers(Object.entries(map).map(([supplier, d]) => ({
        supplier,
        totalOrders: d.total,
        totalQty: d.qty,
        status: d.pending > 0 ? "pending" : "clear",
      })).sort((a, b) => b.totalOrders - a.totalOrders));
    } catch (err: any) {
      toast.error("Failed to load supplier data");
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6 text-green-600" /> Supplier Payment Tracker</h1>
        <p className="text-muted-foreground mt-1">Track supplier orders and pending payments from live transfer data.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{suppliers.length}</p><p className="text-xs text-muted-foreground">Suppliers</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{suppliers.filter(s => s.status === "clear").length}</p><p className="text-xs text-muted-foreground">Clear</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-amber-600">{suppliers.filter(s => s.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Supplier Payment Status</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-center">Orders</th>
                  <th className="px-3 py-2 text-center">Total Qty</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No supplier data</td></tr>
                ) : (
                  suppliers.map((s, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{s.supplier}</td>
                      <td className="px-3 py-2 text-center text-xs font-bold">{s.totalOrders}</td>
                      <td className="px-3 py-2 text-center text-xs">{s.totalQty}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={s.status === "clear" ? "outline" : "default"} className={`text-[10px] ${s.status === "clear" ? "text-green-600" : "text-amber-600"}`}>{s.status}</Badge>
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
}
