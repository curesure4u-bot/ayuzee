import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLabOrders } from "@/hooks/useLabOrders";
import { FlaskConical, CheckCircle, Clock, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

type LabOrder = {
  id: string;
  order_number: string;
  patient_display_id: string;
  patient_name: string;
  ordered_by_name: string;
  priority: string;
  status: string;
  created_at: string;
  hms_lab_order_items: { id: string; test_name: string; status: string; result_value: string | null }[];
};

export const LabOrdersQueue = () => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({});
  const { getPendingOrders, enterResult, completeOrder } = useLabOrders();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getPendingOrders();
      setOrders(data);
    } catch (e: any) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel("lab-orders-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "hms_lab_orders" }, () => loadOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleEnterResult = async (itemId: string, orderId: string) => {
    const value = resultInputs[itemId];
    if (!value?.trim()) return toast.error("Enter a result value");

    try {
      const numVal = parseFloat(value);
      await enterResult(itemId, value, isNaN(numVal) ? undefined : numVal);
      toast.success("Result saved");
      setResultInputs((prev) => ({ ...prev, [itemId]: "" }));
      loadOrders();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await completeOrder(orderId);
      toast.success("Order marked as complete");
      loadOrders();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const priorityColor: Record<string, string> = {
    routine: "bg-gray-100 text-gray-700",
    urgent: "bg-amber-100 text-amber-700",
    stat: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Lab Orders Queue</h3>
          <Badge variant="secondary">{orders.length}</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={loadOrders}>
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            <FlaskConical className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            No pending lab orders.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Card key={order.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{order.order_number}</Badge>
                    <span className="text-sm font-medium">{order.patient_name}</span>
                    <span className="text-[10px] text-muted-foreground">{order.patient_display_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[9px] ${priorityColor[order.priority] || ""}`}>
                      {order.priority === "stat" && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                      {order.priority}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-0.5" />
                      {new Date(order.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      {expandedOrder === order.id ? "Collapse" : "Enter Results"}
                    </Button>
                  </div>
                </div>

                {/* Test items (expanded) */}
                {expandedOrder === order.id && (
                  <div className="mt-2 border-t pt-2 space-y-1.5">
                    <p className="text-[10px] text-muted-foreground">Ordered by: {order.ordered_by_name}</p>
                    {(order.hms_lab_order_items || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-muted/30 rounded p-2">
                        <span className="text-xs flex-1 font-medium">{item.test_name}</span>
                        {item.status === "resulted" || item.status === "verified" ? (
                          <Badge className="bg-green-100 text-green-700 text-[9px]">
                            <CheckCircle className="h-2.5 w-2.5 mr-0.5" /> {item.result_value}
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Input
                              className="h-6 w-24 text-xs"
                              placeholder="Result..."
                              value={resultInputs[item.id] || ""}
                              onChange={(e) => setResultInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleEnterResult(item.id, order.id)}
                            />
                            <Button
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={() => handleEnterResult(item.id, order.id)}
                            >
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompleteOrder(order.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" /> Mark Order Complete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabOrdersQueue;
