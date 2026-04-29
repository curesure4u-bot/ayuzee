import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink, HelpCircle, Loader2, MapPin, PackageCheck, Search, ShoppingBag, Truck } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem { id: string; product_name: string; quantity: number; unit_price: number; }
interface OrderRow {
  id: string;
  created_at: string;
  total: number;
  payment_status: string;
  order_status: string;
  phone: string;
  delhivery_waybill?: string | null;
  order_items?: OrderItem[];
}

const formatINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const shortOrderId = (id: string) => `AYZ-${id.slice(0, 8).toUpperCase()}`;

const trackingSteps = (order: OrderRow) => [
  { label: "Order Placed", detail: new Date(order.created_at).toLocaleString("en-IN"), done: true, active: order.order_status === "placed" && order.payment_status !== "paid" },
  { label: "Payment Confirmed", detail: order.payment_status === "paid" ? "Payment received" : "Awaiting payment", done: order.payment_status === "paid", active: order.payment_status !== "paid" },
  { label: "Packed & Dispatched", detail: "Your medicines are packed", done: ["shipped", "out_for_delivery", "delivered"].includes(order.order_status), active: order.order_status === "shipped" },
  { label: "Out for Delivery", detail: "Rider is on the way", done: ["out_for_delivery", "delivered"].includes(order.order_status), active: order.order_status === "out_for_delivery" },
  { label: "Delivered", detail: "Order completed", done: order.order_status === "delivered", active: order.order_status === "delivered" },
];

const Stepper = ({ order }: { order: OrderRow }) => (
  <div className="mt-5 grid gap-3 md:grid-cols-5">
    {trackingSteps(order).map((step) => (
      <div key={step.label} className="rounded-lg border border-border bg-muted/30 p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${step.done ? "bg-primary" : step.active ? "bg-secondary" : "bg-muted-foreground/30"}`} />
          <p className="text-sm font-semibold">{step.label}</p>
        </div>
        <p className="text-xs text-muted-foreground">{step.detail}</p>
      </div>
    ))}
  </div>
);

const OrderCard = ({ order }: { order: OrderRow }) => (
  <Collapsible defaultOpen={false}>
    <Card className="overflow-hidden">
      <CollapsibleTrigger className="w-full text-left">
        <CardHeader className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-mono text-sm font-semibold text-primary">{shortOrderId(order.id)}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("en-IN")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>{order.payment_status}</Badge>
            <Badge variant="secondary">{order.order_status.replace(/_/g, " ")}</Badge>
            <span className="font-semibold">{formatINR(order.total)}</span>
          </div>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent className="border-t border-border pt-5">
          <div className="space-y-2">
            {(order.order_items ?? []).map((item) => (
              <div key={item.id} className="flex justify-between gap-4 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span>{item.product_name} <span className="text-muted-foreground">× {item.quantity}</span></span>
                <span>{formatINR(item.unit_price)}</span>
              </div>
            ))}
          </div>
          <Stepper order={order} />
          <div className="mt-5 flex flex-wrap gap-3">
            {order.delhivery_waybill && (
              <Button asChild variant="outline">
                <a href={`https://www.delhivery.com/track/package/${order.delhivery_waybill}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Track on Delhivery
                </a>
              </Button>
            )}
            <Button asChild variant="ghost"><Link to="/contact"><HelpCircle className="mr-2 h-4 w-4" /> Need help?</Link></Button>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
);

const TrackOrder = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    document.title = "Track Medicine Order — Ayuzee";
    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      setIsLoggedIn(!!userId);
      if (!userId) { setLoading(false); return; }
      const { data: rows, error } = await (supabase as any)
        .from("orders")
        .select("id,created_at,total,payment_status,order_status,phone,delhivery_waybill,order_items(id,product_name,quantity,unit_price)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setOrders((rows as OrderRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const guestResult = useMemo(() => orders[0], [orders]);

  const trackGuest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!guestOrderId.trim() || !guestPhone.trim()) return toast.error("Enter order ID and phone number");
    setLoading(true);
    const id = guestOrderId.trim().replace(/^AYZ-/i, "");
    const { data, error } = await (supabase as any)
      .from("orders")
      .select("id,created_at,total,payment_status,order_status,phone,delhivery_waybill,order_items(id,product_name,quantity,unit_price)")
      .eq("id", id)
      .eq("phone", guestPhone.trim())
      .maybeSingle();
    if (error) toast.error(error.message);
    if (!data) toast.info("No order found for these details");
    setOrders(data ? [data as OrderRow] : []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <section className="border-b border-border bg-background">
        <div className="container py-10 md:py-14">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="text-primary hover:underline">Home</Link><ChevronRight className="h-3.5 w-3.5" />
            <Link to="/shop" className="text-primary hover:underline">Medicines</Link><ChevronRight className="h-3.5 w-3.5" /><span>Track Order</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl">Track Medicine Order</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">Follow your medicine delivery status from payment to doorstep.</p>
        </div>
      </section>

      <main className="container py-8">
        {!isLoggedIn && (
          <Card className="mb-6 max-w-2xl">
            <CardHeader><h2 className="font-display text-xl">Guest tracking</h2></CardHeader>
            <CardContent>
              <form onSubmit={trackGuest} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div><Label htmlFor="order-id">Order ID</Label><Input id="order-id" placeholder="AYZ-XXXXXXXX" value={guestOrderId} onChange={(e) => setGuestOrderId(e.target.value)} /></div>
                <div><Label htmlFor="phone">Phone number</Label><Input id="phone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} /></div>
                <Button type="submit" disabled={loading}><Search className="mr-2 h-4 w-4" /> Track</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? <p className="text-sm text-muted-foreground">Loading orders…</p> : orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-12 text-center">
            <PackageCheck className="mx-auto h-12 w-12 text-primary/50" />
            <p className="mt-4 font-semibold">{isLoggedIn ? "No medicine orders found" : guestResult ? "" : "Track an order with your details"}</p>
            <p className="text-sm text-muted-foreground">Your tracked medicine orders will appear here.</p>
            <Button asChild variant="hero" className="mt-5"><Link to="/shop"><ShoppingBag className="mr-2 h-4 w-4" /> Shop medicines</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">{orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrder;
