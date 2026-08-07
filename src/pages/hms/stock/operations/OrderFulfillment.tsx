import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Truck, CheckCircle, Clock, Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OrderRecord = {
  id: string;
  product_name: string;
  quantity: number;
  status: string;
  transfer_reason: string | null;
  created_at: string;
  to_store_name?: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  received: "bg-green-100 text-green-700",
};

const OrderFulfillment = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setOrders((data || []).map((row: any) => ({
        ...row,
        to_store_name: row.to_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load orders");
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
      loadOrders();
    } catch (err: any) {
      toast.error("Failed to update");
    }
  };

  const pending = orders.filter(o => o.status === "pending").length;
  const inTransit = orders.filter(o => o.status === "in_transit" || o.status === "approved").length;
  const delivered = orders.filter(o => o.status === "received").length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-blue-600" /> Order Fulfillment</h1>
          <p className="text-muted-foreground mt-1">Track and fulfill orders — pending → packed → shipped → delivered. Live from Supabase.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{pending}</p><p className="text-[10px] text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Truck className="h-4 w-4 mx-auto text-purple-600" /><p className="text-xl font-bold text-purple-600">{inTransit}</p><p className="text-[10px] text-muted-foreground">In Transit</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{delivered}</p><p className="text-[10px] text-muted-foreground">Delivered</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{orders.length}</p><p className="text-[10px] text-muted-foreground">Total Orders</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-left">Destination</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders found</td></tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 text-xs font-medium">{o.product_name}</td>
                      <td className="px-3 py-2 text-center text-xs">{o.quantity}</td>
                      <td className="px-3 py-2 text-xs">{o.to_store_name}</td>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground max-w-[150px] truncate">{o.transfer_reason || "—"}</td>
                      <td className="px-3 py-2 text-center"><Badge className={`text-[10px] ${statusColors[o.status] || ""}`}>{o.status}</Badge></td>
                      <td className="px-3 py-2 text-center">
                        {o.status === "pending" && <Button size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateStatus(o.id, "approved")}>Pack</Button>}
                        {o.status === "approved" && <Button size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateStatus(o.id, "in_transit")}>Ship</Button>}
                        {o.status === "in_transit" && <Button size="sm" className="h-6 text-[10px]" onClick={() => handleUpdateStatus(o.id, "received")}>Deliver</Button>}
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
            <p className="font-semibold text-xs text-purple-800">AI Fulfillment</p>
            <p className="text-[10px] text-purple-700">Orders flow: pending → approved (packed) → in_transit (shipped) → received (delivered). Each status update is persisted to Supabase in real-time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderFulfillment;
