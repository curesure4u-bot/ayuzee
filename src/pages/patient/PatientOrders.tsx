import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Filter, Stethoscope, RotateCcw, Loader2, Download } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderRow {
  id: string;
  total: number;
  subtotal?: number | null;
  shipping?: number | null;
  order_status: string;
  payment_status: string;
  created_at: string;
  full_name?: string | null;
  phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}
interface ApptRow {
  id: string;
  appointment_date: string;
  time_slot: string;
  mode: string;
  fee: number;
  status: string;
  payment_status: string;
}

const FILTERS = ["All Orders", "Delivered", "In-transit", "Returned"];

const PatientOrders = () => {
  const { addItem } = useCart();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [appts, setAppts] = useState<ApptRow[]>([]);
  const [filter, setFilter] = useState("All Orders");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const reorder = async (orderId: string) => {
    setReorderingId(orderId);
    try {
      const { data: items, error } = await supabase
        .from("order_items")
        .select("product_id, product_name, quantity, unit_price, products(brand, unit, stock)")
        .eq("order_id", orderId);
      if (error) throw error;
      if (!items || items.length === 0) {
        toast.error("No items found in this order");
        return;
      }
      let added = 0;
      let skipped = 0;
      for (const it of items as Array<{ product_id: string; product_name: string; quantity: number; unit_price: number; products: { brand: string | null; unit: string | null; stock: number } | null }>) {
        if (!it.products || it.products.stock <= 0) { skipped++; continue; }
        addItem(
          { id: it.product_id, name: it.product_name, brand: it.products.brand ?? "", unit: it.products.unit ?? null, price: it.unit_price },
          it.quantity,
        );
        added++;
      }
      if (added) toast.success(`Re-added ${added} item${added === 1 ? "" : "s"} to your cart${skipped ? ` (${skipped} out of stock)` : ""}`);
      else toast.error("All items in this order are out of stock");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reorder");
    } finally {
      setReorderingId(null);
    }
  };

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      const [o, a] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("appointments").select("*").eq("user_id", uid).order("appointment_date", { ascending: false }),
      ]);
      setOrders((o.data as OrderRow[]) ?? []);
      setAppts((a.data as ApptRow[]) ?? []);
    })();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === "All Orders") return true;
    if (filter === "Delivered") return o.order_status === "delivered";
    if (filter === "In-transit") return ["shipped", "out_for_delivery", "processing"].includes(o.order_status);
    if (filter === "Returned") return o.order_status === "returned";
    return true;
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 font-display text-xl font-semibold">My Orders</h1>
        <Filter className="h-5 w-5 text-primary" />
      </div>

      <Tabs defaultValue="medicine" className="p-5">
        <TabsList>
          <TabsTrigger value="medicine">Medicine Orders</TabsTrigger>
          <TabsTrigger value="consult">Consultation Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="medicine" className="mt-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  filter === f
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="font-mono text-sm text-primary">AYZ-{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{o.order_status}</Badge>
                    <Badge variant={o.payment_status === "paid" ? "default" : "outline"}>{o.payment_status}</Badge>
                    <span className="font-semibold">₹{o.total}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reorder(o.id)}
                      disabled={reorderingId === o.id}
                    >
                      {reorderingId === o.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-2 h-3.5 w-3.5" />}
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="consult" className="mt-5">
          {appts.length === 0 ? (
            <EmptyConsult />
          ) : (
            <div className="space-y-3">
              {appts.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">
                      {new Date(a.appointment_date).toLocaleDateString()} • {a.time_slot}
                    </p>
                    <p className="text-sm capitalize text-muted-foreground">{a.mode} consultation</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{a.status}</Badge>
                    <Badge variant={a.payment_status === "paid" ? "default" : "outline"}>{a.payment_status}</Badge>
                    <span className="font-semibold">₹{a.fee}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

const EmptyOrders = () => (
  <div className="grid place-items-center py-16 text-center">
    <div className="grid h-32 w-32 place-items-center rounded-full bg-emerald-50">
      <ShoppingCart className="h-16 w-16 text-emerald-600/70" />
    </div>
    <p className="mt-6 text-lg font-semibold">No order found. Please change filter</p>
  </div>
);

const EmptyConsult = () => (
  <div className="grid place-items-center py-16 text-center">
    <div className="grid h-32 w-32 place-items-center rounded-full bg-emerald-50">
      <Stethoscope className="h-16 w-16 text-emerald-600/70" />
    </div>
    <p className="mt-6 text-lg font-semibold">No consultations yet</p>
    <p className="mt-1 text-sm text-muted-foreground">Book your first appointment to get started.</p>
  </div>
);

export default PatientOrders;
