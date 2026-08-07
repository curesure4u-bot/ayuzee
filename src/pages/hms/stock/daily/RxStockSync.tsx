import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Lock, CheckCircle, Clock, AlertTriangle, Pill, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type StockItem = {
  id: string;
  product_name: string;
  quantity_available: number;
  batch_number: string | null;
  cost_per_unit: number;
};

type Reservation = {
  id: string;
  product_name: string;
  quantity: number;
  status: string;
  created_at: string;
  notes: string | null;
  store_name?: string;
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-blue-100 text-blue-700", label: "Reserved" },
  approved: { color: "bg-blue-100 text-blue-700", label: "Reserved" },
  in_transit: { color: "bg-green-100 text-green-700", label: "Dispensed" },
  received: { color: "bg-green-100 text-green-700", label: "Dispensed" },
  rejected: { color: "bg-gray-100 text-gray-600", label: "Released" },
};

export default function RxStockSync() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch available stock items
      const { data: items } = await (supabase as any)
        .from("hms_ward_stock_items")
        .select("id, product_name, quantity_available, batch_number, cost_per_unit")
        .gt("quantity_available", 0)
        .order("product_name");

      setStockItems(items || []);

      // Fetch recent transfers as "reservations" (Rx sync uses transfers)
      const { data: transfers } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .select("*, to_store:hms_ward_stores!hms_ward_stock_transfers_to_store_id_fkey(ward_name)")
        .order("created_at", { ascending: false })
        .limit(10);

      setReservations((transfers || []).map((t: any) => ({
        ...t,
        store_name: t.to_store?.ward_name || "—",
      })));
    } catch (err: any) {
      toast.error("Failed to load data");
      console.error(err);
    }
    setLoading(false);
  };

  const handleDispense = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .update({ status: "received" })
        .eq("id", id);
      if (error) throw error;
      toast.success("Dispensed successfully");
      loadData();
    } catch (err: any) {
      toast.error("Failed to dispense");
    }
  };

  const handleRelease = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("hms_ward_stock_transfers")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      toast.info("Reservation released");
      loadData();
    } catch (err: any) {
      toast.error("Failed to release");
    }
  };

  const reserved = reservations.filter(r => r.status === "pending" || r.status === "approved");
  const dispensed = reservations.filter(r => r.status === "in_transit" || r.status === "received");
  const stockouts = stockItems.filter(s => s.quantity_available <= 2).length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Lock className="h-6 w-6 text-blue-600" /> Prescription-to-Stock Sync</h1>
          <p className="text-muted-foreground mt-1">Doctor writes Rx → stock auto-reserved → patient collects. Live from Supabase.</p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 text-xs">{reserved.length} active reservations</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200"><CardContent className="p-3 text-center"><Lock className="h-4 w-4 mx-auto text-blue-600" /><p className="text-xl font-bold text-blue-600">{reserved.length}</p><p className="text-[10px] text-muted-foreground">Reserved</p></CardContent></Card>
        <Card className="border-green-200"><CardContent className="p-3 text-center"><CheckCircle className="h-4 w-4 mx-auto text-green-600" /><p className="text-xl font-bold text-green-600">{dispensed.length}</p><p className="text-[10px] text-muted-foreground">Dispensed</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="p-3 text-center"><AlertTriangle className="h-4 w-4 mx-auto text-amber-600" /><p className="text-xl font-bold text-amber-600">{stockouts}</p><p className="text-[10px] text-muted-foreground">Low Stock Items</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Clock className="h-4 w-4 mx-auto text-gray-500" /><p className="text-xl font-bold">{stockItems.length}</p><p className="text-[10px] text-muted-foreground">Available Products</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Live Reservations / Transfers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reservations.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">No reservations found</p>
          ) : (
            reservations.map((res) => {
              const sc = statusConfig[res.status] || { color: "bg-gray-100 text-gray-600", label: res.status };
              return (
                <div key={res.id} className={`p-3 rounded border ${(res.status === "pending" || res.status === "approved") ? "border-blue-200 bg-blue-50/20" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{res.product_name}</p>
                      <Badge className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-muted-foreground">{res.store_name} • {new Date(res.created_at).toLocaleTimeString()}</p>
                      <p className="font-bold">Qty: {res.quantity}</p>
                    </div>
                  </div>
                  {res.notes && <p className="text-[10px] text-muted-foreground">{res.notes}</p>}
                  {(res.status === "pending" || res.status === "approved") && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="h-7 text-xs" onClick={() => handleDispense(res.id)}>Dispense Now</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRelease(res.id)}>Release</Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-800">AI Sync Intelligence</p>
            <p className="text-sm text-purple-700">
              {reserved.length > 0
                ? `${reserved.length} items reserved for patients. Dispense or release to keep stock accurate.`
                : "No pending reservations. All stock available for walk-in patients."
              }
              {stockouts > 0 && ` Warning: ${stockouts} items at critically low levels.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
